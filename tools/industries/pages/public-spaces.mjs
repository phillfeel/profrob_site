// Industry landing «Общественные пространства»: transport hubs (stations, airports), museums and exhibition centres,
// MFC and public offices, concert venues. Parks and streets live on the municipal page.
// Facts: docs/research/2026-10-06-empty-industries-research.md, sections 2, 5, 10.
// Own hero («табло»: a departure-board styled list of robot jobs) and own signature block («Между волнами пассажиров»:
// an illustrative daily passenger flow with cleaning windows between peaks), plus a «где уже работает» proof block
// with other companies' deployments. Styles: industry-public-spaces.css, script: industry-public-spaces.js.
import { existsSync } from 'node:fs';

// Real hero photo from assets/industry_hero/<slug>.webp, if it has been added; otherwise the robot placeholder.
const heroPhoto = (slug) => (existsSync(new URL(`../../../assets/industry_hero/${slug}.webp`, import.meta.url))
  ? `assets/industry_hero/${slug}.webp` : null);

const SOL = {
  cleaning: { label: 'Роботизированный клининг', href: '/solutions/cleaning/' },
  service: { label: 'Сервисные роботы', href: '/solutions/service-robots/' },
  security: { label: 'Роботы безопасности', href: '/solutions/security/' },
};

// Departure-board rows in the hero: object → what the robot does → mode. Each row leads to its direction.
const BOARD = [
  { zone: 'Залы ожидания', task: 'Влажная уборка пола в окнах между поездами', mode: 'Между пиками', anchor: 'halls' },
  { zone: 'Терминалы и переходы', task: 'Мойка больших площадей, пока людей мало', mode: 'Ночью', anchor: 'halls' },
  { zone: 'Вестибюли МФЦ и музеев', task: 'Подсказывает дорогу и отвечает на типовые вопросы', mode: 'В часы работы', anchor: 'wayfinding' },
  { zone: 'Периметр и паркинг', task: 'Объезжает маршрут и сообщает дежурному', mode: 'Круглосуточно', anchor: 'patrol' },
];

// Signature block: an ILLUSTRATIVE passenger flow (share of the daily peak, hour 0…24). Not measured data —
// the page says so next to the chart. Cleaning windows sit in the troughs.
const FLOW = [12, 8, 5, 4, 6, 14, 34, 68, 92, 80, 52, 38, 42, 47, 40, 44, 58, 80, 96, 84, 60, 40, 28, 19, 12];
const WINDOWS = [
  { from: 0.5, to: 5.5, title: 'Ночная мойка', text: 'Основная влажная уборка залов и переходов, пока поток минимальный.' },
  { from: 10.5, to: 12.5, title: 'После утренней волны', text: 'Проход по залам ожидания после пригородных поездов.' },
  { from: 14, to: 15.75, title: 'Дневной провал', text: 'Точечная мойка у входов и касс, где натоптали за день.' },
  { from: 21.25, to: 23.75, title: 'После вечерней волны', text: 'Повторная уборка до ночного режима.' },
];
const PEAKS = [{ at: 8, label: 'Утренний пик' }, { at: 18, label: 'Вечерний пик' }];

// Other companies' deployments (not PROFROBOT's) — wording says «работают», not «мы внедрили».
// Competitors (Russian makers we do not work with) are not named.
const PROOF = {
  main: {
    place: 'Вокзалы РЖД',
    stations: ['Казанский', 'Ярославский', 'Курский', 'Павелецкий', 'Киевский', 'Московский (Санкт-Петербург)'],
    value: '1 980',
    unit: 'м²/ч',
    text: 'Автономные роботы-уборщики подметают и моют залы, сами строят карту помещений и фиксируют степень загрязнения. Производительность — до 1 980 м² в час. Модель и число роботов РЖД не называли.',
  },
  more: [
    {
      place: 'Аэропорт Пулково',
      text: 'Роботы-уборщики с лидарами и камерами в залах регистрации и прилёта.',
      value: '5 000 м²', valueNote: 'на одном заряде',
    },
  ],
};

