// Industry landing «Бизнес-центры и офисы» → industries-business-centers.html.
// Facts: docs/research/2026-10-06-empty-industries-research.md (sections 1–3, 9, 10) and, for the facade robot,
// docs/research/2026-10-02-facade-robot-calculator-data.md. The page carries no links to press articles.
// Own blocks: hero «building section» (levels link to directions) and «ready» — a building readiness checklist
// after the MR developer standard (industry-business-centers.js counts the ticks).
//
// TODO(client): кейс с главной «Бизнес-центр — снижение затрат на клининг на 32%» здесь не используем, пока нет
//   объекта, периода и разрешения на публикацию (исследование, раздел 10, вопрос 2).
// TODO(client): своих кейсов в БЦ (доставка, ресепшн, патрулирование) нет — нужны объекты и цифры, если есть.
// Competitors (other integrators, Russian makers we do not work with) are not named on the page.
import { existsSync } from 'node:fs';

// Real hero photo from assets/industry_hero/<slug>.webp, if it has been added; otherwise the robot placeholder.
const heroPhoto = (slug) => (existsSync(new URL(`../../../assets/industry_hero/${slug}.webp`, import.meta.url))
  ? `assets/industry_hero/${slug}.webp` : null);

const SOL = {
  cleaning: { label: 'Роботизированный клининг', href: '/solutions/cleaning/' },
  service: { label: 'Сервисные роботы', href: '/solutions/service-robots/' },
  humanoid: { label: 'Гуманоидные роботы', href: '/solutions/humanoid/' },
};

// Hero «building section»: top to bottom. Elevation marks are illustrative (a typical office tower), not a real object.
const LEVELS = [
  { key: 'roof', mark: '+72,000', name: 'Кровля и фасад', task: 'Мойка остекления', anchor: 'facades' },
  { key: 'floors', mark: '+7,200…', name: 'Офисные этажи', task: 'Доставка по этажам', anchor: 'delivery' },
  { key: 'lifts', mark: '+3,600', name: 'Лифтовые холлы и коридоры', task: 'Уборка днём, при людях', anchor: 'indoor-cleaning' },
  { key: 'lobby', mark: '±0,000', name: 'Лобби', task: 'Ресепшн и навигация', anchor: 'reception' },
  { key: 'parking', mark: '−3,600', name: 'Подземный паркинг', task: 'Уборка паркинга', anchor: 'indoor-cleaning' },
];

// Signature block: points of the MR «automated cleaning» standard (ComNews, 03.07.2026).
// «Зачем» and «если нет» are our reasoning.
const READY = [
  { id: 'lifts', icon: 'bc-lift', title: 'Интеграция с лифтами', why: 'Робот сам вызывает лифт и переезжает между этажами и на паркинг.', no: 'Робот работает на одном этаже, между этажами его переставляют люди.' },
  { id: 'doors', icon: 'bc-door', title: 'Автодоводчики дверей', why: 'Двери на маршруте открываются и закрываются без сотрудника рядом.', no: 'Маршрут строим по зонам без дверей или открываем двери по графику уборки.' },
  { id: 'dock', icon: 'bc-plug', title: 'Зоны зарядки', why: 'Место под док-станцию с розеткой, в стороне от потока людей.', no: 'Ищем место на аудите: от него зависит длина маршрута и время на зарядку.' },
  { id: 'water', icon: 'drop', title: 'Точки воды', why: 'Набор и слив воды для поломоечного робота рядом с маршрутом.', no: 'Ставим робота с мобильным баком: он работает без точек набора и слива воды.' },
  { id: 'wifi', icon: 'bc-wifi', title: 'Стабильный Wi-Fi', why: 'Задания, карта и отчёты доходят без обрывов, в том числе в лифтах и на паркинге.', no: 'Меряем покрытие на маршруте и добавляем точки доступа там, где связь пропадает.' },
];


