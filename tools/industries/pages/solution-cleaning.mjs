// Solution landing «Роботизированный клининг» (/solutions/cleaning/) → solutions-cleaning.html.
// Angle: the SOLUTION answers «what task», the industry pages answer «what object». So this page is «technology and economics»:
// the software on any cleaning robot, classes of robots, how payback is counted. Object cases stay on the industry pages (links below).
// Positioning (client): we sell and deploy our software on ANY robot; hardware is the carrier. Three ways in: your robot / no robot / own scenario.
// Facts: docs/research/2026-10-02-roi-competitors.md (prices, payback, cases), 2026-10-06-empty-industries-research.md §2 (staff),
// roi-model.js (our assumptions; the payback of the office example is calculated from it at build time).
// Every outside figure carries its source; the dealers' and makers' figures are their claims, we did not verify them.
//
// TODO(client): подтвердить, какие бренды и типы роботов реально подключены к платформе сейчас, и что возможно для «чужого» робота
//   (API / SDK / только облако производителя). Блок «Что добавляет ПО» и пути «У вас уже есть робот» опираются на тезис платформы.
// TODO(client): какие интеграции сделаны (лифты, двери, СКУД, BMS, 1С): сейчас названы как возможные.
// TODO(client): свои кейсы клининга с цифрами (карточка «−32%» на главной — заглушка). Блока «наши результаты» на странице нет.
// TODO(client): SLA (время реакции, сервисная сеть, склад запчастей) — цифр на странице нет до подтверждения.
// TODO(client): продаём ли мы роботов (перепродажа, дистрибуция) или только ПО и внедрение: от этого зависит формулировка пути 02.

import { shared } from '../sx-shared.mjs';

const SRC = {
  core: { label: 'CORE.XP и DAKO Professional, «Коммерсантъ», 2025' },
  mt: { label: 'The Moscow Times, 19.08.2025' },
  avito: { label: 'Авито Работа, «Коммерсантъ», 18.06.2026' },
  price: { label: 'прайс дилера робоуборка.рф, 02.10.2026' },
  speed: { label: 'gausium.ru и Retail Service, 19.09.2025' },
  komandor: { label: 'Retail.ru, 12.12.2024, кейс дистрибьютора Pudu' },
  r2b: { label: 'R2B, vc.ru, 15.10.2025' },
  tco: { label: 'Т-Компани, дилер Gausium, 03.09.2026' },
  model: { label: 'наша модель roi-model.js' },
};

