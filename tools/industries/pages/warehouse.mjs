// Industry landing: warehouses and logistics (/industries/warehouse/).
// Facts: docs/research/2026-10-07-warehouse-industry-research.md. Every figure is signed with its source next to it.
// There is no own warehouse case of the company on the site (the «+35%» card on the home page is a placeholder), so the
// proof block shows public deployments of other Russian companies and says so. The ROI calculator is not used.
// Own blocks: hero «floor» (a live plan of the warehouse with robots running along the aisles), «figures» instead of problem
// cards, signature «flow» (five stages of an order × robot × people) and dark «proof» (before/after bars of named companies).
//
// TODO(client): подтвердить бренды (Hikrobot, Quicktron, ForwardX, AgileX) для складских задач и узнать, работаем ли с российскими производителями складских роботов («Яндекс Роботикс», Ronavi, Automacon): для закупок с требованием отечественного оборудования это сильный аргумент.
// TODO(client): подтвердить, что берём палетайзеры и роборуки-депалетайзеры (направление #palletizing); производителей для них у нас в списке нет.
// TODO(legal): требования к безопасности AMR рядом с людьми описаны по международному стандарту ISO 3691-4; российский эквивалент и сертификацию уточнить.
// TODO(client): собственный склад-кейс вместо чужих внедрений, как только появится объект с согласованными цифрами.

const SRC = {
  comnews: { label: 'исследование «Технологии Доверия», ComNews, 29.08.2025' },
  ibc: { label: 'IBC Real Estate и ОЭЗ «Максимиха», Retail.ru, 14.09.2026' },
  press: { label: 'пресс-релиз, Retail.ru, 23.06.2026' },
  sber: { label: 'Sber PRO, 16.12.2024' },
  yandex: { label: 'опрос «Яндекс Роботикс» и «Промышленная робототехника», Retail.ru, 15.07.2025' },
  iso: { label: 'по описанию стандарта ISO 3691-4' },
};

const SOL = {
  warehouse: { label: 'Складская роботизация', href: 'solutions-warehouse.html' },
  industrial: { label: 'Промышленная роботизация', href: 'solutions.html#dir-industrial' },
};

