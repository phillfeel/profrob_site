// Builds the industry landings (industries-<slug>.html in the project root).
// One shell (nav, form, footer) for all pages; each industry picks its own hero layout, section order and a
// signature block, so the pages share a design system but don't look like copies.
//
//   node tools/industries/build.mjs                 # all pages
//   node tools/industries/build.mjs --only retail   # one page
//
// Sources: the first five industries live in data.mjs. Newer ones live one per file in pages/<slug>.mjs:
//   export default { industry, brands?, renderers?, icons? }
//   - industry: same shape as an INDUSTRIES entry, plus optional heads, problemsStyle, secNames;
//   - brands: extra BRANDS entries (no `file` → shown as a text name);
//   - renderers: { [sectionKey]: (ind, n, h) => html } — own hero or signature blocks; h holds the helpers below;
//   - icons: extra <symbol id="i-…"> strings for the sprite.
// A page's own styles go to industry-<slug>.css, its own script to industry-<slug>.js (both in the root);
// they are linked automatically when present.
// Edit the sources, then rebuild. Don't edit the generated HTML by hand.
import { writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { BRANDS, INDUSTRIES as BASE_INDUSTRIES } from './data.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const ROI = createRequire(import.meta.url)(join(root, 'roi-model.js'));

const pagesDir = join(here, 'pages');
const PAGE_MODULES = existsSync(pagesDir)
  ? await Promise.all((await readdir(pagesDir)).filter((f) => f.endsWith('.mjs')).sort()
    .map(async (f) => (await import(pathToFileURL(join(pagesDir, f)).href)).default))
  : [];
for (const m of PAGE_MODULES) {
  if (!m || !m.industry) throw new Error('pages/*.mjs must export default { industry, ... }');
  for (const [k, b] of Object.entries(m.brands || {})) if (!BRANDS[k]) BRANDS[k] = b;
  m.industry.renderers = m.renderers || {};
}
const INDUSTRIES = [...BASE_INDUSTRIES, ...PAGE_MODULES.map((m) => m.industry)];
const EXTRA_ICONS = PAGE_MODULES.flatMap((m) => m.icons || []).join('\n    ');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');
const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};
const fmtMonths = (m) => (Number.isFinite(m) ? `≈ ${Math.round(m)} мес` : 'не окупается');
const fmtMln = (rub) => `≈ ${(rub / 1e6).toFixed(1).replace('.', ',')} млн ₽`;

const ARROW_UR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
const ARROW_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const goArrow = `<span class="go-arrow">${ARROW_UR}</span>`;
const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;