const industry = {
  slug: 'solution-cleaning',
  kind: 'solution',
  key: 'cleaning',
  name: 'Роботизированный клининг',
  tier: 1,
  title: 'Роботы-уборщики для бизнеса: ПО, внедрение, сервис | Профессиональная Робототехника',
  description: 'Роботы-уборщики и платформа для управления ими: аудит, пилот, интеграция, сервис по SLA. Подключаем роботов любых производителей. Рассчитайте окупаемость.',
  h1: ['Роботы-уборщики', 'для бизнеса.'],
  lead: 'Робота-уборщика можно купить у любого дилера. Мы делаем так, чтобы он работал как часть бизнеса: наше ПО ставит задачи, следит за качеством и подключает робота к лифтам, дверям и вашим системам. Своего робота нет — подберём. Уже есть — подключим.',
  lead2: 'Выбор бренда не должен определять, чем вы управляете. Парк из разных роботов работает в одном окне.',
  audiences: ['владельцы и управляющие объектов', 'клининговые подрядчики', 'сети магазинов и ТЦ'],
  hero: 'console',
  primaryCta: { label: 'Подобрать решение для клининга', href: '#talk' },
  secondaryCta: { label: 'Что добавляет наше ПО', href: '#software' },
  heads: {
    paths: 'С чего начать: три входа.',
    pathsLead: 'Робот здесь носитель, а продукт — программа, которая им управляет. Поэтому с нами можно прийти и с роботом, и без него.',
    problems: 'Людей меньше, труд дороже.',
    software: 'Что наше ПО добавляет к любому роботу.',
    softwareLead: 'Робот сам по себе ездит по карте. Результатом клининга он становится, когда за ним стоит система.',
    directions: 'Какие бывают роботы-уборщики.',
    directionsLead: 'По задаче, а не по бренду. Цены и скорости ниже — рыночные ориентиры, не наше предложение.',
    economy: 'Как считать окупаемость.',
    economyLead: 'Две ошибки: взять паспортную скорость и считать, что робот заменит всю бригаду. Мы считаем осторожнее.',
    vendors: 'Роботы и производители.',
    pilot: 'От аудита до сервиса.',
    see: 'Где применяется и что почитать.',
  },
  secNames: { paths: 'С ЧЕГО НАЧАТЬ', problems: 'КАДРЫ', software: 'ПРОГРАММЫ', directions: 'КЛАССЫ РОБОТОВ', pilot: 'КАК ВНЕДРЯЕМ' },
  paths: [
    { title: 'У вас уже есть робот.', text: 'Подключим к платформе: общая карта, расписание, отчёты о качестве, сервис. Если производитель даёт доступ (API или SDK), интегрируем под ваш сценарий. Что возможно именно с вашей моделью, скажем на аудите, до сделки.', tag: 'Платформа и интеграция', href: 'products.html#fleet' },
    { title: 'Робота ещё нет.', text: 'Подберём класс и модель под ваш пол, площадь и режим работы. Купить или взять в аренду. Запустим сразу под нашей платформой, чтобы эффект был виден с первой смены.', tag: 'Подбор и внедрение', href: 'products.html#raas' },
    { title: 'Нужно то, чего нет в коробке.', text: 'Лифты нескольких брендов, задания из вашей 1С, свои отчёты. Пишем софт под процесс в рамках платформы.', tag: 'Софт под сценарий', href: 'platform.html' },
  ],
  problems: [
    { figure: '80%+', cap: 'доля иностранцев в персонале клининга', title: 'Штат держится на тех, кого всё труднее нанять.', text: 'В 2025 году дополнительные ограничения на найм мигрантов ввели в 11 регионах, на 2026 год предлагали отраслевые квоты.', src: [SRC.core, SRC.mt] },
    { figure: '×2–3', cap: 'рост ФОТ клининговых компаний за пять лет', title: 'Труд дорожает.', text: 'DAKO Professional оценивает рост фонда оплаты труда в клининге в два-три раза. Прогноз на 2025 год: цены на клининг +10–15% из-за дефицита кадров.', src: [SRC.core] },
    { figure: '+31%', cap: 'рост спроса на исполнителей в клининге за год, первое полугодие 2026', title: 'Спрос на людей растёт.', text: 'Робот не заменяет бригаду целиком: он берёт ровный пол и повторяющиеся маршруты, людям остаются санузлы, углы и контроль.', src: [SRC.avito] },
  ],
  // Signature block: what the software does on top of any robot. Six capabilities, each with what the owner gets.
  software: [
    { icon: 'fleet', title: 'Один парк — одно окно', text: 'Роботы разных брендов и классов видны на одной карте: статус, заряд, ошибки.', out: 'один экран вместо приложения на каждый бренд' },
    { icon: 'map', title: 'Задачи без пересечений', text: 'Платформа строит расписание и делит площадь между роботами, чтобы они не мешали друг другу и не оставляли пропусков.', out: 'нет пропущенных зон' },
    { icon: 'check', title: 'Отчёт о фактической уборке', text: 'Что убрано, когда и сколько заняло. История операций и отклонения от регламента.', out: 'вы видите результат, а не часы работы' },
    { icon: 'link', title: 'Лифты, двери, ваши системы', text: 'Стыкуем робота с системами здания и вашими программами через API платформы, чтобы он ездил между этажами сам.', out: 'меньше ручных переносов и заявок' },
    { icon: 'wrench', title: 'Сервис и инциденты', text: 'Сбой превращается в заявку автоматически, время реакции фиксируется. Предиктивное обслуживание сообщает об износе заранее.', out: 'меньше простоев' },
    { icon: 'gear', title: 'Ваш сценарий', text: 'Нужна логика, которой нет «из коробки»? Пишем софт под ваш процесс в рамках единой платформы.', out: 'под вашу задачу, а не под каталог' },
  ],
  softwareNote: 'Глубина интеграции зависит от доступа, который даёт производитель: открытый API, SDK или только облако. Проверяем это на аудите, до покупки.',
  directions: [
    { anchor: 'floor', title: 'Поломоечные роботы для ровных больших зон', text: 'Офисы, торговые залы, холлы, склады с ровным полом. Основной класс: сюда приходит большая часть заказов.',
      facts: [
        { k: 'Цена на рынке', v: '1,45–3,7 млн ₽', src: SRC.price },
        { k: 'Скорость на практике', v: '300–700 м²/ч', src: SRC.speed },
        { k: 'По паспорту', v: 'до 1 180 м²/ч', src: SRC.speed },
      ] },
    { anchor: 'large', title: 'Крупные машины для складов и производств', text: 'Большие площади, ночные и круглосуточные смены, тяжёлые загрязнения. Паспортные скорости больших машин мы не сверяли: на пилоте измеряем выработку на вашем объекте.',
      facts: [{ k: 'Цена на рынке', v: '5,3–7,7 млн ₽', src: SRC.price }] },
    { anchor: 'dry', title: 'Сухая уборка: подметание и пылесос', text: 'Ковровые покрытия, залы с тканью, пыль. У сухой и мокрой уборки разные рабочие узлы и разная выработка: твёрдый пол и ковёр считаем отдельно.', facts: [] },
    { anchor: 'facade', title: 'Фасады и остекление', text: 'Отдельная задача со своей техникой и своей экономикой. Разобрана на странице бизнес-центров.', facts: [], link: { label: 'Мойка фасадов в бизнес-центрах', href: 'industries-business-centers.html#facades' } },
  ],
  directionsNote: 'Паспортная скорость почти всегда выше практической: сам дилер Gausium называет для Phantas 300–700 м²/ч на практике и 1 180 м²/ч теоретически. Считайте по практической.',
  econ: {
    how: {
      title: 'Наши допущения',
      items: [
        { k: 'Зарплата уборщика', v: '67 000 ₽ в месяц плюс страховые взносы 30%' },
        { k: 'Освобождается людей', v: 'в одну смену не больше 2 ставок на робота и не больше половины штата' },
        { k: 'Остаётся людям', v: '30% работы по полу: углы, кромки, пятна' },
        { k: 'Сервис и расходники', v: '8% цены робота в год, щётки и электричество 60 000 ₽ в год, доля оператора платформы 120 000 ₽ в год' },
        { k: 'Химия и вода', v: 'расход на 40% ниже' },
        { k: 'Срок службы', v: '5 лет' },
      ],
      src: SRC.model,
    },
    market: {
      title: 'Что говорит рынок',
      rows: [
        { value: '≈ 15 мес.', who: 'Наша модель, офис 6 000 м²', what: 'Один робот, одна смена, экономия около 1,8 млн ₽ в год. Считается из допущений слева; пересчитывается в калькуляторе на ваш объект.', src: SRC.model },
        { value: '1,5–2 года', who: 'Сеть «Командор»: Pudu CC1 в 12 гипермаркетах', what: 'Расходы на ФОТ клининга −25%, штат 8 → 6 человек. Ночная уборка осталась у подрядчика. Единственный найденный кейс с названным клиентом и окупаемостью.', src: SRC.komandor },
        { value: '18–22 мес.', who: 'R2B Mark 2', what: 'Расчёт самого производителя: 2 уборщика на смену, цена 2,2 млн ₽, обслуживание 20 тыс. ₽ в месяц.', src: SRC.r2b },
        { value: '12–18 мес.', who: 'Дилер Gausium', what: 'Среднее по заявлению дилера. Интеграторы в рекламе обещают и 3–11 месяцев, но считают, что робот заменяет весь штат.', src: SRC.tco },
      ],
    },
    note: 'Чужие цифры — заявления продавцов, мы их не проверяли. Свои результаты покажем, когда будут объекты с согласованными цифрами. Точный расчёт — после аудита.',
    link: { label: 'Рассчитать для вашего объекта', href: 'roi.html' },
  },
  pilot: [
    { title: 'Аудит объекта', text: 'Площадь по типам покрытия, пороги, лифты и двери, место для станции, время, когда можно убирать. Считаем окупаемость до вложений.' },
    { title: 'Пилот с платформой', text: 'Один робот (ваш или подобранный нами) на вашем объекте с подключением к платформе. Выработку и качество меряем на месте, а не по паспорту.' },
    { title: 'Интеграции и сценарии', text: 'Подключаем лифты, двери и ваши системы, донастраиваем софт под процесс.' },
    { title: 'Масштаб и сервис', text: 'Добавляем роботов и объекты. Мониторинг, заявки и обслуживание ведём по SLA.' },
  ],
  vendors: [{ group: 'Роботы-уборщики', brands: ['pudu', 'gausium', 'keenon', 'lionsbot'] }],
  vendorsLead: 'Подключаем роботов этих и других производителей к одной платформе. Что именно возможно с конкретной моделью, проверяем до покупки.',
  form: { title: 'С какого робота и объекта начать?', lead: 'Опишите объект: площадь, покрытие, режим работы. И скажите, есть ли у вас уже роботы. Подскажем путь и посчитаем эффект.', button: 'Обсудить решение' },
  links: [
    { kicker: 'ПРОДУКТ', title: 'Платформа управления роботами', text: 'Парк, задачи, качество и сервис в одном окне.', href: 'platform.html' },
    { kicker: 'ПРОДУКТ', title: 'Аренда роботов (RaaS)', text: 'Начать без крупных вложений.', href: 'products.html#raas' },
    { kicker: 'УСЛУГА', title: 'Аудит объекта', text: 'Покрытие, лифты, двери, расчёт.', href: 'services.html#audit' },
    { kicker: 'СТАТЬЯ', title: 'Как работает робот-уборщик', text: 'Датчики, карта, какую площадь тянет, когда не подходит.', href: 'knowledge-cleaning-robot-basics.html' },
    { kicker: 'ОТРАСЛИ', title: 'Бизнес-центры и офисы', text: 'Уборка днём и ночью, фасады, доставка.', href: 'industries-business-centers.html' },
    { kicker: 'ОТРАСЛИ', title: 'Ритейл и торговые центры', text: 'Ночная уборка залов, частота проходов.', href: 'industries-retail.html' },
    { kicker: 'ОТРАСЛИ', title: 'Отели и HoReCa', text: 'Общие зоны, холлы и коридоры.', href: 'industries-hotels.html' },
    { kicker: 'ОТРАСЛИ', title: 'Общественные пространства', text: 'Вокзалы, аэропорты, парки.', href: 'industries-public-spaces.html' },
  ],
  sections: ['hero', 'paths', 'problems', 'software', 'directions', 'economy', 'vendors', 'pilot', 'form', 'see'],
};