const industry = {
  slug: 'warehouse',
  name: 'Склады и логистика',
  tier: 3,
  title: 'Роботы для складов и логистики: AMR, паллеты, комплектация | Профессиональная Робототехника',
  description: 'Складская роботизация без остановки склада: паллетные роботы-погрузчики, AMR для комплектации, палетизация и сортировка. Начните с одного маршрута.',
  h1: ['Роботы для складов', 'и логистики.'],
  lead: 'Склад — это поток: паллеты приходят, товары собираются в заказы, заказы уходят. Роботы берут на себя перемещения и повторяющиеся операции, люди остаются там, где нужно решение или нестандартный груз.',
  lead2: 'Начинать лучше с одного маршрута, а не со склада целиком: эффект виден быстро, вложения небольшие.',
  audiences: ['распределительные центры', 'склады e-commerce и ритейла', '3PL-операторы', 'склады при производстве'],
  hero: 'floor',
  primaryCta: { label: 'Подобрать роботов для склада', href: '#talk' },
  secondaryCta: { label: 'Путь заказа по складу', href: '#flow' },
  heads: { problems: 'Что давит на склад.', directions: 'Что берут на себя роботы.', pilot: 'Начните с одного маршрута.', vendors: 'Роботы и производители.' },
  secNames: { flow: 'ПУТЬ ЗАКАЗА', proof: 'ВНЕДРЕНИЯ' },
  // Figure first, then what it means. Each figure has its source next to it (own renderer below).
  problems: [
    { icon: 'box', figure: '30', cap: 'роботов на 10 тыс. сотрудников в России', title: 'Роботов на складах мало.', text: 'В развитых экономиках — 500–800 роботов на 10 тыс. сотрудников, цель России на 2030 год — 145. Полностью роботизированных складов в опросе оказалось 3%.', src: [SRC.comnews] },
    { icon: 'people', figure: '115,4 тыс. ₽', cap: 'средняя зарплата складского персонала, август 2026', title: 'Дефицит людей ослаб, зарплаты остались.', text: 'В 2025 году кадровый дефицит назвали 65% опрошенных компаний. К 2026 году напряжённость на рынке труда снизилась до 0,04–0,09 вакансии на 1 тыс. м².', src: [SRC.comnews, SRC.ibc] },
    { icon: 'weight', figure: '> 2×', cap: 'разброс объёмов между пиком и низким сезоном, «Боржоми»', title: 'Нагрузка прыгает, штат один.', text: '«Боржоми» планирует за два года передать роботам все горизонтальные перемещения паллет.', src: [SRC.press] },
    { icon: 'stairs', figure: '2–3 года', cap: 'за это время возвращаются инвестиции, по оценке исследования', title: 'Вход дорогой, окупаемость в годах.', text: 'Среди барьеров исследование называет высокую стоимость входа, недостаточную зрелость ИТ-инфраструктуры и нехватку специалистов.', src: [SRC.comnews] },
  ],
  // Signature block: the stages of an order. Letters match the zones on the plan in the hero.
  flow: [
    { letter: 'A', name: 'Приёмка и разгрузка', robot: 'Роборука снимает коробки с паллеты, робот-погрузчик забирает паллету с рампы.', people: 'Сверка с документами, проверка качества, нестандартные грузы.', anchor: 'palletizing' },
    { letter: 'B', name: 'Хранение и перемещение', robot: 'Паллетные роботы-погрузчики и AMR возят паллеты между рампой, стеллажами и зонами.', people: 'Размещение негабарита, решения по остаткам.', anchor: 'pallets' },
    { letter: 'C', name: 'Комплектация', robot: 'AMR привозит стеллаж к сотруднику или едет рядом с комплектовщиком.', people: 'Берут товар из ячейки, проверяют заказ.', anchor: 'picking' },
    { letter: 'D', name: 'Сортировка и упаковка', robot: 'Роботы раскладывают заказы по направлениям и считают остатки.', people: 'Упаковка нестандартных заказов, возвраты.', anchor: 'sorting' },
    { letter: 'E', name: 'Отгрузка', robot: 'Паллетайзер собирает паллету, робот-погрузчик отвозит её на рампу.', people: 'Погрузка в машину, документы, контроль.', anchor: 'palletizing' },
  ],
  directions: [
    { anchor: 'pallets', title: 'Паллетный транспорт', text: 'Роботы-погрузчики и AMR возят паллеты по горизонтали: рампа, стеллаж, зона отгрузки. Самый простой вход: маршрут понятный, склад не перестраивается.', items: ['роботы-погрузчики (FMR)', 'AMR-тележки', 'рампа — стеллаж — зона', 'ночные перемещения'], fact: { value: '2 года', text: '«Боржоми» планирует передать роботам все горизонтальные перемещения', src: SRC.press }, solution: SOL.warehouse },
    { anchor: 'picking', title: 'Комплектация заказов', text: 'AMR работает по схеме «товар к человеку»: стеллаж едет к сотруднику, а не наоборот. Или едет рядом с комплектовщиком и несёт собранное.', items: ['«товар к человеку»', 'AMR рядом с комплектовщиком', 'сборка наборов и аксессуаров'], fact: { value: '+80%', text: 'выработка сотрудника на комплектации в «Магните»: с примерно 18 до более чем 32 тонн', src: SRC.press }, solution: SOL.warehouse },
    { anchor: 'palletizing', title: 'Палетизация и депалетизация', text: 'Роборука снимает коробки с паллеты или собирает паллету под отгрузку. Тяжёлая однообразная работа уходит с рампы.', items: ['роборуки-депалетайзеры', 'паллетайзеры', 'укладка коробов'], fact: { value: '−40%', text: 'расходы на депалетизацию в распределительном центре «Лемана ПРО», скорость выросла вдвое', src: SRC.sber }, fact2: { value: '44%', text: 'опрошенных логистических компаний уже установили палетайзеры', src: SRC.comnews }, solution: SOL.industrial },
    { anchor: 'sorting', title: 'Сортировка и инвентаризация', text: 'Мобильные роботы закрывают поток заказов, динамическое хранение, инвентаризацию, сортировку и транспортировку. Подключаем, когда первые маршруты уже работают.', items: ['сортировка заказов', 'инвентаризация', 'динамическое хранение'], fact: { text: 'Эти задачи исследование называет типичными для мобильных роботов на складе', src: SRC.comnews }, solution: SOL.warehouse },
  ],
  proof: {
    lead: 'Публичные внедрения российских компаний. Это не наши кейсы, а заявления самих компаний и пресс-релизы: независимо мы цифры не проверяли.',
    market: { value: '88%', text: 'опрошенных компаний планируют использовать мобильных роботов, 43% хотят запустить 2–5 проектов в 2025 году (112 респондентов из 51 компании)', src: SRC.yandex },
    cases: [
      { company: 'Магнит', what: 'AMR «товар к человеку»', value: '+80%', cap: 'выработка сотрудника', from: { n: 18, label: '≈ 18 т' }, to: { n: 32, label: '32+ т' }, src: SRC.press },
      { company: 'Аскона', what: 'AMR на сборке аксессуаров', value: '1 вместо 3', cap: 'сотрудников на операции', from: { n: 75, label: '70–80 ед/ч' }, to: { n: 325, label: '300–350 ед/ч' }, src: SRC.press },
      { company: 'Леман ПРО', what: 'роборука-депалетайзер с ИИ', value: '−40%', cap: 'расходы на депалетизацию', from: { n: 50, label: 'скорость 1×' }, to: { n: 100, label: 'скорость 2×' }, src: SRC.sber },
      { company: 'JNB', what: 'шаттловая система SberShuttle', value: '−80%', cap: 'кладовщиков на складе', from: { n: 100, label: 'было 100%' }, to: { n: 20, label: 'стало 20%' }, src: SRC.sber },
    ],
    note: 'Столбики показывают порядок величин по данным источников; в диапазонах взята середина.',
  },
  pilot: [
    { title: 'Аудит склада', text: 'Смотрим потоки, ширину проходов, покрытие пола, пороги и рампы. Выбираем маршрут, где робот даст эффект раньше всего.' },
    { title: 'Один маршрут', text: 'Робот работает на одном маршруте при вашей обычной загрузке, без остановки склада. Задания приходят из вашей WMS или 1С.' },
    { title: 'Решение по итогам', text: 'Сравниваем пробег людей, скорость и ошибки до и после. Решаем, на какие маршруты и операции переносить роботов дальше.' },
  ],
  vendors: [
    { group: 'AMR и паллетные роботы', brands: ['hikrobot', 'quicktron', 'forwardx', 'agilex'] },
  ],
  vendorsLead: 'Технику подбираем под груз, ширину проходов и покрытие пола, а не под каталог. Роботы разных брендов работают в одной системе.',
  why: { title: 'Разные бренды — одно окно.', text: 'AMR и роботы-погрузчики разных производителей видны в одном окне: маршруты, задачи и отчёты. Задания приходят из вашей WMS или 1С, а парк обслуживаем по SLA.', link: { label: 'Fleet Management', href: 'products.html#fleet' } },
  form: { title: 'С какого маршрута начать на вашем складе?', lead: 'Опишите склад: площадь, грузы, смены. Подскажем маршрут для пилота и посчитаем эффект.', button: 'Обсудить пилот' },
  links: [
    { kicker: 'РЕШЕНИЕ', title: 'Складская роботизация', text: 'AMR и внутренняя логистика.', href: SOL.warehouse.href },
    { kicker: 'РЕШЕНИЕ', title: 'Промышленная роботизация', text: 'Роборуки, палетайзеры, ячейки.', href: SOL.industrial.href },
    { kicker: 'ПРОДУКТ', title: 'Fleet Management', text: 'Парк роботов разных брендов в одном окне.', href: 'products.html#fleet' },
    { kicker: 'УСЛУГА', title: 'Пилотный проект', text: 'Один маршрут, понятный результат.', href: 'services.html#pilot' },
    { kicker: 'УСЛУГА', title: 'Аудит объекта', text: 'Потоки, проходы, маршруты и расчёт.', href: 'services.html#audit' },
    { kicker: 'ПРОДУКТ', title: 'Аренда роботов (RaaS)', text: 'Робот на пилот без покупки.', href: 'products.html#raas' },
    { kicker: 'ОТРАСЛИ', title: 'Промышленность и производство', text: 'AMR внутри цеха и коботы на линии.', href: 'industries-manufacturing.html' },
    { kicker: 'ОТРАСЛИ', title: 'Все отрасли', text: 'Все 12 отраслевых страниц.', href: 'industries.html' },
  ],
  sections: ['hero', 'problems', 'flow', 'directions', 'proof', 'pilot', 'vendors', 'why', 'form', 'see'],
};

