// Industry landing «Бизнес-центры и офисы» → industries-business-centers.html.
// Facts: docs/research/2026-10-06-empty-industries-research.md (sections 1–3, 9, 10) and, for the facade robot,
// docs/research/2026-10-02-facade-robot-calculator-data.md. Every figure on the page carries its source next to it.
// Own blocks: hero «building section» (levels link to directions) and «ready» — a building readiness checklist
// after the MR developer standard (industry-business-centers.js counts the ticks).
//
// TODO(client): кейс с главной «Бизнес-центр — снижение затрат на клининг на 32%» здесь не используем, пока нет
//   объекта, периода и разрешения на публикацию (исследование, раздел 10, вопрос 2).
// TODO(client): своих кейсов в БЦ (доставка, ресепшн, патрулирование) нет — нужны объекты и цифры, если есть.
// TODO(client): Prime Park (5 роботов ROBO RUBY-S, «−80% ручного труда», robo.ooo) не показываем: это заявление
//   вендора, и не подтверждено, что работаем с ROBO.
import { existsSync } from 'node:fs';

// Real hero photo from assets/industry_hero/<slug>.webp, if it has been added; otherwise the robot placeholder.
const heroPhoto = (slug) => (existsSync(new URL(`../../../assets/industry_hero/${slug}.webp`, import.meta.url))
  ? `assets/industry_hero/${slug}.webp` : null);

const SOL = {
  cleaning: { label: 'Роботизированный клининг', href: '/solutions/cleaning/' },
  service: { label: 'Сервисные роботы', href: '/solutions/service-robots/' },
  humanoid: { label: 'Гуманоидные роботы', href: '/solutions/humanoid/' },
};

