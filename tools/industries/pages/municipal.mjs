// Industry landing: municipal services (/industries/municipal/) — parks, streets, embankments, parking lots.
// Facts: docs/research/2026-10-06-empty-industries-research.md, section 6 (+ sections 1, 2, 9, 10).
// Directions follow the client's docx «Ниши Роботы запрос v4» (street/municipal cleaning, winter machinery, lawns).
// Own blocks:
//   - hero «plan»: a top-down SVG plan of a territory (alleys, plaza, lawns, embankment, parking); every zone links to
//     its direction, an HTML legend duplicates the zones for small screens and screen readers;
//   - signature «procurement»: how a budget customer buys (44-FZ / 223-FZ, national regime, «cleaning as a service»).
// The ROI calculator is not used: roi-model.js counts indoor floor cleaning only.
//
// Competitors (Russian makers we do not work with) are not named, so there is no proof block with their deployments.
// TODO(client): поставляет ли Профессиональная Робототехника уличную технику (подметальные роботы, косилки, снег) или только перечислил
//   направления в docx? От ответа зависят направления #winter и #lawns.
// TODO(client): готовы ли вы продавать «уборку территории как услугу» (подрядчик владеет роботами)? На этом стоит
//   маршрут Б в блоке «Как это купить».
// TODO(client): нужен ли реальный кейс Профессиональной Робототехники в муниципальном секторе? Пока на странице кейсов нет.
import { existsSync } from 'node:fs';

// Real hero photo from assets/industry_hero/<slug>.webp, if it has been added; otherwise the robot placeholder.
const heroPhoto = (slug) => (existsSync(new URL(`../../../assets/industry_hero/${slug}.webp`, import.meta.url))
  ? `assets/industry_hero/${slug}.webp` : null);

const SRC = {
  pp1875: { label: 'ПП РФ № 1875' },
  mt1: { label: 'даташит производителя, Pudu' },
};

const SOL = {
  cleaning: { label: 'Роботизированный клининг', href: 'solutions-cleaning.html' },
  agro: { label: 'Агророботы и уход за территорией', href: 'solutions.html#dir-agro' },
};

