// Industry landing: «Образовательные учреждения» (/industries/education/).
// Facts: docs/research/2026-10-06-empty-industries-research.md, sections 7 (education), 2 (staffing), 9, 10.
// Two scenarios with different buyers: A — the building (cleaning recreations during lessons),
// B — teaching robotics for university and college labs.
// Hero: «two doors» (building / lab) with the corridor photo between them.
// Signature block: a school bell schedule — the robot cleans during lessons and goes to its station at breaks.
// Styles: industry-education.css (every selector starts with .ind--education).

const SOL = {
  cleaning: { label: 'Роботизированный клининг', href: '/solutions/cleaning/' },
  humanoid: { label: 'Гуманоидные роботы', href: '/solutions/humanoid/' },
};

// Illustrative bell schedule. Cycles per floor and the gym cycle follow school №281 (АиФ, 17.11.2025);
// the bell times are an example, not that school's real timetable.
const BELLS = [
  { kind: 'lesson', no: 1, t: '08:30–09:15', what: 'Цикл 1', note: 'моет рекреацию этажа' },
  { kind: 'break', t: '09:15–09:25', what: 'Перемена' },
  { kind: 'lesson', no: 2, t: '09:25–10:10', what: 'Цикл 2', note: 'моет рекреацию этажа' },
  { kind: 'break', t: '10:10–10:30', what: 'Большая перемена' },
  { kind: 'lesson', no: 3, t: '10:30–11:15', what: 'Цикл 3', note: 'моет рекреацию этажа' },
  { kind: 'break', t: '11:15–11:30', what: 'Перемена' },
  { kind: 'lesson', no: 4, t: '11:30–12:15', what: 'Цикл 4', note: 'моет рекреацию этажа' },
  { kind: 'break', t: '12:15–12:35', what: 'Перемена' },
  { kind: 'lesson', no: 5, t: '12:35–13:20', what: 'Цикл 5', note: 'моет рекреацию этажа' },
  { kind: 'break', t: '13:20–13:30', what: 'Перемена' },
  { kind: 'gym', no: 6, t: '13:30–14:15', what: 'Цикл 6', note: 'спортзал, пока в нём нет урока' },
  { kind: 'people', t: 'с 14:15', what: 'Уборщицы', note: 'классы и санузлы' },
];

const ARROW_D = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';

