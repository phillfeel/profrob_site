#!/usr/bin/env python3
"""Вырезает робота со студийного серого фона в webp с альфой, как остальные assets/robots/*.webp.

Фон в генерациях однородный и плоский (локальный разброс ~0.5), а подносы и панели
корпуса бывают почти того же тона, но с фактурой. Поэтому фон = «близко к эталону
по цвету И плоско». Берётся область, связанная с краем кадра, плюс крупные плоские
просветы внутри силуэта (между подносами, под головой) — их с края не достать.

Тень на полу темнее фона, но светлее днища: под нижней кромкой корпуса всё, что
светлее --shadow-max, считается тенью и уходит в прозрачность.

Кромка: жёсткая маска → лёгкое размытие альфы → цвет «отмывается» от серого фона,
иначе на тёмном подиуме вокруг белого корпуса виден серый ореол.

Пример:
  python3 tools/cutout_robot.py "assets/роботс/доставщик.png" assets/robots/robot-delivery.webp --preview /tmp/p.png
"""
from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def local_std(gray: np.ndarray, r: int) -> np.ndarray:
    k = (2 * r + 1, 2 * r + 1)
    m = cv2.blur(gray, k)
    return np.sqrt(np.maximum(cv2.blur(gray * gray, k) - m * m, 0))