// Hero: a console of the platform with robots of different brands. Illustrative data, said so in the caption.
const ROBOTS = [
  { id: 'CL-01', bk: 'a', brand: 'бренд А', zone: 'этаж 1, холл', state: 'run' },
  { id: 'CL-02', bk: 'b', brand: 'бренд Б', zone: 'этаж 2, коридор', state: 'run' },
  { id: 'CL-03', bk: 'a', brand: 'бренд А', zone: 'паркинг', state: 'charge' },
  { id: 'CL-04', bk: 'c', brand: 'бренд В', zone: 'этаж 3, зал', state: 'run' },
];
const STATE = { run: 'в работе', charge: 'заряд' };

const hero = (ind, n, h) => `<section class="ih sx-hero wrap" data-sec="${n}"${h.dnName(ind)}>
      <div class="sx-hero__grid">
        <div class="ih__copy">
          ${h.heroCopy(ind, n)}
        </div>
        <figure class="sx-console reveal" style="--i:2">
          <figcaption class="sx-console__h mono"${h.L('hero.consoleTitle')}>Платформа · пример интерфейса</figcaption>
          <ul class="sx-console__list"${h.TA(['aria-label', h.pk('hero.consoleLabel')])} aria-label="Парк роботов разных брендов на одной платформе">
            ${ROBOTS.map((r) => `<li class="sx-bot sx-bot--${r.state}"><b class="mono">${r.id}</b><span class="sx-bot__brand"${h.L(`hero.brand.${r.bk}`)}>${r.brand}</span><span class="sx-bot__zone"${h.L(`hero.zone.${r.id.toLowerCase()}`)}>${r.zone}</span><span class="sx-bot__st"${h.L(`hero.state.${r.state}`)}>${STATE[r.state]}</span></li>`).join('\n            ')}
          </ul>
          <p class="sx-console__f"><b class="tnum">3</b> <span${h.L('hero.consoleFoot')}>бренда, один оператор. Демо-данные.</span></p>
        </figure>
      </div>
    </section>`;