const industry = {
  slug: 'education',
  name: 'Образовательные учреждения',
  // Research, section 1: named schools and an official announcement, but no independent savings figures.
  tier: 3,
  title: 'Роботы для школ и вузов: уборка рекреаций, учебные лаборатории | Профессиональная Робототехника',
  description: 'Поломоечные роботы для школ моют рекреации во время уроков. Гуманоиды и платформы для учебных лабораторий робототехники в вузах и колледжах. Честная экономика: аренда и уборка как услуга.',
  h1: ['Роботы для школ,', 'колледжей и вузов.'],
  lead: 'У учебного заведения два разных повода для роботов. Здание: рекреации нужно мыть каждый день, и удобнее всего — пока идут уроки. Лаборатория: вузам и колледжам нужны гуманоиды и платформы, на которых учатся студенты.',
  lead2: 'Покупатели и бюджеты у этих задач разные, поэтому на странице два входа.',
  audiences: ['школы', 'департаменты образования', 'АХЧ вузов и колледжей', 'кафедры и лаборатории'],
  hero: 'doors',
  photo: { robot: 'robot-cleaning.webp', w: 964, h: 1026, note: 'Промпт 10 — пустой школьный коридор во время урока (запасной — университетская лаборатория)', alt: 'Поломоечный робот моет пустой школьный коридор, пока идёт урок' },
  primaryCta: { label: 'Обсудить пилот на одном этаже', href: '#talk' },
  secondaryCta: { label: 'Сколько это стоит на самом деле', href: '#economy' },
  doors: [
    { letter: 'А', name: 'Здание', anchor: 'corridors', value: 'Рекреации и коридоры моются во время уроков. На перемене пол свободен для детей.', who: 'школы, департаменты образования, АХЧ вузов и колледжей' },
    { letter: 'Б', name: 'Лаборатория', anchor: 'labs', value: 'Гуманоиды, манипуляторы и мобильные платформы для учебной робототехники.', who: 'вузы, колледжи, кафедры' },
  ],
  heads: {
    problems: 'Где учебному зданию тяжело с уборкой.',
    directions: 'Два сценария — два бюджета.',
    pilot: 'Начните с одного этажа.',
  },
  secNames: { bells: 'РАСПИСАНИЕ', proof: 'ВНЕДРЕНИЯ' },
  problems: [
    // TODO(legal): сверить пункт СП 2.4.3648-20 (в исследовании п. 2.11.2 виден только в пересказе) и только потом ставить номер.
    { icon: 'drop', title: 'Убирать нужно каждый день', text: 'Ежедневная влажная уборка всех помещений — требование санитарных правил для образовательных организаций.' },
    { icon: 'clock', title: 'Удобное время одно — урок', text: 'Рекреации пачкаются на переменах, а мыть пол при детях неудобно. Остаётся время уроков, пока все в классах.' },
    { icon: 'people', title: 'Людей на уборку всё меньше', text: 'Больше 80% персонала в клининге — иностранцы, а регионы ужесточают наём мигрантов.' },
    { icon: 'weight', title: 'Уборка дорожает', text: 'Фонд оплаты труда клининговых компаний за пять лет вырос в два-три раза — это идёт в цену контракта на уборку.' },
  ],
  directions: [
    { anchor: 'corridors', scenario: 'building', title: 'Уборка рекреаций и коридоров во время уроков', text: 'Поломоечный робот моет рекреации, пока дети в классах, и сам уходит на станцию. Станция заряжает его, сливает грязную воду и наливает чистую.', items: ['рекреации на всех этажах', 'коридоры и холлы', 'вестибюль и гардероб'], solution: SOL.cleaning },
    { anchor: 'gym-canteen', scenario: 'building', title: 'Уборка спортзала и столовой', text: 'Отдельный цикл по расписанию: спортзал — когда в нём нет урока, обеденный зал — после потока учеников.', items: ['спортивный зал', 'обеденный зал', 'актовый зал'], solution: SOL.cleaning },
    // TODO(client): какой объём работ по лабораториям берёт Профессиональная Робототехника (поставка, запуск, обучение преподавателей, сервис)?
    { anchor: 'labs', scenario: 'lab', title: 'Учебные лаборатории робототехники', text: 'Гуманоиды, четвероногие и мобильные платформы для кафедр и колледжей: подбираем состав под учебную программу и бюджет, поставляем и запускаем.', items: ['гуманоидные роботы', 'мобильные платформы', 'манипуляторы для учебных стендов'], solution: SOL.humanoid },
  ],
  scenarios: {
    building: { letter: 'А', name: 'Здание', who: 'Покупатель: школа, департамент образования, АХЧ вуза или колледжа.' },
    lab: { letter: 'Б', name: 'Лаборатория', who: 'Покупатель: вуз, колледж, кафедра.' },
  },
  vendors: [
    { group: 'Уборка рекреаций и залов', brands: ['gausium', 'pudu', 'lionsbot'] },
    // Russian makers we do not work with are competitors and are not named. Школы и госвузы покупают по
    // 44-ФЗ/223-ФЗ (исследование, разделы 7 и 10): если появится российский партнёр, добавить его сюда.
    // Нацрежим (ПП №1875) по поломоечным роботам позиций не найдено — на страницу не выносим, уточнить с юристом.
    { group: 'Учебная робототехника', brands: ['unitree', 'agilex', 'ubtech'] },
  ],
  vendorsLead: 'Технику для здания и для лаборатории подбираем отдельно: у них разные задачи и разные закупки.',
  pilot: [
    { title: 'Обход здания', text: 'Смотрим рекреации, покрытия, пороги, лифты и место для станции. Сверяем с расписанием звонков.' },
    { title: 'Пилот на одном этаже', text: 'Робот в аренду на этаж. Проверяем циклы во время уроков и собираем отзывы завхоза, учителей и уборщиц.' },
    { title: 'Остальные этажи', text: 'Подключаем этажи, спортзал и столовую. Переходим на уборку как услугу или покупку — что выгоднее школе.' },
  ],
  form: { title: 'Покажем робота в вашей школе.', lead: 'Приедем, проедем рекреацию на одном этаже и честно посчитаем: покупка, аренда или уборка как услуга. Для лаборатории подберём состав под программу.', button: 'Обсудить пилот' },
  formStage: true,
  links: [
    { kicker: 'РЕШЕНИЕ', title: 'Роботизированный клининг', text: 'Поломоечные роботы для рекреаций и залов.', href: SOL.cleaning.href },
    { kicker: 'РЕШЕНИЕ', title: 'Гуманоидные роботы', text: 'Платформы для учебных лабораторий.', href: SOL.humanoid.href },
    { kicker: 'ПРОДУКТ', title: 'Аренда роботов (RaaS)', text: 'Робот без покупки и без капитальных затрат.', href: 'products.html#raas' },
    { kicker: 'ПРОДУКТ', title: 'Платформа Профессиональная Робототехника', text: 'Циклы уборки и отчёты в одном окне.', href: 'products.html#platform' },
    { kicker: 'УСЛУГА', title: 'Пилот', text: 'Один этаж, понятные критерии успеха.', href: 'services.html#pilot' },
    { kicker: 'КЕЙСЫ', title: 'Кейсы: образование', text: 'Внедрения в школах и вузах.', href: 'cases.html?industry=education' },
    { kicker: 'ОТРАСЛИ', title: 'Все отрасли', text: 'Все 11 отраслевых страниц.', href: '/industries/' },
  ],
  sections: ['hero', 'problems', 'bells', 'directions', 'proof', 'economy', 'vendors', 'pilot', 'form', 'see'],
};

