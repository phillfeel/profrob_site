// Lint for the English catalogue: i18n/en.json against i18n/ru.json (the source of truth). Node ESM, no dependencies.
//
//   node tools/i18n/en-lint.mjs                 # lint i18n/en.json; exit code 1 if there are errors
//   node tools/i18n/en-lint.mjs --build         # first merge i18n/en.partial/*.json into i18n/en.json (key order and shape of ru.json)
//   node tools/i18n/en-lint.mjs --all           # print every finding (default: the first 25 of each rule)
//   node tools/i18n/en-lint.mjs --rule length   # print only one rule, in full (rule names are in the output)
//   node tools/i18n/en-lint.mjs --only industries.retail.   # only keys with this prefix
//   node tools/i18n/en-lint.mjs --accepted      # list the accepted exceptions (see ACCEPT) with their reasons
//   I18N_EN=path/to/en.json node tools/i18n/en-lint.mjs     # lint another file (as check.mjs does)
//
// i18n/en.partial/*.json stays the source of the translation; en.json is generated from it (the lint reports a stale en.json).
// Rules (E = error, W = warning):
//   keys      E  same keys as ru.json: nothing missing, nothing extra; every value is a non-empty string
//   icu       E  valid ICU, only the allowed tags
//   vars      E  same variables, same tags in the same number (tags may be moved, not lost or added); W if a plural/number variable became plain
//   plural    E  plural options only one / other (and =N); a plural needs "other"
//   cyrillic  E  no Cyrillic in English text, except the ALLOW_CYRILLIC list
//   numbers   E  the multiset of numbers equals ru (decimal comma = point, thousands separators, K/M, dates written with a month name)
//   currency  E  no rouble sign, no USD/EUR or other conversions; E a decimal comma or space-grouped thousands in English
//   length    E  width limits by role (context.json): the RU length plus 15% (buttons: also 28 characters), tags and section labels
//                not longer than RU, page title 60 and meta description 160; W body text beyond +20% (or far below: check for omissions).
//                Running text in a short role (60+ characters, audience rows, direction keywords) gets the body-text rule, see RUNNING_TEXT
//   case      E  capitals: section labels and tags set in capitals in RU stay in capitals; W headings in Title Case
//   terms     E  calques and words the style guide rejects (robotization, business center, ...); W softer ones
//   style     W  straight quotes, "...", em dash, double spaces, end punctuation, first letter, a no-break space where needed, new acronyms
//   same      W  the same RU text translated differently under different keys
//
// Length is measured on the visible text: tags are dropped, a variable counts as 2 characters, a plural counts as its "other" option.
// Strings shorter than 15 characters get a slack of 3 characters over the 15% rule (15% of 10 characters is less than one letter).
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse as parseIcu } from './icu.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const I18N = join(root, 'i18n');
const PARTIAL = join(I18N, 'en.partial');
const EN_FILE = process.env.I18N_EN || join(I18N, 'en.json');
const ALLOWED_TAGS = ['a', 'b', 'br', 'button', 'em', 'i', 'mark', 'small', 'span', 'strong', 'sub', 'sup', 'u'];

/** Cyrillic is allowed in English text only here: keys (regex) or exact strings. Empty on purpose: every Russian name is latinised (glossary, section 10). */
const ALLOW_CYRILLIC = { keys: [], strings: [] };

/**
 * Accepted exceptions to the width limits: key (* is one segment, ** the rest of the key) -> reason.
 * Each one is a decision: the limit is exceeded on purpose and the text cannot be shortened without losing meaning.
 * Only hard limits can be accepted; the list is printed by --accepted and goes into the report.
 */