const industry = {
  slug: 'public-spaces',
  name: 'Общественные пространства',
  tier: 3, // TODO(client): tier по стратегии не задан; у отрасли сильные доказательства (РЖД), можно поднять до 2.
  title: 'Роботы для вокзалов, аэропортов, музеев и МФЦ | ПРОФРОБОТ',
  description: 'Роботы-уборщики для залов ожидания, терминалов и переходов, сервисные роботы для навигации в МФЦ и музеях, патрульные роботы. Уборка ночью и между пиками потока. Аудит объекта.',
  h1: ['Роботы для вокзалов,', 'аэропортов и МФЦ.'],
  lead: 'Залы ожидания и терминалы работают почти круглые сутки, а люди идут волнами — по расписанию поездов и рейсов. Огромную площадь нужно убирать так, чтобы не мешать пассажирам.',
  lead2: 'Робот моет пол ночью и в провалах между пиками, а люди берут на себя санузлы, точечные загрязнения и посетителей. На шести вокзалах РЖД роботы-уборщики уже работают.',
  audiences: ['операторы вокзалов и аэропортов', 'музеи и выставочные комплексы', 'МФЦ и госучреждения', 'концертные площадки'],
  photo: { robot: 'robot-cleaning.webp', w: 964, h: 1026, note: 'Промпт 8 — поломоечный робот в зале ожидания вокзала, поток людей', alt: 'Поломоечный робот моет мраморный пол в зале ожидания вокзала, мимо идут пассажиры с чемоданами' },
  primaryCta: { label: 'Заказать аудит объекта', href: '#talk' },
  secondaryCta: { label: 'Где роботы уже работают', href: '#proof' },
  heads: {
    problems: 'Почему залы трудно держать в чистоте.',
    directions: 'Что роботизируем.',
    results: 'Что получает оператор объекта.',
  },
  secNames: { flow: 'ПОТОК', proof: 'ГДЕ РАБОТАЕТ' },
  problems: [
    { icon: 'map', title: 'Огромные площади', text: 'Залы ожидания, терминалы и переходы огромны, а поток людей не прекращается почти круглые сутки.' },
    { icon: 'clock', title: 'Пики по расписанию', text: 'Поезда и рейсы приводят людей волнами. В пик уборщик с машиной мешает пассажирам, а после пика грязи больше всего.' },
    { icon: 'eye', title: 'Одни и те же вопросы', text: 'Где выход к поездам, какое окно, куда пройти на выставку — персонал тратит смену на типовые ответы.' },
  ],
  // Background fact for the staffing card (research, section 2). Both figures are [Ф].
  staffing: {
    value: '> 80%',
    text: 'персонала клининга в России — иностранные граждане. А регионы ужесточают наём мигрантов: в 2025 году дополнительные ограничения ввели в 11 регионах.',
  },
  directions: [
    {
      anchor: 'halls', title: 'Уборка залов ожидания, терминалов, переходов',
      text: 'Поломоечные роботы моют большие площади ночью и в окна между пиками потока. Сами строят карту зала и объезжают людей.',
      items: ['роботы-уборщики для вокзалов', 'роботы-уборщики для аэропортов', 'поломоечные роботы', 'уборка залов ожидания', 'уборка терминалов и переходов'],
      solution: SOL.cleaning,
      status: 'Есть внедрения в России', proven: true,
    },
    {
      anchor: 'wayfinding', title: 'Навигация и информирование посетителей',
      text: 'Сервисные роботы и гуманоиды в вестибюлях: подсказывают дорогу, отвечают на типовые вопросы, встречают гостей выставки.',
      items: ['робот-навигатор', 'робот-консультант для МФЦ', 'робот-гид для музея', 'гуманоидные роботы'],
      solution: SOL.service,
      status: 'Дополнительный сценарий',
    },
    {
      anchor: 'patrol', title: 'Патрулирование',
      text: 'Робот безопасности объезжает периметр, паркинг или пустые залы ночью по заданному маршруту и передаёт сигнал дежурному.',
      items: ['патрульные роботы', 'роботы безопасности', 'ночной обход'],
      solution: SOL.security,
      status: 'Российских кейсов на транспорте пока нет',
    },
  ],
  results: [
    'Залы чистые к пику: уборка идёт ночью и в провалах потока.',
    'Люди переходят на санузлы, точечные загрязнения и работу с посетителями.',
    'Меньше зависимости от найма в клининге, где рук не хватает.',
    'Карта уборки и отчёт по зонам — видно, что и когда убрано.',
  ],
  vendors: [
    { group: 'Уборка залов и терминалов', brands: ['gausium', 'pudu', 'orionstar', 'lionsbot'] },
    { group: 'Навигация и информирование', brands: ['orionstar', 'ubtech', 'keenon', 'pudu'] },
  ],
  vendorsLead: 'Технику подбираем под площадь, покрытие пола и режим объекта, без привязки к одному вендору.',
  why: {
    title: 'Сначала поток, потом робот.',
    text: 'Прежде чем ставить робота, смотрим, когда и где идут люди, и под это составляем расписание уборки. Технику берём у нескольких производителей и обслуживаем по SLA по всей России.',
    link: { label: 'Аудит объекта', href: '/services/audit/' },
  },
  form: {
    title: 'Найдём окна для уборки на вашем объекте.',
    lead: 'Посмотрим залы и поток людей, предложим технику и расписание работы робота.',
    button: 'Заказать аудит',
  },
  // TODO(client): адреса страниц /industries/<slug>/ на проде; здесь — целевые URL, как у остальных ссылок.
  links: [
    { kicker: 'РЕШЕНИЕ', title: 'Роботизированный клининг', text: 'Поломоечные роботы для больших площадей.', href: SOL.cleaning.href },
    { kicker: 'РЕШЕНИЕ', title: 'Сервисные роботы', text: 'Навигация и ответы посетителям.', href: SOL.service.href },
    { kicker: 'РЕШЕНИЕ', title: 'Роботы безопасности', text: 'Патрулирование периметра и паркингов.', href: SOL.security.href },
    { kicker: 'ПРОДУКТ', title: 'Аренда роботов (RaaS)', text: 'Уборка как услуга, без покупки техники.', href: 'products.html#raas' },
    { kicker: 'ПРОДУКТ', title: 'Cleaning Operations Platform', text: 'Управление уборкой и отчёты в одном окне.', href: 'products.html#platform' },
    { kicker: 'ОТРАСЛЬ', title: 'Муниципальные службы', text: 'Парки и улицы — там.', href: '/industries/municipal/' },
    { kicker: 'КЕЙСЫ', title: 'Кейсы: общественные пространства', text: 'Внедрения на вокзалах и в аэропортах.', href: '/cases/?industry=public-spaces' },
    { kicker: 'ОТРАСЛИ', title: 'Все отрасли', text: 'Все 11 отраслевых страниц.', href: '/industries/' },
  ],
  sections: ['hero', 'problems', 'flow', 'directions', 'proof', 'results', 'vendors', 'why', 'form', 'see'],
};