const industry = {
  slug: 'municipal',
  name: 'Муниципальные службы',
  tier: 3,
  title: 'Роботы для уборки парков, улиц и набережных: муниципальным службам | Профессиональная Робототехника',
  description: 'Роботы-подметальщики для парков, тротуаров и набережных, зимнее содержание, косилки для газонов и откосов, уборка паркингов. Как купить по 44-ФЗ и 223-ФЗ с учётом нацрежима.',
  h1: ['Роботы для уборки', 'парков, улиц и набережных.'],
  lead: 'Территории большие, работы много, а людей на неё всё меньше. Листопад, снегопад и тополиный пух короче от этого не становятся.',
  lead2: 'Роботы берут длинные однообразные проходы по аллеям, тротуарам и паркингам, люди — то, где нужны руки и глаза. Технику подбираем с учётом того, как вы закупаете.',
  audiences: ['ГБУ «Жилищник»', 'дирекции парков', 'ГБУ по содержанию дорог', 'УК жилых комплексов', 'операторы набережных и благоустроенных территорий'],
  hero: 'plan',
  photo: { robot: 'robot-cleaning.webp', w: 964, h: 1026, note: 'Промпт 9 — робот-подметальщик на аллее парка осенью', alt: 'Небольшой электрический робот-подметальщик сметает жёлтую листву с аллеи городского парка пасмурным октябрьским утром' },
  primaryCta: { label: 'Обсудить пилот на территории', href: '#talk' },
  secondaryCta: { label: 'Как это купить', href: '#procurement' },
  heads: {
    problems: 'Территория та же, рук всё меньше.',
    directions: 'Четыре зоны — четыре задачи.',
    vendors: 'Оборудование и производители.',
    pilot: 'Начните с одной аллеи.',
  },
  secNames: { procurement: 'КАК КУПИТЬ' },
  // Figure-led problem cards; every figure is signed with its source.
  problems: [
    { fig: '>80%', title: 'Уборка держится на иностранцах.', text: 'Такая доля иностранцев в персонале клининга. Любое ужесточение миграционных правил бьёт по уборке напрямую.' },
    { fig: '11', unit: 'регионов', title: 'Наём мигрантов ограничивают.', text: 'В 2025 году дополнительные ограничения ввели в 11 регионах, на 2026-й предложены отраслевые квоты.' },
    { fig: '+31%', title: 'Исполнителей ищут всё активнее.', text: 'Рост спроса на исполнителей в клининге в первом полугодии 2026 года к тому же периоду 2025-го.' },
    { fig: 'п. 98', title: 'Иностранную коммунальную технику закупить нельзя.', text: 'Позиция в перечне запретов нацрежима для госзакупок. Что это значит для роботов — в блоке «Как это купить».', src: SRC.pp1875, href: '#procurement' },
  ],
  directions: [
    { anchor: 'streets', zone: 'Аллеи и набережная', short: 'подметание · листва · пух',
      title: 'Дорожки, тротуары, набережные, парки',
      text: 'Подметание, мойка покрытий, сбор листвы и тополиного пуха. Робот проходит длинные маршруты по графику, бригада занимается урнами, клумбами и тем, что требует рук.',
      items: ['подметание аллей и дорожек', 'мойка покрытий', 'сбор листвы', 'тополиный пух'],
      facts: [],
      solution: SOL.cleaning },
    { anchor: 'winter', zone: 'Площадь: снег и реагенты', short: 'отвал · щётка · реагенты',
      title: 'Зимнее содержание: снег и реагенты',
      text: 'Сменные отвалы и щётки — для расчистки дорожек, площадей и входных групп. Одна машина работает круглый год, меняется навесное оборудование.',
      items: ['расчистка дорожек от снега', 'щётки для свежего снега', 'распределение реагентов'],
      facts: [
        { text: 'Серийных беспилотных снегоуборщиков в России мы пока не нашли: известные проекты в разработке.' },
      ],
      solution: SOL.cleaning },
    { anchor: 'lawns', zone: 'Газоны и откос', short: 'косилки · откосы · склоны',
      title: 'Газоны и откосы',
      text: 'Коммерческие роботизированные косилки — для ровных газонов парков и дворов. Для откосов, дамб и склонов — дистанционно управляемая техника: оператор стоит на безопасном месте, а не на склоне.',
      items: ['роботизированные косилки', 'газоны парков и дворов', 'откосы, дамбы, склоны'],
      facts: [
        { text: 'FJ Dynamics — коммерческие роботизированные косилки.' },
        { text: 'Koham и Leking — дистанционно управляемая техника для откосов, без автономного режима.' },
      ],
      solution: SOL.agro },
    { anchor: 'parking', zone: 'Паркинг', short: 'подметание больших площадей',
      title: 'Паркинги и большие площадки',
      text: 'Автономные подметальные машины для открытых и крытых паркингов, площадей и стоянок. Удобно убирать ночью, когда машин меньше.',
      items: ['открытые паркинги', 'крытые паркинги', 'площади и стоянки'],
      facts: [
        { text: 'Pudu MT1 — до 1 800 м²/ч в стандартном режиме, 4–8 ч работы на одном заряде.', src: SRC.mt1 },
      ],
      solution: SOL.cleaning },
  ],
  vendors: [
    { group: 'Подметание и паркинги', brands: ['pudu'] },
    { group: 'Роботизированные косилки', brands: ['fjdynamics'] },
    { group: 'Дистанционно управляемая техника для откосов', brands: ['koham', 'leking'] },
  ],
  vendorsLead: 'Бюджетному заказчику сначала смотрим российских производителей: по части кодов ОКПД2 иностранную технику закупить нельзя.',
  pilot: [
    { title: 'Обследование территории', text: 'Покрытия, уклоны, бордюры, маршруты, где хранить и заряжать технику. Отдельно — как вы закупаете.' },
    { title: 'Пилот на одной аллее или паркинге', text: 'Сравниваем с текущим регламентом уборки: проходы, время, что остаётся бригаде.' },
    { title: 'Решение о закупке', text: 'Техника по 44-ФЗ или 223-ФЗ, аренда или уборка как услуга. Затем — остальная территория.' },
  ],
  why: { title: 'Техника или результат — выбирать вам.', text: 'Роботов можно купить, взять в аренду или заказать уборку как услугу, где техникой владеет подрядчик. Обслуживаем по SLA, чтобы машина не стояла в листопад и снегопад.', link: { label: 'Аренда роботов (RaaS)', href: 'products.html#raas' } },
  form: { title: 'Обсудим вашу территорию.', lead: 'Опишите территорию и как вы закупаете — подскажем технику, участок для пилота и модель покупки.', button: 'Обсудить пилот' },
  formStage: false,
  links: [
    { kicker: 'РЕШЕНИЕ', title: 'Роботизированный клининг', text: 'Подметальные и поломоечные роботы.', href: SOL.cleaning.href },
    { kicker: 'РЕШЕНИЕ', title: 'Агророботы и уход за территорией', text: 'Косилки и техника для газонов.', href: SOL.agro.href },
    { kicker: 'ПРОДУКТ', title: 'Аренда роботов (RaaS)', text: 'Техника без покупки, на сезон или дольше.', href: 'products.html#raas' },
    { kicker: 'ПРОДУКТ', title: 'Платформа Профессиональная Робототехника', text: 'Регламенты уборки и отчёты в одном окне.', href: 'products.html#platform' },
    { kicker: 'УСЛУГА', title: 'Аудит территории', text: 'Покрытия, маршруты, модель закупки.', href: 'services.html#audit' },
    { kicker: 'УСЛУГА', title: 'Пилот', text: 'Одна аллея или паркинг — до решения о закупке.', href: 'services.html#pilot' },
    { kicker: 'КЕЙСЫ', title: 'Кейсы: муниципальные службы', text: 'Внедрения на городских территориях.', href: 'cases.html?industry=municipal' },
    { kicker: 'ОТРАСЛИ', title: 'Все отрасли', text: 'Все 12 отраслевых страниц.', href: 'industries.html' },
  ],
  sections: ['hero', 'problems', 'directions', 'procurement', 'pilot', 'vendors', 'why', 'form', 'see'],
};