const SRC = {
  malachite: { label: 'кейс интегратора «Ритейл Сервис»', href: 'https://robot.rssib.ru/tpost/csi4mz0pz1-reshenie-dlya-biznes-tsentra-robot-ubors' },
  mr: { label: 'ComNews, 03.07.2026', href: 'https://www.comnews.ru/digital-economy/content/246190/2026-07-03/2026-w27/1012/developer-mr-vyvel-rabotu-robotov-uborschikov' },
  skolkovo: { label: 'ComNews, 04.06.2024', href: 'https://www.comnews.ru/content/233521/2024-06-04/2024-w23/1010/tekhnopark-skolkovo-ubirayut-roboty' },
  kommersant25: { label: 'Коммерсантъ, 2025', href: 'https://www.kommersant.ru/doc/7755385' },
  kommersant26: { label: 'Коммерсантъ, 18.06.2026', href: 'https://www.kommersant.ru/doc/8740708' },
  mos: { label: 'mos.ru, 13.04.2024', href: 'https://www.mos.ru/en/news/item/137249073/' },
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
// «Зачем» and «если нет» are our reasoning, except the mobile tank — that is the «Малахитовая шкатулка» case.
const READY = [
  { id: 'lifts', icon: 'bc-lift', title: 'Интеграция с лифтами', why: 'Робот сам вызывает лифт и переезжает между этажами и на паркинг.', no: 'Робот работает на одном этаже, между этажами его переставляют люди.' },
  { id: 'doors', icon: 'bc-door', title: 'Автодоводчики дверей', why: 'Двери на маршруте открываются и закрываются без сотрудника рядом.', no: 'Маршрут строим по зонам без дверей или открываем двери по графику уборки.' },
  { id: 'dock', icon: 'bc-plug', title: 'Зоны зарядки', why: 'Место под док-станцию с розеткой, в стороне от потока людей.', no: 'Ищем место на аудите: от него зависит длина маршрута и время на зарядку.' },
  { id: 'water', icon: 'drop', title: 'Точки воды', why: 'Набор и слив воды для поломоечного робота рядом с маршрутом.', no: 'Ставим робота с мобильным баком — так сделали в «Малахитовой шкатулке», где точек слива нет.' },
  { id: 'wifi', icon: 'bc-wifi', title: 'Стабильный Wi-Fi', why: 'Задания, карта и отчёты доходят без обрывов, в том числе в лифтах и на паркинге.', no: 'Меряем покрытие на маршруте и добавляем точки доступа там, где связь пропадает.' },
];

const srcLink = (h, s, pre = '') => `<a class="bc-src__a" href="${s.href}" target="_blank" rel="noopener">${pre}${h.esc(s.label)}</a>`;

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
    { level: 'Лифтовые холлы и лобби', title: 'Убирать приходится при арендаторах.', text: 'Общие зоны работают весь день. Уборка идёт в рабочее время и не должна мешать людям: тихо, без луж и перегороженных проходов.', src: [SRC.malachite], srcText: 'Задача в кейсе БЦ «Малахитовая шкатулка» — «уборка в рабочее время, после обеда, до 18:00»' },
    { level: 'Всё здание', title: 'Клининг держится на дефицитных людях.', text: 'Больше 80% персонала клининга — иностранцы, ФОТ клининговых компаний за пять лет вырос в два-три раза, а спрос на исполнителей в клининге за год прибавил 31%.', src: [SRC.kommersant25, SRC.kommersant26], srcText: 'CORE.XP и DAKO Professional; Авито Работа, 1-е полугодие 2026' },
    { level: 'Инженерия', title: 'Старое здание не готово к роботу.', text: 'Нет точек набора и слива воды для док-станций, лифты не умеют принимать вызов от робота, двери открывают вручную.', src: [SRC.malachite], srcText: 'Про воду — из того же кейса «Малахитовой шкатулки»' },
    { level: 'Фасад', title: 'Фасад моют на высоте.', text: 'Мойка остекления — работа на высоте: допуски, наряд-допуск, и при ветре от 15 м/с на открытых местах работы не ведут. Каждая мойка — подрядчик с альпинистами.', src: [], srcText: 'Правила по охране труда при работе на высоте, приказ Минтруда № 782н' },
  ],
  directions: [
    {
      anchor: 'indoor-cleaning', level: 'Лифтовые холлы · коридоры · паркинг', title: 'Уборка холлов, коридоров и паркингов',
      text: 'Поломоечные и пылесосные роботы моют лобби, лифтовые холлы и коридоры днём, при людях, и ночью. На паркинге работают крупные машины без водителя.',
      items: ['лобби и лифтовые холлы', 'коридоры офисных этажей', 'подземные паркинги', 'уборка днём и ночью'],
      fact: 'Девелопер MR: роботы Viggo на паркингах — до 1 800 м²/ч', src: SRC.mr,
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
      fact: 'Роботы For-1 «работают секретарями в московских компаниях»', src: SRC.mos,
      solution: SOL.humanoid,
    },
  ],
  vendors: [
    { group: 'Уборка холлов и паркингов', brands: ['gausium', 'pudu', 'lionsbot'] },
    // TODO(client): подтвердить, что работаем с ROBO, R2B, YaCu и Waybot.
    { group: 'Уборка: российские производители', brands: ['robo', 'r2b', 'yacu', 'waybot'] },
    // TODO(client): подтвердить формат поставки X-Human (поставщик заказчика) и нужен ли логотип.
    { group: 'Мойка фасадов', brands: ['x-human'] },
    { group: 'Доставка и ресепшн', brands: ['keenon', 'pudu', 'orionstar', 'ubtech'] },
  ],
  vendorsLead: 'Подбираем технику под уровень здания и тип покрытия, без привязки к одному вендору.',
  why: { title: 'Один подрядчик на всё здание.', text: 'Подбираем технику для каждого уровня, от паркинга до фасада, внедряем её и обслуживаем по SLA. Роботов можно взять в аренду и не замораживать капитал в оборудовании.', link: { label: 'Аренда роботов (RaaS)', href: '/products/raas/' } },
  formStage: true,
  form: { title: 'Проверим ваше здание под роботов.', lead: 'Пройдём маршрут от паркинга до кровли, проверим лифты, двери, воду и Wi-Fi и скажем, с какой зоны начать.', button: 'Заказать аудит' },
  links: [
    { kicker: 'УСЛУГА', title: 'Аудит объекта', text: 'Проверка здания под роботов и расчёт по зонам.', href: '/services/audit/' },
    { kicker: 'УСЛУГА', title: 'Пилотный проект', text: 'Одна зона, понятный результат.', href: '/services/pilot/' },
    { kicker: 'РЕШЕНИЕ', title: 'Роботизированный клининг', text: 'Поломоечные и пылесосные роботы для общих зон.', href: SOL.cleaning.href },
    { kicker: 'РЕШЕНИЕ', title: 'Сервисные роботы', text: 'Доставка по этажам и встреча гостей.', href: SOL.service.href },
    { kicker: 'ПРОДУКТ', title: 'Cleaning Operations Platform', text: 'Задания, контроль и отчёты по уборке в одном окне.', href: '/products/cleaning-operations/' },
    { kicker: 'КЕЙСЫ', title: 'Кейсы: бизнес-центры', text: 'Внедрения в офисных зданиях.', href: '/cases/?industry=business-centers' },
    { kicker: 'ОТРАСЛИ', title: 'Все отрасли', text: 'Все 11 отраслевых страниц.', href: '/industries/' },
  ],
  sections: ['hero', 'problems', 'directions', 'ready', 'case', 'economy', 'vendors', 'why', 'form', 'see'],
};