const industry = {
  slug: 'business-centers',
  name: 'Бизнес-центры и офисы',
  // Evidence is medium: named objects exist, savings figures come only from vendors and developers (research, section 1).
  tier: 3,
  title: 'Роботы для бизнес-центров и офисов: уборка, фасады | ПРОФРОБОТ',
  description: 'Роботы-уборщики для офиса и бизнес-центра: уборка холлов и паркингов днём при арендаторах, мойка фасадов, доставка по этажам, ресепшн. Проверим здание под роботов.',
  h1: ['Роботы в бизнес-центре:', 'от паркинга до фасада.'],
  lead: 'Общие зоны бизнес-центра убирают днём, при арендаторах, а клининг держится на подрядчике и людях, которых всё труднее найти.',
  lead2: 'Роботы тихо моют холлы и паркинги по графику, фасад — с кровли на тросе, документы и обеды развозят по этажам. Начинаем с проверки здания: лифты, двери, вода, Wi-Fi.',
  audiences: ['управляющие компании БЦ', 'девелоперы коммерческой недвижимости', 'АХО и facility-операторы'],
  photo: { robot: 'robot-cleaning.webp', w: 964, h: 1026, note: 'Промпт 6 — лифтовый холл БЦ днём, при людях', alt: 'Компактный поломоечный робот моет лифтовый холл бизнес-центра днём, мимо проходят сотрудники с ноутбуками' },
  primaryCta: { label: 'Проверить здание под роботов', href: '#ready' },
  secondaryCta: { label: 'Обсудить пилот', href: '#talk' },
  heads: {
    problems: 'Где бизнес-центр теряет на уборке.',
    directions: 'Что роботизируем на каждом уровне.',
    vendors: 'Техника под каждый уровень здания.',
  },
  secNames: { ready: 'ГОТОВНОСТЬ ЗДАНИЯ', case: 'КЕЙСЫ' },
  problems: [
    { level: 'Лифтовые холлы и лобби', title: 'Убирать приходится при арендаторах.', text: 'Общие зоны работают весь день. Уборка идёт в рабочее время и не должна мешать людям: тихо, без луж и перегороженных проходов.' },
    { level: 'Всё здание', title: 'Клининг держится на дефицитных людях.', text: 'Больше 80% персонала клининга — иностранцы, ФОТ клининговых компаний за пять лет вырос в два-три раза, а спрос на исполнителей в клининге за год прибавил 31%.', srcText: 'CORE.XP и DAKO Professional; Авито Работа, 1-е полугодие 2026' },
    { level: 'Инженерия', title: 'Старое здание не готово к роботу.', text: 'Нет точек набора и слива воды для док-станций, лифты не умеют принимать вызов от робота, двери открывают вручную.', srcText: 'Что нужно зданию — по стандарту автоматизированного клининга девелопера MR' },
    { level: 'Фасад', title: 'Фасад моют на высоте.', text: 'Мойка остекления — работа на высоте: допуски, наряд-допуск, и при ветре от 15 м/с на открытых местах работы не ведут. Каждая мойка — подрядчик с альпинистами.', srcText: 'Правила по охране труда при работе на высоте, приказ Минтруда № 782н' },
  ],
  directions: [
    {
      anchor: 'indoor-cleaning', level: 'Лифтовые холлы · коридоры · паркинг', title: 'Уборка холлов, коридоров и паркингов',
      text: 'Поломоечные и пылесосные роботы моют лобби, лифтовые холлы и коридоры днём, при людях, и ночью. На паркинге работают крупные машины без водителя.',
      items: ['лобби и лифтовые холлы', 'коридоры офисных этажей', 'подземные паркинги', 'уборка днём и ночью'],
      fact: 'Девелопер MR: роботы на паркингах — до 1 800 м²/ч',
      solution: SOL.cleaning,
    },
    {
      anchor: 'facades', level: 'Кровля · фасад', title: 'Мойка фасадов и остекления',
      text: 'Робот K3 спускается с кровли на тросе и моет сплошное остекление, люди остаются на кровле. Горизонтальные рамы выше 10 мм он не проходит, поэтому пригодность фасада проверяем на аудите.',
      items: ['сплошное остекление', 'гладкий полированный камень', 'монтаж с кровли'],
      fact: 'До 1 500 м² за смену по данным производителя; окупается от ≈ 36 тыс. м² мойки в год — наш расчёт при цене подрядчика 60 ₽/м²',
      solution: { label: 'Калькулятор мойки фасадов', href: 'roi.html?k=facade' },
    },
    {
      anchor: 'delivery', level: 'Офисные этажи', title: 'Доставка внутри здания',
      text: 'Почта, документы и обеды из фудкорта по этажам. Робот-курьер сам вызывает лифт, если лифты к нему подключены, и привозит заказ к двери офиса.',
      items: ['почта и документы', 'обеды из фудкорта', 'расходники для АХО'],
      fact: 'Российских кейсов в офисах с опубликованными цифрами мы не нашли — предлагаем пилот на одном маршруте',
      solution: SOL.service,
    },
    {
      anchor: 'reception', level: 'Лобби', title: 'Ресепшн и навигация',
      text: 'Сервисный или гуманоидный робот встречает гостей арендаторов, показывает дорогу к лифтам и отвечает на типовые вопросы.',
      items: ['встреча гостей', 'навигация по зданию', 'типовые вопросы'],
      fact: 'Роботы-секретари уже работают в московских компаниях',
      solution: SOL.humanoid,
    },
  ],
  vendors: [
    { group: 'Уборка холлов и паркингов', brands: ['gausium', 'pudu', 'lionsbot'] },
    // TODO(client): подтвердить формат поставки X-Human (поставщик заказчика) и нужен ли логотип.
    { group: 'Мойка фасадов', brands: ['x-human'] },
    { group: 'Доставка и ресепшн', brands: ['keenon', 'pudu', 'orionstar', 'ubtech'] },
  ],
  vendorsLead: 'Подбираем технику под уровень здания и тип покрытия, без привязки к одному вендору.',
  why: { title: 'Один подрядчик на всё здание.', text: 'Подбираем технику для каждого уровня, от паркинга до фасада, внедряем её и обслуживаем по SLA. Роботов можно взять в аренду и не замораживать капитал в оборудовании.', link: { label: 'Аренда роботов (RaaS)', href: 'products.html#raas' } },
  formStage: true,
  form: { title: 'Проверим ваше здание под роботов.', lead: 'Пройдём маршрут от паркинга до кровли, проверим лифты, двери, воду и Wi-Fi и скажем, с какой зоны начать.', button: 'Заказать аудит' },
  links: [
    { kicker: 'УСЛУГА', title: 'Аудит объекта', text: 'Проверка здания под роботов и расчёт по зонам.', href: '/services/audit/' },
    { kicker: 'УСЛУГА', title: 'Пилотный проект', text: 'Одна зона, понятный результат.', href: '/services/pilot/' },
    { kicker: 'РЕШЕНИЕ', title: 'Роботизированный клининг', text: 'Поломоечные и пылесосные роботы для общих зон.', href: SOL.cleaning.href },
    { kicker: 'РЕШЕНИЕ', title: 'Сервисные роботы', text: 'Доставка по этажам и встреча гостей.', href: SOL.service.href },
    { kicker: 'ПРОДУКТ', title: 'Cleaning Operations Platform', text: 'Задания, контроль и отчёты по уборке в одном окне.', href: 'products.html#platform' },
    { kicker: 'КЕЙСЫ', title: 'Кейсы: бизнес-центры', text: 'Внедрения в офисных зданиях.', href: '/cases/?industry=business-centers' },
    { kicker: 'ОТРАСЛИ', title: 'Все отрасли', text: 'Все 11 отраслевых страниц.', href: '/industries/' },
  ],
  sections: ['hero', 'problems', 'directions', 'ready', 'case', 'economy', 'vendors', 'why', 'form', 'see'],
};

