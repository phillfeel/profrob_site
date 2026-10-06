// Industry landing: fitness clubs and sports facilities (/industries/fitness-sports/).
// Facts: docs/research/2026-10-06-empty-industries-research.md, sections 2 and 8 (option 1: an honest page without cases).
// No Russian fitness-club deployment was found, so there is no case and no effect figures; the page rests on the
// sanitary rules (SP 2.1.3678-20) and on manufacturer specs, each signed next to the figure.
// The ROI calculator is not used: roi-model.js has no "fitness" object type.
// Own blocks: hero «lanes» (zones of the club as lane rows next to the photo) and signature «zones» (zone × rules × robot × people).
//
// TODO(client): работает ли ПРОФРОБОТ с подводными роботами для бассейнов (Maytronics) и роботами-косилками для стадионов (Husqvarna)? Нужны ли направления #pool и #fields на этой странице?
// TODO(client): ресепшн-робот для фитнеса («Промобот», 2023) не выносим: ни один клуб с ним не назван. Вернуть, если появится объект.

const SRC = {
  sp: { label: 'СП 2.1.3678-20 в изложении ЦГОН Роспотребнадзора' },
  pudu: { label: 'по данным производителя, Pudu' },
  husqvarna: { label: 'по данным производителя, Husqvarna' },
  fjd: { label: 'по данным производителя, FJ Dynamics' },
};

const SOL = {
  cleaning: { label: 'Роботизированный клининг', href: '/solutions/cleaning/' },
  agro: { label: 'Агророботы и уход за территорией', href: '/solutions/agro/' },
};