// Signature: the six things the software adds. Dark stage, a head on the left and the list on the right.
const software = (ind, n, h) => `<section class="sol-sec" id="software" data-sec="${n}"${h.dn(ind, 'software')} aria-labelledby="software-h">
      <div class="stage sx-sw">
        <div class="sx-sw__head">
          ${h.idx(n, h.secName(ind, 'software'))}
          <h2 class="h2 reveal" id="software-h"${h.T(ind.heads, 'software')}>${h.esc(ind.heads.software)}</h2>
          <p class="lead reveal"${h.T(ind.heads, 'softwareLead')}>${h.esc(ind.heads.softwareLead)}</p>
          <a class="text-link reveal" href="platform.html"><span${h.L('software.more')}>Как устроена платформа</span> ${h.ARROW_R}</a>
        </div>
        <ol class="sx-sw__list">
          ${ind.software.map((s, i) => `<li class="sx-cap reveal" style="--i:${i}">
            <span class="ic-tile">${h.icon(s.icon)}</span>
            <div><h3${h.T(s, 'title')}>${h.esc(s.title)}</h3><p${h.T(s, 'text')}>${h.esc(s.text)}</p></div>
            <span class="sx-cap__out mono"><span${h.L('software.gets')}>Вы получаете:</span> <span${h.T(s, 'out')}>${h.esc(s.out)}</span></span>
          </li>`).join('\n          ')}
        </ol>
        <p class="sx-sw__note"${h.T(ind, 'softwareNote')}>${h.esc(ind.softwareNote)}</p>
      </div>
    </section>`;

export default { industry, renderers: { hero, software, ...shared }, data: { sources: SRC }, icons: [
    '<symbol id="i-fleet" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M14 17.5h7M17.5 14v7"/></symbol>',
    '<symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></symbol>',
    '<symbol id="i-wrench" viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-2.6-.6-.6-2.6z"/></symbol>',
    '<symbol id="i-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></symbol>',
  ] };