const brands = {
  'x-human': { name: 'X-Human Lingkong' },
};

const icons = [
  '<symbol id="i-bc-lift" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M8 10l-1.5 2h3zM16 14l-1.5-2h3z"/></symbol>',
  '<symbol id="i-bc-door" viewBox="0 0 24 24"><path d="M5 21V4a1 1 0 0 1 1-1h9v18M3 21h18M15 6l4 1.5V21"/><path d="M12 12h.01"/></symbol>',
  '<symbol id="i-bc-plug" viewBox="0 0 24 24"><path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/></symbol>',
  '<symbol id="i-bc-wifi" viewBox="0 0 24 24"><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0"/><path d="M12 19.5h.01"/></symbol>',
];

// ───────── renderers ─────────

const hero = (ind, n, h) => {
  const p = ind.photo;
  const lv = LEVELS.map((l, i) => {
    const row = `<a class="bcx__row" href="#${l.anchor}">
                <span class="bcx__mark mono tnum"${h.T(l, 'mark')}>${h.esc(l.mark)}</span>
                <span class="bcx__name"${h.T(l, 'name')}>${h.esc(l.name)}</span>
                <span class="bcx__task"><bdi${h.T(l, 'task')}>${h.esc(l.task)}</bdi> <span class="bcx__go">${h.ARROW_R}</span></span>
              </a>`;
    const real = heroPhoto(ind.slug);
    const ph = l.key !== 'lifts' ? '' : real ? `
              <figure class="bcx__ph bcx__ph--photo">
                <img src="${real}" alt="${h.esc(p.alt)}"${h.TA(['alt', h.dk(p, 'alt')])} width="1536" height="1024" decoding="async">
              </figure>` : `
              <!-- Место под фото Hero (16:9): ${h.esc(p.note)}, docs/specs/ПРОМПТЫ_HERO_ОТРАСЛИ.md. alt будущего фото: «${h.esc(p.alt)}» -->
              <figure class="bcx__ph">
                <img src="assets/robots/${p.robot}" alt="" width="${p.w}" height="${p.h}">
                <figcaption class="mono"${mPh.attr}>${mPh.text}</figcaption>
              </figure>`;
    const mPh = h.msg('industries.common.photo.placeholder', { ratio: '16:9' });
    const k3 = l.key === 'floors' ? '<i class="bcx__k3" aria-hidden="true"></i>' : '';
    return `<li class="bcx__lv bcx__lv--${l.key}" style="--i:${i}">
              ${row}${ph}${k3}
            </li>`;
  }).join('\n            ');
  return `<section class="ih ih--cut wrap" data-sec="${n}"${h.dnName(ind)}>
      <div class="ih__grid">
        <div class="ih__copy">
          ${h.heroCopy(ind, n)}
        </div>
        <nav class="bcx reveal" style="--i:2"${h.TA(['aria-label', h.pk('hero.sectionLabel')])} aria-label="Разрез бизнес-центра: что делают роботы на каждом уровне">
          <span class="bcx__cap mono" aria-hidden="true"${h.L('hero.sectionCaption')}>Разрез здания · схема условная</span>
          <span class="bcx__shaft" aria-hidden="true"><i class="bcx__car"></i></span>
          <ol class="bcx__lvs">
            ${lv}
          </ol>
        </nav>
      </div>
    </section>`;
};

