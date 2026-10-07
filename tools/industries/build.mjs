// Builds the industry landings (industries-<slug>.html in the project root).
// One shell (nav, form, footer) for all pages; each industry picks its own hero layout, section order and a
// signature block, so the pages share a design system but don't look like copies.
//
//   node tools/industries/build.mjs                 # all pages
//   node tools/industries/build.mjs --only retail   # one page
//
// Sources: the first five industries live in data.mjs. Newer ones live one per file in pages/<slug>.mjs:
//   export default { industry, brands?, renderers?, icons?, data?, templates? }
//   - industry: same shape as an INDUSTRIES entry, plus optional heads, problemsStyle, secNames;
//   - brands: extra BRANDS entries (no `file` → shown as a text name);
//   - renderers: { [sectionKey]: (ind, n, h) => html } — own hero or signature blocks; h holds the helpers below;
//   - icons: extra <symbol id="i-…"> strings for the sprite;
//   - data: module-level constants that a renderer shows (sources, schedules…), so that their strings get message keys;
//   - templates: ICU templates of messages with variables that only this page uses.
// Every visible string needs a message key (data-i18n*): see the i18n block below and i18n/README.md. After a change:
//   node tools/industries/build.mjs && node tools/i18n/extract.mjs --write && node --test tools/i18n/check.mjs
// A page's own styles go to industry-<slug>.css, its own script to industry-<slug>.js (both in the root);
// they are linked automatically when present.
// Edit the sources, then rebuild. Don't edit the generated HTML by hand.
import { writeFile, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { BRANDS, INDUSTRIES as BASE_INDUSTRIES } from './data.mjs';
import { parse as icuParse, format as icuFormat } from '../i18n/icu.mjs';
import { NEEDS } from '../i18n/needs.mjs';
import { bootBlock } from '../i18n/embed.mjs';
import { footerNav } from '../site/footer-nav.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const ROI = createRequire(import.meta.url)(join(root, 'roi-model.js'));
const BOOT = bootBlock(readFileSync(join(root, 'i18n', 'boot.js'), 'utf8')); // language choice, inline: no request for Russian

// ───────── i18n ─────────
// Every string a visitor reads carries data-i18n* attributes (contract and key scheme: i18n/README.md); i18n/ru.json is
// extracted from this markup by tools/i18n. Keys of strings that live in industry data come from their place in the data
// (industries.<page>.<path>; list items are «items.<n>» or the item's own id/key). Strings written in the templates take
// explicit keys: L(path) for the page's own, C(name) for the shared shell, K(key) for any other.
const camel = (slug) => slug.replace(/-(\w)/g, (_, c) => c.toUpperCase());
let CUR = null; // slug of the page being rendered
const REG = new WeakMap(); // data object or array → key path
function registerKeys(node, path) {
  if (!node || typeof node !== 'object' || REG.has(node)) return;
  REG.set(node, path);
  if (Array.isArray(node)) {
    node.forEach((el, i) => {
      const id = el && typeof el === 'object' ? (typeof el.id === 'string' ? el.id : el.key) : undefined;
      registerKeys(el, `${path}.${typeof id === 'string' ? id : `items.${i}`}`);
    });
  } else {
    for (const [k, v] of Object.entries(node)) if (k !== 'renderers') registerKeys(v, `${path}.${k}`);
  }
}
// Names that are the same everywhere (solutions, products, services, link labels, quoted sources): one key for all pages.
const NAMES = {
  'Роботизированный клининг': 'common.solutionNames.cleaning',
  'Складская роботизация': 'common.solutionNames.warehouse',
  'Сервисные роботы': 'common.solutionNames.service',
  'Промышленная роботизация': 'common.solutionNames.industrial',
  'Медицинская робототехника': 'common.solutionNames.medical',
  'Строительная робототехника': 'common.solutionNames.construction',
  'Агророботы': 'common.solutionNames.agro',
  'Роботы безопасности': 'common.solutionNames.security',
  'Гуманоидные роботы': 'common.solutionNames.humanoid',
  'Агророботы и уход за территорией': 'common.solutionNames.agroGrounds',
  'Аренда роботов (RaaS)': 'common.linkNames.raas',
  'Диспетчеризация': 'common.linkNames.dispatch',
  'Пилотный проект': 'common.linkNames.pilotProject',
  'Пилот': 'common.linkNames.pilot',
  'Аудит объекта': 'common.linkNames.audit',
  'Аудит территории': 'common.linkNames.auditTerritory',
  'Сервисное обслуживание': 'common.linkNames.maintenance',
  'Подбор решения': 'common.linkNames.selection',
  'Муниципальные службы': 'industries.municipal.name',
  // Source labels that several pages quote
  'The Moscow Times, 19.08.2025': 'common.sources.moscowTimes20250819',
  'mos.ru, 13.04.2024': 'common.sources.mos20240413',
  'CORE.XP и DAKO Professional, «Коммерсантъ», 2025': 'common.sources.kommersantCoreDako2025',
  'CORE.XP в «Коммерсанте», 2025': 'common.sources.kommersantCore2025',
  'Все отрасли': 'industries.common.links.allIndustries',
  'Все 12 отраслевых страниц.': 'industries.common.links.allIndustriesText',
  'РЕШЕНИЕ': 'industries.common.kickers.solution',
  'ПРОДУКТ': 'industries.common.kickers.product',
  'УСЛУГА': 'industries.common.kickers.service',
  'КЕЙСЫ': 'industries.common.kickers.cases',
  'ОТРАСЛИ': 'industries.common.kickers.industries',
  'ОТРАСЛЬ': 'industries.common.kickers.industry',
};
// Messages with variables: the Russian text of such an element is rendered from this template, the template goes to ru.json.
export const TEMPLATES = {
  'industries.common.hero.metrics.directions': '<b>{n}</b> {n, plural, one {направление} few {направления} many {направлений} other {направлений}}',
  'industries.common.hero.metrics.makers': '<b>{n}</b> {n, plural, one {производитель} few {производителя} many {производителей} other {производителей}}',
  'industries.common.photo.placeholder': 'Место под фото · {ratio}',
  'industries.common.case.number': 'Кейс {no}',
  'industries.common.calc.months': '≈ {n} мес',
  'industries.common.calc.millions': '≈ {n, number, ::.0} млн ₽',
  'industries.common.calc.robots': '{n, plural, one {робот на объект} few {робота на объект} many {роботов на объект} other {роботов на объект}}',
};

/** Key of the string obj[field] of the industry being rendered. */
const dk = (obj, field) => {
  const text = obj[field];
  if (obj.href !== undefined && NAMES[text]) return NAMES[text];
  const base = REG.get(obj);
  if (base === undefined) throw new Error(`i18n: «${String(text).slice(0, 50)}» has no key path: register the data object (module export "data")`);
  const own = `industries.${camel(CUR)}`;
  if (base !== own && !base.startsWith(`${own}.`)) throw new Error(`i18n: «${String(text).slice(0, 50)}» belongs to ${base}: shared data needs an entry in NAMES`);
  return Array.isArray(obj) ? `${base}.items.${field}` : `${base}.${field}`;
};
const pk = (path) => `industries.${camel(CUR)}.${path}`;
const ck = (name) => `industries.common.${name}`;
// Attributes. T/TH: the string obj[field] from the data (text / text with inline tags); L: literal of this page's
// templates; C: literal of the shared shell; K: any key; TA: attribute messages, pairs of [attribute, key].
const K = (key) => ` data-i18n="${key}"`;
const KH = (key) => ` data-i18n-html="${key}"`;
const T = (obj, field) => K(dk(obj, field));
const TH = (obj, field) => KH(dk(obj, field));
const L = (path) => K(pk(path));
const LH = (path) => KH(pk(path));
const C = (name) => K(ck(name));
const CH = (name) => KH(ck(name));
const TA = (...pairs) => ` data-i18n-attr="${pairs.map(([a, k]) => `${a}:${k}`).join(';')}"`;
const TN = (key, text) => (NEEDS.test(text) ? K(key) : ''); // language-neutral text (numbers, names) needs no message
// A string together with its key, for pieces that take both (section heads, labels).
const tx = (t, k) => ({ t, k });
const dt = (obj, field) => tx(obj[field], dk(obj, field));
const lt = (path, t) => tx(t, pk(path));
const ct = (name, t) => tx(t, ck(name));
/** Message with variables: its attributes and the Russian text rendered from TEMPLATES. */
const msg = (key, args) => {
  const tpl = TEMPLATES[key];
  if (!tpl) throw new Error(`i18n: no template for ${key}`);
  const text = icuFormat(icuParse(tpl), args, 'ru');
  const rich = tpl.includes('<');
  return { attr: `${rich ? KH(key) : K(key)} data-i18n-args='${JSON.stringify(args)}'`, text: rich ? text.replace(/<b>/g, '<b class="tnum">') : esc(text) };
};

const pagesDir = join(here, 'pages');
const PAGE_MODULES = existsSync(pagesDir)
  ? await Promise.all((await readdir(pagesDir)).filter((f) => f.endsWith('.mjs')).sort()
    .map(async (f) => (await import(pathToFileURL(join(pagesDir, f)).href)).default))
  : [];
for (const m of PAGE_MODULES) {
  if (!m || !m.industry) throw new Error('pages/*.mjs must export default { industry, ... }');
  if (m.data) registerKeys(m.data, `industries.${camel(m.industry.slug)}`); // before the industry: nicer keys for shared constants
  Object.assign(TEMPLATES, m.templates); // messages with variables that only this page uses
  for (const [k, b] of Object.entries(m.brands || {})) if (!BRANDS[k]) BRANDS[k] = b;
  m.industry.renderers = m.renderers || {};
}
const INDUSTRIES = [...BASE_INDUSTRIES, ...PAGE_MODULES.map((m) => m.industry)];
for (const ind of INDUSTRIES) registerKeys(ind, `industries.${camel(ind.slug)}`);
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
// A section title with its key: the page's own (data), the one in HEADS above, or the default.
const head = (ind, key) => {
  if (ind.heads && ind.heads[key]) return dt(ind.heads, key);
  if (HEADS[ind.slug] && HEADS[ind.slug][key]) return lt(`heads.${key}`, HEADS[ind.slug][key]);
  return ct(`heads.${key}`, DEFAULT_HEADS[key]);
};

const SEC_NAMES = {
  problems: 'ПРОБЛЕМЫ', day: 'СУТКИ ОТЕЛЯ', directions: 'НАПРАВЛЕНИЯ', stairs: 'НАПРАВЛЕНИЯ', economy: 'ЭКОНОМИКА',
  results: 'РЕЗУЛЬТАТ', vendors: 'ОБОРУДОВАНИЕ', case: 'КЕЙС', why: 'ПОЧЕМУ МЫ', form: 'ЗАЯВКА',
  see: 'СМОТРИТЕ ТАКЖЕ', safety: 'БЕЗОПАСНОСТЬ', route: 'МАРШРУТ', pilot: 'С ЧЕГО НАЧАТЬ', season: 'СЕЗОН',
};

// Section label (the small caps «01 — ПРОБЛЕМЫ») and the page's own name in capitals, with their keys.
const secName = (ind, key) => (ind.secNames && ind.secNames[key] ? dt(ind.secNames, key) : ct(`sections.${key === 'stairs' ? 'directions' : key}`, SEC_NAMES[key]));
const nameCaps = (ind) => tx(ind.name.toUpperCase(), `industries.${camel(ind.slug)}.nameCaps`);
// data-name of a section, with the key of its translation
const dn = (ind, key) => { const s = secName(ind, key); return ` data-name="${s.t}"${TA(['data-name', s.k])}`; };
const dnName = (ind) => { const s = nameCaps(ind); return ` data-name="${esc(s.t)}"${TA(['data-name', s.k])}`; };

const uniqueBrands = (ind) => [...new Set(ind.vendors.flatMap((g) => g.brands))];

// ───────── pieces ─────────
// name, title and lead are {t, k} pairs (see tx/dt/lt/ct): the text and the key of its translation.
const idx = (n, name, extra = '') => `<span class="idx reveal"${extra}><b>${n}</b> — <span${K(name.k)}>${name.t}</span></span>`;
const secHead = (n, name, title, lead, id) => `<div class="sol-head">
        ${idx(n, name)}
        <h2 class="h2 reveal" id="${id}"${K(title.k)}>${esc(title.t)}</h2>${lead ? `\n        <p class="lead reveal"${K(lead.k)}>${esc(lead.t)}</p>` : ''}
      </div>`;

const logo = (slug, k = 'vlogo') => {
  const b = BRANDS[slug];
  if (!b) throw new Error(`Unknown brand "${slug}"`);
  const key = `common.brandNames.${camel(slug)}`;
  if (!b.file) return `<li class="${k} ${k}--text"${TN(key, b.name)}>${esc(b.name)}</li>`;
  return `<li class="${k}"><img src="assets/brands/${b.file}" alt="${esc(b.name)}"${NEEDS.test(b.name) ? TA(['alt', key]) : ''} style="--h:${b.h}px" width="${b.w}" height="${b.hh}" loading="lazy"></li>`;
};

const photo = (ind, ratio, cls = '') => {
  const p = ind.photo;
  const nDir = ind.directions.length, nBr = uniqueBrands(ind).length;
  const mDir = msg('industries.common.hero.metrics.directions', { n: nDir }), mBr = msg('industries.common.hero.metrics.makers', { n: nBr });
  const metrics = `<div class="ph__metrics"><span${mDir.attr}>${mDir.text}</span><span${mBr.attr}>${mBr.text}</span></div>`;
  if (existsSync(join(root, 'assets', 'industry_hero', `${ind.slug}.webp`))) {
    return `<figure class="ph ph--photo ${cls} reveal" style="--ar:${ratio.replace(':', '/')};--i:2">
          <img class="ph__img" src="assets/industry_hero/${ind.slug}.webp" alt="${esc(p.alt)}"${TA(['alt', dk(p, 'alt')])} width="1536" height="1024"${p.pos ? ` style="object-position:${p.pos}"` : ''} decoding="async">
          ${metrics}
        </figure>`;
  }
  const mPh = msg('industries.common.photo.placeholder', { ratio });
  return `<!-- Место под фото Hero (${ratio}): ${esc(p.note)}, docs/specs/ПРОМПТЫ_HERO_ОТРАСЛИ.md. alt будущего фото: «${esc(p.alt)}» -->
        <figure class="ph ${cls} reveal" style="--ar:${ratio.replace(':', '/')};--i:2">
          <img class="ph__robot" src="assets/robots/${p.robot}" alt="" width="${p.w}" height="${p.h}">
          <figcaption class="ph__lbl mono"${mPh.attr}>${mPh.text}</figcaption>
          ${metrics}
        </figure>`;
};

const crumbs = (ind) => `<nav class="crumbs reveal"${TA(['aria-label', 'common.crumbs.label'])} aria-label="Хлебные крошки"><ol><li><a${K('common.crumbs.home')} href="index.html">Главная</a></li><li><a${K('common.crumbs.industries')} href="industries.html">Отрасли</a></li><li${T(ind, 'name')} aria-current="page">${esc(ind.name)}</li></ol></nav>`;

// The H1 as one <span> per line, and the «Для кого» line: the audiences stay separate messages, the dots between them are markup.
const h1 = (ind) => ind.h1.map((l, i) => `<span${T(ind.h1, i)}>${esc(l)}</span>`).join(' ');
// (.ih__aud is a flex row: the list sits in one <span>, as the single text run did before)
const audience = (ind) => `<span class="mono"${C('hero.audience')}>Для кого</span> <span>${ind.audiences.map((a, i) => `<span${T(ind.audiences, i)}>${esc(a)}</span>`).join(' · ')}</span>`;

const heroCopy = (ind, n) => `${crumbs(ind)}
          ${idx(n, nameCaps(ind))}
          <h1 class="h1 ih__h1 reveal">${h1(ind)}</h1>
          <div class="ih__text reveal" style="--i:1">
            <p class="lead"${T(ind, 'lead')}>${esc(ind.lead)}</p>
            <p${T(ind, 'lead2')}>${esc(ind.lead2)}</p>
          </div>
          <div class="ih__cta reveal" style="--i:2">
            <a class="btn btn-pri" href="${ind.primaryCta.href}"${T(ind.primaryCta, 'label')}>${esc(ind.primaryCta.label)}</a>
            <a class="text-link" href="${ind.secondaryCta.href}"><span${T(ind.secondaryCta, 'label')}>${esc(ind.secondaryCta.label)}</span> ${ARROW_R}</a>
          </div>
          <p class="ih__aud reveal" style="--i:3">${audience(ind)}</p>`;

// ───────── sections ─────────
const S = {};

S.hero = (ind, n) => {
  const nm = dnName(ind);
  switch (ind.hero) {
    case 'stage':
      return `<section class="ih ih--stage" data-sec="${n}"${nm}>
      <div class="stage ih__stage">
        <div class="ih__grid">
          <div class="ih__copy">
          ${heroCopy(ind, n)}
          </div>
          ${photo(ind, '4:3', 'ph--dark')}
        </div>
        <ul class="ih__ticker mono"${TA(['aria-label', ck('hero.tickerLabel')])} aria-label="Направления">${ind.directions.map((d) => `<li><a href="#${d.anchor}"${T(d, 'title')}>${esc(d.title)}</a></li>`).join('')}</ul>
      </div>
    </section>`;
    case 'center':
      return `<section class="ih ih--center wrap" data-sec="${n}"${nm}>
      <div class="ih__copy">
          ${heroCopy(ind, n)}
      </div>
      ${photo(ind, '21:9', 'ph--wide')}
      ${ind.compliance ? `<!-- TODO(legal): формулировку согласовать с юристом -->
      <aside class="ih__note reveal"${TA(['aria-label', ck('hero.noteLabel')])} aria-label="Важно">${icon('shield')}<p${T(ind, 'compliance')}>${esc(ind.compliance)}</p></aside>` : ''}
    </section>`;
    case 'mirror':
      return `<section class="ih ih--mirror wrap" data-sec="${n}"${nm}>
      <div class="ih__grid">
        ${photo(ind, '4:5')}
        <div class="ih__copy">
          ${heroCopy(ind, n)}
        </div>
      </div>
    </section>`;
    case 'pano':
      return `<section class="ih ih--pano wrap" data-sec="${n}"${nm}>
      <div class="ih__copy">
          ${heroCopy(ind, n)}
      </div>
      ${photo(ind, '21:9', 'ph--wide')}
    </section>`;
    default:
      return `<section class="ih ih--split wrap" data-sec="${n}"${nm}>
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
          <h3${T(p, 'title')}>${esc(p.title)}</h3>
          <p${T(p, 'text')}>${esc(p.text)}</p>
        </li>`).join('\n        ');
  return `<section class="sol-sec wrap" id="problems" data-sec="${n}"${dn(ind, 'problems')} aria-labelledby="problems-h">
      ${secHead(n, secName(ind, 'problems'), head(ind, 'problems'), null, 'problems-h')}
      <ol class="probs probs--${style}">
        ${items}
      </ol>
    </section>`;
};

// A list of short items joined with dots: each item stays a separate message, the dots are markup.
const itemsList = (items) => items.map((s, i) => `<span${T(items, i)}>${esc(s)}</span>`).join(' · ');
// «Решение: <solution>» link of a direction
// The prefix and the name sit in one <span>: the link is a flex row, and two items would get a gap between them.
const solLink = (s, prefix = true) => `<a class="drow__sol" href="${s.href}"><span>${prefix ? `<span${C('directions.solution')}>Решение:</span> ` : ''}<span${T(s, 'label')}>${esc(s.label)}</span></span> ${ARROW_UR}</a>`;

const dirRow = (d, i) => `<article class="drow reveal" id="${d.anchor}" style="--i:${i}">
          <div class="drow__l">
            <span class="drow__no mono">${pad(i + 1)}</span>
            <h3${T(d, 'title')}>${esc(d.title)}</h3>
            <p${T(d, 'text')}>${esc(d.text)}</p>
          </div>
          <div class="drow__r">
            <p class="drow__items">${itemsList(d.items)}</p>
            ${solLink(d.solution)}
          </div>
        </article>`;

S.directions = (ind, n) => `<section class="sol-sec wrap" id="directions" data-sec="${n}"${dn(ind, 'directions')} aria-labelledby="directions-h">
      ${secHead(n, secName(ind, 'directions'), head(ind, 'directions'), null, 'directions-h')}
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
              <b${T(s, 'title')}>${esc(s.title)}</b>
              <span class="day__x"${T(s, 'text')}>${esc(s.text)}</span>
            </a>
          </li>`).join('\n          ');
  return `<section class="sol-sec" id="day" data-sec="${n}"${dn(ind, 'day')} aria-labelledby="day-h">
      <div class="stage day">
        <div class="day__head">
          ${idx(n, secName(ind, 'day'))}
          <h2 class="h2 reveal" id="day-h"${L('day.title')}>Сутки отеля: где работает робот.</h2>
          <p class="lead reveal"${L('day.lead')}>Ночь и пиковые часы — там, где людей не хватает или они дорогие. Пример дня, расписание собираем под ваш отель.</p>
        </div>
        <div class="day__scale" aria-hidden="true">${ticks}</div>
        <ol class="day__track">
          ${segs}
        </ol>
      </div>
    </section>`;
};