const srcLabel = (h, s) => `<span${h.T(s, 'label')}>${h.esc(s.label)}</span>`;
const srcLine = (h, src) => `<p class="wh-src mono">${[].concat(src).map((s) => srcLabel(h, s)).join(' · ')}</p>`;

// Plan of a warehouse (viewBox 600×414). Zones A–E are the stages of the order; lime dots are robots on aisle loops.
// Racks are drawn from a short list so the markup stays readable.
const rackRows = (x0, widths, ys) => ys.flatMap((y) => widths.map(([dx, w]) => `<rect class="wh-rack" x="${x0 + dx}" y="${y}" width="${w}" height="18" rx="3"/>`)).join('');
const bot = (path, dur, begin) => `<circle class="wh-bot" r="5"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${path}"/></circle>`;
const planSvg = (h, ind) => `<svg class="wh-plan" viewBox="0 0 600 414" role="img"${h.TA(['aria-label', h.pk('hero.planLabel')])} aria-label="Схема склада: приёмка, хранение, комплектация, сортировка и упаковка, отгрузка; по проходам едут роботы">
          <rect class="wh-plan__wall" x="12" y="12" width="576" height="390" rx="18"/>
          <g class="wh-zone" data-zone="A"><rect x="30" y="48" width="140" height="130" rx="10"/><text x="44" y="76">A</text>
            <rect class="wh-pallet" x="52" y="100" width="24" height="24" rx="3"/><rect class="wh-pallet" x="88" y="100" width="24" height="24" rx="3"/><rect class="wh-pallet" x="124" y="100" width="24" height="24" rx="3"/><rect class="wh-pallet" x="52" y="136" width="24" height="24" rx="3"/></g>
          <g class="wh-zone" data-zone="B"><rect x="186" y="48" width="250" height="218" rx="10"/><text x="200" y="76">B</text>
            ${rackRows(190, [[10, 100], [126, 100]], [90, 128, 166, 204])}</g>
          <g class="wh-zone" data-zone="C"><rect x="452" y="48" width="122" height="218" rx="10"/><text x="466" y="76">C</text>
            ${rackRows(452, [[16, 90]], [90, 128, 166, 204])}</g>
          <g class="wh-zone" data-zone="D"><rect x="186" y="282" width="388" height="106" rx="10"/><text x="200" y="310">D</text>
            <path class="wh-belt" d="M214 352H548"/><rect class="wh-pallet" x="250" y="340" width="20" height="24" rx="3"/><rect class="wh-pallet" x="352" y="340" width="20" height="24" rx="3"/><rect class="wh-pallet" x="458" y="340" width="20" height="24" rx="3"/></g>
          <g class="wh-zone" data-zone="E"><rect x="30" y="194" width="140" height="194" rx="10"/><text x="44" y="222">E</text>
            <rect class="wh-pallet" x="60" y="250" width="24" height="24" rx="3"/><rect class="wh-pallet" x="96" y="250" width="24" height="24" rx="3"/><rect class="wh-pallet" x="60" y="290" width="24" height="24" rx="3"/><rect class="wh-pallet" x="60" y="330" width="24" height="24" rx="3"/></g>
          <path class="wh-aisle" d="M170 118H186M436 118H452"/>
          ${bot('M176 118H444V158H176Z', 11, 0)}
          ${bot('M176 196H444V236H176Z', 13, -4)}
          ${bot('M458 118H568V158H458Z', 8, -2)}
          ${bot('M192 326H562V376H192Z', 15, -6)}
          ${bot('M52 236H152V374H52Z', 12, -3)}
        </svg>`;

