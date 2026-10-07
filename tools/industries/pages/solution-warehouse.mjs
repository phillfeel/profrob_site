// Solution landing «Складская роботизация» (/solutions/warehouse/) → solutions-warehouse.html.
// Angle: the SOLUTION is «technology and economics of AMR» plus our software on top of robots of any brand. The warehouse as an
// object (order flow, public deployments, pilot route) lives on industries-warehouse.html: this page links there, it does not copy it.
// Facts: docs/research/2026-10-07-warehouse-industry-research.md; VDA 5050 — vda.de (opened 2026-10-07: «all-purpose interface for
// communication between a master control system and mobile robots», VDA with VDMA, version 3.0.0 of March 2026).
// Own blocks: hero «route» (one AMR on one route: where to start) and signature «dispatcher» (WMS/1C → platform → robots of different brands).
//
// TODO(client): подтвердить бренды (Hikrobot, Quicktron, ForwardX, AgileX): есть ли дистрибьютор и подключены ли они к платформе.
// TODO(client): цены, модели и сроки поставки AMR, которые мы предлагаем; собственной экономической модели AMR в репозитории нет
//   (roi-model.js, тип «Склад», считает только уборку пола). Страница даёт рамку расчёта, а не цифры по AMR.
// TODO(client): какие WMS и 1С-конфигурации подключены; поддерживает ли платформа VDA 5050 сейчас (на странице сказано как условие подключения, не как факт).
// TODO(client): работаем ли с российскими производителями складских роботов (Automacon, Ronavi, «Яндекс Роботикс») — для закупок с требованием отечественного оборудования.
// TODO(client): подтвердить, что берём палетайзеры и роборуки-депалетайзеры (направление #palletizing).
// TODO(legal): требования к безопасности AMR описаны по международному стандарту ISO 3691-4; российский эквивалент и сертификацию уточнить.
// TODO(client): свой складской кейс (карточка «+35%» на главной — заглушка). Внедрения в таблице экономики — чужие, цифры самих компаний.

import { shared } from '../sx-shared.mjs';

const SRC = {
  comnews: { label: 'исследование «Технологии Доверия», ComNews, 29.08.2025' },
  yandex: { label: 'опрос «Яндекс Роботикс» и «Промышленная робототехника», Retail.ru, 15.07.2025' },
  press: { label: 'пресс-релиз, Retail.ru, 23.06.2026' },
  sber: { label: 'Sber PRO, 16.12.2024' },
  vda: { label: 'VDA, vda.de, спецификация VDA 5050' },
};