const industry = {
  slug: 'fitness-sports',
  name: 'Фитнес-клубы и спорткомплексы',
  tier: 3,
  title: 'Роботы для фитнес-клубов и спорткомплексов: уборка залов, бассейн, газон | ПРОФРОБОТ',
  description: 'Роботы для уборки тренажёрных залов, раздевалок и санузлов, подводные роботы для бассейнов, косилки и разметка для стадионов. Пилот на одной зоне клуба.',
  h1: ['Роботы для фитнес-клубов', 'и спорткомплексов.'],
  lead: 'Санправила требуют мыть все помещения спортобъекта каждый день, а залы, инвентарь, душевые и раздевалки ещё и дезинфицировать. Клуб при этом открыт с утра до вечера, и уборку приходится вписывать между тренировками.',
  lead2: 'Роботы берут на себя пол в зале и санузлах, дно бассейна, газон и разметку поля. Люди занимаются инвентарём, дезинфекцией поверхностей и контролем.',
  audiences: ['сети фитнес-клубов', 'спорткомплексы', 'бассейны', 'стадионы и арены'],
  hero: 'lanes',
  photo: { robot: 'robot-cleaning.webp', w: 964, h: 1026, note: 'Промпт 11 — робот моет зону свободных весов рано утром (запасной кадр — бассейн)', alt: 'Компактный поломоечный робот объезжает скамью в зоне свободных весов фитнес-клуба ранним утром' },
  primaryCta: { label: 'Подобрать технику для клуба', href: '#talk' },
  secondaryCta: { label: 'Карта зон клуба', href: '#zones' },
  heads: { pilot: 'Начните с одной зоны.', directions: 'Что берёт на себя техника.' },
  secNames: { zones: 'КАРТА ЗОН' },
  // Problems with a source next to every figure (own renderer below).
  problems: [
    { icon: 'drop', title: 'Каждый день — влажная уборка всех помещений.', text: 'Объект спорта убирают влажным способом с моющими и дезинфицирующими средствами ежедневно. Залы и инвентарь (тренажёры, маты), туалеты, душевые, раздевалки и медпункт ежедневно дезинфицируют.', src: SRC.sp },
    { icon: 'people', title: 'Рук в клининге меньше.', text: 'Больше 80% персонала клининга — иностранцы, а фонд оплаты труда клининговых компаний за пять лет вырос в два-три раза. В 2025 году наём мигрантов дополнительно ограничили в 11 регионах.' },
    { icon: 'clock', title: 'Убирать приходится между тренировками.', text: 'Пол в зале моют, пока в зоне почти никого нет: рано утром, поздно вечером или в провалы между пиками.' },
    { icon: 'ruler', title: 'У спорткомплекса не только полы.', text: 'Чаша бассейна, газон стадиона и разметка поля — отдельная работа со своим графиком и своей техникой.' },
  ],
  // Signature block: zone → what the rules require → what the robot takes → what stays with people.
  zones: [
    { name: 'Тренажёрный зал и свободные веса', freq: 'ежедневно', rules: 'Влажная уборка с моющими и дезсредствами, дезинфекция зала и инвентаря.', robot: 'Моет пол по маршруту, объезжает тренажёры и скамьи. Работает до открытия или в непик.', people: 'Дезинфекция тренажёров, гантелей и матов, места под стойками.', anchor: 'gym-floor' },
    { name: 'Раздевалки', freq: 'ежедневно', rules: 'Влажная уборка и ежедневная дезинфекция.', robot: 'Компактный робот моет проходы между шкафчиками.', people: 'Скамьи, дверцы и ручки шкафчиков, фены и зеркала.', anchor: 'locker-rooms' },
    { name: 'Душевые и санузлы', freq: 'ежедневно', rules: 'Ежедневная дезинфекция.', robot: 'Моет пол санузлов и узкие места, куда не пройдёт большая машина.', people: 'Сантехника, перегородки, расходники и контроль чистоты.', anchor: 'locker-rooms' },
    { name: 'Бассейн', freq: 'ежедневно', rules: 'Помещения бассейна — ежедневная влажная уборка, как и все помещения объекта.', robot: 'Подводный робот-пылесос чистит дно чаши, пока бассейн закрыт.', people: 'Обходные дорожки, водоподготовка, проверка после чистки.', anchor: 'pool' },
    { name: 'Поле и газон', freq: 'по графику', rules: 'Санитарной нормы для газона нет: график задают календарь игр и регламент поля.', robot: 'Косилка стрижёт газон без провода по периметру, робот наносит разметку.', people: 'Уход за газоном, подготовка поля к игре.', anchor: 'fields' },
  ],
  directions: [
    { anchor: 'gym-floor', title: 'Уборка залов и зон тренажёров', text: 'Робот моет пол зала по заданному маршруту, объезжает тренажёры и сам возвращается на базу. Уборку ставим на часы, когда в зале пусто.', items: ['тренажёрные залы', 'зоны свободных весов', 'кардиозоны', 'холлы и коридоры'], fact: { value: '700–1 000 м²/ч', text: 'производительность Pudu CC1', src: SRC.pudu }, solution: SOL.cleaning },
    { anchor: 'locker-rooms', title: 'Раздевалки, душевые и санузлы', text: 'Компактные роботы для узких проходов и санузлов, где большой поломоечной машине не развернуться.', items: ['раздевалки', 'душевые', 'санузлы', 'узкие коридоры'], fact: { text: 'Pudu SH1 — для санузлов и узких мест', src: { label: 'по описанию производителя, Pudu' } }, solution: SOL.cleaning },
    // TODO(client): подтвердить, что работаем с Maytronics; карточка — по данным дилеров, сайт производителя не открывали.
    { anchor: 'pool', title: 'Бассейн', text: 'Профессиональный подводный робот-пылесос для больших бассейнов чистит дно чаши ночью или в санитарный час.', items: ['подводные роботы-пылесосы', 'большие и олимпийские бассейны', 'аквазоны спорткомплексов'], fact: { value: 'до ~50 м', text: 'длина бассейна для Maytronics Dolphin Wave 300 XL', src: { label: 'по данным дилеров Maytronics' } }, solution: SOL.cleaning },
    // TODO(client): подтвердить, что работаем с Husqvarna и FJ Dynamics PaintMaster для спортивных полей.
    { anchor: 'fields', title: 'Стадионы и поля', text: 'Роботы-косилки стригут газон по графику, без провода по периметру. Роботы разметки наносят линии спортивного поля.', items: ['роботы-косилки', 'разметка полей', 'газоны стадионов и тренировочных полей'], fact: { value: 'до 38 000 м²', text: 'Husqvarna CEORA 544 EPOS; при ежедневном «спортивном» кошении — до 20 000 м²', src: SRC.husqvarna }, fact2: { text: 'FJ Dynamics PaintMaster — роботы разметки спортивных полей', src: SRC.fjd }, solution: SOL.agro },
  ],
  pilotLead: 'Публичных внедрений роботов в российских фитнес-клубах мы не нашли, поэтому не показываем чужих цифр. Предлагаем пилот на вашем объекте: результат будет вашим.',
  pilot: [
    { title: 'Обход клуба', text: 'Проходим зоны, меряем площади, смотрим покрытия, пороги, проходы между тренажёрами и часы работы.' },
    { title: 'Одна зона', text: 'Удобнее всего начать с зала: площадь большая, уборка ежедневная. Робот работает до открытия или в непик.' },
    { title: 'Решение по итогам', text: 'Сравниваем, сколько времени уборки освободилось и как держится чистота. Решаем, отдавать ли технике раздевалки, бассейн или поле.' },
  ],
  vendors: [
    { group: 'Залы, раздевалки и санузлы', brands: ['pudu'] },
    { group: 'Бассейн', brands: ['maytronics'] },
    { group: 'Газон и разметка поля', brands: ['husqvarna', 'fjdynamics'] },
  ],
  vendorsLead: 'Pudu выделяет спорт и развлечения в отдельное решение: CC1 для залов, MT1 для больших площадей, SH1 для санузлов (по данным производителя). Технику подбираем под площадь, покрытие и часы работы клуба.',
  why: { title: 'Сначала пилот, потом парк.', text: 'Робота можно взять в аренду на время пилота, а не покупать сразу. Технику разных производителей для зала, бассейна и поля подбираем, запускаем и обслуживаем по SLA.', link: { label: 'Пилотный проект', href: '/services/pilot/' } },
  form: { title: 'Покажем робота в вашем клубе.', lead: 'Привезём робота на демо, проедем маршрут по залу и подскажем, какую зону отдать технике первой.', button: 'Заказать демо' },
  links: [
    { kicker: 'РЕШЕНИЕ', title: 'Роботизированный клининг', text: 'Поломоечные роботы для залов и санузлов.', href: SOL.cleaning.href },
    { kicker: 'РЕШЕНИЕ', title: 'Агророботы', text: 'Косилки и уход за территорией.', href: SOL.agro.href },
    { kicker: 'УСЛУГА', title: 'Пилотный проект', text: 'Одна зона, понятный результат.', href: '/services/pilot/' },
    { kicker: 'УСЛУГА', title: 'Аудит объекта', text: 'Зоны, площади, маршруты и расчёт.', href: '/services/audit/' },
    { kicker: 'ПРОДУКТ', title: 'Аренда роботов (RaaS)', text: 'Робот на пилот без покупки.', href: 'products.html#raas' },
    { kicker: 'ПРОДУКТ', title: 'Cleaning Operations Platform', text: 'Уборка всех зон и отчёты в одном окне.', href: 'products.html#platform' },
    { kicker: 'ОТРАСЛИ', title: 'Все отрасли', text: 'Все 11 отраслевых страниц.', href: '/industries/' },
  ],
  sections: ['hero', 'problems', 'zones', 'directions', 'pilot', 'vendors', 'why', 'form', 'see'],
};