def background_mask(rgb: np.ndarray, tol: int, flat: float, min_hole: int) -> tuple[np.ndarray, np.ndarray]:
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    ref = np.median(border, axis=0)
    dist = np.abs(rgb - ref).max(axis=2)
    std = local_std(rgb.mean(axis=2), 3)
    cand = ((dist <= tol) & (std <= flat)).astype(np.uint8)

    n, lab, stats, _ = cv2.connectedComponentsWithStats(cand, connectivity=4)
    keep = np.zeros(n, bool)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    keep[edge] = True
    keep[stats[:, cv2.CC_STAT_AREA] >= min_hole] = True
    keep[0] = False
    bg = keep[lab]
    # Мягкий переход фон→объект: дотягиваем фон по пикселям, которые просто близки к эталону.
    near = (dist <= tol * 1.6).astype(np.uint8)
    for _ in range(3):
        bg = bg | (cv2.dilate(bg.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & near.astype(bool))
    return bg, ref


def shadow_mask(rgb: np.ndarray, fg: np.ndarray, ref: np.ndarray, shadow_max: int, band: float) -> np.ndarray:
    """Тень под днищем: ниже нижней кромки силуэта, малонасыщенная, светлее днища."""
    ys = np.nonzero(fg.any(axis=1))[0]
    top, bottom = ys[0], ys[-1]
    y0 = int(bottom - (bottom - top) * band)
    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    soft = fg & (lum > shadow_max) & (lum < ref.mean() + 4) & (sat < 14)
    soft[:y0] = False
    # Только то, что связано с фоном снизу/сбоку: блики на днище не трогаем.
    region = soft & ~cv2.erode(fg.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    allowed = soft
    while True:
        grown = cv2.dilate(region.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & allowed
        if (grown == region).all():
            return region
        region = grown


def floor_cut(rgb: np.ndarray, fg: np.ndarray, band: float, keep: int, edge: float = 12) -> np.ndarray:
    """Контактная тень: у самого пола она так же темна, как днище, по яркости не отделить.

    Тень — монотонный градиент: от пола вверх она темнеет до щели под днищем или до
    контакта колеса. Идём по столбцу снизу вверх, пока темнеет; первый локальный минимум
    и есть контакт, всё ниже срезаем. Возвращает маску того, что убрать.
    """
    ys = np.nonzero(fg.any(axis=1))[0]
    top, bottom = ys[0], ys[-1]
    y0 = int(bottom - (bottom - top) * band)
    raw = rgb.mean(axis=2)
    lum = cv2.GaussianBlur(raw, (1, 5), 0)
    h, w = fg.shape
    cut = np.full(w, h, np.int32)
    for x in range(w):
        col = np.nonzero(fg[y0:, x])[0]
        if col.size < 4:
            continue
        y = y0 + col[-1]
        lo = y
        # Допуск 1.5: шум не должен останавливать подъём раньше времени.
        while y > y0 + col[0] and lum[y - 1, x] <= lum[lo, x] + 1.5:
            y -= 1
            if raw[y, x] < raw[y + 1, x] - edge:
                lo = y  # резкая кромка корпуса: тень так не обрывается, дальше уже робот
                break
            if lum[y, x] < lum[lo, x]:
                lo = y
        cut[x] = lo + keep
    # Сглаживаем линию среза, чтобы кромка не была рваной.
    valid = cut < h
    smooth = cut.copy()
    r = 3
    for x in np.nonzero(valid)[0]:
        win = cut[max(0, x - r): x + r + 1]
        smooth[x] = int(np.median(win[win < h]))
    rows = np.arange(h)[:, None]
    return rows > smooth[None, :]


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("src")
    p.add_argument("dst")
    p.add_argument("--tol", type=int, default=8, help="допуск к цвету фона")
    p.add_argument("--flat", type=float, default=2.0, help="макс. локальный разброс фона")
    p.add_argument("--min-hole", type=int, default=4000, help="мин. площадь просвета внутри силуэта")
    p.add_argument("--shadow-max", type=int, default=96, help="тень светлее этой яркости")
    p.add_argument("--band", type=float, default=0.12, help="доля высоты снизу, где ищем тень")
    p.add_argument("--floor-band", type=float, default=0.06,
                   help="доля высоты снизу для среза контактной тени (0 — выкл.)")
    p.add_argument("--floor-keep", type=int, default=-1, help="сколько px оставить ниже тёмной линии")
    p.add_argument("--pad", type=int, default=4, help="прозрачное поле вокруг силуэта, px")
    p.add_argument("--preview", help="PNG: результат на тёмном и светлом фоне")
    args = p.parse_args()

    rgb = np.array(Image.open(args.src).convert("RGB")).astype(np.float32)
    bg, ref = background_mask(rgb, args.tol, args.flat, args.min_hole)
    fg = ~bg
    fg &= ~shadow_mask(rgb, fg, ref, args.shadow_max, args.band)
    if args.floor_band > 0:
        fg &= ~floor_cut(rgb, fg, args.floor_band, args.floor_keep)

    # Оставляем только крупные связные куски: крошки фона/тени по краю отбрасываем.
    n, lab, stats, _ = cv2.connectedComponentsWithStats(fg.astype(np.uint8), connectivity=8)
    big = stats[:, cv2.CC_STAT_AREA] >= 200
    big[0] = False
    fg = big[lab]
    fg = cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)

    alpha = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 0.8)
    alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)

    # Отмывка кромки от фона: C = a·F + (1−a)·B → F = (C − (1−a)·B) / a
    a3 = alpha[..., None]
    out = np.where(a3 > 0.02, (rgb - (1 - a3) * ref) / np.maximum(a3, 0.02), 0)
    out = np.clip(out, 0, 255)
    rgba = np.dstack([out, alpha * 255]).round().astype(np.uint8)

    ys, xs = np.nonzero(rgba[..., 3] > 0)
    y1, y2 = max(ys.min() - args.pad, 0), min(ys.max() + args.pad + 1, rgba.shape[0])
    x1, x2 = max(xs.min() - args.pad, 0), min(xs.max() + args.pad + 1, rgba.shape[1])
    rgba = rgba[y1:y2, x1:x2]
    rgba[rgba[..., 3] == 0, :3] = 0

    img = Image.fromarray(rgba, "RGBA")
    dst = Path(args.dst)
    img.save(dst, "WEBP", quality=92, method=6)
    print(f"{dst}: {img.size}")

    if args.preview:
        w, h = img.size
        sheet = Image.new("RGBA", (w * 2, h), (0, 0, 0, 255))
        sheet.paste(Image.new("RGBA", (w, h), (44, 49, 58, 255)), (0, 0))
        sheet.paste(Image.new("RGBA", (w, h), (238, 236, 232, 255)), (w, 0))
        sheet.alpha_composite(img, (0, 0))
        sheet.alpha_composite(img, (w, 0))
        sheet.convert("RGB").save(args.preview)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