const problems = (ind, n, h) => `<section class="sol-sec wrap" id="problems" data-sec="${n}"${h.dn(ind, 'problems')} aria-labelledby="problems-h">
      ${h.secHead(n, h.secName(ind, 'problems'), h.head(ind, 'problems'), null, 'problems-h')}
      <ol class="bcp">
        ${ind.problems.map((p, i) => `<li class="bcp__i reveal" style="--i:${i + 1}">
          <span class="bcp__lv mono"><i aria-hidden="true"></i><bdi${h.T(p, 'level')}>${h.esc(p.level)}</bdi></span>
          <h3${h.T(p, 'title')}>${h.esc(p.title)}</h3>
          <p${h.T(p, 'text')}>${h.esc(p.text)}</p>
          ${p.srcText ? `<p class="bc-src"><span${h.T(p, 'srcText')}>${h.esc(p.srcText)}</span></p>` : ''}
        </li>`).join('\n        ')}
      </ol>
    </section>`;

const directions = (ind, n, h) => `<section class="sol-sec wrap" id="directions" data-sec="${n}"${h.dn(ind, 'directions')} aria-labelledby="directions-h">
      ${h.secHead(n, h.secName(ind, 'directions'), h.head(ind, 'directions'), h.lt('directions.lead', 'Четыре направления — четыре уровня здания. Начать можно с любого, чаще всего начинают с уборки общих зон.'), 'directions-h')}
      <div class="bcd">
        ${ind.directions.map((d, i) => `<article class="bcd__i reveal" id="${d.anchor}" style="--i:${i}">
          <div class="bcd__head">
            <span class="bcd__no mono tnum">${h.pad(i + 1)}</span>
            <span class="bcd__lv mono"${h.T(d, 'level')}>${h.esc(d.level)}</span>
          </div>
          <h3${h.T(d, 'title')}>${h.esc(d.title)}</h3>
          <p${h.T(d, 'text')}>${h.esc(d.text)}</p>
          <p class="drow__items">${h.itemsList(d.items)}</p>
          <p class="bcd__fact"><span${h.T(d, 'fact')}>${h.esc(d.fact)}</span></p>
          ${h.solLink(d.solution, !d.solution.href.startsWith('roi'))}
        </article>`).join('\n        ')}
      </div>
    </section>`;