// ───────── renderers ─────────

const hero = (ind, n, h) => {
  const rows = BOARD.map((r, i) => `<li class="psb__row" style="--r:${i}">
                <a href="#${r.anchor}">
                  <span class="psb__no tnum">${h.pad(i + 1)}</span>
                  <span class="psb__zone"${h.T(r, 'zone')}>${h.esc(r.zone)}</span>
                  <span class="psb__task"${h.T(r, 'task')}>${h.esc(r.task)}</span>
                  <span class="psb__mode"${h.T(r, 'mode')}>${h.esc(r.mode)}</span>
                  <span class="psb__go">${h.ARROW_R}</span>
                </a>
              </li>`).join('\n              ');
  const p = ind.photo;
  const mPh = h.msg('industries.common.photo.placeholder', { ratio: '4:3' });
  return `<section class="ih ih--board wrap" data-sec="${n}"${h.dnName(ind)}>
      <div class="ih__grid">
        <div class="ih__copy">
          ${h.heroCopy(ind, n)}
        </div>
        <div class="psh__media">
          ${heroPhoto(ind.slug) ? `<figure class="ph ph--photo psh__ph reveal" style="--ar:4/3;--i:1">
            <img class="ph__img" src="${heroPhoto(ind.slug)}" alt="${h.esc(p.alt)}"${h.TA(['alt', h.dk(p, 'alt')])} width="1536" height="1024" decoding="async">
          </figure>` : `<!-- Место под фото Hero (4:3): ${h.esc(p.note)}, docs/specs/ПРОМПТЫ_HERO_ОТРАСЛИ.md. alt будущего фото: «${h.esc(p.alt)}» -->
          <figure class="ph psh__ph reveal" style="--ar:4/3;--i:1">
            <img class="ph__robot" src="assets/robots/${p.robot}" alt="" width="${p.w}" height="${p.h}">
            <figcaption class="ph__lbl mono"${mPh.attr}>${mPh.text}</figcaption>
          </figure>`}
          <div class="psb reveal" style="--i:2">
            <div class="psb__head">
              <span${h.L('hero.board.title')}>Роботы на смене</span>
              <span class="psb__clock tnum" data-ps-clock aria-hidden="true">--<i>:</i>--</span>
            </div>
            <div class="psb__cols" aria-hidden="true"><span>№</span><span${h.L('hero.board.cols.zone')}>Зона · что делает робот</span><span class="psb__cm"${h.L('hero.board.cols.mode')}>Режим</span></div>
            <ol class="psb__list"${h.TA(['aria-label', h.pk('hero.board.listLabel')])} aria-label="Сценарии работы роботов по зонам">
              ${rows}
            </ol>
          </div>
          <p class="psb__note"${h.L('hero.board.note')}>Сценарии примерные. Режим работы составляем на аудите объекта.</p>
        </div>
      </div>
    </section>`;
};

