// Industry landing «Торговые центры и ритейл» (/industries/retail/).
// Facts: docs/research/2026-10-06-empty-industries-research.md, sections 2 and 4 (+ 1, 9, 10). Every figure on
// the page carries its source next to it. Build: node tools/industries/build.mjs --only retail
//
// Own blocks:
//   hero      — «proof first»: the Moscow pilot (26 malls, 1.1M m²) as a shelf price tag next to the H1 and photo;
//   problems  — fact tiles, each figure with its source;
//   frequency — signature: how many times a day a store is cleaned (passes per day by zone) + Perekrestok resources;
//   case      — three receipt-like cards (Giper Lenta, Perekrestok, Moscow pilot), no photos;
// Competitors (other integrators, Russian makers we do not work with) are not named: figures from them are signed
// «по данным участников проекта».
//   economy   — the shared mini calculator markup (industry.js drives it), preset to «ТЦ».

const SOL = {
  cleaning: { label: 'Роботизированный клининг', href: 'solutions.html#dir-cleaning' },
  service: { label: 'Сервисные роботы', href: 'solutions.html#dir-service-robots' },
  warehouse: { label: 'Складская роботизация', href: 'solutions.html#dir-warehouse' },
};

const industry = {
  slug: 'retail',
  name: 'Торговые центры и ритейл',
  // Tier 2: the strongest evidence of the six new industries (official pilot + named retail cases) and the only one
  // with its own search demand («робот уборщик для торговых центров» — 99), see research sections 1, 4, 9.
  tier: 2,
  title: 'Робот-уборщик для торговых центров и магазинов | Профессиональная Робототехника',
  description: 'Робот-уборщик для торговых центров, супермаркетов и гипермаркетов: уборка галерей, торгового зала и паркингов, промо-роботы. Кейсы «Ленты» и «Перекрёстка», пилот в 26 ТЦ Москвы.',
  h1: ['Робот-уборщик', 'для торговых центров', 'и магазинов.'],
  lead: 'Робот-уборщик для торговых центров моет галереи, торговый зал и паркинг по расписанию: ночью до открытия и днём между покупателями.',
  lead2: 'Уборщики остаются там, где нужны руки: санузлы, фудкорт, разлитое у кассы. Повторные проходы по большим площадям берёт робот.',
  audiences: ['УК торговых центров и ТРЦ', 'продуктовые сети и гипермаркеты', 'DIY и fashion-ритейл'],
  photo: { robot: 'robot-cleaning.webp', w: 964, h: 1026, note: 'Промпт 7 — галерея ТЦ ранним утром до открытия', alt: 'Поломоечный робот моет центральную галерею торгового центра ранним утром, роллеты магазинов ещё опущены' },
  primaryCta: { label: 'Обсудить пилот в ТЦ', href: '#talk' },
  secondaryCta: { label: 'Посчитать окупаемость', href: '#economy' },

  problems: [
    { fig: '> 80%', title: 'Клининг держится на мигрантах.', text: 'Больше 80% персонала клининга — иностранцы. В 2025 году 11 регионов ввели дополнительные ограничения на их наём.', },
    { fig: '×2–3', title: 'Фонд оплаты растёт.', text: 'За пять лет ФОТ клининговых компаний вырос в два-три раза. Это уходит в цену договора на уборку.', },
    { fig: '15%', title: 'Не хватает линейного персонала.', text: '15% ритейлеров называют нехватку линейного персонала главной причиной модернизации.', },
    { icon: 'moon', title: 'Большая площадь, короткое окно.', text: 'Галереи, зал и паркинг нужно отмыть до открытия, а днём убирать так, чтобы не мешать покупателям.' },
  ],

  directions: [
    { anchor: 'sales-floor', title: 'Уборка торгового зала и галерей', text: 'Поломоечные роботы моют галереи ТЦ и торговый зал ночью до открытия, а днём делают повторные проходы между покупателями.', items: ['поломоечные роботы', 'ночная уборка галерей', 'дневные проходы по залу', 'зоны у входов и касс'], solution: SOL.cleaning },
    { anchor: 'parking', title: 'Уборка паркингов', text: 'Подметальные и поломоечные роботы для крытых и подземных паркингов. В московском пилоте роботы убирают не только помещения ТЦ, но и паркинги.', items: ['подметальные роботы', 'крытые и подземные паркинги', 'ночная смена без оператора на машине'], solution: SOL.cleaning },
    { anchor: 'promo', title: 'Промо и навигация в зале', text: 'Сервисный робот с рекламным экраном возит промо по залу и подсказывает дорогу. BellaBot так работает в двух магазинах «Перекрёстка»; по данным участников проекта, продажи отдельных товаров растут до 100%.', items: ['роботы с рекламным экраном', 'навигация покупателей', 'Pudu BellaBot, Keenon'], solution: SOL.service },
    { anchor: 'backstore', title: 'Склады и дарксторы', text: 'Сборка онлайн-заказов и движение товара за залом — это складская роботизация. О ней отдельная страница.', items: ['дарксторы', 'склады сетей', 'AMR и сортировка'], solution: SOL.warehouse },
  ],

  // Signature block. «Перекрёсток» in Retail.ru (2024): at least 2 cleanings a day, 5 in autumn and winter,
  // 5–10 in the fruit and vegetable zone. Words of market participants, not a regulation (research: [?] for «2»).
  frequency: [
    { zone: 'Торговый зал', when: 'обычный день', min: 2, max: 2, value: '2', note: 'минимум' },
    { zone: 'Торговый зал', when: 'осень и зима', min: 5, max: 5, value: '5', note: 'в сезон' },
    { zone: 'Овощи и фрукты', when: 'весь день', min: 5, max: 10, value: '5–10', note: 'по ситуации' },
  ],

  vendors: [
    { group: 'Уборка зала и галерей', brands: ['gausium', 'pudu', 'keenon', 'lionsbot'] },
    { group: 'Промо и навигация', brands: ['pudu', 'keenon'] },
    // TODO(client): пилот ФЦ БАС в 26 ТЦ Москвы идёт только на российских роботах. Если есть российский
    // производитель-партнёр, добавить его сюда; производителей, с которыми не работаем, не называем.
  ],
  vendorsLead: 'Подбираем технику под площадь, покрытие и график уборки, без привязки к одному бренду. Московский пилот в ТЦ идёт на российских роботах.',

  // TODO(client): на главной есть кейс «ТЦ — оптимизация уборки в ночное время». Какой объект, период, цифры,
  // можно ли раскрыть? Если да — добавить его первой карточкой в блок кейсов.
  cases: [
    { no: '01', kicker: 'Гипермаркеты · 2025', pre: '', value: '42', unit: 'робота-уборщика', title: '«Гипер Лента»: роботы в гипермаркетах по стране.',
      text: 'Волгоград, Нижний Новгород, Москва, Петербург и другие города. Начали с пилота: 10 роботов в 9 гипермаркетах, затем докупили 32. Экономия — на персонале и на отказе от аренды поломоечных машин.',
      quote: 'По данным пресс-службы «Ленты», штат клининга сократился на 30–40%.' },
    { no: '02', kicker: 'Супермаркеты · 2024', pre: '', value: '11', unit: 'супермаркетов', title: '«Перекрёсток»: Pudu CC1 в супермаркетах сети.',
      text: '9 магазинов в Москве, 1 в Петербурге, 1 в Сочи (на июнь 2024). Уход за роботом с док-станцией — 10–15 минут в день.',
      quote: 'Воды — 11 т в год на магазин против 73 т у ручной поломоечной машины, по данным участников проекта.' },
    { no: '03', kicker: 'Пилот Москвы · 2026', pre: 'более', value: '16 000', unit: 'м² за первую неделю', title: 'ЦДМ на Лубянке: первая неделя пилота.',
      text: 'Пилот ФЦ БАС при Департаменте предпринимательства и инноваций: 26 ТЦ, роботы четырёх российских производителей. Убирают помещения и паркинги.',
      quote: 'Пилот идёт несколько месяцев, потом сравнение с ручной уборкой. Итоги пока не опубликованы.' },
  ],

  // Calculator preset (roi-model.js, type «mall»). Shown with the label «Расчётный ориентир».
  estimate: { type: 'mall', area: 8000, mode: 'one', object: 'ТЦ, 8 000 м² убираемой площади, одна смена' },

  why: { title: 'Свой пилот — раньше городского.', text: 'Итоги московского пилота обещают после нескольких месяцев работы. Ждать их не обязательно: запустим робота на одной галерее или одном этаже вашего ТЦ и сравним с ручной уборкой на ваших цифрах.', link: { label: 'Пилотный проект', href: 'services.html#pilot' } },
  form: { title: 'Обсудим робота для вашего ТЦ или сети.', lead: 'Посмотрим планировку, зоны и график уборки. Предложим технику, режим работы и формат: покупка, аренда или уборка как услуга.', button: 'Обсудить пилот' },
  formStage: true,
  links: [
    { kicker: 'РЕШЕНИЕ', title: 'Роботизированный клининг', text: 'Поломоечные и подметальные роботы.', href: SOL.cleaning.href },
    { kicker: 'РЕШЕНИЕ', title: 'Сервисные роботы', text: 'Промо, навигация, доставка в зале.', href: SOL.service.href },
    { kicker: 'РЕШЕНИЕ', title: 'Складская роботизация', text: 'Дарксторы и склады сетей.', href: SOL.warehouse.href },
    { kicker: 'ПРОДУКТ', title: 'Платформа Профессиональная Робототехника', text: 'Уборка всех точек сети в одном окне.', href: 'products.html#platform' },
    { kicker: 'ПРОДУКТ', title: 'Аренда роботов (RaaS)', text: 'Без капзатрат, с обслуживанием.', href: 'products.html#raas' },
    { kicker: 'УСЛУГА', title: 'Пилотный проект', text: 'Одна галерея или один магазин.', href: 'services.html#pilot' },
    { kicker: 'КЕЙСЫ', title: 'Кейсы: ритейл', text: 'Внедрения в ТЦ и магазинах.', href: 'cases.html?industry=retail' },
    { kicker: 'ОТРАСЛИ', title: 'Все отрасли', text: 'Все 12 отраслевых страниц.', href: 'industries.html' },
  ],
  heads: { problems: 'Почему торговле нужен робот.', directions: 'Что роботизируем в ТЦ и магазине.', vendors: 'Оборудование и производители.' },
  secNames: { frequency: 'ЧАСТОТА УБОРКИ', case: 'КЕЙСЫ', economy: 'ЭКОНОМИКА' },
  sections: ['hero', 'problems', 'frequency', 'directions', 'case', 'economy', 'vendors', 'why', 'form', 'see'],
};