const hero = (ind, n, h) => {
  const legend = ind.flow.map((s, i) => `<li class="reveal" style="--i:${i + 2}"><a href="#flow" data-zone="${s.letter}">
              <b class="wh-leg__l mono">${s.letter}</b><span${h.T(s, 'name')}>${h.esc(s.name)}</span></a></li>`).join('\n            ');
  return `<section class="ih wh-hero wrap" data-sec="${n}"${h.dnName(ind)}>
      <div class="wh-hero__grid">
        <div class="ih__copy">
          ${h.heroCopy(ind, n)}
        </div>
        <figure class="wh-map reveal" style="--i:2">
          <figcaption class="wh-map__h mono"${h.L('hero.mapTitle')}>План склада · роботы на маршрутах</figcaption>
          ${planSvg(h, ind)}
          <ol class="wh-leg"${h.TA(['aria-label', h.pk('hero.legendLabel')])} aria-label="Этапы заказа на плане склада">
            ${legend}
          </ol>
        </figure>
      </div>
    </section>`;
};

// Problems as a ledger: the figure on the left, what it means in the middle, the source under it.
const problems = (ind, n, h) => {
  const rows = ind.problems.map((p, i) => `<li class="wh-fig reveal" style="--i:${i}">
          <div class="wh-fig__n"><b${h.TN(h.dk(p, 'figure'), p.figure)}>${h.esc(p.figure)}</b><span${h.T(p, 'cap')}>${h.esc(p.cap)}</span></div>
          <div class="wh-fig__t"><h3${h.T(p, 'title')}>${h.esc(p.title)}</h3><p${h.T(p, 'text')}>${h.esc(p.text)}</p>${srcLine(h, p.src)}</div>
        </li>`).join('\n        ');
  return `<section class="sol-sec wrap" id="problems" data-sec="${n}"${h.dn(ind, 'problems')} aria-labelledby="problems-h">
      ${h.secHead(n, h.secName(ind, 'problems'), h.head(ind, 'problems'), null, 'problems-h')}
      <ol class="wh-figs">
        ${rows}
      </ol>
    </section>`;
};