// The mini calculator's radio segments (hotels and the pages with their own economy block share them).
// Language-neutral names (24/7) need no message.
const calcTypes = (checked) => Object.entries(ROI.TYPES).map(([k, t]) => `<label class="seg__o"><input type="radio" name="calc-type" value="${k}"${k === checked ? ' checked' : ''}><span${TN(`calc.types.${k}`, t.name)}>${esc(t.name)}</span></label>`).join('');
const calcModes = (checked) => Object.entries(ROI.MODES).map(([k, m]) => `<label class="seg__o"><input type="radio" name="calc-mode" value="${k}"${k === checked ? ' checked' : ''}><span${TN(`calc.modes.${k}`, m.name)}>${esc(m.name)}</span></label>`).join('');

S.economy = (ind, n) => {
  const t0 = 'hotel', RT = ROI.TYPES[t0], m0 = RT.mode0, r = ROI.calc({ type: t0, area: RT.area0, mode: m0 });
  const types = calcTypes(t0);
  const modes = calcModes(m0);
  return `<section class="sol-sec wrap" id="economy" data-sec="${n}"${dn(ind, 'economy')} aria-labelledby="economy-h">
      <div class="econ">
        <div class="econ__copy">
          ${idx(n, secName(ind, 'economy'))}
          <h2 class="h2 reveal" id="economy-h"${L('economy.title')}>Уборка окупается быстрее всего.</h2>
          <p class="lead reveal"${L('economy.lead')}>Робот убирает общие зоны ночью, без ночной бригады и доплат. Посчитайте, когда он окупится.</p>
          <span class="badge-roi reveal"${L('economy.badge')}>Быстрая окупаемость</span>
        </div>
        <form class="calc reveal" data-calc${TA(['aria-label', ck('calc.formLabel')])} aria-label="Быстрый расчёт окупаемости уборки">
          <fieldset class="calc__f"><legend${C('calc.object')}>Объект</legend><div class="seg">${types}</div></fieldset>
          <div class="calc__f">
            <label for="calc-area"${C('calc.area')}>Площадь</label>
            <div class="calc__range"><input id="calc-area" type="range" min="${RT.area[0]}" max="${RT.area[1]}" step="500" value="${RT.area0}" aria-valuetext="${RT.area0.toLocaleString('ru-RU')} м²"><output for="calc-area" class="tnum" data-out="area">${RT.area0.toLocaleString('ru-RU')} м²</output></div>
          </div>
          <fieldset class="calc__f"><legend${C('calc.mode')}>Режим уборки</legend><div class="seg">${modes}</div></fieldset>
          <dl class="calc__res" aria-live="polite">
            <div><dt${C('calc.payback')}>Окупаемость</dt><dd class="tnum" data-out="payback">${fmtMonths(r.payback)}</dd></div>
            <div><dt${C('calc.savings')}>Экономия в год</dt><dd class="tnum" data-out="net">${fmtMln(r.net)}</dd></div>
          </dl>
          <p class="calc__note"${L('economy.note')}>Ориентир по нашей модели. Точный расчёт — после аудита объекта.</p>
          <a class="btn btn-pri" data-out="link" href="roi.html?t=${t0}&amp;a=${RT.area0}&amp;m=${m0}"><span${C('calc.fullRoi')}>Полный расчёт ROI</span> ${ARROW_R}</a>
        </form>
      </div>
    </section>`;
};