const renderers = {
  // ───────── Hero: proof first ─────────
  hero: (ind, n, h) => `<section class="ih rh wrap" data-sec="${n}"${h.dnName(ind)}>
      <div class="rh__grid">
        <div class="rh__l">
        <div class="rh__head">
          ${h.crumbs(ind)}
          ${h.idx(n, h.nameCaps(ind))}
          <h1 class="h1 rh__h1 reveal">${h.h1(ind)}</h1>
        </div>
        <div class="rh__body">
          <div class="ih__text reveal" style="--i:2">
            <p class="lead"${h.T(ind, 'lead')}>${h.esc(ind.lead)}</p>
            <p${h.T(ind, 'lead2')}>${h.esc(ind.lead2)}</p>
          </div>
          <div class="ih__cta reveal" style="--i:3">
            <a class="btn btn-pri" href="${ind.primaryCta.href}"${h.T(ind.primaryCta, 'label')}>${h.esc(ind.primaryCta.label)}</a>
            <a class="text-link" href="${ind.secondaryCta.href}"><span${h.T(ind.secondaryCta, 'label')}>${h.esc(ind.secondaryCta.label)}</span> ${h.ARROW_R}</a>
          </div>
          <p class="ih__aud reveal" style="--i:4">${h.audience(ind)}</p>
        </div>
        </div>
        <div class="rh__r">
        <aside class="proof reveal" style="--i:1" aria-labelledby="proof-h">
          <div class="proof__top mono"><span id="proof-h"${h.L('hero.proof.title')}>Пилот Москвы · 26 ТЦ</span><span${h.L('hero.proof.since')}>с 27.05.2026</span></div>
          <dl class="proof__nums">
            <div><dt${h.L('hero.proof.malls')}>торговых центров в пилоте</dt><dd class="tnum">26</dd></div>
            <div><dt${h.L('hero.proof.area')}>млн м² их площадей</dt><dd class="tnum"${h.LH('hero.proof.areaValue')}><small>более</small>1,1</dd></div>
          </dl>
          <p class="proof__status"><i aria-hidden="true"></i><span${h.LH('hero.proof.status')}><b>Пилот идёт.</b> Роботы российских производителей убирают торговые залы и паркинги, потом их сравнят с ручной уборкой. Итоги сравнения ещё не опубликованы.</span></p>
          <span class="proof__code" aria-hidden="true"></span>
        </aside>
        ${h.photo(ind, '3:2', 'rh__ph')}
        </div>
      </div>
    </section>`,

  // ───────── Problems: fact tiles ─────────
  problems: (ind, n, h) => `<section class="sol-sec wrap" id="problems" data-sec="${n}"${h.dn(ind, 'problems')} aria-labelledby="problems-h">
      ${h.secHead(n, h.secName(ind, 'problems'), h.head(ind, 'problems'), h.lt('problems.lead', 'Рук на уборку становится меньше по причинам, на которые магазин не влияет.'), 'problems-h')}
      <ol class="rfacts">
        ${ind.problems.map((p, i) => `<li class="rfact reveal" style="--i:${i + 1}">
          ${p.fig ? `<b class="rfact__fig tnum"${h.TN(h.dk(p, 'fig'), p.fig)}>${h.esc(p.fig)}</b>` : `<span class="rfact__fig rfact__fig--ic">${h.icon(p.icon)}</span>`}
          <h3${h.T(p, 'title')}>${h.esc(p.title)}</h3>
          <p${h.T(p, 'text')}>${h.esc(p.text)}</p>
          
        </li>`).join('\n        ')}
      </ol>
    </section>`,

  // ───────── Signature: cleaning frequency + resources ─────────
  frequency: (ind, n, h) => {
    const cells = (f) => Array.from({ length: 10 }, (_, k) => {
      const c = k + 1;
      const cls = c <= f.min ? 'on' : c <= f.max ? 'range' : '';
      return `<i class="fq__c${cls ? ` fq__c--${cls}` : ''}" style="--c:${k}"></i>`;
    }).join('');
    const label = (f) => (f.min === f.max ? `${f.min} ${h.plural(f.min, 'раз', 'раза', 'раз')}` : `от ${f.min} до ${f.max} раз`);
    const rows = ind.frequency.map((f, i) => `<li class="fq__row" style="--r:${i}">
              <span class="fq__zone"><b${h.T(f, 'zone')}>${h.esc(f.zone)}</b><span${h.T(f, 'when')}>${h.esc(f.when)}</span></span>
              <span class="fq__track" role="img" aria-label="${h.esc(`${f.zone}, ${f.when}: ${label(f)} в день`)}"${h.TA(['aria-label', h.pk(`frequency.items.${i}.ariaLabel`)])}>${cells(f)}</span>
              <span class="fq__val"><b class="tnum"${h.TN(h.dk(f, 'value'), f.value)}>${h.esc(f.value)}</b><span${h.T(f, 'note')}>${h.esc(f.note)}</span></span>
            </li>`).join('\n            ');
    const scale = Array.from({ length: 10 }, (_, k) => `<span>${k + 1}</span>`).join('');
    return `<section class="sol-sec wrap" id="frequency" data-sec="${n}"${h.dn(ind, 'frequency')} aria-labelledby="frequency-h">
      ${h.secHead(n, h.secName(ind, 'frequency'), h.lt('frequency.title', 'Торговый зал моют по нескольку раз в день.'), h.lt('frequency.lead', 'Каждая уборка — отдельный проход по всей площади. Чем чаще проход, тем выгоднее отдать его роботу и оставить людям точечную работу.'), 'frequency-h')}
      <div class="fq reveal" data-freq>
        <div class="fq__main">
          <h3 class="fq__h"${h.L('frequency.mainTitle')}>Сколько раз в день убирают магазин.</h3>
          <div class="fq__scale mono" aria-hidden="true"><span class="fq__scale-l"${h.L('frequency.scale')}>раз в день</span><span class="fq__scale-n">${scale}</span></div>
          <ol class="fq__rows">
            ${rows}
          </ol>
          <ul class="fq__legend" aria-hidden="true"><li><i class="fq__c fq__c--on"></i><bdi${h.L('frequency.legend.cleaning')}>уборка</bdi></li><li><i class="fq__c fq__c--range"></i><bdi${h.L('frequency.legend.range')}>по ситуации</bdi></li></ul>
          <p class="fq__note"><span${h.L('frequency.note')}>Так рассказывают в «Перекрёстке»: это практика сети, а не санитарный норматив.</span></p>
        </div>
        <div class="fq__side">
          <h3 class="fq__h"${h.L('frequency.resourcesTitle')}>Ресурсы на один магазин «Перекрёстка» за год.</h3>
          <div class="cmp">
            <p class="cmp__t"><span${h.L('frequency.cmp.water')}>Вода</span><span class="mono"${h.L('frequency.cmp.waterUnit')}>т в год</span></p>
            <div class="cmp__row"><span${h.L('frequency.cmp.manual')}>Ручная поломоечная машина</span><span class="cmp__bar"><i style="--w:100%"></i></span><b class="tnum">73</b></div>
            <div class="cmp__row cmp__row--bot"><span${h.L('frequency.cmp.robot')}>Робот</span><span class="cmp__bar"><i style="--w:15.1%"></i></span><b class="tnum">11</b></div>
          </div>
          <div class="cmp">
            <p class="cmp__t"><span${h.L('frequency.cmp.chemicals')}>Моющие средства</span><span class="mono"${h.L('frequency.cmp.chemicalsNote')}>в 10 раз меньше</span></p>
            <div class="cmp__row"><span${h.L('frequency.cmp.manual')}>Ручная поломоечная машина</span><span class="cmp__bar"><i style="--w:100%"></i></span><b class="tnum">1×</b></div>
            <div class="cmp__row cmp__row--bot"><span${h.L('frequency.cmp.robot')}>Робот</span><span class="cmp__bar"><i style="--w:10%"></i></span><b class="tnum"${h.L('frequency.cmp.robotChemicals')}>0,1×</b></div>
          </div>
          <p class="cmp__svc"${h.LH('frequency.service')}><b class="tnum">10–15 мин</b> в день — уход за роботом, остальное делает док-станция.</p>
        </div>
      </div>
    </section>`;
  },

  // ───────── Cases: receipt cards without photos ─────────
  case: (ind, n, h) => `<section class="sol-sec wrap" id="case" data-sec="${n}"${h.dn(ind, 'case')} aria-labelledby="case-h">
      ${h.secHead(n, h.secName(ind, 'case'), h.lt('case.title', 'Сети уже моют залы роботами.'), h.lt('case.lead', 'Названные объекты и цифры из открытых источников. Это не наши проекты, а рынок, на который можно опереться.'), 'case-h')}
      <div class="rcases">
        ${ind.cases.map((c, i) => { const mNo = h.msg('industries.common.case.number', { no: c.no }); return `<article class="rcase reveal" style="--i:${i}">
          <div class="rcase__top mono"><span${mNo.attr}>${mNo.text}</span><span${h.T(c, 'kicker')}>${h.esc(c.kicker)}</span></div>
          <div class="rcase__fig">${c.pre ? `<small${h.T(c, 'pre')}>${h.esc(c.pre)}</small>` : ''}<b class="tnum"${h.TN(h.dk(c, 'value'), c.value)}>${h.esc(c.value)}</b><span class="mono"${h.T(c, 'unit')}>${h.esc(c.unit)}</span></div>
          <h3${h.T(c, 'title')}>${h.esc(c.title)}</h3>
          <p${h.T(c, 'text')}>${h.esc(c.text)}</p>
          <p class="rcase__q"${h.T(c, 'quote')}>${h.esc(c.quote)}</p>
        </article>`; }).join('\n        ')}
      </div>
    </section>`,

  // ───────── Economy: shared calculator markup, preset to «ТЦ» ─────────
  economy: (ind, n, h) => {
    const e = ind.estimate, T = h.ROI.TYPES[e.type], r = h.ROI.calc({ type: e.type, area: e.area, mode: e.mode });
    const types = h.calcTypes(e.type);
    const modes = h.calcModes(e.mode);
    const area = e.area.toLocaleString('ru-RU');
    return `<section class="sol-sec wrap" id="economy" data-sec="${n}"${h.dn(ind, 'economy')} aria-labelledby="economy-h">
      <div class="econ">
        <div class="econ__copy">
          ${h.idx(n, h.secName(ind, 'economy'))}
          <h2 class="h2 reveal" id="economy-h"${h.L('economy.title')}>Посчитайте окупаемость для ТЦ.</h2>
          <p class="lead reveal"${h.L('economy.lead')}>Модель считает уборку полов: площадь, режим, сколько роботов нужно и когда они окупятся. Тип «ТЦ» уже выбран.</p>
          <p class="reveal rh-est"${h.LH('economy.estimate')}><span class="mono">Расчётный ориентир</span> Это расчёт по нашей модели, не результат внедрения. Цифры по вашему объекту — после аудита или пилота.</p>
        </div>
        <form class="calc reveal" data-calc${h.TA(['aria-label', h.ck('calc.formLabel')])} aria-label="Быстрый расчёт окупаемости уборки">
          <fieldset class="calc__f"><legend${h.C('calc.object')}>Объект</legend><div class="seg">${types}</div></fieldset>
          <div class="calc__f">
            <label for="calc-area"${h.C('calc.area')}>Площадь</label>
            <div class="calc__range"><input id="calc-area" type="range" min="${T.area[0]}" max="${T.area[1]}" step="500" value="${e.area}" aria-valuetext="${area} м²"><output for="calc-area" class="tnum" data-out="area">${area} м²</output></div>
          </div>
          <fieldset class="calc__f"><legend${h.C('calc.mode')}>Режим уборки</legend><div class="seg">${modes}</div></fieldset>
          <dl class="calc__res" aria-live="polite">
            <div><dt${h.C('calc.payback')}>Окупаемость</dt><dd class="tnum" data-out="payback">${h.fmtMonths(r.payback)}</dd></div>
            <div><dt${h.C('calc.savings')}>Экономия в год</dt><dd class="tnum" data-out="net">${h.fmtMln(r.net)}</dd></div>
          </dl>
          <p class="calc__note"${h.LH('economy.note')}><b class="mono">Расчётный ориентир</b> по нашей ROI-модели. Точный расчёт — после аудита объекта.</p>
          <a class="btn btn-pri" data-out="link" href="roi.html?t=${e.type}&amp;a=${e.area}&amp;m=${e.mode}"><span${h.C('calc.fullRoi')}>Полный расчёт ROI</span> ${h.ARROW_R}</a>
        </form>
      </div>
    </section>`;
  },
};

export default { industry, renderers };