const industry = {
  slug: 'solution-warehouse',
  kind: 'solution',
  key: 'warehouse',
  name: 'Складская роботизация',
  tier: 2,
  title: 'AMR-роботы и складская роботизация: ПО, внедрение, сервис | Профессиональная Робототехника',
  description: 'AMR-роботы, паллетные роботы-погрузчики и ПО для управления парком разных брендов: аудит, пилот на одном маршруте, интеграция с WMS и 1С, сервис по SLA.',
  h1: ['AMR-роботы и', 'складская роботизация.'],
  lead: 'AMR купить можно у любого поставщика. Сложное начинается потом: роботов нужно подключить к WMS или 1С, развести по маршрутам и держать на связи. Мы внедряем ПО, которое управляет парком AMR разных брендов, и ставим его на роботов, которые у вас уже есть или которые мы подберём.',
  lead2: 'Начинать лучше с одного маршрута, а не со склада целиком.',
  audiences: ['операторы складов', 'ритейл и e-commerce', 'производства с внутренней логистикой'],
  hero: 'route',
  primaryCta: { label: 'Подобрать решение для склада', href: '#talk' },
  secondaryCta: { label: 'Диспетчер над парком', href: '#dispatcher' },
  heads: {
    paths: 'С чего начать: три входа.',
    pathsLead: 'Робот здесь носитель, а продукт — программа, которая им управляет. Поэтому с нами можно прийти и с парком, и без него.',
    problems: 'Склады только начинают.',
    dispatcher: 'Диспетчер над парком.',
    dispatcherLead: 'Задания приходят из ваших систем, роботы получают их через платформу. Бренд робота не должен менять то, как вы управляете складом.',
    directions: 'Какие бывают складские роботы.',
    directionsLead: 'По операциям, а не по брендам. Как устроен весь путь заказа по складу, показано на странице отрасли.',
    economy: 'Как считать окупаемость AMR.',
    economyLead: 'Паспорт робота окупаемость не покажет: она зависит от маршрутов, смен и пиков вашего склада.',
    vendors: 'Роботы и производители.',
    pilot: 'От аудита до сервиса.',
    see: 'Смотрите также.',
  },
  secNames: { paths: 'С ЧЕГО НАЧАТЬ', problems: 'РЫНОК', dispatcher: 'ДИСПЕТЧЕР', directions: 'КЛАССЫ РОБОТОВ', pilot: 'КАК ВНЕДРЯЕМ' },
  paths: [
    { title: 'У вас уже есть AMR или роботы-погрузчики.', text: 'Подключим парк к одной платформе: общая очередь заданий, маршруты, мониторинг. Условие — доступ к интерфейсу робота: VDA 5050, API или SDK производителя. Проверяем его до начала работ.', tag: 'Платформа и интеграция', href: 'products.html#fleet' },
    { title: 'Парка ещё нет.', text: 'Подберём тип роботов под груз, проходы и покрытие пола, запустим один маршрут как пилот. Робота можно взять в аренду, не покупая.', tag: 'Подбор и пилот', href: 'products.html#raas' },
    { title: 'Нужна интеграция с вашими системами.', text: 'Задания из WMS или 1С, статусы обратно, учёт зарядки, свои отчёты. Пишем под ваш процесс в рамках платформы.', tag: 'Софт под сценарий', href: 'platform.html' },
  ],
  problems: [
    { figure: '30', cap: 'роботов на 10 тыс. сотрудников в России', title: 'Рынок только начинается.', text: 'В развитых экономиках 500–800 роботов на 10 тыс. сотрудников, цель России на 2030 год — 145. Полностью роботизированных складов 3%.', src: [SRC.comnews] },
    { figure: '88%', cap: 'опрошенных компаний планируют использовать AMR', title: 'Спрос уже сформирован.', text: 'В опросе 112 респондентов из 51 компании 43% хотели запустить 2–5 проектов с мобильными роботами в 2025 году.', src: [SRC.yandex] },
    { figure: '2–3 года', cap: 'за это время возвращаются инвестиции, по оценке исследования', title: 'Окупаемость — годы, не месяцы.', text: 'Барьеры по тому же исследованию: стоимость входа, незрелость ИТ-инфраструктуры, нехватка специалистов.', src: [SRC.comnews] },
  ],
  // Signature block: three columns — your systems, the platform, the robots. Each column lists what sits there.
  dispatcher: {
    systems: { title: 'Ваши системы', items: ['WMS', '1С или ERP', 'Заказы и отгрузки'] },
    platform: { title: 'Платформа', items: ['Очередь заданий', 'Маршруты без пробок', 'Зарядка и простои', 'Мониторинг и отчёты'] },
    robots: { title: 'Роботы любых брендов', items: ['Паллетный робот-погрузчик · бренд А', 'AMR «товар к человеку» · бренд Б', 'AMR рядом с комплектовщиком · бренд В'] },
    note: 'Подключить проще, если робот поддерживает VDA 5050: это открытая спецификация обмена между системой управления и мобильными роботами разных производителей (VDA и VDMA, версия 3.0.0 от марта 2026). Если не поддерживает, подключаемся через API или SDK производителя. Что доступно для вашей модели, проверяем на аудите.',
    src: SRC.vda,
    legend: 'Схема иллюстративная: бренды А, Б и В обозначают роботов разных производителей.',
  },
  directions: [
    { anchor: 'pallets', title: 'Паллетные роботы-погрузчики и AMR-тележки', text: 'Возят паллеты по горизонтали: рампа, стеллаж, зона отгрузки. Самый простой вход: маршрут повторяется, склад не перестраивается.',
      facts: [{ k: 'Проверяем на аудите', v: 'покрытие пола, ширина проходов, пороги и рампы' }] },
    { anchor: 'picking', title: 'AMR для комплектации', text: 'Товар едет к человеку: стеллаж привозит робот. Или робот едет рядом с комплектовщиком и несёт собранное.',
      facts: [{ k: 'Публичный кейс', v: '«Магнит»: выработка сотрудника +80%', src: SRC.press }] },
    { anchor: 'palletizing', title: 'Роборуки: палетизация и депалетизация', text: 'Роборука снимает коробки с паллеты или собирает паллету под отгрузку. Тяжёлая однообразная работа уходит с рампы.',
      facts: [{ k: 'Публичный кейс', v: '«Леман ПРО»: расходы на депалетизацию −40%', src: SRC.sber }] },
    { anchor: 'sorting', title: 'Сортировка и инвентаризация', text: 'Мобильные роботы закрывают поток заказов, динамическое хранение, сортировку и инвентаризацию. Подключаем, когда первые маршруты уже работают.', facts: [], link: { label: 'Весь путь заказа по складу', href: 'industries-warehouse.html#flow' } },
  ],
  directionsNote: 'Безопасность рядом с людьми описывает международный стандарт ISO 3691-4: обнаружение человека, ограничение скорости, остановка. Требования и сертификацию для вашего склада уточняем на аудите.',
  econ: {
    how: {
      title: 'Из чего складывается расчёт',
      items: [
        { k: 'Пробег людей', v: 'сколько километров за смену проходят люди и погрузчики по маршрутам, которые можно отдать роботу' },
        { k: 'Смены и пики', v: 'сколько смен работает склад и насколько прыгает нагрузка между пиком и низким сезоном; считаем по пику, а не по среднему' },
        { k: 'Ошибки и повреждения', v: 'доля ошибок комплектации и повреждений груза до и после' },
        { k: 'Стоимость внедрения', v: 'робот, зарядка, интеграция с WMS или 1С, обучение, сервис по SLA: всё в одной смете, а не по частям после запуска' },
      ],
      src: null,
    },
    market: {
      title: 'Что уже получили другие',
      rows: [
        { value: '2–3 года', who: 'Оценка рынка', what: 'За такой срок возвращаются инвестиции в складскую роботизацию по оценке опрошенных компаний.', src: SRC.comnews },
        { value: '+80%', who: '«Магнит»: AMR «товар к человеку»', what: 'Выработка сотрудника выросла примерно с 18 до 32+ тонн. Заявление самой компании.', src: SRC.press },
        { value: '1 вместо 3', who: '«Аскона»: AMR на сборке аксессуаров', what: 'Один сотрудник вместо трёх на операции, 70–80 → 300–350 единиц в час. Заявление самой компании.', src: SRC.press },
      ],
    },
    note: 'Это чужие внедрения, цифры — заявления компаний, независимо мы их не проверяли. Точный расчёт делаем на ваших маршрутах после аудита.',
    link: { label: 'Все внедрения на странице отрасли', href: 'industries-warehouse.html#proof' },
  },
  pilot: [
    { title: 'Аудит склада', text: 'Потоки, проходы, покрытие пола, пороги и рампы. Выбираем маршрут, где робот даст эффект раньше всего.' },
    { title: 'Один маршрут под нашим ПО', text: 'Робот (ваш или подобранный нами) работает на одном маршруте при обычной загрузке, склад не останавливается. Задания приходят из WMS или 1С.' },
    { title: 'Интеграция и масштаб', text: 'Подключаем остальные маршруты и системы. Роботы разных брендов работают в одном окне.' },
    { title: 'Сервис', text: 'Мониторинг парка, заявки и обслуживание ведём по SLA.' },
  ],
  vendors: [{ group: 'AMR и паллетные роботы', brands: ['hikrobot', 'quicktron', 'forwardx', 'agilex'] }],
  vendorsLead: 'Подключаем роботов этих и других производителей к одной платформе. Технику подбираем под груз, проходы и покрытие пола, а не под каталог.',
  form: { title: 'С какого маршрута начать на вашем складе?', lead: 'Опишите склад: площадь, грузы, смены, есть ли уже роботы. Подскажем маршрут для пилота и путь подключения.', button: 'Обсудить пилот' },
  links: [
    { kicker: 'ОТРАСЛЬ', title: 'Склады и логистика', text: 'Путь заказа, внедрения и пилот на одном маршруте.', href: 'industries-warehouse.html' },
    { kicker: 'ПРОДУКТ', title: 'Платформа управления роботами', text: 'Парк роботов разных брендов в одном окне.', href: 'platform.html' },
    { kicker: 'ПРОДУКТ', title: 'Аренда роботов (RaaS)', text: 'Робот на пилот без покупки.', href: 'products.html#raas' },
    { kicker: 'УСЛУГА', title: 'Аудит объекта', text: 'Потоки, проходы, маршруты и расчёт.', href: 'services.html#audit' },
    { kicker: 'УСЛУГА', title: 'Пилотный проект', text: 'Один маршрут, понятный результат.', href: 'services.html#pilot' },
    { kicker: 'ОТРАСЛИ', title: 'Промышленность и производство', text: 'AMR внутри цеха и коботы на линии.', href: 'industries-manufacturing.html' },
    { kicker: 'РЕШЕНИЕ', title: 'Роботизированный клининг', text: 'Уборка складских полов и ПО для неё.', href: 'solutions-cleaning.html' },
  ],
  sections: ['hero', 'paths', 'problems', 'dispatcher', 'directions', 'economy', 'vendors', 'pilot', 'form', 'see'],
};