S.results = (ind, n) => `<section class="sol-sec wrap" id="results" data-sec="${n}"${dn(ind, 'results')} aria-labelledby="results-h">
      <div class="resx">
        <div class="resx__head">
          ${idx(n, secName(ind, 'results'))}
          <h2 class="h2 reveal" id="results-h"${K(head(ind, 'results').k)}>${esc(head(ind, 'results').t)}</h2>
        </div>
        <ul class="res">
          ${ind.results.map((r, i) => `<li class="reveal" style="--i:${i}"><span class="res__ic">${icon('check')}</span><span${T(ind.results, i)}>${esc(r)}</span></li>`).join('\n          ')}
        </ul>
      </div>
    </section>`;

S.vendors = (ind, n) => `<section class="sol-sec wrap" id="vendors" data-sec="${n}"${dn(ind, 'vendors')} aria-labelledby="vendors-h">
      ${secHead(n, secName(ind, 'vendors'), head(ind, 'vendors'), dt(ind, 'vendorsLead'), 'vendors-h')}
      <div class="vend">
        ${ind.vendors.map((g, i) => `<div class="vend__grp reveal" style="--i:${i}">
          <h3 class="mono"${T(g, 'group')}>${esc(g.group)}</h3>
          <ul class="vend__list">${g.brands.map((b) => logo(b)).join('')}</ul>
        </div>`).join('\n        ')}
      </div>
    </section>`;