const ACCEPT = {
  // fixed names and terms (glossary)
  'common.nav.cases': 'nav: glossary term "Case studies" (rejected: "Cases"); the header row has room',
  'common.linkNames.selection': 'glossary term "Solution selection", one character over',
  'home.process.steps.selection.title': 'glossary term "Solution selection", one character over',
  'home.cases.title': 'glossary term "Case studies", one character over',
  'home.cases.all': 'button, auto width, 16 of 28 characters: glossary term "case studies"',
  'industries.common.case.title': 'glossary term "Case study" (RU "Кейс" is 4 letters)',
  'industries.common.case.titleMany': 'glossary term "Case studies" (RU "Кейсы" is 5 letters)',
  'industries.*.name': 'glossary name of the industry, the same text as on the home page',
  'home.industries.items.**': 'glossary name of the industry (a row of the industries list)',
  'industries.*.links.items.*.title': 'title of a "See also" card: wraps, the names are fixed by the glossary',
  'industries.*.h1.items.*': 'headline line: see en.review.md (every line stays shorter than the longest RU line)',
  // mono capitals and tags: the shortest accurate word is longer than the RU one
  'home.sections.contact': 'RU "ЗАЯВКА" is 6 letters; CONTACT (7) is the shortest accurate label',
  'solutions.sections.talk': 'RU "ЗАЯВКА" is 6 letters; CONTACT (7) is the shortest accurate label',
  'products.sections.talk': 'RU "ЗАЯВКА" is 6 letters; CONTACT (7) is the shortest accurate label',
  'industries.common.sections.form': 'RU "ЗАЯВКА" is 6 letters; CONTACT (7) is the shortest accurate label',
  'home.sections.process': 'glossary term DEPLOYMENT (10) against ВНЕДРЕНИЕ (9)',
  'solutions.sections.hero': 'RU "РЕШЕНИЯ" is 7 letters; SOLUTIONS (9) is the glossary term; the label is only visible in the section counter',
  'solutions.sections.scenarios': 'RU "СЦЕНАРИИ" is 8 letters; SCENARIOS (9)',
  'roi.lead.label': 'RU "КП — ЗАЯВКА" (11); QUOTE — FORM (12)',
  'industries.businessCenters.ready.verdict': 'RU "Вывод" is 5 letters; "Result" (6) is the shortest accurate tag',
  'industries.agriculture.season.items.*.name': 'season names: Spring (6) and Summer (6) are longer than ВЕСНА (5) and ЛЕТО (4); one word each, no synonym',
  'industries.agriculture.cases.items.0.tag': 'RU "Агрохолдинг" is 11 letters; "Agribusiness" (12)',
  'industries.manufacturing.cases.items.0.tag': 'RU "Производство" is 12 letters; "Manufacturing" (13) is the industry name',
  'industries.construction.safety.zoneLabel': 'RU "ЗОНА ДЕМОНТАЖА" is 14 letters; DEMOLITION ZONE (15)',
  'industries.fitnessSports.zones.people': 'RU "Люди" is 4 letters; "People" (6) pairs with the neighbouring tag "Robots"',
  'industries.retail.hero.proof.since': 'a date: "since 27 May 2026" (17) against "с 27.05.2026" (12); the date is not shortened',
  'industries.medicalWellness.route.rooms.*': 'SVG room label: the boxes are 100 to 200 px wide (build.mjs, route section), 8 to 10 capitals fit',
  'industries.municipal.plan.caps.*': 'SVG caption on the plan, the label has the whole line to itself (municipal.mjs)',
  // buttons and headings that wrap
  'industries.businessCenters.form.button': 'button: "Book an assessment" (18) against 17, same wording as on the other pages',
  'industries.publicSpaces.form.button': 'button: "Book an assessment" (18) against 17, same wording as on the other pages',
  'industries.education.form.title': 'heading, one character over; same pattern as "We’ll show a robot in your hotel."',
  'industries.education.bells.facts.robots': 'caption, one character over; the school name is "School No. 281"',
  'industries.businessCenters.directions.items.3.title': 'heading, one character over',
  'industries.construction.vendors.items.1.group': 'heading of a vendor group: "Finishing and screeding" names two works, wraps',
  'industries.hotels.problems.items.2.title': 'heading of a card: "Floor-to-floor delivery" is the term used on the BC page too',
  'industries.hotels.directions.items.1.title': 'heading of a card, wraps',
  'industries.retail.directions.items.3.title': 'heading of a card: "Warehouses, dark stores"',
  'home.hero.robots.amr.cat': '"Warehouse" (9) against СКЛАД (5): the category word of the glossary',
  'home.platform.layers.robots.items.warehouse': '"Warehouse" (9) against СКЛАД (5): the category word of the glossary',
  'calc.types.warehouse': 'segment button: "Warehouse" (9) against СКЛАД (5); the segments share the row, the widest decides',
};

/** Words and phrases the style guide rejects (glossary: "Отвергнуто"). level: E error, W warning. */
const TERMS = [
  ['E', /\brobotiz/i, 'robotization is a calque: use robotics / automation'],
  ['E', /\b(revolutionary|cutting-edge|seamless(ly)?|world-class|game-changing|unlock(s|ed|ing)?|empower(s|ed|ing)?|leverag(e|es|ed|ing))\b/i, 'hype word the RU text does not have (style guide, tone)'],
  ['E', /\bbusiness cent(er|re)s?\b/i, '"business center" is a calque (a hotel room with a printer): office building'],
  ['E', /\bexploitation\b/i, 'calque of "эксплуатация": operation'],
  ['E', /\b(alpinists?|climbers?)\b/i, 'rope access technicians'],
  ['E', /\bclining\b/i, 'cleaning'],
  ['E', /\bmedical robotics\b/i, 'Healthcare robotics (regulatory risk of "medical")'],
  ['E', /\bentry threshold\b/i, 'entry cost'],
  ['E', /\brobots? (is|are) deployed by\b/i, 'passive: we deploy robots'],
  ['E', /\b(colour|centre|metres?|litres?|programme|favour|grey|storey|travelling|cancelled)\b/i, 'British spelling: the site is American English'],
  ['E', /\blift(s)?\b/i, 'elevator (American English)'],
  ['E', /(?<!Ministry of )\blabour\b/i, 'labor (American English; "Ministry of Labour" is a proper name)'],
  ['W', /\bdirections?\b/i, 'calque of "направление": area / application (and "directions" in the sense of route is not used on the site)'],
  ['W', /\bobjects?\b/i, 'calque of "объект": site, building, facility'],
  ['W', /\baudit/i, '"audit" sounds like a financial check: site assessment'],
  ['W', /\bimplementation\b/i, 'deployment (glossary)'],
  ['W', /\bpublic spaces?\b/i, 'the industry is "Public venues and transport hubs" (glossary); "public spaces" means parks and squares'],
  ['W', /\bscenarios? (between|of) robots\b/i, 'multi-robot workflows'],
  ['W', /\bin the regime of\b|\bin regime\b/i, 'calque: mode / schedule'],
  ['W', /\bsolution(s)? for\b.*\bsolution(s)? for\b/i, 'repeated phrase'],
];