const ext = (h, s) => `<span${h.T(s, 'label')}>${h.esc(s.label)}</span>`;
const srcLine = (h, src, cls = 'mn-src') => `<p class="${cls} mono"><span${h.C('sources.labelColon')}>Источник:</span> ${[].concat(src).map((s) => ext(h, s)).join(' · ')}</p>`;

// ───────── Hero: plan of a territory ─────────
// Zones are drawn back to front: lawns (park ground) → parking → alleys/embankment → plaza → trees → markers.
const ZONE_MARK = {
  streets: { x: 432, y: 318, lx: 452, ly: 323 },
  winter: { x: 240, y: 200, lx: 296, ly: 160 },
  lawns: { x: 76, y: 150, lx: 98, ly: 155 },
  parking: { x: 630, y: 176, lx: 548, ly: 282 },
};

const zoneA = (h, d, i, shapes) => {
  const m = ZONE_MARK[d.anchor];
  return `<a class="mz mz--${d.anchor}" href="#${d.anchor}" aria-label="${h.pad(i + 1)} — ${h.esc(d.zone)}: направление «${h.esc(d.title)}»"${h.TA(['aria-label', h.pk(`plan.zones.${d.anchor}.label`)])}>
            ${shapes}
            <g class="mz__mk"><circle cx="${m.x}" cy="${m.y}" r="17"/><text x="${m.x}" y="${m.y + 4}" text-anchor="middle">${h.pad(i + 1)}</text></g>
            <text class="mz__lbl" x="${m.lx}" y="${m.ly}"${h.T(d, 'zone')}>${h.esc(d.zone)}</text>
          </a>`;
};