S.case = (ind, n) => {
  let body;
  if (ind.estimate) {
    const e = ind.estimate, r = ROI.calc({ type: e.type, area: e.area, mode: e.mode });
    // The estimate is computed at build time and not touched by scripts, so its figures are messages with variables.
    const mMonths = Number.isFinite(r.payback) ? msg('industries.common.calc.months', { n: Math.round(r.payback) }) : null;
    const mMln = msg('industries.common.calc.millions', { n: Math.round(r.net / 1e5) / 10 });
    const mRobots = msg('industries.common.calc.robots', { n: r.robots });
    body = `<article class="icase icase--est reveal">
        <div class="icase__l">
          <span class="mono icase__flag"${C('estimate.flag')}>Расчётный ориентир</span>
          <h3${T(e, 'object')}>${esc(e.object)}</h3>
          <p${L('case.estimateText')}>Реального кейса по отелю пока нет — показываем расчёт по нашей ROI-модели. Фактические цифры появятся после пилота.</p>
          <a class="text-link" href="roi.html?t=${e.type}&amp;a=${e.area}&amp;m=${e.mode}"><span${L('case.estimateLink')}>Как мы считали</span> ${ARROW_R}</a>
        </div>
        <dl class="icase__nums">
          <div><dt${C('calc.paybackShort')}>окупаемость</dt><dd class="tnum"${mMonths ? mMonths.attr : ''}>${mMonths ? mMonths.text : fmtMonths(r.payback)}</dd></div>
          <div><dt${C('calc.savingsShort')}>экономия в год</dt><dd class="tnum"${mMln.attr}>${mMln.text}</dd></div>
          <div><dt${mRobots.attr}>${mRobots.text}</dt><dd class="tnum">${r.robots}</dd></div>
        </dl>
      </article>`;
  } else if (ind.cases.length === 1) {
    const c = ind.cases[0];
    body = `<article class="icase reveal">
        <div class="icase__ph"><img src="assets/cases_images/${c.img}" alt="${esc(c.alt)}"${TA(['alt', dk(c, 'alt')])} loading="lazy" decoding="async"></div>
        <div class="icase__body">
          <span class="mono case-kicker"${T(c, 'tag')}>${esc(c.tag)}</span>
          <div class="icase__res"><b class="tnum"${TN(dk(c, 'value'), c.value)}>${esc(c.value)}</b>${c.unit ? `<span class="mono"${T(c, 'unit')}>${esc(c.unit)}</span>` : ''}</div>
          <h3${T(c, 'title')}>${esc(c.title)}</h3>${c.note ? `\n          <p${T(c, 'note')}>${esc(c.note)}</p>` : ''}
          <a class="text-link" href="cases.html?industry=${ind.slug}"><span${C('case.view')}>Смотреть кейс</span> ${ARROW_R}</a>
        </div>
      </article>`;
  } else {
    body = `<div class="icases">${ind.cases.map((c, i) => `
        <article class="case reveal" style="--i:${i}"><div class="ph"><img src="assets/cases_images/${c.img}" alt="${esc(c.alt)}"${TA(['alt', dk(c, 'alt')])} loading="lazy" decoding="async"></div><div class="body"><span class="mono case-kicker"${T(c, 'tag')}>${esc(c.tag)}</span><div class="res"><b${TN(dk(c, 'value'), c.value)}>${esc(c.value)}</b>${c.unit ? `<span class="mono"${T(c, 'unit')}>${esc(c.unit)}</span>` : ''}</div><h3${T(c, 'title')}>${esc(c.title)}</h3><a class="more" href="cases.html?industry=${ind.slug}"><span${C('case.view')}>Смотреть кейс</span> ${ARROW_UR}</a></div></article>`).join('')}
      </div>`;
  }
  const many = ind.cases && ind.cases.length > 1;
  const name = many ? ct('sections.cases', 'КЕЙСЫ') : ct('sections.case', 'КЕЙС');
  const title = many ? ct('case.titleMany', 'Кейсы.') : ind.estimate ? lt('case.estimateTitle', 'Сколько это стоит отелю.') : ct('case.title', 'Кейс.');
  return `<section class="sol-sec wrap" id="case" data-sec="${n}" data-name="${name.t}"${TA(['data-name', name.k])} aria-labelledby="case-h">
      ${secHead(n, name, title, null, 'case-h')}
      ${body}
    </section>`;
};