const renderers = {
  // Hero «two doors»: copy on top, then door A — corridor photo — door B.
  hero: (ind, n, h) => {
    const door = (d, i) => `<a class="edu-door reveal" href="#${d.anchor}" style="--i:${i + 2}">
            <span class="edu-door__win" aria-hidden="true"></span>
            <span class="edu-door__plate" aria-hidden="true"${h.T(d, 'letter')}>${h.esc(d.letter)}</span>
            <span class="edu-door__k mono"${h.L(`doors.items.${i}.scenario`)}>Сценарий ${h.esc(d.letter)}</span>
            <b class="edu-door__t"${h.T(d, 'name')}>${h.esc(d.name)}</b>
            <span class="edu-door__v"${h.T(d, 'value')}>${h.esc(d.value)}</span>
            <span class="edu-door__who"><span class="mono"${h.L('doors.buyer')}>Покупатель</span><bdi${h.T(d, 'who')}>${h.esc(d.who)}</bdi></span>
            <span class="edu-door__go"><bdi${h.L('doors.go')}>К сценарию</bdi> ${ARROW_D}</span>
          </a>`;
    return `<section class="ih edu-hero wrap" data-sec="${n}"${h.dnName(ind)}>
      <div class="edu-hero__meta">
        ${h.crumbs(ind)}
        ${h.idx(n, h.nameCaps(ind))}
      </div>
      <div class="edu-hero__top">
        <div class="ih__copy">
          <h1 class="h1 ih__h1 reveal">${h.h1(ind)}</h1>
        </div>
        <div class="edu-hero__side">
          <div class="ih__text reveal" style="--i:1">
            <p class="lead"${h.T(ind, 'lead')}>${h.esc(ind.lead)}</p>
            <p${h.T(ind, 'lead2')}>${h.esc(ind.lead2)}</p>
          </div>
          <div class="ih__cta reveal" style="--i:2">
            <a class="btn btn-pri" href="${ind.primaryCta.href}"${h.T(ind.primaryCta, 'label')}>${h.esc(ind.primaryCta.label)}</a>
            <a class="text-link" href="${ind.secondaryCta.href}"><span${h.T(ind.secondaryCta, 'label')}>${h.esc(ind.secondaryCta.label)}</span> ${h.ARROW_R}</a>
          </div>
        </div>
      </div>
      <div class="edu-hall">
          ${door(ind.doors[0], 0)}
          ${h.photo(ind, '4:5', 'edu-hall__ph')}
          ${door(ind.doors[1], 1)}
      </div>
      <p class="ih__aud reveal">${h.audience(ind)}</p>
    </section>`;
  },

  // Problems on ruled «exercise book» sheets, each figure signed with its source.
  problems: (ind, n, h) => `<section class="sol-sec wrap" id="problems" data-sec="${n}"${h.dn(ind, 'problems')} aria-labelledby="problems-h">
      ${h.secHead(n, h.secName(ind, 'problems'), h.head(ind, 'problems'), null, 'problems-h')}
      <ol class="edu-probs">
        ${ind.problems.map((p, i) => `<li class="edu-prob reveal" style="--i:${i + 1}">
          <span class="edu-prob__no mono tnum">${h.pad(i + 1)}</span>
          <span class="ic-tile">${h.icon(p.icon)}</span>
          <h3${h.T(p, 'title')}>${h.esc(p.title)}</h3>
          <p${h.T(p, 'text')}>${h.esc(p.text)}</p>${p.src ? `\n          <p class="edu-prob__src"><span${h.C('sources.labelColon')}>Источник:</span> ${p.src.map((s) => src(h, s)).join('; ')}</p>` : ''}
        </li>`).join('\n        ')}
      </ol>
    </section>`,

  // Signature block: the bell schedule. Lessons — the robot cleans; breaks — it's on the station.
  bells: (ind, n, h) => {
    const rows = BELLS.map((b, i) => {
      const mLesson = b.kind === 'lesson' || b.kind === 'gym' ? h.msg('industries.education.bells.lesson', { n: b.no }) : null;
      const label = b.kind === 'break'
        ? `<span class="edu-bell__l"${h.T(b, 'what')}>${h.esc(b.what)}</span>`
        : b.kind === 'people'
          ? `<span class="edu-bell__l"${h.L('bells.afterLessons')}>После уроков</span>`
          : `<span class="edu-bell__l"${mLesson.attr}>${mLesson.text}</span>`;
      const state = b.kind === 'break'
        ? `<span class="edu-bell__st"><i aria-hidden="true"></i><bdi${h.L('bells.breakState')}>Робот на станции · в коридоре дети</bdi></span>`
        : `<span class="edu-bell__bar"><b${h.T(b, 'what')}>${h.esc(b.what)}</b> <bdi${h.T(b, 'note')}>${h.esc(b.note)}</bdi></span>`;
      return `<li class="edu-bell edu-bell--${b.kind} reveal" style="--i:${Math.min(i, 8)}">
            <span class="edu-bell__t mono tnum"${h.TN(h.dk(b, 't'), b.t)}>${h.esc(b.t)}</span>
            ${label}
            ${state}
          </li>`;
    }).join('\n          ');
    return `<section class="sol-sec wrap" id="bells" data-sec="${n}"${h.dn(ind, 'bells')} aria-labelledby="bells-h">
      <div class="edu-bells">
        <div class="edu-bells__copy">
          ${h.idx(n, h.secName(ind, 'bells'))}
          <h2 class="h2 reveal" id="bells-h"${h.L('bells.title')}>Робот моет, пока идут уроки.</h2>
          <p class="lead reveal"${h.L('bells.lead')}>На перемене коридор принадлежит детям, поэтому робот уходит на станцию. Звенит звонок на урок — он выезжает на следующий цикл.</p>
          <dl class="edu-facts reveal">
            <div><dt${h.L('bells.facts.robots')}>роботов в школе №281</dt><dd class="tnum">5</dd></div>
            <div><dt${h.L('bells.facts.cycles')}>циклов в день на этаж, шестой — в спортзале</dt><dd class="tnum">5</dd></div>
            <div><dt${h.L('bells.facts.station')}>станция: заряд, слив грязной воды, налив чистой</dt><dd${h.L('bells.facts.stationValue')}>3 в 1</dd></div>
          </dl>
          <p class="edu-note reveal"><span${h.L('bells.note')}>Школа №281, Москва. Уборщицы в школе остались и работают на классах.</span></p>
        </div>
        <figure class="edu-board reveal" aria-labelledby="bells-cap">
          <figcaption class="edu-board__head" id="bells-cap">
            <span class="edu-board__t"${h.L('bells.board.title')}>Расписание звонков</span>
            <span class="mono"${h.L('bells.board.example')}>Пример расписания</span>
          </figcaption>
          <ol class="edu-board__rows">
          ${rows}
          </ol>
          <p class="edu-board__foot"${h.L('bells.board.foot')}>Время звонков условное. Циклы и спортзал — как в школе №281; расписание робота собираем под ваши звонки.</p>
        </figure>
      </div>
    </section>`;
  },

  // Directions grouped by scenario: A — the building, B — the lab.
  directions: (ind, n, h) => {
    let i = 0;
    const group = (key) => {
      const sc = ind.scenarios[key];
      const rows = ind.directions.filter((d) => d.scenario === key).map((d) => {
        const k = i++;
        return `<article class="drow reveal" id="${d.anchor}" style="--i:${k}">
            <div class="drow__l">
              <span class="drow__no mono">${h.pad(k + 1)}</span>
              <h4${h.T(d, 'title')}>${h.esc(d.title)}</h4>
              <p${h.T(d, 'text')}>${h.esc(d.text)}</p>
            </div>
            <div class="drow__r">
              <p class="drow__items">${h.itemsList(d.items)}</p>
              ${h.solLink(d.solution)}
            </div>
          </article>`;
      }).join('\n          ');
      return `<div class="edu-scen">
          <div class="edu-scen__head reveal">
            <span class="edu-scen__plate" aria-hidden="true"${h.T(sc, 'letter')}>${h.esc(sc.letter)}</span>
            <h3${h.L(`scenarios.${key}.heading`)}>Сценарий ${h.esc(sc.letter)} — ${h.esc(sc.name)}</h3>
            <p${h.T(sc, 'who')}>${h.esc(sc.who)}</p>
          </div>
          <div class="drows">
          ${rows}
          </div>
        </div>`;
    };
    return `<section class="sol-sec wrap" id="directions" data-sec="${n}"${h.dn(ind, 'directions')} aria-labelledby="directions-h">
      ${h.secHead(n, h.secName(ind, 'directions'), h.head(ind, 'directions'), h.lt('directions.lead', 'Уборку здания закупает хозяйственная служба, лабораторию — кафедра или программа развития вуза. Поэтому и считаем их отдельно.'), 'directions-h')}
      <div class="edu-scens">
        ${group('building')}
        ${group('lab')}
      </div>
    </section>`;
  },

  // Other companies' deployments, one per scenario. Not Professional Robotics projects — said so in the lead.
  proof: (ind, n, h) => `<section class="sol-sec wrap" id="proof" data-sec="${n}"${h.dn(ind, 'proof')} aria-labelledby="proof-h">
      ${h.secHead(n, h.secName(ind, 'proof'), h.lt('proof.title', 'Это уже работает в школах и вузах.'), h.lt('proof.lead', 'Ниже чужие внедрения, не проекты Профессиональной Робототехники. Показываем их, чтобы было видно: оба сценария проверены на реальных зданиях и студентах.'), 'proof-h')}
      <div class="edu-proof">
        <article class="edu-case reveal">
          <span class="edu-case__k mono"><span class="edu-scen__plate" aria-hidden="true"${h.T(ind.scenarios.building, 'letter')}>А</span><bdi${h.L('proof.schools.place')}>Московские школы</bdi></span>
          <p class="edu-case__num"><b class="tnum"${h.L('proof.schools.value')}>4 800</b><span${h.L('proof.schools.unit')}>м² в день</span></p>
          <p class="edu-case__lead"${h.L('proof.schools.lead')}>Больше 4 800 м² в день моют роботы в рекреациях трёх школ — №1514, №281 и №1387. Работают во время уроков, на всех этажах, сами уходят на станцию.</p>
          <p class="edu-src-line"${h.L('proof.schools.announced')}>Объявил Департамент образования и науки Москвы.</p>
          <blockquote class="edu-quote">
            <p${h.L('proof.schools.quote')}>«Теперь не представляем работу без них».</p>
            <footer${h.L('proof.schools.quoteBy')}>Заместитель директора школы №281</footer>
          </blockquote>
        </article>
        <article class="edu-case reveal" style="--i:1">
          <span class="edu-case__k mono"><span class="edu-scen__plate" aria-hidden="true"${h.T(ind.scenarios.lab, 'letter')}>Б</span><bdi${h.L('proof.lab.place')}>РТУ МИРЭА</bdi></span>
          <p class="edu-case__num"><b class="tnum">122</b><span${h.L('proof.lab.unit')}>млн ₽ — оборудование лаборатории</span></p>
          <p class="edu-case__lead"${h.L('proof.lab.lead')}>Программа «Шагающие роботы»: 9 гуманоидов Unitree H1 и 4 манипулятора. В 2024 году в лаборатории занимались больше 250 студентов.</p>
          <ul class="edu-case__list">
            <li><b class="tnum">9</b><span${h.L('proof.lab.humanoids')}>гуманоидов Unitree H1</span></li>
            <li><b class="tnum">4</b><span${h.L('proof.lab.arms')}>манипулятора</span></li>
            <li><b class="tnum">250+</b><span${h.L('proof.lab.students')}>студентов в 2024</span></li>
          </ul>
        </article>
      </div>
    </section>`,

  // Honest economics: buying pays back slowly (T—Zh calculation), so offer rent / cleaning as a service.
  economy: (ind, n, h) => `<section class="sol-sec wrap" id="economy" data-sec="${n}"${h.dn(ind, 'economy')} aria-labelledby="economy-h">
      ${h.secHead(n, h.secName(ind, 'economy'), h.lt('economy.title', 'Покупка окупается долго. Так и говорим.'), h.lt('economy.lead', 'Робот берёт на себя не всю смену уборщицы, а её часть. Поэтому при покупке срок окупаемости в школе — годы, а не месяцы.'), 'economy-h')}
      <div class="edu-econ">
        <article class="edu-calc reveal" aria-labelledby="edu-calc-h">
          <span class="edu-calc__flag mono"${h.L('economy.flag')}>Расчёт журнала Т—Ж, не наш</span>
          <h3 id="edu-calc-h"${h.L('economy.calcTitle')}>Один робот в школе</h3>
          <div class="edu-shift" role="img"${h.TA(['aria-label', h.pk('economy.shiftLabel')])} aria-label="Восьмичасовая смена уборщицы: робот закрывает 2,5 часа из 8, это 31 процент">
            <div class="edu-shift__bar"><i></i></div>
            <div class="edu-shift__scale mono tnum" aria-hidden="true"><span${h.L('economy.scale.zero')}>0 ч</span><span${h.L('economy.scale.part')}>2,5 ч</span><span${h.L('economy.scale.shift')}>8 ч смены</span></div>
          </div>
          <dl class="edu-calc__nums">
            <div><dt${h.L('economy.nums.price')}>цена робота</dt><dd class="tnum"${h.L('economy.nums.priceValue')}>≈ 2 млн ₽</dd></div>
            <div><dt${h.L('economy.nums.covers')}>смены уборщицы закрывает робот</dt><dd class="tnum"${h.L('economy.nums.coversValue')}>2,5 из 8 ч</dd></div>
            <div><dt${h.L('economy.nums.payback')}>окупаемость при покупке, зарплата 65 тыс. ₽ на руки</dt><dd class="tnum"${h.L('economy.nums.paybackValue')}>≈ 5,5 года</dd></div>
            <div><dt${h.L('economy.nums.lowWage')}>при зарплате 30 тыс. ₽</dt><dd class="tnum"${h.L('economy.nums.lowWageValue')}>почти 12 лет</dd></div>
          </dl>
          <p class="edu-src-line"${h.L('economy.serviceNote')}>Сервис робота в расчёт не входит.</p>
        </article>
        <div class="edu-ways">
          <p class="edu-ways__h"${h.L('economy.ways.title')}>Что из этого следует</p>
          <!-- TODO(legal): сверить формулировку про закупку уборки как услуги по 44-ФЗ (ОКПД2 81.2, распоряжение №471-р в исследовании помечено [?]). -->
          <article class="edu-way reveal" style="--i:1">
            <span class="edu-way__no mono tnum">01</span>
            <h3${h.L('economy.ways.rent.title')}>Аренда или уборка как услуга</h3>
            <p${h.L('economy.ways.rent.text')}>Без капитальных затрат и без пяти лет ожидания. Уборку роботами можно закупать как услугу — так же, как школа уже закупает услуги уборки по 44-ФЗ.</p>
            <a class="drow__sol" href="products.html#raas"><span${h.K('common.linkNames.raas')}>Аренда роботов (RaaS)</span> ${h.ARROW_UR}</a>
          </article>
          <article class="edu-way reveal" style="--i:2">
            <span class="edu-way__no mono tnum">02</span>
            <h3${h.L('economy.ways.staff.title')}>Уборщицы — на классы и санузлы</h3>
            <p${h.L('economy.ways.staff.text')}>Робот моет длинные рекреации, люди — то, что ему не под силу: классы, санузлы, лестницы. Так в школе №281: уборщицы остались и работают на классах.</p>
            <a class="drow__sol" href="#bells"${h.L('economy.ways.staff.link')}>Как это выглядит по звонкам ↑</a>
          </article>
        </div>
      </div>
    </section>`,
};

export default {
  industry,
  renderers,
  data: { bells: BELLS },
  templates: { 'industries.education.bells.lesson': '{n} урок' },
};