/** Capitalised words that are names and not a sign of Title Case. */
const PROPER = new Set(('PROFROBOT Platform Operations Fleet Management Dispatch Retrofit Open API AI Moscow Russia Russian Skolkovo Lomonosov Kommersant ' +
  'Wi-Fi Telegram HoReCa RaaS Robots-as-a-Service St Petersburg Sochi Volgograd Nizhny Novgorod Ufa Yaroslavl Pudu Keenon Gausium Husqvarna Maytronics ' +
  'Lenta Perekrestok Rospotrebnadzor Decree Annex Federal Law School Class Order Route Scenario Lesson Case Cycle Station Pilot Moscow Polytechnic University ' +
  'Department Education Science Trade Services Entrepreneurship Innovation Innovative Development Children Store Central Victory Park Kolomenskaya Embankment ' +
  'Pulkovo Airport Sheremetyevo Terminal Tolmachevo Krasnoyarsk Krasnodar Kazansky Yaroslavsky Kursky Paveletsky Kievsky Moskovsky Olympic Guest ' +
  'Malakhitovaya Shkatulka Symphony Severny Mall Skolkovo Technopark MR Group iCITY City Priority Mirea MIREA Cluster Hotel Office Retail Hypermarkets ' +
  'Supermarkets Morning Evening Spring Walking Robots Zhilishchnik Avtonomika Pixel BellaBot Dolphin Wave Mark Unit Fitness Sports Facilities Municipal ' +
  'Healthcare Wellness Manufacturing Industry Agriculture Farming Construction Development Education Hospitality Transport Hubs Venues Public Industries ' +
  'Solutions Contact Case Studies Platform Products Services Knowledge Company About Manufacturers Sections Status Home Privacy Requisites Back Deployment Team ' +
  'Service Desk MSK Source Sources Important Areas Area Solution Product Service Sector Sectors Estimate Indicative Payback Annual Savings Full ROI Quick Site ' +
  'Type Cleaning Schedule Months Mode Zone People Robots Rules Entry Item Document List Disclaimer Sidewalks Fall Winter Spring Summer Facade Roof Floor ' +
  'Lobby Parking Underground Elevator Charging Water Reliable Automatic Door Wi-Fi Building Readiness Verdict Next Step Book Request Calculate Discuss ' +
  'Find Check Get See View Estimate Learn Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec Dept Novosti Delovoy Peterburg Rabota Argumenty Fakty Vesti Fontanka Moskvich Mag Finam').split(/\s+/));

/** Capitalised acronyms that English text may use although the RU text does not have them as Latin letters. */
const SAFE_ACRONYMS = new Set(['PROFROBOT', 'FZ', 'OKPD2', 'RIA', 'FM', 'RUB', 'MSK', 'UTC', 'CNC', 'FTE', 'FTEs', 'MFC', 'MFCs', 'TsGON', 'FTs', 'BAS', 'ERP', 'DIY', 'AMRs', 'KPIs', 'FAQ', 'PDF', 'ID', 'OK', 'SP', 'IT', 'RZD', 'US', 'USA', 'EU', 'UK', 'DC', 'DCs', 'SVG', 'URL', 'MIC', 'WCs']);

// ---------------------------------------------------------------------------------------------------------------- helpers

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
/** Nested catalogue -> flat key -> message (keys of a flat file with dots are kept as they are). */
export const flatten = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, key, out);
    else out[key] = v;
  }
  return out;
};
/** Same output format as extract.mjs (toJson): 2 spaces, no-break spaces written as escapes, final newline. */
const toJson = (obj) => `${JSON.stringify(obj, null, 2).replace(/\u00a0/g, '\\u00a0').replace(/\u202f/g, '\\u202f')}\n`;
const globToRe = (glob) => new RegExp(`^${glob.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^.]+').replace(/\u0000/g, '.+')}$`);
const accepted = Object.entries(ACCEPT).map(([glob, reason]) => ({ re: globToRe(glob), glob, reason }));