S.why = (ind, n) => `<section class="sol-sec wrap" id="why" data-sec="${n}"${dn(ind, 'why')} aria-labelledby="why-h">
      <div class="whyn reveal">
        ${idx(n, secName(ind, 'why'))}
        <h2 class="whyn__h" id="why-h"${T(ind.why, 'title')}>${esc(ind.why.title)}</h2>
        <p${T(ind.why, 'text')}>${esc(ind.why.text)}</p>
        <a class="text-link" href="${ind.why.link.href}"><span${T(ind.why.link, 'label')}>${esc(ind.why.link.label)}</span> ${ARROW_R}</a>
      </div>
    </section>`;

S.form = (ind, n) => {
  const opts = ind.directions.map((d) => `<option value="${d.anchor}"${T(d, 'title')}>${esc(d.title)}</option>`).join('\n              ');
  const talk = `<div class="talk">
        <div class="talk__copy">
          ${idx(n, secName(ind, 'form'))}
          <h2 class="h2 reveal" id="talk-h"${T(ind.form, 'title')}>${esc(ind.form.title)}</h2>
          <p class="lead reveal"${T(ind.form, 'lead')}>${esc(ind.form.lead)}</p>
          <a class="text-link reveal" href="tel:+74951234567"${C('form.callUs')}>Или позвоните: +7 (495) 123-45-67</a>
        </div>

        <form class="form reveal" id="lead-form" novalidate data-endpoint="" data-source="industries/${ind.slug}" aria-labelledby="talk-h">
          <div class="form__row">
            <div class="fld">
              <label for="f-name"${K('common.form.name')}>Имя</label>
              <input id="f-name" name="name" type="text" autocomplete="name" maxlength="80" required aria-describedby="f-name-err">
              <span class="fld__err" id="f-name-err" role="alert"></span>
            </div>
            <div class="fld">
              <label for="f-phone"${K('common.form.phone')}>Телефон</label>
              <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required aria-describedby="f-phone-err">
              <span class="fld__err" id="f-phone-err" role="alert"></span>
            </div>
          </div>
          <div class="fld">
            <label for="f-dir"${CH('form.directionLabel')}>Направление <small>необязательно</small></label>
            <select id="f-dir" name="direction">
              <option value=""${K('common.form.directionUnknown')}>Пока не знаю</option>
              ${opts}
            </select>
          </div>
          <div class="hp" aria-hidden="true"><label><span${K('common.form.honeypot')}>Не заполняйте</span> <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
          <div class="fld">
            <label class="consent"><input type="checkbox" name="consent" id="f-consent" required aria-describedby="f-consent-err"><span${KH('common.form.consent')}>Даю <a href="consent.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a> и принимаю <a href="privacy.html" target="_blank" rel="noopener">политику конфиденциальности</a></span></label>
            <span class="fld__err" id="f-consent-err" role="alert"></span>
          </div>
          <div class="form__foot">
            <button class="btn btn-pri" type="submit"><span class="spin" aria-hidden="true"></span><span class="btn__t"${T(ind.form, 'button')}>${esc(ind.form.button)}</span></button>
            <span class="form__status" id="f-status" role="status" aria-live="polite"></span>
          </div>
          <div class="form__ok" role="status">
            <span class="ic-tile">${icon('check')}</span>
            <b${K('common.form.sentTitle')}>Заявка принята.</b>
            <p${K('common.form.sentText')}>Перезвоним в рабочее время.</p>
          </div>
        </form>
      </div>`;
  return ind.formStage
    ? `<section class="sol-sec" id="talk" data-sec="${n}"${dn(ind, 'form')} aria-labelledby="talk-h">
      <div class="stage talk-stage">
      ${talk}
      </div>
    </section>`
    : `<section class="sol-sec wrap" id="talk" data-sec="${n}"${dn(ind, 'form')} aria-labelledby="talk-h">
      ${talk}
    </section>`;
};