// Signature: five stages as one pipeline; the letter matches the zone on the plan in the hero.
const flow = (ind, n, h) => {
  const cols = ind.flow.map((s, i) => `<li class="wh-stage reveal" style="--i:${i}" data-zone="${s.letter}">
          <span class="wh-stage__l mono">${s.letter}</span>
          <h3${h.T(s, 'name')}>${h.esc(s.name)}</h3>
          <div class="wh-stage__c wh-stage__robot"><span class="wh-stage__lbl mono"${h.L('flow.robot')}>Робот</span><p${h.T(s, 'robot')}>${h.esc(s.robot)}</p></div>
          <div class="wh-stage__c"><span class="wh-stage__lbl mono"${h.L('flow.people')}>Люди</span><p${h.T(s, 'people')}>${h.esc(s.people)}</p></div>
          <a class="drow__sol" href="#${s.anchor}"><span${h.L('flow.more')}>Подробнее</span> ${h.ARROW_R}</a>
        </li>`).join('\n        ');
  return `<section class="sol-sec wrap" id="flow" data-sec="${n}"${h.dn(ind, 'flow')} aria-labelledby="flow-h">
      ${h.secHead(n, h.secName(ind, 'flow'), h.lt('flow.title', 'Путь заказа по складу.'), h.lt('flow.lead', 'Пять этапов, два вопроса: что берёт робот и что остаётся людям. Пример для типового распределительного центра, под ваш склад собираем его на аудите.'), 'flow-h')}
      <ol class="wh-flow">
        ${cols}
      </ol>
      <p class="wh-flow__foot"><span${h.L('flow.footLead')}>Безопасность рядом с людьми —</span> ${srcLabel(h, SRC.iso)}<span${h.L('flow.footTail')}>: обнаружение человека, снижение скорости, остановка.</span></p>
    </section>`;
};