// TODO(client): подтвердить, что работаем с Maytronics и Husqvarna. Логотипов нет — показываем названием.
const brands = {
  maytronics: { name: 'Maytronics' },
  husqvarna: { name: 'Husqvarna' },
};

const srcLabel = (h, s) => `<span${h.T(s, 'label')}>${h.esc(s.label)}</span>`;
const srcLine = (h, src) => `<p class="fz-src mono">${[].concat(src).map((s) => srcLabel(h, s)).join(' · ')}</p>`;

// Hero: big type across the page, then the photo with the club's zones stacked next to it as lanes.
const hero = (ind, n, h) => {
  const lanes = ind.directions.map((d, i) => `<li class="fz-lane reveal" style="--i:${i + 2}">
            <a href="#${d.anchor}">
              <span class="fz-lane__no mono tnum">${h.pad(i + 1)}</span>
              <span class="fz-lane__t"${h.T(d, 'title')}>${h.esc(d.title)}</span>
              <span class="fz-lane__go" aria-hidden="true">${h.ARROW_R}</span>
            </a>
          </li>`).join('\n          ');
  return `<section class="ih fz-hero wrap" data-sec="${n}"${h.dnName(ind)}>
      <div class="fz-hero__top">
        ${h.crumbs(ind)}
        ${h.idx(n, h.nameCaps(ind))}
        <h1 class="h1 fz-hero__h1 reveal">${h.h1(ind)}</h1>
      </div>
      <div class="fz-hero__mid">
        <div class="ih__text reveal" style="--i:1">
          <p class="lead"${h.T(ind, 'lead')}>${h.esc(ind.lead)}</p>
          <p${h.T(ind, 'lead2')}>${h.esc(ind.lead2)}</p>
        </div>
        <div class="fz-hero__act reveal" style="--i:2">
          <div class="ih__cta">
            <a class="btn btn-pri" href="${ind.primaryCta.href}"${h.T(ind.primaryCta, 'label')}>${h.esc(ind.primaryCta.label)}</a>
            <a class="text-link" href="${ind.secondaryCta.href}"><span${h.T(ind.secondaryCta, 'label')}>${h.esc(ind.secondaryCta.label)}</span> ${h.ARROW_R}</a>
          </div>
          <p class="ih__aud">${h.audience(ind)}</p>
        </div>
      </div>
      <div class="fz-hero__deck">
        ${h.photo(ind, '4:3', 'fz-hero__ph')}
        <nav class="fz-lanes"${h.TA(['aria-label', h.pk('hero.lanesLabel')])} aria-label="Зоны клуба">
          <p class="fz-lanes__h mono reveal" style="--i:1"${h.L('hero.lanesTitle')}>Зоны клуба</p>
          <ol>
          ${lanes}
          </ol>
        </nav>
      </div>
    </section>`;
};