const srcLabel = (h, s) => `<span${h.T(s, 'label')}>${h.esc(s.label)}</span>`;

// Hero: one route of one AMR, drawn as a loop between three points. The robot is the only moving thing.
const hero = (ind, n, h) => `<section class="ih sx-hero wrap" data-sec="${n}"${h.dnName(ind)}>
      <div class="sx-hero__grid">
        <div class="ih__copy">
          ${h.heroCopy(ind, n)}
        </div>
        <figure class="sx-route reveal" style="--i:2">
          <figcaption class="sx-route__h mono"${h.L('hero.routeTitle')}>Один маршрут · пилот</figcaption>
          <svg class="sx-route__svg" viewBox="0 0 520 300" role="img"${h.TA(['aria-label', h.pk('hero.routeLabel')])} aria-label="Схема маршрута: робот ездит по кругу между рампой, стеллажами и отгрузкой">
            <rect class="sx-route__wall" x="8" y="8" width="504" height="284" rx="22"/>
            <path class="sx-route__path" id="sx-loop" d="M90 70H430Q460 70 460 100V200Q460 230 430 230H90Q60 230 60 200V100Q60 70 90 70Z"/>
            <g class="sx-route__rack"><rect x="150" y="116" width="220" height="14" rx="4"/><rect x="150" y="168" width="220" height="14" rx="4"/></g>
            <g class="sx-route__pt"><circle cx="90" cy="70" r="9"/><circle cx="430" cy="70" r="9"/><circle cx="430" cy="230" r="9"/></g>
            <text class="sx-route__lbl" x="90" y="48" text-anchor="middle"${h.L('hero.pointA')}>рампа</text>
            <text class="sx-route__lbl" x="430" y="48" text-anchor="middle"${h.L('hero.pointB')}>стеллажи</text>
            <text class="sx-route__lbl" x="430" y="262" text-anchor="middle"${h.L('hero.pointC')}>отгрузка</text>
            <circle class="sx-route__bot" r="7"><animateMotion dur="14s" repeatCount="indefinite"><mpath href="#sx-loop"/></animateMotion></circle>
          </svg>
          <p class="sx-route__f"><span${h.L('hero.routeFoot')}>Начните с одного маршрута: эффект виден быстро, вложения небольшие.</span></p>
        </figure>
      </div>
    </section>`;