const factBox = (h, f) => `<div class="wh-fact">
              ${f.value ? `<b class="tnum"${h.TN(h.dk(f, 'value'), f.value)}>${h.esc(f.value)}</b>` : ''}<span${h.T(f, 'text')}>${h.esc(f.text)}</span>
              ${srcLine(h, f.src)}
            </div>`;

const directions = (ind, n, h) => `<section class="sol-sec wrap" id="directions" data-sec="${n}"${h.dn(ind, 'directions')} aria-labelledby="directions-h">
      ${h.secHead(n, h.secName(ind, 'directions'), h.head(ind, 'directions'), null, 'directions-h')}
      <div class="drows">
        ${ind.directions.map((d, i) => `<article class="drow wh-drow reveal" id="${d.anchor}" style="--i:${i}">
          <div class="drow__l">
            <span class="drow__no mono">${h.pad(i + 1)}</span>
            <h3${h.T(d, 'title')}>${h.esc(d.title)}</h3>
            <p${h.T(d, 'text')}>${h.esc(d.text)}</p>
          </div>
          <div class="drow__r">
            <p class="drow__items">${h.itemsList(d.items)}</p>
            ${factBox(h, d.fact)}${d.fact2 ? `\n            ${factBox(h, d.fact2)}` : ''}
            ${h.solLink(d.solution)}
          </div>
        </article>`).join('\n        ')}
      </div>
    </section>`;

// Dark block: public deployments with before/after bars. The bars are decoration (aria-hidden), the numbers are in the text.
const proof = (ind, n, h) => {
  const p = ind.proof;
  const cards = p.cases.map((c, i) => {
    const top = Math.max(c.from.n, c.to.n);
    return `<li class="wh-case reveal" style="--i:${i}">
            <span class="wh-case__co mono"${h.T(c, 'company')}>${h.esc(c.company)}</span>
            <b class="wh-case__v tnum"${h.T(c, 'value')}>${h.esc(c.value)}</b>
            <span class="wh-case__cap"${h.T(c, 'cap')}>${h.esc(c.cap)}</span>
            <p class="wh-case__what"${h.T(c, 'what')}>${h.esc(c.what)}</p>
            <div class="wh-bars" aria-hidden="true">
              <span class="wh-bar wh-bar--from" style="--w:${(c.from.n / top * 100).toFixed(0)}%"><i></i><em${h.T(c.from, 'label')}>${h.esc(c.from.label)}</em></span>
              <span class="wh-bar wh-bar--to" style="--w:${(c.to.n / top * 100).toFixed(0)}%"><i></i><em${h.T(c.to, 'label')}>${h.esc(c.to.label)}</em></span>
            </div>
            ${srcLine(h, c.src)}
          </li>`;
  }).join('\n          ');
  return `<section class="sol-sec" id="proof" data-sec="${n}"${h.dn(ind, 'proof')} aria-labelledby="proof-h">
      <div class="stage wh-proof">
        <div class="wh-proof__head">
          ${h.idx(n, h.secName(ind, 'proof'))}
          <h2 class="h2 reveal" id="proof-h"${h.L('proof.title')}>Что уже получили другие.</h2>
          <p class="lead reveal"${h.T(p, 'lead')}>${h.esc(p.lead)}</p>
        </div>
        <ul class="wh-cases">
          ${cards}
        </ul>
        <div class="wh-market reveal">
          <b class="tnum"${h.TN(h.dk(p.market, 'value'), p.market.value)}>${h.esc(p.market.value)}</b>
          <p><span${h.T(p.market, 'text')}>${h.esc(p.market.text)}</span>${srcLine(h, p.market.src)}</p>
        </div>
        <p class="wh-proof__note"${h.T(p, 'note')}>${h.esc(p.note)}</p>
      </div>
    </section>`;
};

export default { industry, renderers: { hero, problems, flow, directions, proof }, data: { sources: SRC } };
