// Industry landing: «Образовательные учреждения» (/industries/education/).
// Facts: docs/research/2026-10-06-empty-industries-research.md, sections 7 (education), 2 (staffing), 9, 10.
// Two scenarios with different buyers: A — the building (cleaning recreations during lessons),
// B — teaching robotics for university and college labs.
// Hero: «two doors» (building / lab) with the corridor photo between them.
// Signature block: a school bell schedule — the robot cleans during lessons and goes to its station at breaks.
// Styles: industry-education.css (every selector starts with .ind--education).

const SRC = {
  ria: { label: 'ДОНМ, РИА Новости, 30.10.2025', href: 'https://ria.ru/20251030/roboty-uborschiki-2051891712.html' },
  aif: { label: 'АиФ, 17.11.2025', href: 'https://aif.ru/techno/technology/shvabry-v-storonu-kak-v-stolichnoy-shkole-poyavilis-roboty-uborshchiki' },
  tj: { label: 'расчёт Т—Ж, 20.08.2026', href: 'https://t-j.ru/short/ne-topchite-tut/' },
  comnews: { label: 'ComNews, 28.11.2024', href: 'https://www.comnews.ru/content/236559/2024-11-28/2024-w48/1008/gumanoidnye-roboty-poselilis-rtu-mirea' },
  kommersant: { label: 'CORE.XP и DAKO Professional, «Коммерсантъ», 2025', href: 'https://www.kommersant.ru/doc/7755385' },
  mt: { label: 'The Moscow Times, 19.08.2025', href: 'https://ru.themoscowtimes.com/2025/08/19/vlasti-zadumali-ogranichit-naem-migrantov-v-obschepite-stroitelstve-i-esche-semi-otraslyah-a172057' },
  robo: { label: 'по данным производителя, robo.ooo', href: 'https://robo.ooo/' },
};

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

const src = (h, s) => `<a class="edu-src" href="${s.href}" target="_blank" rel="noopener">${h.esc(s.label)}</a>`;
const ARROW_D = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';

const industry = {
  slug: 'education',
  name: 'Образовательные учреждения',
  // Research, section 1: named schools and an official announcement, but no independent savings figures.
  tier: 3,
  title: 'Роботы для школ и вузов: уборка рекреаций, учебные лаборатории | ПРОФРОБОТ',
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
    { icon: 'people', title: 'Людей на уборку всё меньше', text: 'Больше 80% персонала в клининге — иностранцы, а регионы ужесточают наём мигрантов.', src: [SRC.kommersant, SRC.mt] },
    { icon: 'weight', title: 'Уборка дорожает', text: 'Фонд оплаты труда клининговых компаний за пять лет вырос в два-три раза — это идёт в цену контракта на уборку.', src: [SRC.kommersant] },
  ],
  directions: [
    { anchor: 'corridors', scenario: 'А', title: 'Уборка рекреаций и коридоров во время уроков', text: 'Поломоечный робот моет рекреации, пока дети в классах, и сам уходит на станцию. Станция заряжает его, сливает грязную воду и наливает чистую.', items: ['рекреации на всех этажах', 'коридоры и холлы', 'вестибюль и гардероб'], solution: SOL.cleaning },
    { anchor: 'gym-canteen', scenario: 'А', title: 'Уборка спортзала и столовой', text: 'Отдельный цикл по расписанию: спортзал — когда в нём нет урока, обеденный зал — после потока учеников.', items: ['спортивный зал', 'обеденный зал', 'актовый зал'], solution: SOL.cleaning },
    // TODO(client): какой объём работ по лабораториям берёт ПРОФРОБОТ (поставка, запуск, обучение преподавателей, сервис)?
    { anchor: 'labs', scenario: 'Б', title: 'Учебные лаборатории робототехники', text: 'Гуманоиды, четвероногие и мобильные платформы для кафедр и колледжей: подбираем состав под учебную программу и бюджет, поставляем и запускаем.', items: ['гуманоидные роботы', 'мобильные платформы', 'манипуляторы для учебных стендов'], solution: SOL.humanoid },
  ],
  scenarios: {
    'А': { name: 'Здание', who: 'Покупатель: школа, департамент образования, АХЧ вуза или колледжа.' },
    'Б': { name: 'Лаборатория', who: 'Покупатель: вуз, колледж, кафедра.' },
  },
  vendors: [
    { group: 'Уборка рекреаций и залов', brands: ['gausium', 'pudu', 'lionsbot'] },
    // TODO(client): подтвердить, что работаем с ROBO и R2B. Без российских производителей сценарий А слабее:
    // школы и госвузы покупают по 44-ФЗ/223-ФЗ (исследование, разделы 7 и 10).
    // Нацрежим (ПП №1875) по поломоечным роботам позиций не найдено — на страницу не выносим, уточнить с юристом.
    { group: 'Российские уборочные роботы', brands: ['robo', 'r2b'] },
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
    { kicker: 'ПРОДУКТ', title: 'Аренда роботов (RaaS)', text: 'Робот без покупки и без капитальных затрат.', href: '/products/raas/' },
    { kicker: 'ПРОДУКТ', title: 'Cleaning Operations Platform', text: 'Циклы уборки и отчёты в одном окне.', href: '/products/cleaning-operations/' },
    { kicker: 'УСЛУГА', title: 'Пилот', text: 'Один этаж, понятные критерии успеха.', href: '/services/pilot/' },
    { kicker: 'КЕЙСЫ', title: 'Кейсы: образование', text: 'Внедрения в школах и вузах.', href: '/cases/?industry=education' },
    { kicker: 'ОТРАСЛИ', title: 'Все отрасли', text: 'Все 11 отраслевых страниц.', href: '/industries/' },
  ],
  sections: ['hero', 'problems', 'bells', 'directions', 'proof', 'economy', 'vendors', 'pilot', 'form', 'see'],
};