const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <symbol id="i-people" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></symbol>
    <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></symbol>
    <symbol id="i-truck" viewBox="0 0 24 24"><path d="M2 6h12v10H2zM14 9h4l4 4v3h-8"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></symbol>
    <symbol id="i-star" viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></symbol>
    <symbol id="i-alert" viewBox="0 0 24 24"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></symbol>
    <symbol id="i-ruler" viewBox="0 0 24 24"><path d="m3 17 14-14 4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/></symbol>
    <symbol id="i-weight" viewBox="0 0 24 24"><path d="M6 8h12l2 12H4z"/><circle cx="12" cy="5" r="2"/></symbol>
    <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/></symbol>
    <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
    <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.4 12 20 12 20z"/></symbol>
    <symbol id="i-box" viewBox="0 0 24 24"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/></symbol>
    <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></symbol>
    <symbol id="i-stairs" viewBox="0 0 24 24"><path d="M3 20h5v-5h5v-5h5V5h3"/></symbol>
    <symbol id="i-map" viewBox="0 0 24 24"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></symbol>
    <symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>${EXTRA_ICONS ? `\n    ${EXTRA_ICONS}` : ''}
  </defs></svg>`;

// Section titles that differ per industry. Anything missing falls back to DEFAULT_HEADS.
const DEFAULT_HEADS = {
  problems: 'С чем сталкивается отрасль.',
  directions: 'Что роботизируем.',
  results: 'Что получает бизнес.',
  vendors: 'Оборудование и производители.',
  pilot: 'Начните с одного участка.',
  see: 'Смотрите также.',
};
const HEADS = {
  hotels: { problems: 'Где отель теряет деньги и сервис.' },
  construction: { problems: 'Что тормозит работу на площадке.' },
  'medical-wellness': { problems: 'Где у клиники уходит время персонала.', pilot: 'Начните с одного маршрута.' },
  manufacturing: { problems: 'Что мешает производству расти.', pilot: 'Начните с одного маршрута.' },
  agriculture: { problems: 'Почему поле не ждёт.', pilot: 'Начните с одного поля.' },
};
const head = (ind, key) => (ind.heads && ind.heads[key]) || (HEADS[ind.slug] && HEADS[ind.slug][key]) || DEFAULT_HEADS[key];

const SEC_NAMES = {
  problems: 'ПРОБЛЕМЫ', day: 'СУТКИ ОТЕЛЯ', directions: 'НАПРАВЛЕНИЯ', stairs: 'НАПРАВЛЕНИЯ', economy: 'ЭКОНОМИКА',
  results: 'РЕЗУЛЬТАТ', vendors: 'ОБОРУДОВАНИЕ', case: 'КЕЙС', why: 'ПОЧЕМУ ПРОФРОБОТ', form: 'ЗАЯВКА',
  see: 'СМОТРИТЕ ТАКЖЕ', safety: 'БЕЗОПАСНОСТЬ', route: 'МАРШРУТ', pilot: 'С ЧЕГО НАЧАТЬ', season: 'СЕЗОН',
};

const uniqueBrands = (ind) => [...new Set(ind.vendors.flatMap((g) => g.brands))];

// ───────── pieces ─────────
const idx = (n, name, extra = '') => `<span class="idx reveal"${extra}><b>${n}</b> — ${name}</span>`;
const secHead = (n, name, title, lead, id) => `<div class="sol-head">
        ${idx(n, name)}
        <h2 class="h2 reveal" id="${id}">${esc(title)}</h2>${lead ? `\n        <p class="lead reveal">${esc(lead)}</p>` : ''}
      </div>`;

const logo = (slug, k = 'vlogo') => {
  const b = BRANDS[slug];
  if (!b) throw new Error(`Unknown brand "${slug}"`);
  if (!b.file) return `<li class="${k} ${k}--text">${esc(b.name)}</li>`;
  return `<li class="${k}"><img src="assets/brands/${b.file}" alt="${esc(b.name)}" style="--h:${b.h}px" width="${b.w}" height="${b.hh}" loading="lazy"></li>`;
};

const photo = (ind, ratio, cls = '') => {
  const p = ind.photo;
  const nDir = ind.directions.length, nBr = uniqueBrands(ind).length;
  const metrics = `<div class="ph__metrics"><span><b class="tnum">${nDir}</b> ${plural(nDir, 'направление', 'направления', 'направлений')}</span><span><b class="tnum">${nBr}</b> ${plural(nBr, 'производитель', 'производителя', 'производителей')}</span></div>`;
  if (existsSync(join(root, 'assets', 'industry_hero', `${ind.slug}.webp`))) {
    return `<figure class="ph ph--photo ${cls} reveal" style="--ar:${ratio.replace(':', '/')};--i:2">
          <img class="ph__img" src="assets/industry_hero/${ind.slug}.webp" alt="${esc(p.alt)}" width="1536" height="1024" decoding="async">
          ${metrics}
        </figure>`;
  }
  return `<!-- Место под фото Hero (${ratio}): ${esc(p.note)}, docs/specs/ПРОМПТЫ_HERO_ОТРАСЛИ.md. alt будущего фото: «${esc(p.alt)}» -->
        <figure class="ph ${cls} reveal" style="--ar:${ratio.replace(':', '/')};--i:2">
          <img class="ph__robot" src="assets/robots/${p.robot}" alt="" width="${p.w}" height="${p.h}">
          <figcaption class="ph__lbl mono">Место под фото · ${ratio}</figcaption>
          ${metrics}
        </figure>`;
};

const crumbs = (ind) => `<nav class="crumbs reveal" aria-label="Хлебные крошки"><ol><li><a href="index.html">Главная</a></li><li><a href="index.html#industries">Отрасли</a></li><li aria-current="page">${esc(ind.name)}</li></ol></nav>`;

const heroCopy = (ind, n) => `${crumbs(ind)}
          ${idx(n, ind.name.toUpperCase())}
          <h1 class="h1 ih__h1 reveal">${ind.h1.map((l) => `<span>${esc(l)}</span>`).join(' ')}</h1>
          <div class="ih__text reveal" style="--i:1">
            <p class="lead">${esc(ind.lead)}</p>
            <p>${esc(ind.lead2)}</p>
          </div>
          <div class="ih__cta reveal" style="--i:2">
            <a class="btn btn-pri" href="${ind.primaryCta.href}">${esc(ind.primaryCta.label)}</a>
            <a class="text-link" href="${ind.secondaryCta.href}">${esc(ind.secondaryCta.label)} ${ARROW_R}</a>
          </div>
          <p class="ih__aud reveal" style="--i:3"><span class="mono">Для кого</span> ${ind.audiences.map(esc).join(' · ')}</p>`;

// ───────── sections ─────────
const S = {};

S.hero = (ind, n) => {
  const nm = ind.name.toUpperCase();
  switch (ind.hero) {
    case 'stage':
      return `<section class="ih ih--stage" data-sec="${n}" data-name="${nm}">
      <div class="stage ih__stage">
        <div class="ih__grid">
          <div class="ih__copy">
          ${heroCopy(ind, n)}
          </div>
          ${photo(ind, '4:3', 'ph--dark')}
        </div>
        <ul class="ih__ticker mono" aria-label="Направления">${ind.directions.map((d) => `<li><a href="#${d.anchor}">${esc(d.title)}</a></li>`).join('')}</ul>
      </div>
    </section>`;
    case 'center':
      return `<section class="ih ih--center wrap" data-sec="${n}" data-name="${nm}">
      <div class="ih__copy">
          ${heroCopy(ind, n)}
      </div>
      ${photo(ind, '21:9', 'ph--wide')}
      ${ind.compliance ? `<!-- TODO(legal): формулировку согласовать с юристом -->
      <aside class="ih__note reveal" aria-label="Важно">${icon('shield')}<p>${esc(ind.compliance)}</p></aside>` : ''}
    </section>`;
    case 'mirror':
      return `<section class="ih ih--mirror wrap" data-sec="${n}" data-name="${nm}">
      <div class="ih__grid">
        ${photo(ind, '4:5')}
        <div class="ih__copy">
          ${heroCopy(ind, n)}
        </div>
      </div>
    </section>`;
    case 'pano':
      return `<section class="ih ih--pano wrap" data-sec="${n}" data-name="${nm}">
      <div class="ih__copy">
          ${heroCopy(ind, n)}
      </div>
      ${photo(ind, '21:9', 'ph--wide')}
    </section>`;
    default:
      return `<section class="ih ih--split wrap" data-sec="${n}" data-name="${nm}">
      <div class="ih__grid">
        <div class="ih__copy">
          ${heroCopy(ind, n)}
        </div>
        ${photo(ind, '4:5')}
      </div>
    </section>`;
  }
};

const PROB_STYLE = { hotels: 'cards', construction: 'list', 'medical-wellness': 'soft', manufacturing: 'table', agriculture: 'strip' };
S.problems = (ind, n) => {
  const style = ind.problemsStyle || PROB_STYLE[ind.slug] || 'cards';
  const items = ind.problems.map((p, i) => `<li class="prob reveal" style="--i:${i + 1}">
          <span class="ic-tile">${icon(p.icon)}</span><span class="prob__no mono">${pad(i + 1)}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.text)}</p>
        </li>`).join('\n        ');
  return `<section class="sol-sec wrap" id="problems" data-sec="${n}" data-name="${SEC_NAMES.problems}" aria-labelledby="problems-h">
      ${secHead(n, SEC_NAMES.problems, head(ind, 'problems'), null, 'problems-h')}
      <ol class="probs probs--${style}">
        ${items}
      </ol>
    </section>`;
};

const dirRow = (d, i) => `<article class="drow reveal" id="${d.anchor}" style="--i:${i}">
          <div class="drow__l">
            <span class="drow__no mono">${pad(i + 1)}</span>
            <h3>${esc(d.title)}</h3>
            <p>${esc(d.text)}</p>
          </div>
          <div class="drow__r">
            <p class="drow__items">${d.items.map(esc).join(' · ')}</p>
            <a class="drow__sol" href="${d.solution.href}">Решение: ${esc(d.solution.label)} ${ARROW_UR}</a>
          </div>
        </article>`;

S.directions = (ind, n) => `<section class="sol-sec wrap" id="directions" data-sec="${n}" data-name="${SEC_NAMES.directions}" aria-labelledby="directions-h">
      ${secHead(n, SEC_NAMES.directions, head(ind, 'directions'), null, 'directions-h')}
      <div class="drows">
        ${ind.directions.map(dirRow).join('\n        ')}
      </div>
    </section>`;

S.day = (ind, n) => {
  const ticks = [0, 6, 12, 18, 24].map((h) => `<span style="--at:${h}">${pad(h)}:00</span>`).join('');
  const segs = ind.day.map((s, i) => `<li class="day__seg reveal" style="--from:${s.from};--to:${s.to};--i:${i}">
            <a href="#${s.anchor}">
              <span class="day__bar"></span>
              <span class="day__t mono tnum">${pad(s.from)}:00–${pad(s.to % 24)}:00</span>
              <b>${esc(s.title)}</b>
              <span class="day__x">${esc(s.text)}</span>
            </a>
          </li>`).join('\n          ');
  return `<section class="sol-sec" id="day" data-sec="${n}" data-name="${SEC_NAMES.day}" aria-labelledby="day-h">
      <div class="stage day">
        <div class="day__head">
          ${idx(n, SEC_NAMES.day)}
          <h2 class="h2 reveal" id="day-h">Сутки отеля: где работает робот.</h2>
          <p class="lead reveal">Ночь и пиковые часы — там, где людей не хватает или они дорогие. Пример дня, расписание собираем под ваш отель.</p>
        </div>
        <div class="day__scale" aria-hidden="true">${ticks}</div>
        <ol class="day__track">
          ${segs}
        </ol>
      </div>
    </section>`;
};

S.economy = (ind, n) => {
  const t0 = 'hotel', T = ROI.TYPES[t0], m0 = T.mode0, r = ROI.calc({ type: t0, area: T.area0, mode: m0 });
  const types = Object.entries(ROI.TYPES).map(([k, t]) => `<label class="seg__o"><input type="radio" name="calc-type" value="${k}"${k === t0 ? ' checked' : ''}><span>${esc(t.name)}</span></label>`).join('');
  const modes = Object.entries(ROI.MODES).map(([k, m]) => `<label class="seg__o"><input type="radio" name="calc-mode" value="${k}"${k === m0 ? ' checked' : ''}><span>${esc(m.name)}</span></label>`).join('');
  return `<section class="sol-sec wrap" id="economy" data-sec="${n}" data-name="${SEC_NAMES.economy}" aria-labelledby="economy-h">
      <div class="econ">
        <div class="econ__copy">
          ${idx(n, SEC_NAMES.economy)}
          <h2 class="h2 reveal" id="economy-h">Уборка окупается быстрее всего.</h2>
          <p class="lead reveal">Робот убирает общие зоны ночью, без ночной бригады и доплат. Посчитайте свой объект.</p>
          <span class="badge-roi reveal">Быстрая окупаемость</span>
        </div>
        <form class="calc reveal" data-calc aria-label="Быстрый расчёт окупаемости уборки">
          <fieldset class="calc__f"><legend>Объект</legend><div class="seg">${types}</div></fieldset>
          <div class="calc__f">
            <label for="calc-area">Площадь</label>
            <div class="calc__range"><input id="calc-area" type="range" min="${T.area[0]}" max="${T.area[1]}" step="500" value="${T.area0}" aria-valuetext="${T.area0.toLocaleString('ru-RU')} м²"><output for="calc-area" class="tnum" data-out="area">${T.area0.toLocaleString('ru-RU')} м²</output></div>
          </div>
          <fieldset class="calc__f"><legend>Режим уборки</legend><div class="seg">${modes}</div></fieldset>
          <dl class="calc__res" aria-live="polite">
            <div><dt>Окупаемость</dt><dd class="tnum" data-out="payback">${fmtMonths(r.payback)}</dd></div>
            <div><dt>Экономия в год</dt><dd class="tnum" data-out="net">${fmtMln(r.net)}</dd></div>
          </dl>
          <p class="calc__note">Ориентир по нашей модели. Точный расчёт — после аудита объекта.</p>
          <a class="btn btn-pri" data-out="link" href="roi.html?t=${t0}&amp;a=${T.area0}&amp;m=${m0}">Полный расчёт ROI ${ARROW_R}</a>
        </form>
      </div>
    </section>`;
};

S.results = (ind, n) => `<section class="sol-sec wrap" id="results" data-sec="${n}" data-name="${SEC_NAMES.results}" aria-labelledby="results-h">
      <div class="resx">
        <div class="resx__head">
          ${idx(n, SEC_NAMES.results)}
          <h2 class="h2 reveal" id="results-h">${esc(head(ind, 'results'))}</h2>
        </div>
        <ul class="res">
          ${ind.results.map((r, i) => `<li class="reveal" style="--i:${i}"><span class="res__ic">${icon('check')}</span>${esc(r)}</li>`).join('\n          ')}
        </ul>
      </div>
    </section>`;

S.vendors = (ind, n) => `<section class="sol-sec wrap" id="vendors" data-sec="${n}" data-name="${SEC_NAMES.vendors}" aria-labelledby="vendors-h">
      ${secHead(n, SEC_NAMES.vendors, head(ind, 'vendors'), ind.vendorsLead, 'vendors-h')}
      <div class="vend">
        ${ind.vendors.map((g, i) => `<div class="vend__grp reveal" style="--i:${i}">
          <h3 class="mono">${esc(g.group)}</h3>
          <ul class="vend__list">${g.brands.map((b) => logo(b)).join('')}</ul>
        </div>`).join('\n        ')}
      </div>
    </section>`;

S.case = (ind, n) => {
  let body;
  if (ind.estimate) {
    const e = ind.estimate, r = ROI.calc({ type: e.type, area: e.area, mode: e.mode });
    body = `<article class="icase icase--est reveal">
        <div class="icase__l">
          <span class="mono icase__flag">Расчётный ориентир</span>
          <h3>${esc(e.object)}</h3>
          <p>Реального кейса по отелю пока нет — показываем расчёт по нашей ROI-модели. Фактические цифры появятся после пилота.</p>
          <a class="text-link" href="roi.html?t=${e.type}&amp;a=${e.area}&amp;m=${e.mode}">Как мы считали ${ARROW_R}</a>
        </div>
        <dl class="icase__nums">
          <div><dt>окупаемость</dt><dd class="tnum">${fmtMonths(r.payback)}</dd></div>
          <div><dt>экономия в год</dt><dd class="tnum">${fmtMln(r.net)}</dd></div>
          <div><dt>${plural(r.robots, 'робот', 'робота', 'роботов')} на объект</dt><dd class="tnum">${r.robots}</dd></div>
        </dl>
      </article>`;
  } else if (ind.cases.length === 1) {
    const c = ind.cases[0];
    body = `<article class="icase reveal">
        <div class="icase__ph"><img src="assets/cases_images/${c.img}" alt="${esc(c.alt)}" loading="lazy" decoding="async"></div>
        <div class="icase__body">
          <span class="mono case-kicker">${esc(c.tag)}</span>
          <div class="icase__res"><b class="tnum">${esc(c.value)}</b>${c.unit ? `<span class="mono">${esc(c.unit)}</span>` : ''}</div>
          <h3>${esc(c.title)}</h3>${c.note ? `\n          <p>${esc(c.note)}</p>` : ''}
          <a class="text-link" href="/cases/?industry=${ind.slug}">Смотреть кейс ${ARROW_R}</a>
        </div>
      </article>`;
  } else {
    body = `<div class="icases">${ind.cases.map((c, i) => `
        <article class="case reveal" style="--i:${i}"><div class="ph"><img src="assets/cases_images/${c.img}" alt="${esc(c.alt)}" loading="lazy" decoding="async"></div><div class="body"><span class="mono case-kicker">${esc(c.tag)}</span><div class="res"><b>${esc(c.value)}</b>${c.unit ? `<span class="mono">${esc(c.unit)}</span>` : ''}</div><h3>${esc(c.title)}</h3><a class="more" href="/cases/?industry=${ind.slug}">Смотреть кейс ${ARROW_UR}</a></div></article>`).join('')}
      </div>`;
  }
  const many = ind.cases && ind.cases.length > 1;
  return `<section class="sol-sec wrap" id="case" data-sec="${n}" data-name="${many ? 'КЕЙСЫ' : 'КЕЙС'}" aria-labelledby="case-h">
      ${secHead(n, many ? 'КЕЙСЫ' : 'КЕЙС', many ? 'Кейсы.' : ind.estimate ? 'Сколько это стоит отелю.' : 'Кейс.', null, 'case-h')}
      ${body}
    </section>`;
};

S.why = (ind, n) => `<section class="sol-sec wrap" id="why" data-sec="${n}" data-name="${SEC_NAMES.why}" aria-labelledby="why-h">
      <div class="whyn reveal">
        ${idx(n, SEC_NAMES.why)}
        <h2 class="whyn__h" id="why-h">${esc(ind.why.title)}</h2>
        <p>${esc(ind.why.text)}</p>
        <a class="text-link" href="${ind.why.link.href}">${esc(ind.why.link.label)} ${ARROW_R}</a>
      </div>
    </section>`;

S.form = (ind, n) => {
  const opts = ind.directions.map((d) => `<option value="${d.anchor}">${esc(d.title)}</option>`).join('\n              ');
  const talk = `<div class="talk">
        <div class="talk__copy">
          ${idx(n, SEC_NAMES.form)}
          <h2 class="h2 reveal" id="talk-h">${esc(ind.form.title)}</h2>
          <p class="lead reveal">${esc(ind.form.lead)}</p>
          <a class="text-link reveal" href="tel:+74951234567">Или позвоните: +7 (495) 123-45-67</a>
        </div>

        <form class="form reveal" id="lead-form" novalidate data-endpoint="" data-source="industries/${ind.slug}" aria-labelledby="talk-h">
          <div class="form__row">
            <div class="fld">
              <label for="f-name">Имя</label>
              <input id="f-name" name="name" type="text" autocomplete="name" maxlength="80" required aria-describedby="f-name-err">
              <span class="fld__err" id="f-name-err" role="alert"></span>
            </div>
            <div class="fld">
              <label for="f-phone">Телефон</label>
              <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required aria-describedby="f-phone-err">
              <span class="fld__err" id="f-phone-err" role="alert"></span>
            </div>
          </div>
          <div class="fld">
            <label for="f-dir">Направление <small>необязательно</small></label>
            <select id="f-dir" name="direction">
              <option value="">Пока не знаю</option>
              ${opts}
            </select>
          </div>
          <div class="hp" aria-hidden="true"><label>Не заполняйте <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
          <div class="fld">
            <label class="consent"><input type="checkbox" name="consent" id="f-consent" required aria-describedby="f-consent-err"><span>Согласен на обработку персональных данных. <a href="#">Политика конфиденциальности</a></span></label>
            <span class="fld__err" id="f-consent-err" role="alert"></span>
          </div>
          <div class="form__foot">
            <button class="btn btn-pri" type="submit"><span class="spin" aria-hidden="true"></span><span class="btn__t">${esc(ind.form.button)}</span></button>
            <span class="form__status" id="f-status" role="status" aria-live="polite"></span>
          </div>
          <div class="form__ok" role="status">
            <span class="ic-tile">${icon('check')}</span>
            <b>Заявка принята.</b>
            <p>Перезвоним в рабочее время.</p>
          </div>
        </form>
      </div>`;
  return ind.formStage
    ? `<section class="sol-sec" id="talk" data-sec="${n}" data-name="${SEC_NAMES.form}" aria-labelledby="talk-h">
      <div class="stage talk-stage">
      ${talk}
      </div>
    </section>`
    : `<section class="sol-sec wrap" id="talk" data-sec="${n}" data-name="${SEC_NAMES.form}" aria-labelledby="talk-h">
      ${talk}
    </section>`;
};

S.see = (ind, n) => `<section class="sol-sec wrap" id="see" data-sec="${n}" data-name="${SEC_NAMES.see}" aria-labelledby="see-h">
      ${secHead(n, SEC_NAMES.see, head(ind, 'see'), null, 'see-h')}
      <div class="seeg">
        ${ind.links.map((l, i) => `<a class="seel reveal" style="--i:${i}" href="${l.href}">
          <span class="dir__no">${esc(l.kicker)}</span>
          <h3>${esc(l.title)}</h3>
          <p>${esc(l.text)}</p>
          ${goArrow}
        </a>`).join('\n        ')}
      </div>
    </section>`;

S.safety = (ind, n) => `<section class="sol-sec" id="safety" data-sec="${n}" data-name="${SEC_NAMES.safety}" aria-labelledby="safety-h">
      <div class="stage zone">
        <div class="zone__grid">
          <div class="zone__copy">
            ${idx(n, SEC_NAMES.safety)}
            <h2 class="h2 reveal" id="safety-h">Людей — из опасной зоны.</h2>
            <p class="lead reveal">На демонтаже под обрушение идёт робот, а не бригада. Оператор управляет им с пульта и видит всю зону со стороны.</p>
          </div>
          <svg class="zone__svg reveal" viewBox="0 0 560 300" role="img" aria-label="Схема: робот работает в зоне демонтажа, оператор с пультом стоит за её пределами">
            <defs><pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v10" class="zone__hatch"/></pattern></defs>
            <circle cx="170" cy="150" r="128" class="zone__area"/>
            <circle cx="170" cy="150" r="128" fill="url(#hatch)"/>
            <text x="170" y="44" text-anchor="middle" class="zone__lbl">ЗОНА ДЕМОНТАЖА</text>
            <g class="zone__bot" transform="translate(126 128)"><rect x="0" y="28" width="70" height="22" rx="6"/><rect x="10" y="10" width="40" height="20" rx="4"/><path d="M48 16 L80 -8 L96 10" /><circle cx="12" cy="50" r="7"/><circle cx="58" cy="50" r="7"/></g>
            <path d="M232 150 C 300 120, 380 120, 452 140" class="zone__signal"/>
            <g class="zone__op" transform="translate(470 104)"><circle cx="14" cy="10" r="10"/><path d="M14 22 v40 M14 62 l-12 26 M14 62 l12 26 M14 32 l-16 14 M14 32 l16 14"/><rect x="-10" y="40" width="16" height="10" rx="2"/></g>
            <path d="M298 236 H 470" class="zone__dim"/><path d="M298 228 v16 M470 228 v16" class="zone__dim"/>
            <text x="384" y="264" text-anchor="middle" class="zone__lbl">ОПЕРАТОР ВНЕ ЗОНЫ</text>
          </svg>
        </div>
        <ul class="zone__facts">
          ${ind.safety.map((f, i) => `<li class="reveal" style="--i:${i}"><b>${esc(f.value)}</b><span>${esc(f.text)}</span></li>`).join('\n          ')}
        </ul>
      </div>
    </section>`;

S.route = (ind, n) => `<section class="sol-sec wrap" id="route" data-sec="${n}" data-name="${SEC_NAMES.route}" aria-labelledby="route-h">
      <div class="route">
        <div class="route__copy">
          ${idx(n, SEC_NAMES.route)}
          <h2 class="h2 reveal" id="route-h">Робот ездит, персонал лечит.</h2>
          <p class="lead reveal">Внутренняя логистика — самый простой сценарий для старта: маршрут понятный, эффект виден за первые недели.</p>
          <ul class="route__legend reveal">
            <li><i class="route__dot"></i><span><b>Аптека → отделение</b>медикаменты и расходники</span></li>
            <li><i class="route__dot"></i><span><b>Отделение → лаборатория</b>анализы по расписанию и по вызову</span></li>
            <li><i class="route__dot"></i><span><b>Бельевая → палаты</b>чистое бельё, ночью тоже</span></li>
          </ul>
        </div>
        <svg class="route__svg reveal" viewBox="0 0 640 360" role="img" aria-label="Схема этажа клиники: робот развозит медикаменты из аптеки в отделения и анализы в лабораторию по коридору через лифт">
          <rect x="8" y="8" width="624" height="344" rx="20" class="route__floor"/>
          <rect x="24" y="24" width="180" height="120" rx="12" class="route__room"/><text x="40" y="52" class="route__lbl">АПТЕКА</text>
          <rect x="220" y="24" width="200" height="120" rx="12" class="route__room"/><text x="236" y="52" class="route__lbl">ОТДЕЛЕНИЕ 1</text>
          <rect x="436" y="24" width="180" height="120" rx="12" class="route__room"/><text x="452" y="52" class="route__lbl">ЛАБОРАТОРИЯ</text>
          <rect x="24" y="216" width="180" height="120" rx="12" class="route__room"/><text x="40" y="244" class="route__lbl">БЕЛЬЕВАЯ</text>
          <rect x="220" y="216" width="200" height="120" rx="12" class="route__room"/><text x="236" y="244" class="route__lbl">ОТДЕЛЕНИЕ 2</text>
          <rect x="436" y="216" width="100" height="120" rx="12" class="route__room route__room--lift"/><text x="452" y="244" class="route__lbl">ЛИФТ</text>
          <path id="route-path" class="route__path" d="M114 144 V180 H320 V152 V180 H526 V152 V180 H486 V224 V180 H320 V224 V180 H114 V224 V180 Z"/>
          <circle r="9" class="route__bot"><animateMotion dur="14s" repeatCount="indefinite"><mpath href="#route-path"/></animateMotion></circle>
        </svg>
      </div>
    </section>`;

S.stairs = (ind, n) => `<section class="sol-sec wrap" id="directions" data-sec="${n}" data-name="${SEC_NAMES.stairs}" aria-labelledby="directions-h">
      ${secHead(n, SEC_NAMES.stairs, 'От простого к сложному.', 'Начинайте с нижней ступени: вложения меньше, окупаемость понятнее. Следующая ступень — когда первая уже работает.', 'directions-h')}
      <ol class="stairs">
        ${ind.directions.map((d, i) => `<li class="step reveal" id="${d.anchor}" style="--lv:${d.level};--i:${i}">
          <div class="step__meter" aria-label="Порог входа: ${['низкий', 'средний', 'выше среднего'][d.level - 1]}"><span class="mono">Порог входа</span><i></i><i></i><i></i></div>
          <span class="drow__no mono">${pad(i + 1)}</span>
          <h3>${esc(d.title)}</h3>
          <p>${esc(d.text)}</p>
          <p class="drow__items">${d.items.map(esc).join(' · ')}</p>
          <a class="drow__sol" href="${d.solution.href}">Решение: ${esc(d.solution.label)} ${ARROW_UR}</a>
        </li>`).join('\n        ')}
      </ol>
    </section>`;

S.pilot = (ind, n) => `<section class="sol-sec wrap" id="pilot" data-sec="${n}" data-name="${SEC_NAMES.pilot}" aria-labelledby="pilot-h">
      ${secHead(n, SEC_NAMES.pilot, head(ind, 'pilot'), null, 'pilot-h')}
      <ol class="steps">
        ${ind.pilot.map((s, i) => `<li class="steps__i reveal" style="--i:${i}"><span class="steps__no mono tnum">${pad(i + 1)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('\n        ')}
      </ol>
    </section>`;

S.season = (ind, n) => `<section class="sol-sec wrap" id="season" data-sec="${n}" data-name="${SEC_NAMES.season}" aria-labelledby="season-h">
      ${secHead(n, SEC_NAMES.season, 'Год хозяйства с роботами.', 'Экономику агротехники считаем за сезон, а не за месяц. Вот где в сезоне работает каждое направление.', 'season-h')}
      <ol class="season">
        ${ind.season.map((s, i) => `<li class="season__i season__i--${i} reveal" style="--i:${i}">
          <span class="season__band"></span>
          <span class="mono">${esc(s.name)}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
          ${s.anchor ? `<a class="drow__sol" href="#${s.anchor}">${esc(ind.directions.find((d) => d.anchor === s.anchor).title)} ↓</a>` : '<span class="season__us">Работа ПРОФРОБОТ</span>'}
        </li>`).join('\n        ')}
      </ol>
      <p class="season__foot">Сроки зависят от культуры и региона — календарь работ составляем на аудите.</p>
    </section>`;

// ───────── page ─────────
const page = (ind) => {
  const order = ind.sections;
  const total = order.length;
  const own = ind.renderers || {};
  const body = order.map((key, i) => {
    const render = own[key] || S[key];
    if (!render) throw new Error(`No renderer for section "${key}" (${ind.slug})`);
    const name = key === 'hero' ? 'HERO' : (ind.secNames && ind.secNames[key]) || SEC_NAMES[key] || key.toUpperCase();
    return `    <!-- ================= ${pad(i + 1)} ${name} ================= -->\n    ${render(ind, pad(i + 1), H)}`;
  }).join('\n\n');
  const url = `/industries/${ind.slug}/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Отрасли', item: '/industries/' },
        { '@type': 'ListItem', position: 3, name: ind.name, item: url },
      ] },
      { '@type': 'Service', name: ind.h1.join(' ').replace(/\.$/, ''), serviceType: 'Роботизация', areaServed: 'RU',
        provider: { '@type': 'Organization', name: 'ПРОФРОБОТ' },
        audience: { '@type': 'BusinessAudience', audienceType: ind.audiences.join(', ') } },
      { '@type': 'ItemList', name: 'Направления', itemListElement: ind.directions.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.title, url: `${url}#${d.anchor}` })) },
    ],
  };
  const needsRoi = order.includes('economy');
  return `<!DOCTYPE html>
<!-- Сгенерировано tools/industries/build.mjs из ${ind.renderers ? `tools/industries/pages/${ind.slug}.mjs` : 'tools/industries/data.mjs'}. Правьте данные и пересобирайте, не этот файл. -->
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(ind.title)}</title>
  <meta name="description" content="${esc(ind.description)}">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="solutions.css">
  <link rel="stylesheet" href="industry.css">
${existsSync(join(root, `industry-${ind.slug}.css`)) ? `  <link rel="stylesheet" href="industry-${ind.slug}.css">\n` : ''}  <script>document.documentElement.classList.add('js');</script>
  <noscript><style>.reveal { opacity: 1; transform: none; }</style></noscript>
</head>
<body class="sol-page ind-page ind--${ind.slug}">
  ${SPRITE}

  <!-- ================= NAV ================= -->
  <header class="nav" aria-label="Основная навигация">
    <a href="index.html" aria-label="ПРОФРОБОТ — на главную"><img src="assets/profrobot-logo.png" alt="ПРОФРОБОТ"></a>
    <nav class="nav-links">
      <a href="solutions.html">Решения</a>
      <a href="index.html#industries" class="on">Отрасли</a>
      <a href="index.html#platform">Платформа</a>
      <a href="index.html#cases">Кейсы</a>
      <a href="#talk">Контакты</a>
    </nav>
    <a class="btn btn-pri" href="#talk">Связаться</a>
  </header>

  <div class="counter" aria-hidden="true">
    <span class="cur tnum">01</span>
    <span class="bar"><i></i></span>
    <span class="tot tnum">${pad(total)}</span>
    <span class="lbl">${esc(ind.name.toUpperCase())}</span>
  </div>

  <main>
${body}
  </main>

  <footer class="site-foot sol-foot">
    <div class="stage foot">
      <div class="foot-top">
        <div class="foot-brand">
          <a href="index.html" aria-label="ПРОФРОБОТ — на главную"><img src="assets/profrobot-logo-inverse.png" alt="ПРОФРОБОТ" width="880" height="136"></a>
          <p>Независимый инженерно-сервисный интегратор роботизации. Внедряем решения с измеримой окупаемостью и обслуживаем их по SLA — по всей России.</p>
        </div>
        <div class="foot-call">
          <span class="mono">Отдел внедрения</span>
          <a class="foot-phone tnum" href="tel:+74951234567">+7 (495) 123-45-67</a>
          <a class="foot-mail" href="mailto:info@profrobot.ru">info@profrobot.ru</a>
        </div>
      </div>
      <div class="foot-bot">
        <span>© 2026 ПРОФРОБОТ. Все права защищены.</span>
        <a href="#">Политика конфиденциальности</a>
        <a class="foot-up" href="index.html#industries">Все отрасли <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg></a>
      </div>
    </div>
  </footer>

  <script type="application/ld+json">
  ${JSON.stringify(schema)}
  </script>
${needsRoi ? '  <script src="roi-model.js"></script>\n' : ''}  <script src="solutions.js"></script>
  <script src="industry.js"></script>
${existsSync(join(root, `industry-${ind.slug}.js`)) ? `  <script src="industry-${ind.slug}.js"></script>\n` : ''}</body>
</html>
`;
};

// Helpers for renderers in pages/*.mjs (passed as the third argument).
const H = { S, esc, pad, plural, idx, secHead, logo, photo, heroCopy, crumbs, icon, head, uniqueBrands,
  ARROW_UR, ARROW_R, goArrow, SEC_NAMES, ROI, fmtMonths, fmtMln };

const onlyArg = process.argv.indexOf('--only');
const only = onlyArg > -1 ? process.argv[onlyArg + 1] : null;
if (only && !INDUSTRIES.some((i) => i.slug === only)) throw new Error(`--only: unknown slug "${only}"`);

for (const ind of INDUSTRIES.filter((i) => !only || i.slug === only)) {
  const file = join(root, `industries-${ind.slug}.html`);
  await writeFile(file, page(ind));
  console.log('wrote', `industries-${ind.slug}.html`);
}