const problems = (ind, n, h) => {
  const s = ind.staffing;
  const items = ind.problems.map((p, i) => `<li class="psp__i reveal" style="--i:${i + 1}">
          <span class="ic-tile">${h.icon(p.icon)}</span>
          <h3${h.T(p, 'title')}>${h.esc(p.title)}</h3>
          <p${h.T(p, 'text')}>${h.esc(p.text)}</p>
        </li>`).join('\n        ');
  return `<section class="sol-sec wrap" id="problems" data-sec="${n}"${h.dn(ind, 'problems')} aria-labelledby="problems-h">
      ${h.secHead(n, h.secName(ind, 'problems'), h.head(ind, 'problems'), null, 'problems-h')}
      <div class="psp">
        <div class="psp__fact reveal">
          <span class="ic-tile">${h.icon('people')}</span>
          <h3${h.L('problems.staffingTitle')}>Рук не хватает</h3>
          <p class="psp__v tnum"${h.TN(h.dk(s, 'value'), s.value)}>${h.esc(s.value)}</p>
          <p${h.T(s, 'text')}>${h.esc(s.text)}</p>
        </div>
        <ol class="psp__list">
        ${items}
        </ol>
      </div>
    </section>`;
};

// Catmull-Rom → cubic Bézier through the hourly points, in a 0..1000 × 0..300 box.
const W = 1000, HGT = 300, TOP = 24;
const xAt = (hr) => (hr / 24) * W;
const yAt = (v) => HGT - (v / 100) * (HGT - TOP);
const smooth = (pts) => {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((v) => v.toFixed(1)).join(',')} ${c2.map((v) => v.toFixed(1)).join(',')} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
};

const fmtH = (hr, h) => `${h.pad(Math.floor(hr) % 24)}:${h.pad(Math.round((hr % 1) * 60))}`;