S.see = (ind, n) => `<section class="sol-sec wrap" id="see" data-sec="${n}"${dn(ind, 'see')} aria-labelledby="see-h">
      ${secHead(n, secName(ind, 'see'), head(ind, 'see'), null, 'see-h')}
      <div class="seeg">
        ${ind.links.map((l, i) => `<a class="seel reveal" style="--i:${i}" href="${l.href}">
          <span class="dir__no"${T(l, 'kicker')}>${esc(l.kicker)}</span>
          <h3${T(l, 'title')}>${esc(l.title)}</h3>
          <p${T(l, 'text')}>${esc(l.text)}</p>
          ${goArrow}
        </a>`).join('\n        ')}
      </div>
    </section>`;

S.safety = (ind, n) => `<section class="sol-sec" id="safety" data-sec="${n}"${dn(ind, 'safety')} aria-labelledby="safety-h">
      <div class="stage zone">
        <div class="zone__grid">
          <div class="zone__copy">
            ${idx(n, secName(ind, 'safety'))}
            <h2 class="h2 reveal" id="safety-h"${L('safety.title')}>Людей — из опасной зоны.</h2>
            <p class="lead reveal"${L('safety.lead')}>На демонтаже под обрушение идёт робот, а не бригада. Оператор управляет им с пульта и видит всю зону со стороны.</p>
          </div>
          <svg class="zone__svg reveal" viewBox="0 0 560 300" role="img"${TA(['aria-label', pk('safety.diagramLabel')])} aria-label="Схема: робот работает в зоне демонтажа, оператор с пультом стоит за её пределами">
            <defs><pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v10" class="zone__hatch"/></pattern></defs>
            <circle cx="170" cy="150" r="128" class="zone__area"/>
            <circle cx="170" cy="150" r="128" fill="url(#hatch)"/>
            <text x="170" y="44" text-anchor="middle" class="zone__lbl"${L('safety.zoneLabel')}>ЗОНА ДЕМОНТАЖА</text>
            <g class="zone__bot" transform="translate(126 128)"><rect x="0" y="28" width="70" height="22" rx="6"/><rect x="10" y="10" width="40" height="20" rx="4"/><path d="M48 16 L80 -8 L96 10" /><circle cx="12" cy="50" r="7"/><circle cx="58" cy="50" r="7"/></g>
            <path d="M232 150 C 300 120, 380 120, 452 140" class="zone__signal"/>
            <g class="zone__op" transform="translate(470 104)"><circle cx="14" cy="10" r="10"/><path d="M14 22 v40 M14 62 l-12 26 M14 62 l12 26 M14 32 l-16 14 M14 32 l16 14"/><rect x="-10" y="40" width="16" height="10" rx="2"/></g>
            <path d="M298 236 H 470" class="zone__dim"/><path d="M298 228 v16 M470 228 v16" class="zone__dim"/>
            <text x="384" y="264" text-anchor="middle" class="zone__lbl"${L('safety.operatorLabel')}>ОПЕРАТОР ВНЕ ЗОНЫ</text>
          </svg>
        </div>
        <ul class="zone__facts">
          ${ind.safety.map((f, i) => `<li class="reveal" style="--i:${i}"><b${T(f, 'value')}>${esc(f.value)}</b><span${T(f, 'text')}>${esc(f.text)}</span></li>`).join('\n          ')}
        </ul>
      </div>
    </section>`;