/** The same nesting and order as the reference object, with the messages from `flat`. */
const nestLike = (ref, flat, prefix = '') => Object.fromEntries(Object.entries(ref).map(([k, v]) => {
  const key = prefix ? `${prefix}.${k}` : k;
  return [k, v && typeof v === 'object' ? nestLike(v, flat, key) : flat[key]];
}));

/**
 * Merges i18n/en.partial/*.json (flat dotted keys or nested) in the shape of ru.json.
 * `fatal`: a key in two parts. `stale`: keys of a part that ru.json no longer has (dropped from en.json). `missing`: keys of ru.json no part translates yet.
 */
async function mergePartials(ruNested, ru) {
  const files = (await readdir(PARTIAL)).filter((f) => f.endsWith('.json')).sort();
  const merged = {}, where = {}, fatal = [], stale = [];
  for (const f of files) {
    for (const [k, v] of Object.entries(flatten(await readJson(join(PARTIAL, f))))) {
      if (k in merged) fatal.push(`${k}: in ${where[k]} and in ${f}`);
      merged[k] = v;
      where[k] = f;
    }
  }
  for (const k of Object.keys(merged)) if (!(k in ru)) { stale.push(`${k} (${where[k]})`); delete merged[k]; }
  const missing = Object.keys(ru).filter((k) => !(k in merged));
  return { files, flat: merged, nested: nestLike(ruNested, merged), fatal, stale, missing };
}

/** Variables, tags and plural options of a parsed message. */
function describe(ast, acc = { vars: new Map(), tags: new Map(), plurals: [] }) {
  const addVar = (name, kind) => {
    const prev = acc.vars.get(name);
    acc.vars.set(name, !prev || prev === 'arg' ? kind : prev);
  };
  const addTag = (name) => acc.tags.set(name, (acc.tags.get(name) || 0) + 1);
  for (const n of ast) {
    if (n.type === 'arg') addVar(n.name, n.format ? 'number' : 'arg');
    else if (n.type === 'plural') { addVar(n.name, n.ordinal ? 'selectordinal' : 'plural'); acc.plurals.push(n); for (const o of Object.values(n.options)) describe(o, acc); }
    else if (n.type === 'select') { addVar(n.name, 'select'); for (const o of Object.values(n.options)) describe(o, acc); }
    else if (n.type === 'tag') { addTag(n.name); describe(n.children, acc); }
    else if (n.type === 'void') addTag(`${n.name}/`);
  }
  return acc;
}

/** The text a visitor reads: tags dropped, a variable is two characters, a plural is its "other" option. `arg` replaces a variable in other uses. */
function visible(ast, arg = '00') {
  return ast.map((n) => {
    switch (n.type) {
      case 'text': return n.value;
      case 'arg': case 'pound': return arg;
      case 'plural': case 'select': return visible(n.options.other ?? Object.values(n.options)[0], arg);
      case 'tag': return visible(n.children, arg);
      case 'void': return ' ';
      default: return '';
    }
  }).join('');
}
const width = (text) => [...text.replace(/\s+/g, ' ').trim()].length;