const flow = (ind, n, h) => {
  const pts = FLOW.map((v, i) => [xAt(i), yAt(v)]);
  const line = smooth(pts);
  const area = `${line} L${W},${HGT} L0,${HGT} Z`;
  const bands = WINDOWS.map((w, i) => `<rect class="psf__band" style="--i:${i}" x="${xAt(w.from).toFixed(1)}" y="0" width="${(xAt(w.to) - xAt(w.from)).toFixed(1)}" height="${HGT}"/>`).join('');
  const grid = [6, 12, 18].map((hr) => `<line class="psf__grid" x1="${xAt(hr)}" x2="${xAt(hr)}" y1="0" y2="${HGT}"/>`).join('');
  const marks = WINDOWS.map((w, i) => `<span class="psf__mark tnum" style="--at:${(w.from + w.to) / 2}">${i + 1}</span>`).join('');
  const peaks = PEAKS.map((p) => `<span class="psf__peak" style="--at:${p.at}"${h.T(p, 'label')}>${h.esc(p.label)}</span>`).join('');
  const ticks = [0, 6, 12, 18, 24].map((hr) => `<span style="--at:${hr}">${h.pad(hr)}:00</span>`).join('');
  const legend = WINDOWS.map((w, i) => `<li class="reveal" style="--i:${i}">
            <span class="psf__lno tnum">${i + 1}</span>
            <span class="psf__lt tnum">${fmtH(w.from, h)}–${fmtH(w.to, h)}</span>
            <b${h.T(w, 'title')}>${h.esc(w.title)}</b>
            <span class="psf__lx"${h.T(w, 'text')}>${h.esc(w.text)}</span>
          </li>`).join('\n          ');
  const desc = `Условный график пассажиропотока за сутки: утренний пик около 8 часов, вечерний около 18 часов. Окна уборки: ${WINDOWS.map((w) => `${fmtH(w.from, h)}–${fmtH(w.to, h)} ${w.title.toLowerCase()}`).join('; ')}.`;
  return `<section class="sol-sec wrap" id="flow" data-sec="${n}"${h.dn(ind, 'flow')} aria-labelledby="flow-h">
      <div class="psf">
        <div class="psf__head">
          ${h.idx(n, h.secName(ind, 'flow'))}
          <h2 class="h2 reveal" id="flow-h"${h.L('flow.title')}>Между волнами пассажиров.</h2>
          <p class="lead reveal"${h.L('flow.lead')}>Поток людей идёт волнами. Робот моет залы ночью и в провалах между пиками: не мешает пассажирам и не ездит по мокрому полу в толпе.</p>
        </div>
        <figure class="psf__fig reveal" data-ps-flow>
          <div class="psf__chart">
            <div class="psf__peaks" aria-hidden="true">${peaks}</div>
            <svg class="psf__svg" viewBox="0 0 ${W} ${HGT}" preserveAspectRatio="none" role="img" aria-labelledby="flow-svg-t">
              <title id="flow-svg-t"${h.L('flow.chartDescription')}>${h.esc(desc)}</title>
              ${grid}${bands}
              <path class="psf__area" d="${area}"/>
              <path class="psf__line" d="${line}"/>
            </svg>
            <div class="psf__marks" aria-hidden="true">${marks}</div>
            <div class="psf__now" data-ps-now hidden><span class="tnum"><bdi${h.L('flow.now')}>Сейчас</bdi> <b data-ps-now-t></b></span></div>
          </div>
          <div class="psf__scale" aria-hidden="true">${ticks}</div>
          <figcaption class="psf__cap"><span class="psf__key psf__key--flow"></span><bdi${h.L('flow.legend.flow')}>поток людей</bdi> <span class="psf__key psf__key--win"></span><bdi${h.L('flow.legend.window')}>окно уборки</bdi> <span class="psf__sep">·</span> <bdi${h.L('flow.legend.note')}>Условный график: форма потока показана для примера. Часы пиков на вашем объекте снимаем на аудите и по ним составляем расписание робота.</bdi></figcaption>
        </figure>
        <ol class="psf__legend">
          ${legend}
        </ol>
        <a class="drow__sol psf__to" href="#halls"${h.L('flow.toDirection')}>Направление: уборка залов ожидания, терминалов, переходов ↓</a>
      </div>
    </section>`;
};