const problems = (ind, n, h) => {
  const items = ind.problems.map((p, i) => `<li class="fz-prob${i === 0 ? ' fz-prob--key' : ''} reveal" style="--i:${i + 1}">
          <span class="ic-tile">${h.icon(p.icon)}</span>
          <h3${h.T(p, 'title')}>${h.esc(p.title)}</h3>
          <p${h.T(p, 'text')}>${h.esc(p.text)}</p>${p.src ? `\n          ${srcLine(h, p.src)}` : ''}
        </li>`).join('\n        ');
  return `<section class="sol-sec wrap" id="problems" data-sec="${n}"${h.dn(ind, 'problems')} aria-labelledby="problems-h">
      ${h.secHead(n, h.secName(ind, 'problems'), h.lt('problems.title', 'Чистота по санправилам, а людей меньше.'), null, 'problems-h')}
      <ol class="fz-probs">
        ${items}
      </ol>
    </section>`;
};

// Signature: a matrix of the club's zones. The «robot» column is one continuous lane.
const zones = (ind, n, h) => {
  const rows = ind.zones.map((z, i) => `<li class="fz-zone reveal" style="--i:${i}">
          <div class="fz-zone__name">
            <span class="fz-zone__no mono tnum">${h.pad(i + 1)}</span>
            <h3${h.T(z, 'name')}>${h.esc(z.name)}</h3>
            <span class="fz-zone__freq mono${z.freq === 'ежедневно' ? ' is-daily' : ''}"${h.T(z, 'freq')}>${h.esc(z.freq)}</span>
          </div>
          <div class="fz-zone__c fz-zone__rules"><span class="fz-zone__lbl mono"${h.L('zones.rules')}>Санправила</span><p${h.T(z, 'rules')}>${h.esc(z.rules)}</p></div>
          <div class="fz-zone__c fz-zone__robot"><span class="fz-zone__lbl mono"${h.L('zones.robot')}>Техника</span><p${h.T(z, 'robot')}>${h.esc(z.robot)}</p><a class="drow__sol" href="#${z.anchor}"><span${h.L('zones.more')}>Подробнее</span> ${h.ARROW_R}</a></div>
          <div class="fz-zone__c fz-zone__people"><span class="fz-zone__lbl mono"${h.L('zones.people')}>Люди</span><p${h.T(z, 'people')}>${h.esc(z.people)}</p></div>
        </li>`).join('\n        ');
  return `<section class="sol-sec wrap" id="zones" data-sec="${n}"${h.dn(ind, 'zones')} aria-labelledby="zones-h">
      ${h.secHead(n, h.secName(ind, 'zones'), h.lt('zones.title', 'Карта зон клуба.'), h.lt('zones.lead', 'Пять зон, три вопроса: что требуют санправила, что берёт на себя техника и что остаётся у людей. Робот моет пол, человек отвечает за поверхности и инвентарь.'), 'zones-h')}
      <div class="fz-map">
        <div class="fz-map__head mono" aria-hidden="true">
          <span${h.L('zones.head.zone')}>Зона</span><span${h.L('zones.head.rules')}>Что требуют санправила</span><span${h.L('zones.head.robot')}>Что берёт техника</span><span${h.L('zones.head.people')}>Что остаётся у людей</span>
        </div>
        <ol class="fz-map__rows">
        ${rows}
        </ol>
      </div>
      <p class="fz-map__foot"><span${h.L('zones.footLead')}>Санитарные требования —</span> ${srcLabel(h, SRC.sp)}<span${h.L('zones.footTail')}>. Распределение работ — пример, на обходе собираем его под ваш клуб.</span></p>
    </section>`;
};