const col = (h, c, cls) => `<div class="sx-col sx-col--${cls} reveal">
          <h3 class="mono"${h.T(c, 'title')}>${h.esc(c.title)}</h3>
          <ul>${c.items.map((it, i) => `<li${h.T(c.items, i)}>${h.esc(it)}</li>`).join('')}</ul>
        </div>`;

// Signature: the dispatcher between your systems and the robots. The connectors between columns are decoration (aria-hidden).
const dispatcher = (ind, n, h) => {
  const d = ind.dispatcher;
  const link = '<span class="sx-link" aria-hidden="true"><i></i></span>';
  return `<section class="sol-sec" id="dispatcher" data-sec="${n}"${h.dn(ind, 'dispatcher')} aria-labelledby="dispatcher-h">
      <div class="stage sx-disp">
        <div class="sx-disp__head">
          ${h.idx(n, h.secName(ind, 'dispatcher'))}
          <h2 class="h2 reveal" id="dispatcher-h"${h.T(ind.heads, 'dispatcher')}>${h.esc(ind.heads.dispatcher)}</h2>
          <p class="lead reveal"${h.T(ind.heads, 'dispatcherLead')}>${h.esc(ind.heads.dispatcherLead)}</p>
        </div>
        <div class="sx-bus">
          ${col(h, d.systems, 'sys')}${link}${col(h, d.platform, 'plat')}${link}${col(h, d.robots, 'bots')}
        </div>
        <p class="sx-disp__note reveal"><span${h.T(d, 'note')}>${h.esc(d.note)}</span> ${srcLabel(h, d.src)}</p>
        <p class="sx-disp__legend mono"${h.T(d, 'legend')}>${h.esc(d.legend)}</p>
      </div>
    </section>`;
};

export default { industry, renderers: { hero, dispatcher, ...shared }, data: { sources: SRC } };