const directions = (ind, n, h) => `<section class="sol-sec wrap" id="directions" data-sec="${n}"${h.dn(ind, 'directions')} aria-labelledby="directions-h">
      ${h.secHead(n, h.secName(ind, 'directions'), h.head(ind, 'directions'), h.lt('directions.lead', 'Вокзалы, аэропорты, музеи, выставочные центры, МФЦ и концертные площадки. Парки и улицы — на странице «Муниципальные службы».'), 'directions-h')}
      <div class="drows">
        ${ind.directions.map((d, i) => `<article class="drow psd reveal" id="${d.anchor}" style="--i:${i}">
          <div class="drow__l">
            <span class="drow__no mono">${h.pad(i + 1)}</span>
            <h3${h.T(d, 'title')}>${h.esc(d.title)}</h3>
            <p${h.T(d, 'text')}>${h.esc(d.text)}</p>
          </div>
          <div class="drow__r">
            <span class="psd__st mono${d.proven ? ' psd__st--on' : ''}"${h.T(d, 'status')}>${h.esc(d.status)}</span>
            <p class="drow__items">${h.itemsList(d.items)}</p>
            ${h.solLink(d.solution)}
          </div>
        </article>`).join('\n        ')}
      </div>
      <p class="psd__more"><span${h.L('directions.more')}>Ищете уборку парков и улиц?</span> <a class="text-link" href="/industries/municipal/"><span${h.K('industries.municipal.name')}>Муниципальные службы</span> ${h.ARROW_R}</a></p>
    </section>`;

const proof = (ind, n, h) => {
  const m = PROOF.main;
  const more = PROOF.more.map((c, i) => `<li class="psw__i reveal" style="--i:${i + 1}">
            <h3${h.T(c, 'place')}>${h.esc(c.place)}</h3>
            ${c.value ? `<p class="psw__v"><b class="tnum"${h.T(c, 'value')}>${h.esc(c.value)}</b> <bdi${h.T(c, 'valueNote')}>${h.esc(c.valueNote)}</bdi></p>` : ''}
            <p${h.T(c, 'text')}>${h.esc(c.text)}</p>
          </li>`).join('\n          ');
  // «1 980»: the gap between the groups of digits is an element, so the message is the number {n}, formatted per language
  const mValue = h.msg('industries.publicSpaces.proof.main.value', { n: Number(m.value.replace(/\s/g, '')) });
  return `<section class="sol-sec wrap" id="proof" data-sec="${n}"${h.dn(ind, 'proof')} aria-labelledby="proof-h">
      ${h.secHead(n, h.secName(ind, 'proof'), h.lt('proof.title', 'Роботы-уборщики уже работают на вокзалах и в аэропортах.'), h.lt('proof.lead', 'Это внедрения других компаний, не ПРОФРОБОТ. Показываем их, чтобы было видно: техника справляется с залами и потоком людей.'), 'proof-h')}
      <div class="psw">
        <article class="psw__main reveal">
          <div class="psw__mhead">
            <h3${h.T(m, 'place')}>${h.esc(m.place)}</h3>
            <ul class="psw__st"${h.TA(['aria-label', h.pk('proof.stationsLabel')])} aria-label="Вокзалы">${m.stations.map((s, i) => `<li${h.T(m.stations, i)}>${h.esc(s)}</li>`).join('')}</ul>
          </div>
          <p class="psw__big"><span class="psw__upto"${h.L('proof.upTo')}>до</span><b${mValue.attr}>${m.value.split(' ').map(h.esc).join('<span class="psw__gap"></span>')}</b><span class="psw__unit"${h.T(m, 'unit')}>${m.unit}</span></p>
          <p class="psw__txt"${h.T(m, 'text')}>${h.esc(m.text)}</p>
        </article>
        <ul class="psw__more">
          ${more}
        </ul>
      </div>
    </section>`;
};

export default {
  industry,
  renderers: { hero, problems, flow, directions, proof },
  data: { board: BOARD, windows: WINDOWS, peaks: PEAKS, proof: PROOF },
  templates: { 'industries.publicSpaces.proof.main.value': '{n, number}' },
};