const plan = (ind, h) => {
  const d = Object.fromEntries(ind.directions.map((x, i) => [x.anchor, [x, i]]));
  const z = (k, shapes) => zoneA(h, d[k][0], d[k][1], shapes);
  const alleys = 'M240 78 V200 C 300 250, 380 280, 432 318 S 540 400, 560 430 M240 200 C 190 260, 120 330, 84 430 M240 200 C 320 182, 420 170, 520 176';
  const trees = [[40, 110], [60, 210], [170, 110], [330, 110], [380, 140], [440, 110], [330, 380], [380, 400], [250, 330], [200, 390], [620, 330], [680, 370], [600, 390], [700, 300], [160, 300], [300, 300]]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${10 + (i % 3) * 3}"/>`).join('');
  return `<svg class="mplan__svg" viewBox="0 0 760 560" role="group" aria-labelledby="mplan-t">
          <title id="mplan-t"${h.L('plan.title')}>Схема городской территории сверху: аллеи и набережная, площадь, газоны с откосом к реке и паркинг. Каждая зона ведёт к своему направлению.</title>
          <defs>
            <pattern id="mp-grass" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0v9" class="mp-grass"/></pattern>
            <pattern id="mp-slope" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 14 7 2 14 14" class="mp-slope"/></pattern>
            <pattern id="mp-snow" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" class="mp-snow"/><circle cx="10" cy="10" r="1.4" class="mp-snow"/></pattern>
            <pattern id="mp-water" width="40" height="12" patternUnits="userSpaceOnUse"><path d="M0 6c5-4 15-4 20 0s15 4 20 0" class="mp-wave"/></pattern>
          </defs>
          <rect class="mp-road" x="0" y="0" width="760" height="56"/>
          <path class="mp-road__axis" d="M0 28H760"/>
          <rect class="mp-water" x="0" y="462" width="760" height="98"/>
          <rect x="0" y="462" width="760" height="98" fill="url(#mp-water)"/>
          ${z('lawns', `<rect class="mz__fill" x="0" y="78" width="500" height="326"/>
            <path class="mz__fill" d="M500 270H760V404H500Z"/>
            <rect x="0" y="78" width="500" height="326" fill="url(#mp-grass)"/>
            <path d="M500 270H760V404H500Z" fill="url(#mp-grass)"/>
            <rect class="mz__fill mz__fill--slope" x="0" y="404" width="760" height="26"/>
            <rect x="0" y="404" width="760" height="26" fill="url(#mp-slope)"/>`)}
          ${z('parking', `<rect class="mz__fill" x="508" y="96" width="236" height="160" rx="10"/>
            <path class="mp-stalls" d="${Array.from({ length: 10 }, (_, k) => `M${520 + k * 22} 104v40M${520 + k * 22} 208v40`).join('')}"/>`)}
          ${z('streets', `<rect class="mz__fill" x="0" y="56" width="760" height="22"/>
            <path class="mz__alley" d="${alleys}"/>
            <path class="mz__alley-in" d="${alleys}"/>
            <rect class="mz__fill" x="0" y="430" width="760" height="28"/>
            <path class="mp-parapet" d="M0 458H760"/>
            <path class="mp-trail" pathLength="100" d="M240 92 V200 C 300 250, 380 280, 432 318 S 540 400, 560 430 H 740"/>`)}
          ${z('winter', `<circle class="mz__fill" cx="240" cy="200" r="50"/>
            <circle cx="240" cy="200" r="50" fill="url(#mp-snow)"/>`)}
          <g class="mp-trees" aria-hidden="true">${trees}</g>
          <text class="mp-cap" x="16" y="36"${h.L('plan.caps.street')}>УЛИЦА</text>
          <text class="mp-cap" x="16" y="530"${h.L('plan.caps.river')}>РЕКА</text>
          <text class="mp-cap" x="600" y="70"${h.L('plan.caps.sidewalk')}>ТРОТУАР</text>
        </svg>`;
};