const MULT = { K: 1e3, thousand: 1e3, тыс: 1e3, M: 1e6, million: 1e6, млн: 1e6, B: 1e9, billion: 1e9, млрд: 1e9 };
/** English renderings of a Russian word that is a number: "круглосуточно", "за сутки" -> 24/7, 24-hour. */
const DAY_WORDS = /сутк|суток|круглосуточ|круглые сутки/i;
/** Numbers of a text as tokens {raw, vals, soft}: vals holds the value and, with a K/M/тыс/млн suffix, the scaled value too. A soft token (H1, Q3, the 5 of X5) is not reported as extra. */
function numberTokens(text, lang, other = '') {
  let s = text.replace(/\b(\d{1,2}):00\b/g, '$1');           // 08:00 and "8 часов" both give 8
  if (lang === 'ru') s = s.replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})(?!\d|[.-]\d)/g, '$1 $3').replace(/\b\d{2}\.(\d{4})\b(?!\.\d)/g, '$1'); // dates: the month becomes a word in English
  else if (DAY_WORDS.test(other)) s = s.replace(/\b24\/7\b|\b24-hour\b/g, ' ');
  const codes = [];
  s = s.replace(/\d+(?:\.\d+){2,}(?:-\d+)?|\d+\.\d+-\d+/g, (m) => { codes.push(m); return ' '; }); // 29.10.59.130, 2.1.3678-20
  const tokens = [];
  if (lang === 'en') s = s.replace(/\b([HQ])([1-4])\b/g, (m, c, d) => { tokens.push({ raw: m, vals: new Set([Number(d)]), soft: true }); return ' '; }); // H1 2026, Q3
  const re = lang === 'ru'
    ? /\d+(?:[ \u00a0\u202f]\d{3}(?!\d))*(?:[.,]\d+)?(?:\s*(тыс|млн|млрд)(?![а-яё]))?/g
    : /\d{1,3}(?:,\d{3})+(?:\.\d+)?(?:\s?(K|M|B|thousand|million|billion)\b)?|\d+(?:\.\d+)?(?:\s?(K|M|B|thousand|million|billion)\b)?/g;
  for (const m of s.matchAll(re)) {
    const glued = lang === 'en' && /[A-Za-z]/.test(s[m.index - 1] || ''); // X5 Group, CC1: a digit inside a name is not a figure of its own
    const num = Number(m[0].match(/^[\d\u00a0\u202f ,.]+/)[0].replace(/[ \u00a0\u202f]/g, '').replace(lang === 'ru' ? /,/ : /,/g, lang === 'ru' ? '.' : ''));
    const suffix = m[1] || m[2];
    tokens.push({ raw: m[0].trim(), vals: new Set(suffix ? [num, num * MULT[suffix]] : [num]), soft: glued });
  }
  return { tokens, codes };
}
/** Multiset comparison: the RU numbers that have no partner in EN, and the EN numbers that have none in RU. */
function diffNumbers(ruText, enText) {
  const a = numberTokens(ruText, 'ru'), b = numberTokens(enText, 'en', ruText);
  const pool = [...b.tokens];
  const missing = [];
  for (const r of a.tokens) {
    const i = pool.findIndex((e) => [...r.vals].some((v) => e.vals.has(v)));
    if (i < 0) missing.push(r.raw); else pool.splice(i, 1);
  }
  const extra = pool.filter((t) => !t.soft).map((t) => t.raw);
  const codeP = [...b.codes];
  for (const c of a.codes) { const i = codeP.indexOf(c); if (i < 0) missing.push(c); else codeP.splice(i, 1); }
  extra.push(...codeP);
  return { missing, extra };
}

/** Page title and meta description keys (limits 60 and 160); other "meta" messages (an SVG title, a chart description) have no hard limit. */
const metaKind = (key) => (/^(home|solutions|roi)\.meta\.title$|^industries\.[A-Za-z]+\.title$/.test(key) ? 'title' : /(^|\.)(meta\.)?description$/.test(key) && !/chart/i.test(key) ? 'description' : null);

/** Lists that are running text in the layout: audience rows wrap (industry.css .ih__aud), direction keywords are joined with " · " in a paragraph (.drow__items). */
const RUNNING_TEXT = [/\.audiences\.items\.\d+$/, /\.items\.items\.\d+$/];
/** Roles that are short UI strings. A string of this role that is 60 characters or longer is a sentence in a note or a card and gets the body-text rule. */
const SHORT_ROLES = ['h1', 'heading', 'label', 'caption', 'short', 'option', 'link', 'nav', 'button'];

/** Width limit of an English message from the role and the RU width: [limit, hard]. Undefined: no limit. */
function limitFor(key, role, ruW) {
  const slack = (n) => (ruW < 15 ? Math.max(n, ruW + 3) : n);
  const p15 = slack(Math.floor(ruW * 1.15));
  const body = [Math.max(Math.floor(ruW * 1.2), ruW + 3), false];
  if (RUNNING_TEXT.some((re) => re.test(key)) || (SHORT_ROLES.includes(role) && !['h1', 'heading', 'button', 'nav'].includes(role) && ruW >= 60)) return body;
  switch (role) {
    case 'h1': case 'heading': case 'label': case 'caption': case 'short': case 'option': case 'link': case 'nav': return [p15, true];
    case 'button': return [Math.min(p15, 28), true];
    case 'section-label': case 'tag': case 'placeholder': return [ruW, true];
    case 'meta': { const k = metaKind(key); return k === 'title' ? [60, true] : k === 'description' ? [160, true] : [Math.floor(ruW * 1.2), false]; }
    case 'paragraph': case 'js': return body;
    case 'alt': case 'aria': return [Math.floor(ruW * 1.3) + 10, false];
    default: return undefined;
  }
}

// ---------------------------------------------------------------------------------------------------------------- the lint