const renderers = {
  // Hero «two doors»: copy on top, then door A — corridor photo — door B.
  hero: (ind, n, h) => {
    const door = (d, i) => `<a class="edu-door reveal" href="#${d.anchor}" style="--i:${i + 2}">
            <span class="edu-door__win" aria-hidden="true"></span>
            <span class="edu-door__plate" aria-hidden="true">${h.esc(d.letter)}</span>
            <span class="edu-door__k mono">Сценарий ${h.esc(d.letter)}</span>
            <b class="edu-door__t">${h.esc(d.name)}</b>
            <span class="edu-door__v">${h.esc(d.value)}</span>
            <span class="edu-door__who"><span class="mono">Покупатель</span>${h.esc(d.who)}</span>
            <span class="edu-door__go">К сценарию ${ARROW_D}</span>
          </a>`;
    return `<section class="ih edu-hero wrap" data-sec="${n}" data-name="${h.esc(ind.name.toUpperCase())}">
      <div class="edu-hero__meta">
        ${h.crumbs(ind)}
        ${h.idx(n, ind.name.toUpperCase())}
      </div>
      <div class="edu-hero__top">
        <div class="ih__copy">
          <h1 class="h1 ih__h1 reveal">${ind.h1.map((l) => `<span>${h.esc(l)}</span>`).join(' ')}</h1>
        </div>
        <div class="edu-hero__side">
          <div class="ih__text reveal" style="--i:1">
            <p class="lead">${h.esc(ind.lead)}</p>
            <p>${h.esc(ind.lead2)}</p>
          </div>
          <div class="ih__cta reveal" style="--i:2">
            <a class="btn btn-pri" href="${ind.primaryCta.href}">${h.esc(ind.primaryCta.label)}</a>
            <a class="text-link" href="${ind.secondaryCta.href}">${h.esc(ind.secondaryCta.label)} ${h.ARROW_R}</a>
          </div>
        </div>
      </div>
      <div class="edu-hall">
          ${door(ind.doors[0], 0)}
          ${h.photo(ind, '4:5', 'edu-hall__ph')}
          ${door(ind.doors[1], 1)}
      </div>
      <p class="ih__aud reveal"><span class="mono">Для кого</span> ${ind.audiences.map(h.esc).join(' · ')}</p>
    </section>`;
  },

  // Problems on ruled «exercise book» sheets, each figure signed with its source.
  problems: (ind, n, h) => `<section class="sol-sec wrap" id="problems" data-sec="${n}" data-name="${h.SEC_NAMES.problems}" aria-labelledby="problems-h">
      ${h.secHead(n, h.SEC_NAMES.problems, h.head(ind, 'problems'), null, 'problems-h')}
      <ol class="edu-probs">
        ${ind.problems.map((p, i) => `<li class="edu-prob reveal" style="--i:${i + 1}">
          <span class="edu-prob__no mono tnum">${h.pad(i + 1)}</span>
          <span class="ic-tile">${h.icon(p.icon)}</span>
          <h3>${h.esc(p.title)}</h3>
          <p>${h.esc(p.text)}</p>${p.src ? `\n          <p class="edu-prob__src">Источник: ${p.src.map((s) => src(h, s)).join('; ')}</p>` : ''}
        </li>`).join('\n        ')}
      </ol>
    </section>`,

  // Signature block: the bell schedule. Lessons — the robot cleans; breaks — it's on the station.
  bells: (ind, n, h) => {
    const rows = BELLS.map((b, i) => {
      const label = b.kind === 'break' ? b.what : b.kind === 'people' ? 'После уроков' : `${b.no} урок`;
      const state = b.kind === 'break'
        ? '<span class="edu-bell__st"><i aria-hidden="true"></i>Робот на станции · в коридоре дети</span>'
        : `<span class="edu-bell__bar"><b>${h.esc(b.what)}</b> ${h.esc(b.note)}</span>`;
      return `<li class="edu-bell edu-bell--${b.kind} reveal" style="--i:${Math.min(i, 8)}">
            <span class="edu-bell__t mono tnum">${h.esc(b.t)}</span>
            <span class="edu-bell__l">${h.esc(label)}</span>
            ${state}
          </li>`;
    }).join('\n          ');
    return `<section class="sol-sec wrap" id="bells" data-sec="${n}" data-name="${ind.secNames.bells}" aria-labelledby="bells-h">
      <div class="edu-bells">
        <div class="edu-bells__copy">
          ${h.idx(n, ind.secNames.bells)}
          <h2 class="h2 reveal" id="bells-h">Робот моет, пока идут уроки.</h2>
          <p class="lead reveal">На перемене коридор принадлежит детям, поэтому робот уходит на станцию. Звенит звонок на урок — он выезжает на следующий цикл.</p>
          <dl class="edu-facts reveal">
            <div><dt>роботов в школе №281</dt><dd class="tnum">5</dd></div>
            <div><dt>циклов в день на этаж, шестой — в спортзале</dt><dd class="tnum">5</dd></div>
            <div><dt>станция: заряд, слив грязной воды, налив чистой</dt><dd>3 в 1</dd></div>
          </dl>
          <p class="edu-note reveal">Школа №281, Москва — ${src(h, SRC.aif)}. Уборщицы в школе остались и работают на классах.</p>
        </div>
        <figure class="edu-board reveal" aria-labelledby="bells-cap">
          <figcaption class="edu-board__head" id="bells-cap">
            <span class="edu-board__t">Расписание звонков</span>
            <span class="mono">Пример расписания</span>
          </figcaption>
          <ol class="edu-board__rows">
          ${rows}
          </ol>
          <p class="edu-board__foot">Время звонков условное. Циклы и спортзал — как в школе №281; расписание робота собираем под ваши звонки.</p>
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
              <h4>${h.esc(d.title)}</h4>
              <p>${h.esc(d.text)}</p>
            </div>
            <div class="drow__r">
              <p class="drow__items">${d.items.map(h.esc).join(' · ')}</p>
              <a class="drow__sol" href="${d.solution.href}">Решение: ${h.esc(d.solution.label)} ${h.ARROW_UR}</a>
            </div>
          </article>`;
      }).join('\n          ');
      return `<div class="edu-scen">
          <div class="edu-scen__head reveal">
            <span class="edu-scen__plate" aria-hidden="true">${h.esc(key)}</span>
            <h3>Сценарий ${h.esc(key)} — ${h.esc(sc.name)}</h3>
            <p>${h.esc(sc.who)}</p>
          </div>
          <div class="drows">
          ${rows}
          </div>
        </div>`;
    };
    return `<section class="sol-sec wrap" id="directions" data-sec="${n}" data-name="${h.SEC_NAMES.directions}" aria-labelledby="directions-h">
      ${h.secHead(n, h.SEC_NAMES.directions, h.head(ind, 'directions'), 'Уборку здания закупает хозяйственная служба, лабораторию — кафедра или программа развития вуза. Поэтому и считаем их отдельно.', 'directions-h')}
      <div class="edu-scens">
        ${group('А')}
        ${group('Б')}
      </div>
    </section>`;
  },

  // Other companies' deployments, one per scenario. Not ProfRobot projects — said so in the lead.
  proof: (ind, n, h) => `<section class="sol-sec wrap" id="proof" data-sec="${n}" data-name="${ind.secNames.proof}" aria-labelledby="proof-h">
      ${h.secHead(n, ind.secNames.proof, 'Это уже работает в школах и вузах.', 'Ниже чужие внедрения, не проекты ПРОФРОБОТ. Показываем их, чтобы было видно: оба сценария проверены на реальных зданиях и студентах.', 'proof-h')}
      <div class="edu-proof">
        <article class="edu-case reveal">
          <span class="edu-case__k mono"><span class="edu-scen__plate" aria-hidden="true">А</span>Московские школы</span>
          <p class="edu-case__num"><b class="tnum">4 800</b><span>м² в день</span></p>
          <p class="edu-case__lead">Больше 4 800 м² в день моют роботы в рекреациях трёх школ — №1514, №281 и №1387. Работают во время уроков, на всех этажах, сами уходят на станцию.</p>
          <p class="edu-src-line">Объявил Департамент образования и науки Москвы — ${src(h, SRC.ria)}</p>
          <blockquote class="edu-quote">
            <p>«Теперь не представляем работу без них».</p>
            <footer>Заместитель директора школы №281 — ${src(h, SRC.aif)}</footer>
          </blockquote>
          <p class="edu-src-line">Роботов ROBO RUBY-S производитель называет работающими в школах №1514 и №281 — ${src(h, SRC.robo)}.</p>
        </article>
        <article class="edu-case reveal" style="--i:1">
          <span class="edu-case__k mono"><span class="edu-scen__plate" aria-hidden="true">Б</span>РТУ МИРЭА</span>
          <p class="edu-case__num"><b class="tnum">122</b><span>млн ₽ — оборудование лаборатории</span></p>
          <p class="edu-case__lead">Программа «Шагающие роботы»: 9 гуманоидов Unitree H1 и 4 манипулятора. В 2024 году в лаборатории занимались больше 250 студентов.</p>
          <p class="edu-src-line">${src(h, SRC.comnews)}</p>
          <ul class="edu-case__list">
            <li><b class="tnum">9</b><span>гуманоидов Unitree H1</span></li>
            <li><b class="tnum">4</b><span>манипулятора</span></li>
            <li><b class="tnum">250+</b><span>студентов в 2024</span></li>
          </ul>
        </article>
      </div>
    </section>`,

  // Honest economics: buying pays back slowly (T—Zh calculation), so offer rent / cleaning as a service.
  economy: (ind, n, h) => `<section class="sol-sec wrap" id="economy" data-sec="${n}" data-name="${h.SEC_NAMES.economy}" aria-labelledby="economy-h">
      ${h.secHead(n, h.SEC_NAMES.economy, 'Покупка окупается долго. Так и говорим.', 'Робот берёт на себя не всю смену уборщицы, а её часть. Поэтому при покупке срок окупаемости в школе — годы, а не месяцы.', 'economy-h')}
      <div class="edu-econ">
        <article class="edu-calc reveal" aria-labelledby="edu-calc-h">
          <span class="edu-calc__flag mono">Расчёт журнала Т—Ж, не наш</span>
          <h3 id="edu-calc-h">Один робот в школе</h3>
          <div class="edu-shift" role="img" aria-label="Восьмичасовая смена уборщицы: робот закрывает 2,5 часа из 8, это 31 процент">
            <div class="edu-shift__bar"><i></i></div>
            <div class="edu-shift__scale mono tnum" aria-hidden="true"><span>0 ч</span><span>2,5 ч</span><span>8 ч смены</span></div>
          </div>
          <dl class="edu-calc__nums">
            <div><dt>цена робота</dt><dd class="tnum">≈ 2 млн ₽</dd></div>
            <div><dt>смены уборщицы закрывает робот</dt><dd class="tnum">2,5 из 8 ч</dd></div>
            <div><dt>окупаемость при покупке, зарплата 65 тыс. ₽ на руки</dt><dd class="tnum">≈ 5,5 года</dd></div>
            <div><dt>при зарплате 30 тыс. ₽</dt><dd class="tnum">почти 12 лет</dd></div>
          </dl>
          <p class="edu-src-line">Сервис робота в расчёт не входит — ${src(h, SRC.tj)}</p>
        </article>
        <div class="edu-ways">
          <p class="edu-ways__h">Что из этого следует</p>
          <!-- TODO(legal): сверить формулировку про закупку уборки как услуги по 44-ФЗ (ОКПД2 81.2, распоряжение №471-р в исследовании помечено [?]). -->
          <article class="edu-way reveal" style="--i:1">
            <span class="edu-way__no mono tnum">01</span>
            <h3>Аренда или уборка как услуга</h3>
            <p>Без капитальных затрат и без пяти лет ожидания. Уборку роботами можно закупать как услугу — так же, как школа уже закупает услуги уборки по 44-ФЗ.</p>
            <a class="drow__sol" href="/products/raas/">Аренда роботов (RaaS) ${h.ARROW_UR}</a>
          </article>
          <article class="edu-way reveal" style="--i:2">
            <span class="edu-way__no mono tnum">02</span>
            <h3>Уборщицы — на классы и санузлы</h3>
            <p>Робот моет длинные рекреации, люди — то, что ему не под силу: классы, санузлы, лестницы. Так в школе №281: уборщицы остались и работают на классах.</p>
            <a class="drow__sol" href="#bells">Как это выглядит по звонкам ↑</a>
          </article>
        </div>
      </div>
    </section>`,
};

export default {
  industry,
  brands: {
    // TODO(client): подтвердить, что работаем с ROBO.
    robo: { name: 'ROBO' },
    // TODO(client): подтвердить, что работаем с R2B.
    r2b: { name: 'R2B' },
  },
  renderers,
};