const hero = (ind, n, h) => {
  const p = ind.photo;
  const legend = ind.directions.map((d, i) => `<li><a href="#${d.anchor}" data-zone="${d.anchor}"><span class="mono tnum">${h.pad(i + 1)}</span><b${h.T(d, 'zone')}>${h.esc(d.zone)}</b><small${h.T(d, 'short')}>${h.esc(d.short)}</small></a></li>`).join('');
  const mPh = h.msg('industries.common.photo.placeholder', { ratio: '16:10' });
  return `<section class="ih ih--plan wrap" data-sec="${n}"${h.dnName(ind)}>
      <div class="mhero">
        <div class="ih__copy mhero__copy">
          ${h.heroCopy(ind, n)}
        </div>
        <div class="mplan reveal" style="--i:1">
          <div class="mplan__head"><span class="mono"${h.L('plan.caption')}>Схема территории · без масштаба</span><span class="mplan__hint"${h.L('plan.hint')}>Нажмите на зону</span></div>
          ${plan(ind, h)}
          <ol class="mplan__legend"${h.TA(['aria-label', h.pk('plan.legendLabel')])} aria-label="Зоны территории и направления">${legend}</ol>
        </div>
        ${heroPhoto(ind.slug) ? `<figure class="ph ph--photo mhero__ph reveal" style="--ar:16/10;--i:2">
          <img class="ph__img" src="${heroPhoto(ind.slug)}" alt="${h.esc(p.alt)}"${h.TA(['alt', h.dk(p, 'alt')])} width="1536" height="1024" decoding="async">
        </figure>` : `<!-- Место под фото Hero (16:10): ${h.esc(p.note)}, docs/specs/ПРОМПТЫ_HERO_ОТРАСЛИ.md. alt будущего фото: «${h.esc(p.alt)}» -->
        <figure class="ph mhero__ph reveal" style="--ar:16/10;--i:2">
          <img class="ph__robot" src="assets/robots/${p.robot}" alt="" width="${p.w}" height="${p.h}">
          <figcaption class="ph__lbl mono"${mPh.attr}>${mPh.text}</figcaption>
        </figure>`}
      </div>
    </section>`;
};

// ───────── Problems: figure-led cards ─────────
const problems = (ind, n, h) => `<section class="sol-sec wrap" id="problems" data-sec="${n}"${h.dn(ind, 'problems')} aria-labelledby="problems-h">
      ${h.secHead(n, h.secName(ind, 'problems'), h.head(ind, 'problems'), null, 'problems-h')}
      <ol class="mprobs">
        ${ind.problems.map((p, i) => `<li class="mprob${p.href ? ' mprob--law' : ''} reveal" style="--i:${i + 1}">
          <p class="mprob__fig"><b class="tnum"${h.TN(h.dk(p, 'fig'), p.fig)}>${h.esc(p.fig)}</b>${p.unit ? `<span${h.T(p, 'unit')}>${h.esc(p.unit)}</span>` : ''}</p>
          <h3${h.T(p, 'title')}>${h.esc(p.title)}</h3>
          <p class="mprob__t"><span${h.T(p, 'text')}>${h.esc(p.text)}</span>${p.href ? ` <a href="${p.href}"${h.L('problems.howToBuy')}>Как это купить ↓</a>` : ''}</p>
          ${p.src ? srcLine(h, p.src) : ''}
        </li>`).join('\n        ')}
      </ol>
    </section>`;