const factBox = (h, f) => `<div class="fz-fact">
              ${f.value ? `<b class="tnum"${h.T(f, 'value')}>${h.esc(f.value)}</b>` : ''}<span${h.T(f, 'text')}>${h.esc(f.text)}</span>
              ${srcLine(h, f.src)}
            </div>`;

const directions = (ind, n, h) => `<section class="sol-sec wrap" id="directions" data-sec="${n}"${h.dn(ind, 'directions')} aria-labelledby="directions-h">
      ${h.secHead(n, h.secName(ind, 'directions'), h.head(ind, 'directions'), null, 'directions-h')}
      <div class="drows">
        ${ind.directions.map((d, i) => `<article class="drow fz-drow reveal" id="${d.anchor}" style="--i:${i}">
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

const pilot = (ind, n, h) => `<section class="sol-sec wrap" id="pilot" data-sec="${n}"${h.dn(ind, 'pilot')} aria-labelledby="pilot-h">
      ${h.secHead(n, h.secName(ind, 'pilot'), h.head(ind, 'pilot'), h.dt(ind, 'pilotLead'), 'pilot-h')}
      <ol class="steps fz-steps">
        ${ind.pilot.map((s, i) => `<li class="steps__i reveal" style="--i:${i}"><span class="steps__no mono tnum">${h.pad(i + 1)}</span><h3${h.T(s, 'title')}>${h.esc(s.title)}</h3><p${h.T(s, 'text')}>${h.esc(s.text)}</p></li>`).join('\n        ')}
      </ol>
    </section>`;

export default { industry, brands, renderers: { hero, problems, zones, directions, pilot }, data: { sources: SRC } };