S.route = (ind, n) => `<section class="sol-sec wrap" id="route" data-sec="${n}"${dn(ind, 'route')} aria-labelledby="route-h">
      <div class="route">
        <div class="route__copy">
          ${idx(n, secName(ind, 'route'))}
          <h2 class="h2 reveal" id="route-h"${L('route.title')}>Робот ездит, персонал лечит.</h2>
          <p class="lead reveal"${L('route.lead')}>Внутренняя логистика — самый простой сценарий для старта: маршрут понятный, эффект виден за первые недели.</p>
          <ul class="route__legend reveal">
            <li><i class="route__dot"></i><span><b${L('route.legend.pharmacy.title')}>Аптека → отделение</b><bdi${L('route.legend.pharmacy.text')}>медикаменты и расходники</bdi></span></li>
            <li><i class="route__dot"></i><span><b${L('route.legend.lab.title')}>Отделение → лаборатория</b><bdi${L('route.legend.lab.text')}>анализы по расписанию и по вызову</bdi></span></li>
            <li><i class="route__dot"></i><span><b${L('route.legend.linen.title')}>Бельевая → палаты</b><bdi${L('route.legend.linen.text')}>чистое бельё, ночью тоже</bdi></span></li>
          </ul>
        </div>
        <svg class="route__svg reveal" viewBox="0 0 640 360" role="img"${TA(['aria-label', pk('route.diagramLabel')])} aria-label="Схема этажа клиники: робот развозит медикаменты из аптеки в отделения и анализы в лабораторию по коридору через лифт">
          <rect x="8" y="8" width="624" height="344" rx="20" class="route__floor"/>
          <rect x="24" y="24" width="180" height="120" rx="12" class="route__room"/><text x="40" y="52" class="route__lbl"${L('route.rooms.pharmacy')}>АПТЕКА</text>
          <rect x="220" y="24" width="200" height="120" rx="12" class="route__room"/><text x="236" y="52" class="route__lbl"${L('route.rooms.ward1')}>ОТДЕЛЕНИЕ 1</text>
          <rect x="436" y="24" width="180" height="120" rx="12" class="route__room"/><text x="452" y="52" class="route__lbl"${L('route.rooms.lab')}>ЛАБОРАТОРИЯ</text>
          <rect x="24" y="216" width="180" height="120" rx="12" class="route__room"/><text x="40" y="244" class="route__lbl"${L('route.rooms.linen')}>БЕЛЬЕВАЯ</text>
          <rect x="220" y="216" width="200" height="120" rx="12" class="route__room"/><text x="236" y="244" class="route__lbl"${L('route.rooms.ward2')}>ОТДЕЛЕНИЕ 2</text>
          <rect x="436" y="216" width="100" height="120" rx="12" class="route__room route__room--lift"/><text x="452" y="244" class="route__lbl"${L('route.rooms.lift')}>ЛИФТ</text>
          <path id="route-path" class="route__path" d="M114 144 V180 H320 V152 V180 H526 V152 V180 H486 V224 V180 H320 V224 V180 H114 V224 V180 Z"/>
          <circle r="9" class="route__bot"><animateMotion dur="14s" repeatCount="indefinite"><mpath href="#route-path"/></animateMotion></circle>
        </svg>
      </div>
    </section>`;

S.stairs = (ind, n) => `<section class="sol-sec wrap" id="directions" data-sec="${n}"${dn(ind, 'stairs')} aria-labelledby="directions-h">
      ${secHead(n, secName(ind, 'stairs'), lt('stairs.title', 'От простого к сложному.'), lt('stairs.lead', 'Начинайте с нижней ступени: вложения меньше, окупаемость понятнее. Следующая ступень — когда первая уже работает.'), 'directions-h')}
      <ol class="stairs">
        ${ind.directions.map((d, i) => `<li class="step reveal" id="${d.anchor}" style="--lv:${d.level};--i:${i}">
          <div class="step__meter"${TA(['aria-label', pk(`stairs.levelLabel.${d.level}`)])} aria-label="Порог входа: ${['низкий', 'средний', 'выше среднего'][d.level - 1]}"><span class="mono"${L('stairs.entryBar')}>Порог входа</span><i></i><i></i><i></i></div>
          <span class="drow__no mono">${pad(i + 1)}</span>
          <h3${T(d, 'title')}>${esc(d.title)}</h3>
          <p${T(d, 'text')}>${esc(d.text)}</p>
          <p class="drow__items">${itemsList(d.items)}</p>
          ${solLink(d.solution)}
        </li>`).join('\n        ')}
      </ol>
    </section>`;

S.pilot = (ind, n) => `<section class="sol-sec wrap" id="pilot" data-sec="${n}"${dn(ind, 'pilot')} aria-labelledby="pilot-h">
      ${secHead(n, secName(ind, 'pilot'), head(ind, 'pilot'), null, 'pilot-h')}
      <ol class="steps">
        ${ind.pilot.map((s, i) => `<li class="steps__i reveal" style="--i:${i}"><span class="steps__no mono tnum">${pad(i + 1)}</span><h3${T(s, 'title')}>${esc(s.title)}</h3><p${T(s, 'text')}>${esc(s.text)}</p></li>`).join('\n        ')}
      </ol>
    </section>`;