// TODO(client): подтвердить, что работаем с российскими производителями ROBO, R2B, YaCu, Waybot.
const brands = {
  robo: { name: 'ROBO' },
  r2b: { name: 'R2B' },
  yacu: { name: 'YaCu' },
  waybot: { name: 'Waybot' },
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
                <span class="bcx__mark mono tnum">${h.esc(l.mark)}</span>
                <span class="bcx__name">${h.esc(l.name)}</span>
                <span class="bcx__task">${h.esc(l.task)} <span class="bcx__go">${h.ARROW_R}</span></span>
              </a>`;
    const real = heroPhoto(ind.slug);
    const ph = l.key !== 'lifts' ? '' : real ? `
              <figure class="bcx__ph bcx__ph--photo">
                <img src="${real}" alt="${h.esc(p.alt)}" width="1536" height="1024" decoding="async">
              </figure>` : `
              <!-- Место под фото Hero (16:9): ${h.esc(p.note)}, docs/specs/ПРОМПТЫ_HERO_ОТРАСЛИ.md. alt будущего фото: «${h.esc(p.alt)}» -->
              <figure class="bcx__ph">
                <img src="assets/robots/${p.robot}" alt="" width="${p.w}" height="${p.h}">
                <figcaption class="mono">Место под фото · 16:9</figcaption>
              </figure>`;
    const k3 = l.key === 'floors' ? '<i class="bcx__k3" aria-hidden="true"></i>' : '';
    return `<li class="bcx__lv bcx__lv--${l.key}" style="--i:${i}">
              ${row}${ph}${k3}
            </li>`;
  }).join('\n            ');
  return `<section class="ih ih--cut wrap" data-sec="${n}" data-name="${ind.name.toUpperCase()}">
      <div class="ih__grid">
        <div class="ih__copy">
          ${h.heroCopy(ind, n)}
        </div>
        <nav class="bcx reveal" style="--i:2" aria-label="Разрез бизнес-центра: что делают роботы на каждом уровне">
          <span class="bcx__cap mono" aria-hidden="true">Разрез здания · схема условная</span>
          <span class="bcx__shaft" aria-hidden="true"><i class="bcx__car"></i></span>
          <ol class="bcx__lvs">
            ${lv}
          </ol>
        </nav>
      </div>
    </section>`;
};

const problems = (ind, n, h) => `<section class="sol-sec wrap" id="problems" data-sec="${n}" data-name="${h.SEC_NAMES.problems}" aria-labelledby="problems-h">
      ${h.secHead(n, h.SEC_NAMES.problems, h.head(ind, 'problems'), null, 'problems-h')}
      <ol class="bcp">
        ${ind.problems.map((p, i) => `<li class="bcp__i reveal" style="--i:${i + 1}">
          <span class="bcp__lv mono"><i aria-hidden="true"></i>${h.esc(p.level)}</span>
          <h3>${h.esc(p.title)}</h3>
          <p>${h.esc(p.text)}</p>
          <p class="bc-src">${h.esc(p.srcText)}${p.src.length ? ` · ${p.src.map((s) => srcLink(h, s)).join(', ')}` : ''}</p>
        </li>`).join('\n        ')}
      </ol>
    </section>`;

const directions = (ind, n, h) => `<section class="sol-sec wrap" id="directions" data-sec="${n}" data-name="${h.SEC_NAMES.directions}" aria-labelledby="directions-h">
      ${h.secHead(n, h.SEC_NAMES.directions, h.head(ind, 'directions'), 'Четыре направления — четыре уровня здания. Начать можно с любого, чаще всего начинают с уборки общих зон.', 'directions-h')}
      <div class="bcd">
        ${ind.directions.map((d, i) => `<article class="bcd__i reveal" id="${d.anchor}" style="--i:${i}">
          <div class="bcd__head">
            <span class="bcd__no mono tnum">${h.pad(i + 1)}</span>
            <span class="bcd__lv mono">${h.esc(d.level)}</span>
          </div>
          <h3>${h.esc(d.title)}</h3>
          <p>${h.esc(d.text)}</p>
          <p class="drow__items">${d.items.map(h.esc).join(' · ')}</p>
          <p class="bcd__fact">${h.esc(d.fact)}${d.src ? ` · ${srcLink(h, d.src)}` : ''}</p>
          <a class="drow__sol" href="${d.solution.href}">${d.solution.href.startsWith('roi') ? '' : 'Решение: '}${h.esc(d.solution.label)} ${h.ARROW_UR}</a>
        </article>`).join('\n        ')}
      </div>
    </section>`;

const ready = (ind, n, h) => `<section class="sol-sec wrap" id="ready" data-sec="${n}" data-name="${ind.secNames.ready}" aria-labelledby="ready-h">
      <div class="bcr">
        <div class="bcr__copy">
          ${h.idx(n, ind.secNames.ready)}
          <h2 class="h2 reveal" id="ready-h">Здание, готовое к роботам.</h2>
          <p class="lead reveal">Девелопер MR ввёл стандарт автоматизированного клининга: здание с самого начала готовят к тому, что по нему ездят роботы. Отметьте, что из этого уже есть у вас.</p>
          <p class="bc-src reveal">Пункты стандарта — ${srcLink(h, SRC.mr, '')}. Что будет, если пункта нет, — наша практика.</p>
        </div>
        <form class="bcr__list reveal" data-ready aria-label="Чек-лист готовности здания к роботам" onsubmit="return false">
          ${READY.map((r, i) => `<label class="bcr__i" for="ready-${r.id}">
            <input type="checkbox" id="ready-${r.id}" name="ready" value="${r.id}">
            <span class="bcr__box" aria-hidden="true">${h.icon('check')}</span>
            <span class="bcr__ic" aria-hidden="true">${h.icon(r.icon)}</span>
            <span class="bcr__t"><b>${h.pad(i + 1)} · ${h.esc(r.title)}</b><span class="bcr__why">${h.esc(r.why)}</span><span class="bcr__no"><span class="mono">Если нет</span> ${h.esc(r.no)}</span></span>
          </label>`).join('\n          ')}
        </form>
        <div class="bcr__stamp reveal" aria-live="polite">
          <div class="bcr__cell bcr__cell--score">
            <span class="mono">Готовность</span>
            <b class="tnum"><span data-ready-n>0</span> / ${READY.length}</b>
            <span class="bcr__bar" aria-hidden="true">${READY.map(() => '<i></i>').join('')}</span>
          </div>
          <div class="bcr__cell bcr__cell--verdict">
            <span class="mono">Вывод</span>
            <p data-ready-verdict>Отметьте пункты в списке — покажем, с чего начать. Робот может работать и в неподготовленном здании, но в меньшем числе зон.</p>
          </div>
          <div class="bcr__cell bcr__cell--next">
            <span class="mono">Следующий шаг</span>
            <a class="btn btn-pri" href="#talk">Заказать аудит объекта</a>
            <a class="text-link" href="/services/audit/">Что входит в аудит ${h.ARROW_R}</a>
          </div>
        </div>
      </div>
    </section>`;

const cases = (ind, n, h) => `<section class="sol-sec wrap" id="case" data-sec="${n}" data-name="${ind.secNames.case}" aria-labelledby="case-h">
      ${h.secHead(n, ind.secNames.case, 'Роботы уже убирают бизнес-центры днём.', 'Цифры по этим объектам публикуют интеграторы и девелоперы, независимых замеров пока нет. Подписываем источник у каждой цифры.', 'case-h')}
      <div class="bcc">
        <article class="bcc__main reveal">
          <div class="bcc__top">
            <span class="mono case-kicker">БЦ класса А · Москва</span>
            <h3>«Малахитовая шкатулка»: уборка в рабочее время.</h3>
            <p>Gausium Phantas S1 Pro с мобильным баком: в здании нет точек набора и слива воды для док-станции.</p>
          </div>
          <dl class="bcc__nums">
            <div class="bcc__win"><dt>окно уборки, при арендаторах</dt><dd class="tnum">14:00–18:00</dd></div>
            <div><dt>производительность</dt><dd class="tnum">308 <small>м²/ч</small></dd></div>
            <div><dt>за 1 ч 18 мин</dt><dd class="tnum">399 <small>м²</small></dd></div>
            <div><dt>воды за смену</dt><dd class="tnum">6 <small>л</small></dd></div>
          </dl>
          <p class="bc-src">По данным интегратора · ${srcLink(h, SRC.malachite)}</p>
        </article>
        <article class="bcc__side reveal" style="--i:1">
          <span class="mono case-kicker">Девелопер MR · iCITY, «Симфония 34»</span>
          <div class="bcc__big"><b class="tnum">до 40%</b><span>снижение расходов на клининг — заявление девелопера</span></div>
          <p>Роботы Pudu убирают лобби и общие зоны башен iCITY в Москва-Сити, Viggo — паркинги. Цена роботов — 2–4 млн ₽. Ещё MR выпустил стандарт автоматизированного клининга для своих зданий.</p>
          <p class="bc-src">${srcLink(h, SRC.mr)}</p>
        </article>
        <aside class="bcc__note reveal" style="--i:2" aria-label="Что важно знать заранее">
          <span class="mono case-kicker">Технопарк «Сколково» · честно о рисках</span>
          <p>Робот Pudu CC1 останавливается, когда рядом люди, посетители нажимают аварийную кнопку, и без оператора не обойтись. Операционный директор MD Facility Management: «говорить, что роботы скоро заменят людей, преждевременно». Поэтому мы закладываем оператора и маршрут с учётом потока людей.</p>
          <p class="bc-src">${srcLink(h, SRC.skolkovo)}</p>
        </aside>
      </div>
    </section>`;

const economy = (ind, n, h) => {
  const t0 = 'office', T = h.ROI.TYPES[t0], m0 = T.mode0, r = h.ROI.calc({ type: t0, area: T.area0, mode: m0 });
  const modes = Object.entries(h.ROI.MODES).map(([k, m]) => `<label class="seg__o"><input type="radio" name="calc-mode" value="${k}"${k === m0 ? ' checked' : ''}><span>${h.esc(m.name)}</span></label>`).join('');
  return `<section class="sol-sec wrap" id="economy" data-sec="${n}" data-name="${h.SEC_NAMES.economy}" aria-labelledby="economy-h">
      <div class="econ bce">
        <div class="econ__copy">
          ${h.idx(n, h.SEC_NAMES.economy)}
          <h2 class="h2 reveal" id="economy-h">Сколько даёт робот в общих зонах.</h2>
          <p class="lead reveal">Ориентир для офисного здания по нашей ROI-модели: площадь общих зон и режим уборки. Фасад считаем отдельно, у него своя экономика.</p>
          <a class="text-link reveal" href="roi.html?k=facade">Калькулятор мойки фасадов ${h.ARROW_R}</a>
        </div>
        <form class="calc reveal" data-calc aria-label="Быстрый расчёт окупаемости уборки бизнес-центра">
          <input type="radio" name="calc-type" value="${t0}" checked hidden>
          <p class="bce__flag mono">Расчётный ориентир · ${h.esc(T.name)}</p>
          <div class="calc__f">
            <label for="calc-area">Площадь общих зон</label>
            <div class="calc__range"><input id="calc-area" type="range" min="${T.area[0]}" max="${T.area[1]}" step="500" value="${T.area0}" aria-valuetext="${T.area0.toLocaleString('ru-RU')} м²"><output for="calc-area" class="tnum" data-out="area">${T.area0.toLocaleString('ru-RU')} м²</output></div>
          </div>
          <fieldset class="calc__f"><legend>Режим уборки</legend><div class="seg">${modes}</div></fieldset>
          <dl class="calc__res" aria-live="polite">
            <div><dt>Окупаемость</dt><dd class="tnum" data-out="payback">${h.fmtMonths(r.payback)}</dd></div>
            <div><dt>Экономия в год</dt><dd class="tnum" data-out="net">${h.fmtMln(r.net)}</dd></div>
          </dl>
          <p class="calc__note">Расчётный ориентир по нашей модели, не результат реального объекта. Точный расчёт — после аудита.</p>
          <a class="btn btn-pri" data-out="link" href="roi.html?t=${t0}&amp;a=${T.area0}&amp;m=${m0}">Полный расчёт ROI ${h.ARROW_R}</a>
        </form>
      </div>
    </section>`;
};

export default { industry, brands, icons, renderers: { hero, problems, directions, ready, case: cases, economy } };