// ───────── Directions: rows with a zone glyph from the hero plan ─────────
const GLYPH = {
  streets: '<path class="g-alley" d="M8 56C20 40 30 34 32 22S44 8 56 6"/><path class="g-alley-in" d="M8 56C20 40 30 34 32 22S44 8 56 6"/>',
  winter: '<circle class="g-plaza" cx="32" cy="32" r="22"/><path class="g-flake" d="M32 20v24M21.6 26l20.8 12M21.6 38l20.8-12"/>',
  lawns: '<rect class="g-lawn" x="6" y="6" width="52" height="34" rx="4"/><path class="g-hatch" d="M10 36 22 10M20 36 32 10M30 36 42 10M40 36 52 10"/><path class="g-slope" d="M6 56l8-12 8 12 8-12 8 12 8-12 8 12 6-9"/>',
  parking: '<rect class="g-park" x="6" y="10" width="52" height="44" rx="5"/><path class="g-stall" d="M16 14v14M26 14v14M36 14v14M46 14v14M16 36v14M26 36v14M36 36v14M46 36v14"/>',
};

const directions = (ind, n, h) => `<section class="sol-sec wrap" id="directions" data-sec="${n}"${h.dn(ind, 'directions')} aria-labelledby="directions-h">
      ${h.secHead(n, h.secName(ind, 'directions'), h.head(ind, 'directions'), h.lt('directions.lead', 'Каждой зоне на схеме — своя техника. Где техника пока экспериментальная или управляется с пульта, так и пишем.'), 'directions-h')}
      <div class="mdirs">
        ${ind.directions.map((d, i) => `<article class="mdir reveal" id="${d.anchor}" style="--i:${i}">
          <div class="mdir__l">
            <svg class="mdir__g" viewBox="0 0 64 64" aria-hidden="true">${GLYPH[d.anchor]}</svg>
            <span class="mdir__no mono tnum">${h.pad(i + 1)} · <bdi${h.T(d, 'zone')}>${h.esc(d.zone)}</bdi></span>
            <h3${h.T(d, 'title')}>${h.esc(d.title)}</h3>
          </div>
          <div class="mdir__r">
            <p class="mdir__t"${h.T(d, 'text')}>${h.esc(d.text)}</p>
            <p class="drow__items">${h.itemsList(d.items)}</p>
            ${d.facts.length ? `<ul class="mdir__facts">
              ${d.facts.map((f) => `<li><p><span${h.T(f, 'text')}>${h.esc(f.text)}</span>${f.href ? ` <a href="${f.href}"${h.L('directions.see')}>Смотреть ↓</a>` : ''}</p>${f.src ? srcLine(h, f.src) : ''}</li>`).join('\n              ')}
            </ul>` : ''}
            ${h.solLink(d.solution)}
          </div>
        </article>`).join('\n        ')}
      </div>
    </section>`;

