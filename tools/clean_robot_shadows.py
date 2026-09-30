#!/usr/bin/env python3
"""Убирает остатки студийной тени под роботами в assets/robots/*.webp.

При вырезке фона тень на полу осталась светлыми полупрозрачными пикселями
с рваным краем. Скрипт ищет их только в нижней полосе силуэта: пиксель
светлый, малонасыщенный и не полностью непрозрачный. Белый корпус робота
непрозрачен, поэтому не попадает под критерий. Дополнительно удаляются
«острова» — фрагменты, не связанные с основным силуэтом.

Режимы:
  --stats    сводка по нижней полосе (гистограмма альфы светлых пикселей)
  --preview  PNG с красной маской удаляемого в <out>/, исходники не трогает
  --apply    бэкап в assets/robots/_backup/ и перезапись webp

Пример:
  python3 tools/clean_robot_shadows.py --preview --out /tmp/prev cleaning amr
  python3 tools/clean_robot_shadows.py --holes --preview --out /tmp/prev agro
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ROBOTS_DIR = ROOT / "assets" / "robots"
BACKUP_DIR = ROBOTS_DIR / "_backup"
DEFAULT_NAMES = ("cleaning", "manipulator", "amr", "wellness")


def shadow_mask(
    rgba: np.ndarray,
    band: float,
    alpha_max: int,
    lum_min: int,
    sat_max: int,
    warm_min: int,
    dark_max: int = 120,
) -> tuple[np.ndarray, int]:
    """Маска пикселей тени и верх полосы (True = удалить)."""
    a = rgba[..., 3].astype(np.int16)
    rgb = rgba[..., :3].astype(np.int16)
    ys = np.nonzero(a.max(axis=1) > 0)[0]
    if ys.size == 0:
        return np.zeros(a.shape, bool), 0
    top, bottom = ys[0], ys[-1]
    y0 = int(bottom - (bottom - top) * band)

    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    light = (a > 0) & (a <= alpha_max) & (lum >= lum_min) & (sat <= sat_max)
    # Тень на полу тёплая (кремовая), белый пластик корпуса нейтральный/холодный.
    light &= (rgb[..., 0] - rgb[..., 2]) >= warm_min
    light[:y0] = False

    # Затравки — нижний непрозрачный пиксель каждого столбца, если он светлый:
    # под роботом снизу всегда пол, а не корпус.
    seeds = np.zeros_like(light)
    has = a.max(axis=0) > 0
    cols = np.nonzero(has)[0]
    low = a.shape[0] - 1 - np.argmax(a[::-1, cols] > 0, axis=0)
    seeds[low, cols] = True
    region = seeds & light

    # Заливка по светлым пикселям до тёмного контура робота.
    region = grow(seeds & light, light)

    # Второй проход: у самого контакта тень холоднее и под «тёплый» критерий
    # не попадает. Добираем её без проверки оттенка, но только ниже нижнего
    # тёмного пикселя столбца (кромка днища/колеса) — корпус выше этой линии.
    dark = (a > 0) & (lum < dark_max)
    dark[:y0] = False
    rows = np.arange(a.shape[0])[:, None]
    last_dark = np.where(dark, rows, -1).max(axis=0)
    below = rows > last_dark[None, :]
    cold = (a > 0) & (lum >= lum_min - 15) & (sat <= sat_max) & below
    cold[:y0] = False
    return grow(region, region | cold), y0


def grow(region: np.ndarray, allowed: np.ndarray) -> np.ndarray:
    """Заливка из region по allowed (4-связность)."""
    while True:
        grown = region.copy()
        grown[1:] |= region[:-1]
        grown[:-1] |= region[1:]
        grown[:, 1:] |= region[:, :-1]
        grown[:, :-1] |= region[:, 1:]
        grown &= allowed
        if (grown == region).all():
            return region
        region = grown


def hole_mask(rgba: np.ndarray, tol: int, warm_min: int, min_size: int) -> np.ndarray:
    """Непрозрачные куски студийного фона внутри силуэта (между ножками и т.п.).

    Фон однородный и тёплый; берём самый частый тёплый светлый цвет как эталон,
    затем морфологическим открытием отбрасываем мелкие блики на корпусе.
    """
    a = rgba[..., 3]
    rgb = rgba[..., :3].astype(np.int16)
    warm = (rgb[..., 0] - rgb[..., 2]) >= warm_min
    light = (a > 0) & warm & (rgb.mean(axis=2) >= 200)
    if not light.any():
        return np.zeros(a.shape, bool)
    colors, counts = np.unique(rgb[light].reshape(-1, 3), axis=0, return_counts=True)
    ref = colors[np.argmax(counts)]
    cand = (a > 0) & warm & (np.abs(rgb - ref).max(axis=2) <= tol)

    core = cand.copy()
    for _ in range(min_size):  # эрозия: выживают только крупные области
        core[1:] &= cand[:-1] & core[1:]
        core[:-1] &= core[1:]
        core[:, 1:] &= core[:, :-1]
        core[:, :-1] &= core[:, 1:]
    print(f"  фон ~{ref.tolist()}")
    return grow(core, cand)


def island_mask(alpha: np.ndarray, removed: np.ndarray) -> np.ndarray:
    """Пиксели, не связанные с основным силуэтом после удаления тени."""
    solid = (alpha > 0) & ~removed
    if not solid.any():
        return np.zeros_like(solid)
    # Затравка — непрозрачный пиксель, ближайший к центру масс силуэта.
    opaque = np.argwhere(alpha == 255)
    if opaque.size == 0:
        return np.zeros_like(solid)
    cy, cx = opaque.mean(axis=0)
    sy, sx = opaque[np.argmin((opaque[:, 0] - cy) ** 2 + (opaque[:, 1] - cx) ** 2)]

    seed = np.zeros_like(solid)
    seed[sy, sx] = True
    return solid & ~grow(seed, solid)


def process(path: Path, args: argparse.Namespace) -> None:
    im = Image.open(path).convert("RGBA")
    rgba = np.array(im)
    alpha = rgba[..., 3]

    if args.stats:
        h = alpha.shape[0]
        ys = np.nonzero(alpha.max(axis=1) > 0)[0]
        y0 = int(ys[-1] - (ys[-1] - ys[0]) * args.band)
        sub = rgba[y0:]
        lum = sub[..., :3].astype(np.int16).mean(axis=2)
        light = (sub[..., 3] > 0) & (lum >= args.lum_min)
        hist, _ = np.histogram(sub[..., 3][light], bins=[1, 64, 128, 192, 250, 256])
        print(f"{path.name}: {im.size}, band y>={y0}/{h}, light px by alpha "
              f"[1-63,64-127,128-191,192-249,250-255] = {hist.tolist()}")
        return

    if args.holes:
        removed = hole_mask(rgba, args.tol, max(args.warm_min, 3), args.min_size)
        y0 = 0
    else:
        removed, y0 = shadow_mask(rgba, args.band, args.alpha_max, args.lum_min, args.sat_max, args.warm_min)
    islands = island_mask(alpha, removed)
    islands[:y0] = False  # острова ищем только у пола
    kill = removed | islands
    print(f"{path.name}: shadow={int(removed.sum())} islands={int(islands.sum())}")

    if args.preview:
        out = Path(args.out)
        out.mkdir(parents=True, exist_ok=True)
        bg = Image.new("RGBA", im.size, (40, 44, 52, 255))
        bg.alpha_composite(im)
        prev = np.array(bg)
        prev[kill] = (255, 0, 0, 255)
        crop = Image.fromarray(prev)
        # Только нижняя треть, уменьшенная, — чтобы превью было лёгким.
        w, h = crop.size
        crop = crop.crop((0, 0 if args.holes else int(h * 0.66), w, h))
        crop.thumbnail((700, 700))
        crop.convert("RGB").save(out / f"{path.stem}-mask.png")
        return

    if args.apply:
        BACKUP_DIR.mkdir(exist_ok=True)
        backup = BACKUP_DIR / path.name
        if not backup.exists():  # не затираем исходник повторным запуском
            shutil.copy2(path, backup)
        rgba[kill] = 0
        Image.fromarray(rgba, "RGBA").save(path, "WEBP", quality=92, method=6)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--stats", action="store_true")
    mode.add_argument("--preview", action="store_true")
    mode.add_argument("--apply", action="store_true")
    p.add_argument("names", nargs="*", default=list(DEFAULT_NAMES),
                   help="суффиксы robot-<name>.webp")
    p.add_argument("--out", default="preview", help="папка для превью")
    p.add_argument("--band", type=float, default=0.25, help="доля высоты силуэта снизу")
    p.add_argument("--alpha-max", type=int, default=255, help="макс. альфа тени")
    p.add_argument("--lum-min", type=int, default=185, help="мин. яркость тени")
    p.add_argument("--sat-max", type=int, default=30, help="макс. насыщенность тени")
    p.add_argument("--warm-min", type=int, default=1, help="мин. R−B тени (тёплый оттенок)")
    p.add_argument("--holes", action="store_true",
                   help="режим «дырки»: убрать куски фона внутри силуэта, а не тень")
    p.add_argument("--tol", type=int, default=10, help="допуск к цвету фона (--holes)")
    p.add_argument("--min-size", type=int, default=4, help="радиус эрозии против бликов (--holes)")
    p.add_argument("--from-backup", action="store_true",
                   help="брать исходник из _backup/, если он там есть")
    args = p.parse_args()

    for name in args.names:
        path = ROBOTS_DIR / f"robot-{name}.webp"
        if not path.exists():
            print(f"skip: {path.name} не найден", file=sys.stderr)
            continue
        backup = BACKUP_DIR / path.name
        if args.from_backup and backup.exists():
            shutil.copy2(backup, path)
        process(path, args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