S.season = (ind, n) => `<section class="sol-sec wrap" id="season" data-sec="${n}"${dn(ind, 'season')} aria-labelledby="season-h">
      ${secHead(n, secName(ind, 'season'), lt('season.title', 'Год хозяйства с роботами.'), lt('season.lead', 'Экономику агротехники считаем за сезон, а не за месяц. Вот где в сезоне работает каждое направление.'), 'season-h')}
      <ol class="season">
        ${ind.season.map((s, i) => `<li class="season__i season__i--${i} reveal" style="--i:${i}">
          <span class="season__band"></span>
          <span class="mono"${T(s, 'name')}>${esc(s.name)}</span>
          <h3${T(s, 'title')}>${esc(s.title)}</h3>
          <p${T(s, 'text')}>${esc(s.text)}</p>
          ${s.anchor ? (() => { const d = ind.directions.find((x) => x.anchor === s.anchor); return `<a class="drow__sol" href="#${s.anchor}"><span><span${T(d, 'title')}>${esc(d.title)}</span> ↓</span></a>`; })() : `<span class="season__us"${L('season.us')}>Работа Профессиональной Робототехники</span>`}
        </li>`).join('\n        ')}
      </ol>
      <p class="season__foot"${L('season.foot')}>Сроки зависят от культуры и региона — календарь работ составляем на аудите.</p>
    </section>`;

// ───────── page ─────────
const page = (ind) => {
  CUR = ind.slug;
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
        provider: { '@type': 'Organization', name: 'Профессиональная Робототехника' },
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
  <title${T(ind, 'title')}>${esc(ind.title)}</title>
  <meta name="description" content="${esc(ind.description)}"${TA(['content', dk(ind, 'description')])}>
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="solutions.css">
  <link rel="stylesheet" href="industry.css">
${existsSync(join(root, `industry-${ind.slug}.css`)) ? `  <link rel="stylesheet" href="industry-${ind.slug}.css">\n` : ''}  <script>document.documentElement.classList.add('js');</script>
${BOOT}
  <noscript><style>.reveal { opacity: 1; transform: none; }</style></noscript>
</head>
<body class="sol-page ind-page ind--${ind.slug}">
  ${SPRITE}

  <!-- ================= NAV ================= -->
  <header class="nav"${TA(['aria-label', 'common.nav.label'])} aria-label="Основная навигация">
    <a href="index.html"${TA(['aria-label', 'common.brand.homeLabel'])} aria-label="Профессиональная Робототехника — на главную"><img src="assets/profrobot-logo.png"${TA(['alt', 'common.brand.logoAlt'])} alt="Профессиональная Робототехника"></a>
    <nav class="nav-links">
      <a href="solutions.html"${K('common.nav.solutions')}>Решения</a>
      <a href="industries.html" class="on"${K('common.nav.industries')}>Отрасли</a>
      <a href="products.html"${K('common.nav.products')}>Продукты</a>
      <a href="services.html"${K('common.nav.services')}>Услуги</a>
      <a href="platform.html"${K('common.nav.platform')}>Платформа</a>
      <a href="cases.html"${K('common.nav.cases')}>Кейсы</a>
      <a href="contacts.html"${K('common.nav.contacts')}>Контакты</a>
    </nav>
    <div class="lang" role="group" aria-label="Язык"${TA(['aria-label', 'common.lang.label'])}><button type="button" lang="ru" data-lang="ru" aria-pressed="true">RU</button><button type="button" lang="en" data-lang="en" aria-pressed="false">EN</button></div>
    <a class="btn btn-pri" href="#talk"${K('common.cta.contact')}>Связаться</a>
  </header>

  <div class="counter" aria-hidden="true">
    <span class="cur tnum">01</span>
    <span class="bar"><i></i></span>
    <span class="tot tnum">${pad(total)}</span>
    <span class="lbl"${K(nameCaps(ind).k)}>${esc(ind.name.toUpperCase())}</span>
  </div>

  <main>
${body}
  </main>

  <footer class="site-foot sol-foot">
    <div class="stage foot">
      <div class="foot-top">
        <div class="foot-brand">
          <a href="index.html"${TA(['aria-label', 'common.brand.homeLabel'])} aria-label="Профессиональная Робототехника — на главную"><img src="assets/profrobot-logo-inverse.png"${TA(['alt', 'common.brand.logoAlt'])} alt="Профессиональная Робототехника" width="783" height="136"></a>
          <p${K('common.footer.about')}>Независимый инженерно-сервисный интегратор роботизации. Внедряем решения с измеримой окупаемостью и обслуживаем их по SLA — по всей России.</p>
        </div>
        <div class="foot-call">
          <span class="mono"${K('common.footer.dept')}>Отдел внедрения</span>
          <a class="foot-phone tnum" href="tel:+74951234567">+7 (495) 123-45-67</a>
          <a class="foot-mail" href="mailto:info@profrobot.ru">info@profrobot.ru</a>
        </div>
      </div>
${footerNav()}      <div class="foot-bot">
        <span${K('common.footer.rights')}>© 2026 Профессиональная Робототехника. Все права защищены.</span>
        <a href="privacy.html"${K('common.footer.privacy')}>Политика конфиденциальности</a>
        <a class="foot-up" href="industries.html"><span${K('common.footer.allIndustries')}>Все отрасли</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg></a>
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
// i18n helpers: see the block at the top of this file and i18n/README.md.
const H = { S, esc, pad, plural, idx, secHead, logo, photo, heroCopy, crumbs, icon, head, uniqueBrands,
  ARROW_UR, ARROW_R, goArrow, SEC_NAMES, ROI, fmtMonths, fmtMln,
  K, KH, T, TH, L, LH, C, CH, TA, TN, tx, dt, lt, ct, msg, dk, pk, ck, secName, nameCaps, dn, dnName, h1, audience, itemsList, solLink, calcTypes, calcModes, NEEDS };

export { page, INDUSTRIES };

// Run as a script: write the pages. Imported (tools/i18n): just expose page() and the data.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const onlyArg = process.argv.indexOf('--only');
  const only = onlyArg > -1 ? process.argv[onlyArg + 1] : null;
  if (only && !INDUSTRIES.some((i) => i.slug === only)) throw new Error(`--only: unknown slug "${only}"`);

  for (const ind of INDUSTRIES.filter((i) => !only || i.slug === only)) {
    const file = join(root, `industries-${ind.slug}.html`);
    await writeFile(file, page(ind));
    console.log('wrote', `industries-${ind.slug}.html`);
  }
}
