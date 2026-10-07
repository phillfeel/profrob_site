// Site-wide footer navigation (sections, industries, solutions, company) for every page except index.html,
// which has its own footer with stats. One source: hand-written pages are synced by this script,
// industry pages get the same block from tools/industries/build.mjs.
//
//   node tools/site/footer-nav.mjs           # insert/refresh the block in every page
//   node tools/site/footer-nav.mjs --check   # report pages whose block is missing or stale (exit 1)
//
// Solution links point at solutions.html#dir-<slug> until the solution pages exist (docs/adr/0001-temporary-solution-urls.md).
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const START = '<!-- foot-nav:start -->';
export const END = '<!-- foot-nav:end -->';

const SECTIONS = [
  ['solutions.html', 'common.nav.solutions', 'Решения'],
  ['industries.html', 'common.nav.industries', 'Отрасли'],
  ['products.html', 'common.footer.nav.products', 'Продукты'],
  ['platform.html', 'common.nav.platform', 'Платформа'],
  ['services.html', 'common.footer.nav.services', 'Услуги'],
  ['cases.html', 'common.nav.cases', 'Кейсы'],
  ['knowledge.html', 'common.footer.nav.knowledge', 'База знаний'],
];

// slug of the page file, i18n key suffix of industries.<key>.name, Russian name (must equal ru.json)
const INDUSTRIES = [
  ['retail', 'retail', 'Торговые центры и ритейл'],
  ['business-centers', 'businessCenters', 'Бизнес-центры и офисы'],
  ['hotels', 'hotels', 'Отели и HoReCa'],
  ['public-spaces', 'publicSpaces', 'Общественные пространства'],
  ['medical-wellness', 'medicalWellness', 'Медицина и велнес'],
  ['education', 'education', 'Образовательные учреждения'],
  ['fitness-sports', 'fitnessSports', 'Фитнес-клубы и спорткомплексы'],
  ['municipal', 'municipal', 'Муниципальные службы'],
  ['warehouse', 'warehouse', 'Склады и логистика'],
  ['manufacturing', 'manufacturing', 'Промышленность и производство'],
  ['construction', 'construction', 'Строительство'],
  ['agriculture', 'agriculture', 'Сельское хозяйство'],
];

// anchor slug on solutions.html, key in common.solutionNames, Russian name
const SOLUTIONS = [
  ['cleaning', 'cleaning', 'Роботизированный клининг'],
  ['warehouse', 'warehouse', 'Складская роботизация'],
  ['service-robots', 'service', 'Сервисные роботы'],
  ['industrial', 'industrial', 'Промышленная роботизация'],
  ['medical', 'medical', 'Медицинская робототехника'],
  ['construction', 'construction', 'Строительная робототехника'],
  ['agro', 'agro', 'Агророботы'],
  ['security', 'security', 'Роботы безопасности'],
  ['humanoid', 'humanoid', 'Гуманоидные роботы'],
];

const COMPANY = [
  ['about.html', 'common.footer.nav.about', 'О компании'],
  ['manufacturers.html', 'common.footer.nav.makers', 'Производители'],
  ['contacts.html', 'common.nav.contacts', 'Контакты'],
  ['roi.html', 'common.footer.nav.roi', 'Калькулятор ROI'],
  ['contacts.html#talk', 'common.footer.nav.quote', 'Запросить КП'],
  ['services.html#pilot', 'common.footer.nav.pilot', 'Демо и пилот'],
];

const link = ([href, key, ru]) => `          <a data-i18n="${key}" href="${href}">${ru}</a>`;

const col = (n, headKey, headRu, items) => `        <nav class="foot-col" aria-labelledby="foot-site-${n}">
          <h3 class="mono" id="foot-site-${n}"><b>0${n}</b> <span data-i18n="${headKey}">${headRu}</span></h3>
${items.map(link).join('\n')}
        </nav>`;

/** The block as it stands in a page; `<div class="foot-bot">` follows it. */
export function footerNav() {
  const cols = [
    col(1, 'common.footer.nav.sections', 'Разделы', SECTIONS),
    col(2, 'common.nav.industries', 'Отрасли', INDUSTRIES.map(([s, k, ru]) => [`industries-${s}.html`, `industries.${k}.name`, ru])),
    col(3, 'common.nav.solutions', 'Решения', SOLUTIONS.map(([s, k, ru]) => [`solutions.html#dir-${s}`, `common.solutionNames.${k}`, ru])),
    col(4, 'common.footer.nav.company', 'Компания', COMPANY),
  ];
  return `      ${START}
      <div class="foot-grid foot-grid--site">
${cols.join('\n')}
      </div>
      ${END}
`;
}

const BLOCK_RE = new RegExp(`      ${START}[\\s\\S]*?${END}\\n`);
const ANCHOR = '      <div class="foot-bot">';

/** Returns the page with the block inserted or refreshed, or null when the page has no inner-page footer to put it in. */
export function syncPage(html) {
  const block = footerNav();
  if (BLOCK_RE.test(html)) return html.replace(BLOCK_RE, () => block);
  if (!/<footer class="site-foot [^"]+"/.test(html) || !html.includes(ANCHOR)) return null;
  return html.replace(ANCHOR, () => block + ANCHOR);
}

async function main() {
  const check = process.argv.includes('--check');
  const pages = (await readdir(root)).filter((f) => f.endsWith('.html') && f !== 'index.html').sort();
  const bad = [];
  for (const f of pages) {
    const html = await readFile(join(root, f), 'utf8');
    const next = syncPage(html);
    if (next === null) { console.log(`skip ${f} (no inner-page footer)`); continue; }
    if (next === html) continue;
    if (check) bad.push(f);
    else { await writeFile(join(root, f), next); console.log(`synced ${f}`); }
  }
  if (bad.length) { console.error(`footer nav is missing or stale: ${bad.join(', ')}\n  Fix: node tools/site/footer-nav.mjs`); process.exit(1); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