const ready = (ind, n, h) => `<section class="sol-sec wrap" id="ready" data-sec="${n}"${h.dn(ind, 'ready')} aria-labelledby="ready-h">
      <div class="bcr">
        <div class="bcr__copy">
          ${h.idx(n, h.secName(ind, 'ready'))}
          <h2 class="h2 reveal" id="ready-h"${h.L('ready.title')}>Здание, готовое к роботам.</h2>
          <p class="lead reveal"${h.L('ready.lead')}>Девелопер MR ввёл стандарт автоматизированного клининга: здание с самого начала готовят к тому, что по нему ездят роботы. Отметьте, что из этого уже есть у вас.</p>
          <p class="bc-src reveal"${h.L('ready.sourceNote')}>Что будет, если пункта нет, — наша практика.</p>
        </div>
        <form class="bcr__list reveal" data-ready${h.TA(['aria-label', h.pk('ready.listLabel')])} aria-label="Чек-лист готовности здания к роботам" onsubmit="return false">
          ${READY.map((r, i) => `<label class="bcr__i" for="ready-${r.id}">
            <input type="checkbox" id="ready-${r.id}" name="ready" value="${r.id}">
            <span class="bcr__box" aria-hidden="true">${h.icon('check')}</span>
            <span class="bcr__ic" aria-hidden="true">${h.icon(r.icon)}</span>
            <span class="bcr__t"><b>${h.pad(i + 1)} · <bdi${h.T(r, 'title')}>${h.esc(r.title)}</bdi></b><span class="bcr__why"${h.T(r, 'why')}>${h.esc(r.why)}</span><span class="bcr__no"><span class="mono"${h.L('ready.ifNot')}>Если нет</span> <bdi${h.T(r, 'no')}>${h.esc(r.no)}</bdi></span></span>
          </label>`).join('\n          ')}
        </form>
        <div class="bcr__stamp reveal" aria-live="polite">
          <div class="bcr__cell bcr__cell--score">
            <span class="mono"${h.L('ready.score')}>Готовность</span>
            <b class="tnum"><span data-ready-n>0</span> / ${READY.length}</b>
            <span class="bcr__bar" aria-hidden="true">${READY.map(() => '<i></i>').join('')}</span>
          </div>
          <div class="bcr__cell bcr__cell--verdict">
            <span class="mono"${h.L('ready.verdict')}>Вывод</span>
            <p data-ready-verdict${h.L('ready.verdictIntro')}>Отметьте пункты в списке — покажем, с чего начать. Робот может работать и в неподготовленном здании, но в меньшем числе зон.</p>
          </div>
          <div class="bcr__cell bcr__cell--next">
            <span class="mono"${h.L('ready.next')}>Следующий шаг</span>
            <a class="btn btn-pri" href="#talk"${h.L('ready.orderAudit')}>Заказать аудит объекта</a>
            <a class="text-link" href="/services/audit/"><span${h.L('ready.auditScope')}>Что входит в аудит</span> ${h.ARROW_R}</a>
          </div>
        </div>
      </div>
    </section>`;