/** @returns {Promise<{findings: {level:'E'|'W', rule:string, key:string, text:string}[], accepted: {key:string, text:string, reason:string}[], stats: object}>} */
export async function lint({ ru, en, ctx, only = '' }) {
  /** @type {{level:'E'|'W', rule:string, key:string, text:string}[]} */
  const findings = [];
  const acceptedHits = [];
  const add = (level, rule, key, text) => findings.push({ level, rule, key, text });

  // keys
  for (const k of Object.keys(ru)) if (!(k in en)) add('E', 'keys', k, 'missing in en.json');
  for (const k of Object.keys(en)) if (!(k in ru)) add('E', 'keys', k, 'not in ru.json');

  const byRu = new Map();
  for (const [k, ruMsg] of Object.entries(ru)) {
    if (only && !k.startsWith(only)) continue;
    const enMsg = en[k];
    if (typeof enMsg !== 'string' || !enMsg.trim()) { if (k in en) add('E', 'keys', k, 'empty or not a string'); continue; }
    const role = ctx[k]?.role;
    let ruAst, enAst;
    try { ruAst = parseIcu(ruMsg); } catch { continue; }       // reported by check.mjs
    try { enAst = parseIcu(enMsg); } catch (e) { add('E', 'icu', k, e.message); continue; }
    const a = describe(ruAst), b = describe(enAst);
    for (const t of b.tags.keys()) if (!ALLOWED_TAGS.includes(t.replace(/\/$/, ''))) add('E', 'icu', k, `tag <${t}> is not allowed`);

    // vars, tags
    const names = (m) => [...m.keys()].sort().join(',');
    if (names(a.vars) !== names(b.vars)) add('E', 'vars', k, `variables {${names(b.vars)}} differ from ru {${names(a.vars)}}`);
    else for (const [n, kind] of a.vars) {
      const got = b.vars.get(n);
      if (kind !== got && (kind === 'plural' || kind === 'number')) add('W', 'vars', k, `{${n}} is ${kind} in ru and ${got} in en`);
    }
    const tagList = (m) => [...m].sort().map(([n, c]) => `${n}×${c}`).join(' ');
    if (tagList(a.tags) !== tagList(b.tags)) add('E', 'vars', k, `tags <${tagList(b.tags)}> differ from ru <${tagList(a.tags)}>`);

    // plural
    for (const p of b.plurals) {
      const ok = p.ordinal ? ['one', 'two', 'few', 'other'] : ['one', 'other'];
      const bad = Object.keys(p.options).filter((o) => !ok.includes(o) && !/^=\d+$/.test(o));
      if (bad.length) add('E', 'plural', k, `${p.ordinal ? 'ordinal' : 'plural'} option(s) ${bad.join(', ')}: English has only ${ok.join(' / ')}`);
    }

    // cyrillic
    if (/[Ѐ-ӿ]/.test(enMsg) && !ALLOW_CYRILLIC.keys.some((re) => re.test(k)) && !ALLOW_CYRILLIC.strings.includes(enMsg)) add('E', 'cyrillic', k, `Cyrillic left: «${enMsg.match(/[^\s]*[Ѐ-ӿ][^\s]*/)[0]}»`);

    const ruText = visible(ruAst, '¤'), enText = visible(enAst, '¤');
    // numbers
    const nd = diffNumbers(ruText, enText);
    if (nd.missing.length || nd.extra.length) add('E', 'numbers', k, `${nd.missing.length ? `missing: ${nd.missing.join(', ')}` : ''}${nd.missing.length && nd.extra.length ? '; ' : ''}${nd.extra.length ? `not in ru: ${nd.extra.join(', ')}` : ''}`);
    for (const m of ruText.matchAll(/\d{1,3}(?:[ \u00a0\u202f]\d{3})+/g)) {
      const plain = m[0].replace(/[ \u00a0\u202f]/g, '');
      if (new RegExp(`(^|[^\\d,.])${plain}(?![\\d])`).test(enText)) add('E', 'currency', k, `${plain}: write thousands with a comma (${Number(plain).toLocaleString('en-US')})`);
    }

    // currency, separators
    if (/₽|руб/i.test(enMsg)) add('E', 'currency', k, 'rouble sign: write RUB');
    if (/\$|€|£|\b(USD|EUR|GBP)\b/.test(enMsg) && !/\$|€|£|USD|EUR/.test(ruMsg)) add('E', 'currency', k, 'no conversion to other currencies');
    if (/\d,\d{1,2}(?!\d)/.test(enText.replace(/\{[^}]*\}/g, ''))) add('E', 'currency', k, 'decimal comma: use a point');
    if (/\d[ \u00a0\u202f]\d{3}(?!\d)/.test(enText) && !/\d[ \u00a0\u202f]\d{3}(?!\d)/.test(ruText.replace(/\d{1,3}(?:[ \u00a0\u202f]\d{3})+/g, ''))) add('E', 'currency', k, 'thousands grouped with a space: use a comma');

    // length
    const ruW = width(ruText), enW = width(enText);
    const lim = role ? limitFor(k, role, ruW) : undefined;
    if (lim) {
      const [max, hard] = lim;
      const hit = accepted.find((x) => x.re.test(k));
      if (enW > max) {
        if (hit && hard) acceptedHits.push({ key: k, text: `${ruW}→${enW} > ${max} [${role}]`, reason: hit.reason });
        else add(hard ? 'E' : 'W', 'length', k, `[${role}] ru ${ruW} → en ${enW}, limit ${max}: «${enText.trim()}»`);
      } else if (role === 'paragraph' && ruW >= 60 && enW < ruW * 0.7) add('W', 'length', k, `[${role}] ru ${ruW} → en ${enW} (more than 30% shorter: check nothing was dropped)`);
    }

    // case
    const letters = (s) => s.replace(/[^A-Za-zА-Яа-яЁё]/g, '');
    if ((role === 'section-label' || role === 'tag') && /[А-Я]/.test(ruText) && letters(ruText) === letters(ruText).toUpperCase() && letters(enText) !== letters(enText).toUpperCase()) add('E', 'case', k, `RU is in capitals, EN is not: «${enText.trim()}»`);
    if (['h1', 'heading', 'button', 'nav', 'option', 'link'].includes(role) && !(letters(enText) === letters(enText).toUpperCase())) {
      const ruLatin = new Set(ruText.match(/[A-Za-z][A-Za-z0-9-]*/g) || []);
      const words = enText.replace(/[“”".,:;!?()↗↓↑→]/g, ' ').split(/\s+/).filter(Boolean).slice(1);
      const caps = words.filter((w) => /^[A-Z][a-z]{2,}$/.test(w) && !PROPER.has(w) && !ruLatin.has(w));
      if (caps.length >= 2) add('W', 'case', k, `Title Case? sentence case is the rule (${caps.join(', ')}): «${enText.trim()}»`);
    }

    // terms
    for (const [level, re, msg] of TERMS) {
      const m = enText.match(re);
      if (m && !re.test(ruText)) add(level, 'terms', k, `"${m[0]}": ${msg}`);
    }

    // style
    if (/["']/.test(enMsg.replace(/''|'[{}<>#]/g, ''))) add('W', 'style', k, 'straight quote or apostrophe: use “ ” and ’');
    if (/\.\.\./.test(enMsg)) add('W', 'style', k, 'three dots: use …');
    if (/\u2014/.test(enMsg) && !/T\u2014Zh/.test(enMsg) && !(role === 'tag' || role === 'section-label')) add('W', 'style', k, 'em dash: the style is an en dash with spaces ( – ), or restructure the sentence');
    if (/ {2,}/.test(enMsg)) add('W', 'style', k, 'double space');
    if (/^\s/.test(ruMsg) !== /^\s/.test(enMsg) || /\s$/.test(ruMsg) !== /\s$/.test(enMsg)) add('W', 'style', k, 'leading or trailing space differs from ru (it is a join with a neighbouring element)');
    if (!['alt', 'aria', 'meta', 'js'].includes(role)) {
      const end = (s) => { const t = s.trim().replace(/[”’"»)]+$/, ''); return /[.!?…]$/.test(t) ? '.' : /[:—–]$/.test(t) ? ':' : ''; };
      if (end(ruText) !== end(enText) && !(end(ruText) === '' && /[?]$/.test(enText.trim()))) add('W', 'style', k, `ends with «${end(enText) || 'nothing'}», ru ends with «${end(ruText) || 'nothing'}»`);
    }
    const lead = (s) => s.trim().replace(/^<[^>]+>/, '');
    const word = (s) => lead(s).match(/^[^\s,.:;]+/)?.[0] || '';
    const fr = word(ruText), fe = word(enText);
    const caps = (w) => /[A-ZА-Я]{2}/.test(w) || /\d/.test(w) || /^[A-Za-z]+[A-Z]/.test(w);
    if (fr && fe && /^[A-Za-zА-Яа-яЁё]/.test(fr) && /^[A-Za-z]/.test(fe) && !caps(fr) && !caps(fe) && !/^(e\.g\.|Например)/.test(fe + fr) && (fr[0] === fr[0].toLowerCase()) !== (fe[0] === fe[0].toLowerCase()) && !/^[A-Za-z]/.test(fr)) add('W', 'style', k, `first letter: ru «${fr}», en «${fe}» (a fragment that continues another element starts in lower case)`);
    if (/\d (m²|m²\/h|km\/h|km|mm|kg|ha|h|min|L|t)(?![A-Za-z])/.test(enMsg) || /\bRUB \d|\bNo\. \d/.test(enMsg)) add('W', 'style', k, 'use a no-break space (U+00A0) between a number and its unit, after RUB and after No.');
    if (!/^[\u0000-\uffff]*$/.test(enMsg)) add('W', 'style', k, 'character outside the BMP');
    const rawAcr = [...(enText.match(/\b[A-Z][A-Za-z]*[A-Z0-9][A-Za-z0-9]*\b/g) || [])].filter((w) => /^[A-Z0-9-]{2,}s?$/.test(w));
    if (rawAcr.length && !(letters(enText) === letters(enText).toUpperCase())) {
      const ruLatin = ruText + ruMsg;
      const fresh = rawAcr.filter((w) => !ruLatin.includes(w) && !SAFE_ACRONYMS.has(w) && !/^[A-Z]\d/.test(w));
      if (fresh.length) add('W', 'style', k, `acronym not in ru: ${[...new Set(fresh)].join(', ')} (every acronym is expanded at its first mention; nothing new is claimed)`);
    }

    // same RU text
    const norm = ruText.replace(/\s+/g, ' ').trim();
    if (/[А-Яа-яЁё]{3}/.test(norm) && norm.length > 3) { if (!byRu.has(norm)) byRu.set(norm, []); byRu.get(norm).push([k, enText.replace(/\s+/g, ' ').trim()]); }
  }
  for (const [norm, list] of byRu) {
    const variants = new Set(list.map(([, t]) => t));
    if (variants.size > 1) add('W', 'same', list[0][0], `same RU «${norm.slice(0, 50)}» has different EN: ${[...variants].map((v) => `«${v.slice(0, 50)}»`).join(' / ')} (keys: ${list.map(([k]) => k).join(', ')})`);
  }
  return { findings, accepted: acceptedHits, stats: { keys: Object.keys(ru).length } };
}

// ---------------------------------------------------------------------------------------------------------------- CLI

async function main() {
  const argv = process.argv.slice(2);
  const opt = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  const ruNested = await readJson(join(I18N, 'ru.json'));
  const ru = flatten(ruNested);
  const ctx = (await readJson(join(I18N, 'context.json'))).keys;
  const merged = existsSync(PARTIAL) ? await mergePartials(ruNested, ru) : null;
  const problems = [];
  if (argv.includes('--build')) {
    if (!merged) { console.error('i18n/en.partial does not exist'); process.exit(1); }
    for (const p of merged.fatal) console.error(`partial: ${p}`);
    if (merged.fatal.length) { console.error('not writing en.json: fix the parts first'); process.exit(1); }
    await writeFile(join(I18N, 'en.json'), toJson(merged.nested));
    console.log(`wrote i18n/en.json: ${Object.keys(merged.flat).length} messages from ${merged.files.length} parts`);
  }
  if (!existsSync(EN_FILE)) { console.error(`${EN_FILE} does not exist: run with --build`); process.exit(1); }
  const enText = await readFile(EN_FILE, 'utf8');
  const en = flatten(JSON.parse(enText));
  if (merged && EN_FILE === join(I18N, 'en.json')) {
    for (const p of merged.fatal) problems.push(`en.partial: ${p}`);
    if (merged.stale.length) problems.push(`en.partial has ${merged.stale.length} key(s) that ru.json no longer has (they are not in en.json; delete them from the parts): ${merged.stale.slice(0, 6).join(', ')}${merged.stale.length > 6 ? ', ...' : ''}`);
    if (merged.missing.length) problems.push(`${merged.missing.length} key(s) of ru.json have no translation in en.partial: ${merged.missing.slice(0, 6).join(', ')}${merged.missing.length > 6 ? ', ...' : ''}`);
    if (!merged.fatal.length && enText !== toJson(merged.nested)) problems.push('i18n/en.json differs from the merge of i18n/en.partial (the parts are the source). Fix: node tools/i18n/en-lint.mjs --build');
  }
  const result = await lint({ ru, en, ctx, only: opt('--only') || '' });
  const rule = opt('--rule');
  const limit = argv.includes('--all') || rule ? Infinity : 25;
  const rules = [...new Set(result.findings.map((f) => f.rule))];
  let errors = problems.length, warnings = 0;
  for (const p of problems) console.log(`ERROR [build] ${p}`);
  for (const r of rules) {
    if (rule && rule !== r) continue;
    for (const level of ['E', 'W']) {
      const list = result.findings.filter((f) => f.rule === r && f.level === level);
      if (!list.length) continue;
      console.log(`\n${level === 'E' ? 'ERROR' : 'warning'} [${r}] ${list.length}`);
      for (const f of list.slice(0, limit)) console.log(`  ${f.key}  ${f.text}`);
      if (list.length > limit) console.log(`  ... and ${list.length - limit} more (--all or --rule ${r})`);
    }
  }
  for (const f of result.findings) if (f.level === 'E') errors++; else warnings++;
  if (argv.includes('--accepted')) {
    console.log(`\naccepted exceptions: ${result.accepted.length}`);
    for (const a of result.accepted) console.log(`  ${a.key}  ${a.text}  (${a.reason})`);
  }
  const perRule = rules.map((r) => `${r} ${result.findings.filter((f) => f.rule === r).length}`).join(', ');
  console.log(`\n${Object.keys(en).length} messages checked against ${result.stats.keys} in ru.json: ${errors} error(s), ${warnings} warning(s), ${result.accepted.length} accepted exception(s)${perRule ? ` [${perRule}]` : ''}`);
  process.exitCode = errors ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