// ───────── Signature: how a budget customer buys ─────────
// TODO(legal): формулировки блока согласовать с юристом (применение ПП № 1875, код ОКПД2, закупка услуги вместо техники,
//   кто из покупателей работает по 44-ФЗ, 223-ФЗ или без них).
const procurement = (ind, n, h) => `<section class="sol-sec wrap" id="procurement" data-sec="${n}"${h.dn(ind, 'procurement')} aria-labelledby="procurement-h">
      ${h.secHead(n, h.secName(ind, 'procurement'), h.lt('procurement.title', 'Сначала закон о закупках, потом модель робота.'), h.lt('procurement.lead', 'Муниципальные службы покупают по 44-ФЗ и 223-ФЗ. От того, как вы закупаете, зависит, какую технику вообще можно рассматривать.'), 'procurement-h')}
      <div class="mbuy">
        <article class="mbuy__doc reveal" aria-labelledby="mbuy-doc-h">
          <div class="mbuy__doc-l">
            <span class="mono"${h.L('procurement.doc.kicker')}>Национальный режим в госзакупках</span>
            <h3 id="mbuy-doc-h"${h.L('procurement.doc.title')}>«Средства транспортные для коммунального хозяйства и содержания дорог».</h3>
            <dl class="mbuy__req">
              <div><dt${h.L('procurement.doc.document')}>Документ</dt><dd${h.L('procurement.doc.documentValue')}>ПП РФ № 1875 от 23.12.2024</dd></div>
              <div><dt${h.L('procurement.doc.list')}>Перечень</dt><dd${h.L('procurement.doc.listValue')}>Приложение 1 — запрет закупки иностранных товаров</dd></div>
              <div><dt${h.L('procurement.doc.okpd')}>Код ОКПД2</dt><dd class="tnum">29.10.59.130</dd></div>
              <div><dt${h.L('procurement.doc.law223')}>По 223-ФЗ</dt><dd${h.L('procurement.doc.law223Value')}>минимальная доля российских товаров — 90% (Приложение 3, п. 197)</dd></div>
            </dl>
            ${srcLine(h, SRC.pp1875)}
          </div>
          <p class="mbuy__stamp" aria-hidden="true"><span class="mono"${h.L('procurement.stamp.label')}>Позиция</span><b class="tnum"${h.L('procurement.stamp.value')}>п. 98</b></p>
        </article>

        <div class="mbuy__fork">
          <p class="mbuy__root reveal"><span class="mono tnum">00</span><b${h.L('procurement.root.title')}>Обследование территории и ТЗ</b><span${h.L('procurement.root.text')}>Площади, покрытия, сезонные работы — и как вы закупаете.</span></p>
          <div class="mbuy__ways">
            <article class="mbuy__way reveal" style="--i:1">
              <span class="mono"${h.L('procurement.routeA.label')}>Маршрут А</span>
              <h3${h.L('procurement.routeA.title')}>Покупаете технику.</h3>
              <ol>
                <li${h.L('procurement.routeA.steps.0')}>Код ОКПД2 определяет заказчик — по документам производителя.</li>
                <li${h.L('procurement.routeA.steps.1')}>Если робот закупается под кодом из п. 98, иностранную машину купить нельзя.</li>
                <li${h.L('procurement.routeA.steps.2')}>Значит, российский производитель — или маршрут Б.</li>
              </ol>
              <a class="drow__sol" href="#vendors"${h.L('procurement.routeA.link')}>Производители ↓</a>
            </article>
            <article class="mbuy__way mbuy__way--svc reveal" style="--i:2">
              <span class="mono"${h.L('procurement.routeB.label')}>Маршрут Б</span>
              <h3${h.L('procurement.routeB.title')}>Покупаете уборку.</h3>
              <ol>
                <li${h.L('procurement.routeB.steps.0')}>Предмет закупки — содержание территории: площади, регламент, качество.</li>
                <li${h.L('procurement.routeB.steps.1')}>Подрядчик сам владеет роботами, обслуживает их и отвечает за результат.</li>
                <li${h.L('procurement.routeB.steps.2')}>Удобно для пилота и сезонных работ: платите за убранную территорию, а не за машину.</li>
              </ol>
              <a class="drow__sol" href="#talk"${h.L('procurement.routeB.link')}>Обсудить уборку как услугу ↓</a>
            </article>
          </div>
        </div>

        <div class="mbuy__notes">
          <aside class="mbuy__note reveal"${h.TA(['aria-label', h.pk('procurement.notes.legal.label')])} aria-label="Оговорка">${h.icon('shield')}<p${h.LH('procurement.notes.legal.text')}><b>Это не юридическая консультация.</b> Под какой код ОКПД2 попадает конкретный робот, определяет заказчик по документам производителя. Для компактных роботов это может быть и другой код. Перед закупкой сверьте актуальную редакцию постановления с юристом.</p></aside>
          <aside class="mbuy__note reveal" style="--i:1"${h.TA(['aria-label', h.pk('procurement.notes.sidewalks.label')])} aria-label="Тротуары">${h.icon('map')}<p${h.LH('procurement.notes.sidewalks.text')}><b>Тротуары.</b> Экспериментальный режим для роботов на тротуарах (ПП РФ № 1247 от 30.09.2026) написан под роботов-доставщиков. Распространяется ли он на уборочных роботов, из открытых источников не следует. В парках робот работает на территории заказчика.</p></aside>
        </div>
      </div>
    </section>`;

export default { industry, renderers: { hero, problems, directions, procurement }, data: { sources: SRC } };