const cases = (ind, n, h) => `<section class="sol-sec wrap" id="case" data-sec="${n}"${h.dn(ind, 'case')} aria-labelledby="case-h">
      ${h.secHead(n, h.secName(ind, 'case'), h.lt('case.title', 'Роботы уже убирают бизнес-центры днём.'), h.lt('case.lead', 'Цифры по этим объектам публикуют сами девелоперы, независимых замеров пока нет.'), 'case-h')}
      <div class="bcc">
        <article class="bcc__main reveal">
          <div class="bcc__top">
            <span class="mono case-kicker"${h.L('case.mr.kicker')}>Девелопер MR · iCITY, «Симфония 34»</span>
            <h3${h.L('case.mr.title')}>Роботы убирают башни в Москва-Сити.</h3>
            <p${h.L('case.mr.text')}>Роботы Pudu убирают лобби и общие зоны башен iCITY, отдельные машины — паркинги. Цена роботов — 2–4 млн ₽. Ещё MR выпустил стандарт автоматизированного клининга для своих зданий.</p>
          </div>
          <div class="bcc__big"><b class="tnum"${h.L('case.mr.value')}>до 40%</b><span${h.L('case.mr.claim')}>снижение расходов на клининг — заявление девелопера</span></div>
        </article>
        <aside class="bcc__note reveal" style="--i:1"${h.TA(['aria-label', h.pk('case.risks.label')])} aria-label="Что важно знать заранее">
          <span class="mono case-kicker"${h.L('case.risks.kicker')}>Технопарк «Сколково» · честно о рисках</span>
          <p${h.L('case.risks.text')}>Робот Pudu CC1 останавливается, когда рядом люди, посетители нажимают аварийную кнопку, и без оператора не обойтись. Операционный директор MD Facility Management: «говорить, что роботы скоро заменят людей, преждевременно». Поэтому мы закладываем оператора и маршрут с учётом потока людей.</p>
        </aside>
      </div>
    </section>`;

const economy = (ind, n, h) => {
  const t0 = 'office', T = h.ROI.TYPES[t0], m0 = T.mode0, r = h.ROI.calc({ type: t0, area: T.area0, mode: m0 });
  const modes = h.calcModes(m0);
  return `<section class="sol-sec wrap" id="economy" data-sec="${n}"${h.dn(ind, 'economy')} aria-labelledby="economy-h">
      <div class="econ bce">
        <div class="econ__copy">
          ${h.idx(n, h.secName(ind, 'economy'))}
          <h2 class="h2 reveal" id="economy-h"${h.L('economy.title')}>Сколько даёт робот в общих зонах.</h2>
          <p class="lead reveal"${h.L('economy.lead')}>Ориентир для офисного здания по нашей ROI-модели: площадь общих зон и режим уборки. Фасад считаем отдельно, у него своя экономика.</p>
          <a class="text-link reveal" href="roi.html?k=facade"><span${h.L('economy.facadeLink')}>Калькулятор мойки фасадов</span> ${h.ARROW_R}</a>
        </div>
        <form class="calc reveal" data-calc${h.TA(['aria-label', h.pk('economy.formLabel')])} aria-label="Быстрый расчёт окупаемости уборки бизнес-центра">
          <input type="radio" name="calc-type" value="${t0}" checked hidden>
          <p class="bce__flag mono"><bdi${h.C('estimate.flag')}>Расчётный ориентир</bdi> · <bdi${h.K('calc.types.office')}>${h.esc(T.name)}</bdi></p>
          <div class="calc__f">
            <label for="calc-area"${h.L('economy.area')}>Площадь общих зон</label>
            <div class="calc__range"><input id="calc-area" type="range" min="${T.area[0]}" max="${T.area[1]}" step="500" value="${T.area0}" aria-valuetext="${T.area0.toLocaleString('ru-RU')} м²"><output for="calc-area" class="tnum" data-out="area">${T.area0.toLocaleString('ru-RU')} м²</output></div>
          </div>
          <fieldset class="calc__f"><legend${h.C('calc.mode')}>Режим уборки</legend><div class="seg">${modes}</div></fieldset>
          <dl class="calc__res" aria-live="polite">
            <div><dt${h.C('calc.payback')}>Окупаемость</dt><dd class="tnum" data-out="payback">${h.fmtMonths(r.payback)}</dd></div>
            <div><dt${h.C('calc.savings')}>Экономия в год</dt><dd class="tnum" data-out="net">${h.fmtMln(r.net)}</dd></div>
          </dl>
          <p class="calc__note"${h.L('economy.note')}>Расчётный ориентир по нашей модели, не результат реального объекта. Точный расчёт — после аудита.</p>
          <a class="btn btn-pri" data-out="link" href="roi.html?t=${t0}&amp;a=${T.area0}&amp;m=${m0}"><span${h.C('calc.fullRoi')}>Полный расчёт ROI</span> ${h.ARROW_R}</a>
        </form>
      </div>
    </section>`;
};

export default { industry, brands, icons, renderers: { hero, problems, directions, ready, case: cases, economy }, data: { levels: LEVELS, ready: READY } };
