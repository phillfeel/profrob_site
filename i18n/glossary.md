# Glossary RU → EN (сайт ПРОФРОБОТ)

Версия 0.1 · 2026-10-06 · Агент 2 (Фаза A). Рабочий документ для перевода `i18n/ru.json` → `i18n/en.json`.

Как читать:
- **Утверждённый EN** — вариант, который используем везде, пока заказчик не решит иначе. Один термин = один перевод на весь сайт.
- **Проверено** — ключ источника из раздела «Источники терминологии» в конце. Это страницы, открытые в этой сессии (поиск или чтение страницы). «Не проверено» = выбор по общепринятому употреблению, источник в этой сессии не открывал.
- **ПРОВЕРИТЬ** — нет подтверждённого официального написания или нужен ответ заказчика.
- **РЕШЕНИЕ ЗАКАЗЧИКА** — выбор влияет на бренд, юридическую сторону или позиционирование.
- Вариант орфографии: американский (см. `style-guide.md`, §2): *center, labor, color, program*. Имена собственные пишем как у их владельца (*Ministry of Labour*).

---

## 1. Бренд, продукты, платформа

| RU | Утверждённый EN | Заметки |
|---|---|---|
| Профессиональная Робототехника | **Professional Robotics** | **РЕШЕНИЕ ЗАКАЗЧИКА (2026-10-07):** компания переименована из ПРОФРОБОТ в «Профессиональная Робототехника», английское название — Professional Robotics (заглавные буквы как в имени собственном). Не склонять, без кавычек. Домен `profrobot.ru`, адрес `info@profrobot.ru` и подпись `PROFROBOT.RU/ROI` на картинке-расчёте пока прежние: новый домен не назван. В заголовках страниц английское название стоит после `|`, поэтому описательная часть сокращена, чтобы заголовок не превышал 60 знаков. |
| Платформа Профессиональная Робототехника | **Professional Robotics Platform** | Первое упоминание на странице: *Professional Robotics Platform, our in-house platform for managing robots of any type*, дальше *the platform*. Так требует ТЗ (§1.9) для RU. |
| Платформа Профессиональная Робототехника для управления роботами любых типов | Professional Robotics Platform for managing robots of any type | см. выше |
| Cleaning Operations Platform | **Cleaning Operations Platform** | Уже по-английски, оставляем как на сайте. Внимание: ТЗ (§1.9 дистиллята) запрещает это название («платформа не только для уборки»), а отраслевые страницы его используют в «Смотрите также». Противоречие RU-версии, не переводческое; передать заказчику. |
| Fleet Management | Fleet Management | Название продукта, не переводим. |
| Диспетчеризация (продукт) | Dispatch | Название продукта в карточке «Смотрите также». |
| Аренда роботов (RaaS) | Robots-as-a-Service (RaaS) | В EN аббревиатура понятна, поэтому порядок обратный: сначала полное название. В тексте: *robot rental (RaaS)* там, где важно слово «аренда». Проверено: [raas]. |
| Retrofit | Retrofit | Без изменений. |
| AI-модули | AI modules | |
| AI-агенты (своей разработки) | AI agents (built in-house) | |
| Open API | Open API | |
| Адаптеры производителей | Manufacturer adapters | Блок платформы. |
| Карта и диспетчеризация | Maps and dispatch | |
| Сценарии между роботами | Multi-robot workflows | Отвергнуто: *scenarios between robots* (калька). |
| Аналитика и SLA | Analytics and SLA | |
| Сценарий «Гость» · v1.3 | "Guest" workflow · v1.3 | Элемент макета диспетчерской. |
| Своя разработка · данные хранятся в РФ | In-house development · data stored in Russia | См. риски (`style-guide.md`, §10, R5). |

## 2. Решения (9 направлений), услуги, модели работы

| RU | Утверждённый EN | Заметки |
|---|---|---|
| Решения (раздел) | Solutions | |
| направление (роботизации) | area / solution area | «9 направлений роботизации» → *9 areas of robotics*. Отвергнуто: *directions* (калька). На отраслевых страницах блок «Направления» → *Applications*. |
| роботизация | robotics; automation with robots | «Роботизация для бизнеса» → *Robotics for business*. Отвергнуто: *robotization* — слово есть, но звучит не по-английски в B2B-маркетинге. |
| Роботизированный клининг | **Robotic cleaning** | Проверено: Gausium называет Phantas *robotic floor cleaner* [gausium], Pudu — *commercial cleaning robot* [pudu-cc1]. |
| Складская роботизация | **Warehouse robotics** | |
| Сервисные роботы | **Service robots** | |
| Промышленная роботизация | **Industrial robotics** | |
| Медицинская робототехника | **Healthcare robotics** | Отвергнуто: *Medical robotics* — в EN это хирургические роботы и медизделия, а на сайте речь о доставке и дезинфекции в клиниках. Это ещё и снижает регуляторный риск (см. риски R7). |
| Строительная робототехника | **Construction robotics** | |
| Агророботы | **Agricultural robots** | Короткая метка в UI: *Agri robots*. |
| Агророботы и уход за территорией | Agricultural and grounds-care robots | |
| Роботы безопасности | **Security robots** | |
| Гуманоидные роботы | **Humanoid robots** | |
| Под запрос | On request | Метка у гуманоидов. |
| Подбор оборудования / Подбор решения | Equipment selection / Solution selection | |
| Интеграция | Integration | |
| Обучение людей / персонала | Staff training | |
| Сервис по SLA | **SLA-backed service** | В шагах процесса: *Service under SLA*. |
| Сервисное обслуживание | Maintenance and service | |
| Аудит объекта | **Site assessment** | Отвергнуто: *site audit* — в EN «audit» звучит как финансовая или регуляторная проверка. Глагол: *assess your site*. |
| Аудит здания под роботов | Robot-readiness assessment of your building | |
| Аудит территории | Site assessment (outdoor areas) | |
| Обследование территории | Site survey | |
| Обход здания / клуба | Walkthrough of the building / club | |
| Пилот, пилотный проект | Pilot, pilot project | |
| Внедрение | **Deployment** | Отвергнуто: *implementation* — допустимо, но *deployment* привычнее в робототехнике. |
| Внедрение под ключ | Turnkey deployment | |
| Помощь в покупке | Purchase support | |
| Аналитика и развитие | Analytics and scaling | |
| Масштабирование | Scaling up | |
| Уборка как услуга | Cleaning as a service | Строчными, не как торговая марка. |
| Подрядчик владеет роботами | The contractor owns the robots | |
| Независимый инженерно-сервисный интегратор роботизации | Independent robotics integrator: engineering and service | Футер. |
| Не привязаны к бренду / без привязки к одному вендору | Vendor-neutral / not tied to any single vendor | |
| эксклюзив (у нас нет эксклюзива) | exclusive distribution deal | |

## 3. Техника и технические термины

| RU | Утверждённый EN | Заметки |
|---|---|---|
| робот-уборщик, клининговый робот | **cleaning robot** | Проверено: [pudu-cc1]. |
| поломоечный робот | **robotic floor scrubber** | Короче: *scrubber robot*. Проверено: [gausium] (*autonomous floor cleaning robot*, режим *scrubbing*). |
| робот-полотёр (подпись на главной) | floor-cleaning robot | |
| пылесосный робот | robotic vacuum | |
| подметальный робот, автономная подметальная машина | **robotic sweeper**; autonomous sweeper | Проверено: Pudu MT1 — *robotic sweeper* [pudu-mt1]. |
| крупные машины без водителя (паркинг) | large driverless scrubbers | |
| робот-мойщик фасадов | **facade-cleaning robot** | Проверено: X-Human называет K3 *High-Rise Flat Facade Cleaning Robot* [xhuman]; в отрасли также *window-cleaning robot* [skyline]. |
| мойка фасадов | **facade cleaning**; facade and window cleaning | В калькуляторе вкладка: *Facade cleaning*. |
| мойка остекления, сплошное остекление | glass cleaning; continuous glazing / curtain wall | *curtain wall* — для специалистов; на сайте достаточно *continuous glass facade*. |
| горизонтальные рамы (выше 10 мм) | horizontal mullions / frames (over 10 mm) | *mullion* — точный термин, но в UI проще *horizontal frames*. |
| альпинисты (промышленные), подрядчик-альпинист | **rope access technicians**; rope access contractor | Проверено: [rope]. Отвергнуто: *alpinists*, *climbers*. |
| страхующий на кровле | roof safety attendant | Не проверено. Описательно: *a safety attendant on the roof*. |
| монтаж с кровли, спускается с кровли на тросе | roof-mounted; descends from the roof on a cable | |
| робот-доставщик, робот-курьер | **delivery robot** | |
| доставка последней мили | last-mile delivery | |
| робот-официант | serving robot | Не проверено в этой сессии. |
| гостиничный робот, room service | hotel delivery robot; room service | |
| роботизированный консьерж / стойка регистрации | robotic concierge / self-service front desk | |
| складской AMR-робот, AMR | **autonomous mobile robot (AMR)** | Проверено: [forwardx]. При первом упоминании расшифровать (так требует и ТЗ §1.9 для RU). |
| follow-me | follow-me mode | Проверено: [forwardx]. |
| тележки, стеллажи (возит) | carts, racks | |
| промышленный манипулятор | industrial robot arm | Отвергнуто: *manipulator* в маркетинге (термин инженерный, звучит тяжело). В перечнях допустимо *robotic manipulators*. |
| кобот, коллаборативный робот | **cobot (collaborative robot)** | |
| роботизированная ячейка, кобот-ячейка | robotic cell; cobot cell | |
| гуманоид | humanoid | |
| шагающие роботы | legged robots | Программа РТУ МИРЭА «Шагающие роботы» — см. §9. |
| четвероногие роботы | quadruped robots | |
| агродрон | **agricultural drone**; spray drone | Проверено: DJI Agriculture [dji]. |
| роботы-опрыскиватели | robotic sprayers | |
| демонтажный робот | **demolition robot**; remote-controlled demolition machine | Проверено: [brokk]. |
| дистанционно управляемая техника для откосов | **remote-control slope mowers** | Проверено: Koham сам пишет *remote control slope mower* [koham]. Не называть их *robots* — в этом и смысл оговорки в исследовании. |
| роботизированная косилка, робот-косилка | **robotic mower** | Проверено: Husqvarna [husqvarna]. |
| без провода по периметру | wire-free (virtual boundaries) | Проверено: [husqvarna]. |
| робот разметки полей | **robotic line marker** | Проверено: FJD [fjd]. |
| подводный робот-пылесос для бассейна | **robotic pool cleaner** | Проверено: Maytronics [maytronics]. |
| робот безопасности, патрульный робот | security robot; patrol robot | |
| робот-навигатор / -консультант / -гид | wayfinding robot / information robot / museum guide robot | |
| роботы обеззараживания, дезинфекция | disinfection robots | Не добавлять *UV*: на сайте технология не названа. |
| автономные больничные тележки | autonomous hospital carts | |
| реабилитационные роботы, экзоскелеты | rehabilitation robots, exoskeletons | |
| AI-массажные системы | AI-powered massage systems | |
| док-станция, станция | **docking station** | |
| станция «3 в 1»: заряд, слив грязной воды, налив чистой | 3-in-1 station: charging, draining dirty water, refilling clean water | |
| мобильный бак | mobile water tank | |
| навесное оборудование, сменные отвалы и щётки | attachments; interchangeable snow blades and brushes | |
| распределение реагентов, антигололёдная смесь | de-icer spreading; de-icing mix | |
| насадка-пылесос для тополиного пуха | vacuum attachment for poplar fluff | |
| лидар, камеры | lidar, cameras | |
| карта помещений (строит сам) | builds its own map of the space | |
| аварийная кнопка | emergency stop button | |
| порог входа (низкий / средний / выше среднего) | entry cost: low / medium / above average | Отвергнуто: *entry threshold* (калька). |
| предиктивное обслуживание | predictive maintenance | |
| AI-инспекция, обходы оборудования | AI inspection; equipment inspection rounds | |
| внутрицеховая логистика | in-plant logistics; intralogistics | |
| Интеграция с лифтами | Elevator integration | Брит. *lift* не используем (US-орфография). |
| Автодоводчики дверей | Automatic door operators | Не проверено. |
| Зоны зарядки, Точки воды, Стабильный Wi-Fi | Charging areas, Water points, Reliable Wi-Fi | Чек-лист БЦ. |
| 1С и ERP | 1C and ERP | 1C — официальное латинское написание компании 1С (не проверено в этой сессии). Для иностранца: *1C (Russian ERP)* при первом упоминании. |
| WMS склада, MES | warehouse WMS, MES | |
| Лифты и двери | Elevators and doors | |
| СКУД и охрана | Access control and security | Отвергнуто: аббревиатура *ACS*. |
| BMS здания | Building BMS | |
| Мессенджеры и почта | Messaging apps and email | |

## 4. Отрасли (11 страниц + главная)

На главной 12 строк, отраслевых страниц 12. Названия на главной и на самих страницах расходятся («Медицинские объекты» / «Медицина и велнес», «Агро и фермерские хозяйства» / «Сельское хозяйство»). В EN одна пара *полное название / короткая метка* на отрасль.

| Slug | RU (главная / страница) | Утверждённый EN: полное · короткое | Заметки |
|---|---|---|---|
| business-centers | Бизнес-центры и офисы | **Office buildings** · Offices | Отвергнуто: *Business centers*. Это русизм; в EN *business center* — комната с принтером в отеле. «БЦ класса А» → *Class A office building*. |
| retail | Торговые центры и ритейл | **Shopping centers and retail** · Retail | *mall* допустимо в тексте; «ТРЦ» → *shopping and entertainment center*. |
| (warehouse) | Склады и логистика | **Warehousing and logistics** · Logistics | Своя страница `industries-warehouse.html`. |
| hotels | Отели и HoReCa | **Hotels and hospitality** · Hotels | HoReCa понятна в Европе, в США почти нет. Оставить в списках аудитории: *hotels, restaurants, cafés (HoReCa)*. |
| medical-wellness | Медицинские объекты / Медицина и велнес | **Healthcare and wellness** · Healthcare | См. «Healthcare robotics» в §2. |
| construction | Строительство и девелопмент / Строительство | **Construction and development** · Construction | |
| manufacturing | Промышленность и производство | **Manufacturing and industry** · Manufacturing | |
| public-spaces | Общественные пространства | **Public venues and transport hubs** · Public venues | Отвергнуто: *Public spaces* — в EN это парки, площади и улицы, а они на муниципальной странице. На самой странице вокзалы, аэропорты, музеи, МФЦ и концертные площадки. |
| municipal | Муниципальные службы | **Municipal services** · Municipal | Альтернатива *City services*; *public works* уже по смыслу. |
| agriculture | Агро и фермерские хозяйства / Сельское хозяйство | **Agriculture and farming** · Agriculture | |
| education | Образовательные учреждения | **Education** · Education | H1 страницы уже называет школы, колледжи и вузы. |
| fitness-sports | Фитнес-клубы и спорткомплексы | **Fitness clubs and sports facilities** · Fitness & sports | |
| — | Отрасли (раздел) / Все отрасли | Industries / All industries | «Все 12 отраслевых страниц» → *All 12 industry pages*. |

## 5. Экономика, финансы, калькулятор

| RU | Утверждённый EN | Заметки |
|---|---|---|
| окупаемость | **payback**; payback period | «Рассчитать окупаемость» → *Calculate payback*. |
| ROI | ROI | При первом упоминании: *ROI (return on investment)*. |
| калькулятор окупаемости | payback calculator; ROI calculator | Название страницы: *Robot ROI calculator*. |
| Полный расчёт ROI | Full ROI calculation | |
| окупился на N-м мес. | pays back in month N | Подпись графика. |
| не окупается | no payback | В калькуляторе: *Doesn't pay back* + пояснение. |
| ≈ N мес | ≈ N months | В узком UI: *≈ N mo*. |
| Оценка экономии в год / экономия в год | Estimated annual savings / annual savings | |
| Эффект за 5 лет | 5-year net benefit | |
| Накопленная выгода, 5 лет | Cumulative net benefit, 5 years | |
| Ставок уходит с полов | FTEs freed from floor cleaning | *FTE* знакомо B2B-аудитории. |
| ставка (штатная) | FTE; position | |
| штат, свой штат | in-house staff | «Кто убирает сейчас: Свой штат / Клининговая компания» → *In-house staff / Cleaning contractor*. |
| ФОТ | payroll; payroll costs | |
| зарплата на руки | take-home pay | |
| медиана (зарплаты) | median salary | |
| НДФЛ | personal income tax (13%) | Ставку указывать, только если она есть в RU-тексте. |
| страховые взносы (×1,3; 30%) | employer social contributions (×1.3; 30%) | |
| Покупка / Лизинг | Purchase / Leasing | |
| рассрочка | installment plan | |
| аванс 20%, 36 месяцев | 20% down payment, 36 months | |
| лизинг и рассрочка от ведущих банков РФ | leasing and installment plans from leading Russian banks | |
| КП, коммерческое предложение | **proposal**; commercial proposal | Отвергнуто: аббревиатура *CP*. «Получить точный расчёт и КП» → *Get a detailed estimate and proposal*. |
| расчёт (предварительный / точный) | estimate (preliminary / detailed) | |
| Расчётный ориентир | **Indicative estimate** | Флаг-метка. |
| по нашей ROI-модели | based on our ROI model | |
| Цена 1 м² мойки для вас · Подрядчик · С роботом | Your cost per m² · Contractor · With robot | |
| Загрузка сезона | Season utilization | |
| Моек в год | Cleanings per year | |
| Площадь остекления | Glazed area | |
| Цена мойки у подрядчика | Contractor price per cleaning | |
| Зарплата оператора / уборщика | Operator wage / Cleaner wage | Подпись «на руки, на человека» → *take-home, per person*. |
| Режим уборки: 1 смена / 2 смены / 24/7 | Cleaning schedule: 1 shift / 2 shifts / 24/7 | |
| Тип объекта: Офис / БЦ · ТЦ · Склад · Клиника · Отель | Site type: Office · Mall · Warehouse · Clinic · Hotel | Ключи модели `roi-model.js` не трогаем, переводим только `name`. |
| Уборщиков сейчас | Current cleaners | |
| Подставили по норме для такой площади. Можно поправить. | Pre-filled from the norm for this area. You can change it. | |
| Вернуть норму | Reset to norm | |
| домывка вручную | manual touch-up | |
| расходники; химия и вода | consumables; chemicals and water | |
| сервис 8% цены в год | service at 8% of the price per year | |
| амортизация | depreciation | |
| срок службы | service life | |
| CAPEX, капзатраты | capex | |
| дорогая химия | expensive chemicals | |
| маржа клининговой компании | cleaning contractor margin | |
| Поделиться · Картинка | Share · Image | Кнопки калькулятора. |
| Ссылка на расчёт скопирована | Link to your estimate copied | Toast. |

## 6. Навигация, кнопки, метки секций, форма

### 6.1 Навигация и футер

| RU | EN | Заметки |
|---|---|---|
| Решения · Отрасли · Платформа · Кейсы · Контакты | Solutions · Industries · Platform · Case studies · Contact | Отвергнуто: *Cases*. |
| Связаться | Contact us | |
| Основная навигация (aria) | Main navigation | |
| Профессиональная Робототехника — на главную (aria) | Professional Robotics home | |
| Хлебные крошки (aria) · Главная | Breadcrumbs · Home | |
| Продукты · Услуги · База знаний · О компании · Производители | Products · Services · Knowledge base · About us · Manufacturers | |
| Разделы · Компания · Связь · Статус | Sections · Company · Contact · Status | Колонки футера. |
| Отдел внедрения | Deployment team | |
| Сервис на связи 24/7 | Service desk 24/7 | |
| Москва · сервис по РФ | Moscow · service across Russia | |
| МСК (часы в футере) | MSK (Moscow time, UTC+3) | В EN стоит показать *MSK* и смещение. |
| © 2026 Профессиональная Робототехника. Все права защищены. | © 2026 Professional Robotics. All rights reserved. | |
| Политика конфиденциальности | Privacy policy | |
| Реквизиты | Company details | |
| Наверх · На главную | Back to top · Home | |

### 6.2 CTA и ссылки

| RU | EN |
|---|---|
| Рассчитать окупаемость | Calculate payback |
| Рассчитать окупаемость за 2 минуты | Calculate payback in 2 minutes |
| Посмотреть кейсы / Все кейсы / Смотреть кейс | See case studies / All case studies / View case study |
| Подобрать решение | Find a solution |
| Обсудить разработку | Discuss custom development |
| Подробнее о платформе ↗ / Как устроена платформа | More about the platform ↗ / How the platform works |
| Заказать звонок | Request a call |
| Получить расчёт и КП | Get an estimate and proposal |
| Заказать демо / в отеле | Book a demo / Book an on-site demo |
| Обсудить пилот (на объекте / в ТЦ / на территории) | Discuss a pilot (on your site / in your mall / on your grounds) |
| Заказать аудит (объекта) | Book a site assessment |
| Проверить здание под роботов | Check your building's robot readiness |
| Запросить консультацию | Request a consultation |
| Рассчитать эффект пилота | Estimate the pilot's impact |
| Рассчитать экономию на персонале / на СЗР | Estimate staff savings / Estimate crop protection savings |
| Подробнее | Learn more |
| Как мы считали | How we calculated this |
| Решение: … ↗ | Solution: … ↗ |
| Смотреть ↓ / К сценарию ↓ | See below ↓ / Go to scenario ↓ |
| Или позвоните: … | Or call: … |
| Или сами рассчитайте окупаемость | Or calculate payback yourself |

### 6.3 Метки секций (капителью, моно-шрифт)

| RU | EN | | RU | EN |
|---|---|---|---|---|
| ГЕРОЙ | INTRO | | ПРОБЛЕМЫ | CHALLENGES |
| ЗАДАЧИ | USE CASES | | НАПРАВЛЕНИЯ | APPLICATIONS |
| ВНЕДРЕНИЕ | DEPLOYMENT | | ЭКОНОМИКА | ECONOMICS |
| РЕЗУЛЬТАТ | RESULTS | | ОБОРУДОВАНИЕ | EQUIPMENT |
| ПЛАТФОРМА | PLATFORM | | КЕЙС / КЕЙСЫ | CASE STUDY / CASE STUDIES |
| ПЛАТФОРМА · ДИСПЕТЧЕРСКАЯ | PLATFORM · CONTROL ROOM | | ПОЧЕМУ МЫ | WHY US |
| ОТРАСЛИ / ОТРАСЛЬ | INDUSTRIES / INDUSTRY | | ЗАЯВКА | GET IN TOUCH |
| РЕШЕНИЯ / РЕШЕНИЕ | SOLUTIONS / SOLUTION | | СМОТРИТЕ ТАКЖЕ | SEE ALSO |
| ПРОДУКТ / УСЛУГА | PRODUCT / SERVICE | | СОСТАВ РЕШЕНИЯ | WHAT'S INCLUDED |
| СЦЕНАРИИ | SCENARIOS | | СУТКИ ОТЕЛЯ | A DAY IN A HOTEL |
| БЕЗОПАСНОСТЬ | SAFETY | | МАРШРУТ | ROUTE |
| С ЧЕГО НАЧАТЬ | GETTING STARTED | | СЕЗОН | SEASON |
| ГОТОВНОСТЬ ЗДАНИЯ | BUILDING READINESS | | РАСПИСАНИЕ | BELL SCHEDULE |
| ВНЕДРЕНИЯ | DEPLOYMENTS | | КАРТА ЗОН | ZONE MAP |
| ПРАКТИКА | IN PRACTICE | | КАК КУПИТЬ | HOW TO BUY |
| ПОТОК | PASSENGER FLOW | | ГДЕ РАБОТАЕТ | IN SERVICE |
| ЧАСТОТА УБОРКИ | CLEANING FREQUENCY | | ОКУПАЕМОСТЬ | PAYBACK |
| — КАЛЬКУЛЯТОР | — CALCULATOR | | КП | PROPOSAL |

### 6.4 Форма

| RU | EN |
|---|---|
| Имя · Телефон · E-mail · Компания и объект | Name · Phone · Email · Company and site |
| Что автоматизировать / Направление · необязательно | What to automate / Area · optional |
| Пока не знаю | Not sure yet |
| Например, БЦ «Северный», Москва | e.g. Severny office building, Moscow |
| Согласен на обработку персональных данных (по 152-ФЗ) | I consent to the processing of my personal data (under Russian Federal Law No. 152-FZ) — формулировку согласовать с юристом, см. риск R4 |
| Без согласия мы не можем принять заявку | We can't accept your request without your consent |
| Напишите, как к вам обращаться | Please tell us your name |
| Нужен номер из 10 цифр после +7 | см. риск R3: валидацию нужно переделать под международные номера, текст ошибки меняется вместе с ней |
| Проверьте адрес: в нём нет @ или домена | Check the address: it's missing @ or a domain |
| Не заполняйте (honeypot) | Leave this field empty |
| Заявка принята. Перезвоним в рабочее время. | Request received. We'll call you back during business hours (Moscow time). |
| Инженер свяжется с вами в течение рабочего дня. | An engineer will get back to you within one business day. |
| Не получилось отправить. Позвоните нам: … | Couldn't send your request. Please call us: … |
| Нет соединения с интернетом… повторите | No internet connection. Check your connection and try again. |

## 7. Люди, объекты, процессы (отраслевая лексика)

| RU | EN | Заметки |
|---|---|---|
| управляющая компания (УК) БЦ / ТЦ / ЖК | property management company; mall management company; residential property manager | |
| АХО, АХЧ | facilities department | |
| facility-операторы | facility management (FM) providers | |
| девелопер | developer | |
| арендаторы | tenants | |
| клининговая компания, клининг | cleaning contractor; cleaning (services) | Отвергнуто: *clining* и прочие кальки. |
| уборщики, уборщицы | cleaners; cleaning staff | Нейтрально по роду. В школах можно *custodial staff*. |
| завхоз | facilities manager | |
| линейный персонал | frontline staff | |
| младший / средний медперсонал | support staff / nursing staff | |
| горничные | housekeeping staff | |
| ночная бригада, ночные доплаты | night crew; night-shift premiums | |
| текучка | staff turnover | |
| дефицит рабочих рук / персонала | labor shortage | |
| мигранты, иностранцы в персонале | migrant workers; foreign nationals | См. риск R8. |
| лифтовой холл, лобби | elevator lobby, lobby | |
| паркинг (подземный / крытый / открытый) | underground parking garage / indoor parking / open parking lot | |
| галерея ТЦ, торговый зал | mall concourse; sales floor | |
| фудкорт | food court | |
| даркстор | dark store | |
| зона овощей и фруктов | produce section | |
| зал ожидания, терминал, переходы | waiting hall, terminal, concourses | |
| пассажиропоток, пик, провал между пиками | passenger flow; peak; off-peak lull | |
| рекреация (школьная) | school hallways | Отвергнуто: *recreation area* (в EN это зона отдыха или спортплощадка). |
| перемена, урок, звонок | break, class (lesson), bell | |
| спортзал, обеденный (актовый) зал | gym; cafeteria (assembly hall) | |
| тренажёрный зал, зона свободных весов, кардиозона | gym floor; free-weights area; cardio area | |
| раздевалки, душевые, санузлы | locker rooms, showers, restrooms | |
| чаша бассейна, санитарный час | pool basin; sanitary closure hour | |
| аптека → отделение → лаборатория, бельевая | pharmacy → ward → lab; linen room | |
| анализы (развезти) | lab samples | |
| демонтаж, отделка, штукатурка, шпаклёвка, стяжка, кладка | demolition, finishing, plastering, skim coating, floor screeding, blockwork | |
| генподрядчик | general contractor | |
| охрана труда, травматизм | occupational safety; workplace injuries | |
| наряд-допуск, допуск к работам на высоте | permit-to-work; work-at-height certification | |
| застройщик | developer | |
| агрохолдинг, фермерское хозяйство, тепличный комплекс | agricultural holding; farm; greenhouse operation | |
| СЗР, средства защиты растений | **crop protection products** | Проверено: [cpp]; *plant protection products* — регуляторный синоним (ЕС). Аббревиатуру не вводим. |
| окно обработки, межсезонье, всходы | spray window; off-season; emergence | |
| точное земледелие | precision farming | |
| аллеи, дорожки, тротуары, набережная | park paths, walkways, sidewalks, riverfront promenade | Отвергнуто для набережной: *embankment* (путается с откосом/дамбой на той же странице). |
| откосы, дамбы, склоны | slopes, dams, embankments | |
| листопад, снегопад, тополиный пух | leaf fall, snowfall, poplar fluff | |
| зимнее содержание | winter maintenance | |
| благоустроенные территории | public grounds | |
| вау-эффект | wow factor | |
| честно о рисках | the honest caveats | |

## 8. Регуляторика и российские реалии

Общее правило (см. `style-guide.md`, §8): номер документа сохраняем точно, суть даём коротким английским описанием. Официальных английских названий у большинства документов нет.

| RU | EN | Заметки |
|---|---|---|
| 44-ФЗ | Federal Law No. 44-FZ (public procurement) | Полное название в англоязычных обзорах: *On the contract system in state and municipal procurement…* [procurement]. На сайте хватит короткой формы. |
| 223-ФЗ | Federal Law No. 223-FZ (procurement by state-owned companies) | Проверено: [procurement]. |
| 152-ФЗ | Federal Law No. 152-FZ on Personal Data | Не проверено в этой сессии. |
| нацрежим, национальный режим в госзакупках | Russia's national procurement regime (restrictions on foreign goods) | Описательно. ПРОВЕРИТЬ у юриста формулировку для EN. |
| ПП РФ № 1875 от 23.12.2024 | Russian Government Decree No. 1875 of 23 December 2024 | Приложение 1 → *Annex 1 (ban on foreign goods)*; п. 98 → *item 98*. |
| ПП РФ № 1247 от 30.09.2026, ЭПР | Government Decree No. 1247 of 30 September 2026; experimental legal regime | *experimental legal regime* — устоявшийся перевод ЭПР (не проверено в этой сессии). |
| ОКПД2, код 29.10.59.130 | OKPD2 (Russian product classification) code 29.10.59.130 | Код без изменений. |
| «Средства транспортные для коммунального хозяйства и содержания дорог» | "Vehicles for municipal services and road maintenance" | Наш описательный перевод, в кавычках; не выдавать за официальный. |
| приказ Минтруда № 782н | Order No. 782n of the Russian Ministry of Labour (work-at-height safety rules) | Брит. *Labour* — часть имени собственного. |
| СП 2.1.3678-20, СП 2.4.3648-20 | Sanitary rules SP 2.1.3678-20 / SP 2.4.3648-20 | Пояснение: *Russian sanitary rules for sports facilities / for schools*. |
| санправила | sanitary rules | |
| Роспотребнадзор | Rospotrebnadzor (Russia's public health and consumer protection authority) | Общепринятая транслитерация, в этой сессии не проверял. |
| ЦГОН Роспотребнадзора | Rospotrebnadzor's hygiene training center (TsGON) | ПРОВЕРИТЬ: официального английского названия не нашёл. |
| ГБУ «Жилищник» | Zhilishchnik (Moscow municipal housing maintenance agencies) | ПРОВЕРИТЬ: официального EN нет. |
| ГБУ по содержанию дорог | municipal road maintenance agencies | |
| дирекции парков | park authorities | |
| департаменты образования | education departments | |
| МФЦ, «Мои документы» | public service centers ("My Documents") | Проверено: mos.ru/en [mfc]. |
| госзакупки, госзаказчик | public procurement; public-sector buyer | |
| бюджетный заказчик | public-sector buyer | |
| электронный аукцион | electronic auction | |
| Приоритет-2030 | Priority 2030 (federal university development program) | Не проверено. |
| данные хранятся в РФ | data stored in Russia | См. риск R5. |
| Сколково, Технопарк «Сколково» | Skolkovo; Skolkovo Technopark | Общепринятое написание. |
| Москва-Сити | Moscow City (business district) | По [icity]: iCity — комплекс в Moscow City. |

## 9. Аббревиатуры и единицы

| RU | EN | Заметки |
|---|---|---|
| SLA | SLA | При первом упоминании: *SLA (service level agreement)*. |
| ROI, AMR, RaaS, API, AI, ERP, WMS, MES, BMS | без изменений | Расшифровка при первом упоминании на странице, кроме API и AI. |
| ИИ / AI | AI | |
| ЧПУ (станок с ЧПУ) | CNC (CNC machine) | |
| ТЦ, ТРЦ, БЦ | mall / shopping center; office building | Аббревиатуры не переносить. |
| РФ, по России | Russia; across Russia | |
| м², тыс. м² | m²; 36,000 m² | Тысячи пишем числом, не *36 thousand m²*. |
| м²/ч | m²/h | |
| га | ha | |
| мм, м, м/с, км/ч | mm, m, m/s, km/h | |
| кг, т (тонн воды) | kg, t | Для воды в тексте понятнее *tonnes*: *11 t (tonnes) a year*. |
| л | L | Заглавная, чтобы не путать с 1. |
| ч, мин | h, min | В тексте: *hours*, *minutes*. |
| мес | months / mo | |
| ₽, руб., млн ₽, тыс. ₽ | RUB; RUB 5.45 million / RUB 5.4M | **РЕШЕНИЕ ЗАКАЗЧИКА**, см. `style-guide.md`, §5. Без конвертации в USD/EUR. |
| ×1,3; ×2–3 | ×1.3; ×2–3 | |
| ≈, ~, >, до, более, от | ≈, ~, >, up to, more than, from | «до 30%» → *up to 30%*. |
| п. (пункт) | item | |
| № | No. | «школа №281» → *School No. 281*. |

---

## 10. Не переводить / транслитерировать

Правило: латинское написание берём у владельца (сайт, пресс-релиз, Википедия по официальным данным). Если его нет, транслитерируем по BGN/PCGN без диакритики (ж→zh, х→kh, ц→ts, ч→ch, ш→sh, щ→shch, ы→y, й→y, ё→yo/e) и ставим «ПРОВЕРИТЬ». Кавычки-ёлочки в EN не нужны: названия компаний без кавычек, названия объектов и программ — в двойных кавычках “ ”, только если иначе непонятно, что это имя.

### 10.1 Производители (логотипы и подписи на сайте)

Написание берём из `tools/industries/data.mjs` (поле `name`, взято с официальных логотипов, см. `assets/logos_official_bundle_updated/README.md`). На сайте менять его нельзя.

| Бренд | EN | Откуда |
|---|---|---|
| KEENON Robotics, Pudu Robotics, OrionStar Robotics, Gausium, LionsBot, UBTECH Robotics, SANY, BMR, Bright Dream Robotics, We-I-Build, Fangshi, Legend Robot, Derutu, Dafang, Xlija, Elite Robots, Realman Robotics, SIASUN, Hikrobot, Quicktron Robotics, ForwardX Robotics, AgileX Robotics, Unitree Robotics, DEEP Robotics, XAG, DJI Agriculture, EAVision, FJ Dynamics, AI Force Tech, Koham, Leking | как в `BRANDS` | `data.mjs`. Регистр сохранять: KEENON, UBTECH, SANY, SIASUN, XAG, DEEP; Koham на своём сайте пишет KOHAM [koham], у нас Koham — менять не предлагаю, на сайте это текст-заглушка. |
| Mare-X, Maxpower | Mare-X, Maxpower | `data.mjs`. Комментарий в коде: на сайте Maxpower стоит бренд LIREACH. ПРОВЕРИТЬ у заказчика. |
| Maytronics, Husqvarna | Maytronics, Husqvarna | `fitness-sports.mjs`; [maytronics], [husqvarna]. |
| X-Human (Lingkong) | X-Human | Проверено: [xhuman]. Компания *X-Human (Lingdu Intel-tech Development Co., Ltd)*, модель *Lingkong K3*. На сайте «X-Human Lingkong». |
| ROBO (ООО «Робо»?) | ROBO | Бренд с robo.ooo, латиницей. Юрлицо не проверял. |
| R2B | R2B | Проверено: r2b.company/eng, *R2B (Robots to business)* [r2b]. |
| YaCu / «Яку Роботикс» | YaCu Robotics | ПРОВЕРИТЬ: на сайте YaCu, в исследовании «Яку Роботикс». Англоязычного источника не нашёл. |
| Waybot / «Вейбот Автомакон Роботикс» | Waybot | ПРОВЕРИТЬ. В русскоязычном источнике встречается *Waybot Robotics*; официального EN-сайта не открывал. Полное «Вейбот Автомакон Роботикс» → *Waybot Avtomakon Robotics* (транслитерация, ПРОВЕРИТЬ). |
| «Автономика», робот «Пиксель» | Avtonomika; Pixel robot | Проверено: каталог выставки *AVTONOMIKA LLC*, продукт *Pixel* [avtonomika]. |
| «Промобот» | Promobot | Проверено: promo-bot.ai [promobot]. |
| SPI robotics | SPI robotics | Как в источнике (Retail.ru). |
| «Ритейл Сервис» (интегратор) | Retail Service (integrator, robot.rssib.ru) | ПРОВЕРИТЬ. Русское название из английских слов, обратная запись естественна, но не подтверждена. |
| MD Facility Management | MD Facility Management | Латиница в источнике. |
| «Конкордия» | Konkordiya | Транслитерация, ПРОВЕРИТЬ. |
| Viggo | Viggo | Как в ComNews. Производителя не установил, ПРОВЕРИТЬ. |

### 10.2 Модели роботов

| Модель | EN | Заметки |
|---|---|---|
| X-Human Lingkong K3, «K3» | Lingkong K3 (K3) | [xhuman]. |
| Pudu CC1, SH1, MT1, BellaBot | PUDU CC1, PUDU SH1, PUDU MT1, BellaBot | Pudu пишет PUDU CC1 капителью [pudu-cc1]; в тексте допустимо *Pudu CC1*. Выбрать одно; предлагаю как на RU-сайте: *Pudu CC1*. |
| Gausium Phantas S1 Pro | Gausium Phantas S1 Pro | [gausium] (Phantas). Суффикс S1 Pro из источника кейса, не проверял. |
| Keenon C40 / C55 | Keenon C40 / C55 | Только в исследовании. |
| OrionStar CleaniBot C5 | OrionStar CleaniBot C5 | Только в исследовании, на сайте нет. |
| ROBO RUBY-S, RUBY-M | ROBO RUBY-S | В исследовании однажды «RUBI-S» (раздел 4) — опечатка или вариант. ПРОВЕРИТЬ на robo.ooo; на сайте везде RUBY-S. |
| R2B Mark 2 SE | R2B Mark 2 SE | В исследовании также «MARK 2 SE». Предлагаю *Mark 2 SE*, как на сайте. |
| YaCu Unit | YaCu Unit | ПРОВЕРИТЬ. |
| Waybot Cleanbotics 600 | Cleanbotics 600 | Проверено по описанию в поиске (вторичный источник). |
| Unitree H1 | Unitree H1 | |
| Husqvarna CEORA 544 EPOS | Husqvarna CEORA 544 EPOS | [husqvarna]. |
| Maytronics Dolphin Wave 300 XL | Maytronics Dolphin Wave 300 XL | [maytronics]. |
| FJ Dynamics PaintMaster | FJD PaintMaster | Производитель пишет *FJD PaintMaster Pro / Mini* [fjd]. На сайте «FJ Dynamics PaintMaster» — допустимо. |
| For-1 | For-1 | Из mos.ru/en, как есть. |
| Promobot V.4 | Promobot V.4 | На сайте сейчас не используется. |
| Шифры на макете: CL-03, DL-01, HM-01, SC-02 | без изменений | Условные ID. |

### 10.3 Объекты, организации, места из кейсов

| RU | EN | Откуда / статус |
|---|---|---|
| РЖД | Russian Railways (RZD) | Общепринятое официальное название. |
| Казанский, Ярославский, Курский, Павелецкий, Киевский вокзалы | Kazansky, Yaroslavsky, Kursky, Paveletsky, Kievsky railway stations | Проверено: mos.ru/en и путеводители [stations]. |
| Московский вокзал (Санкт-Петербург) | Moskovsky railway station (St Petersburg) | По аналогии, не проверено. |
| Аэропорт Пулково | Pulkovo Airport | Общепринятое. |
| Шереметьево (терминал B) | Sheremetyevo Airport (Terminal B) | Общепринятое. |
| Толмачёво | Tolmachevo Airport (Novosibirsk) | Город в RU-тексте не назван — в EN добавлять только если заказчик согласен. |
| аэропорты Красноярска и Краснодара | Krasnoyarsk and Krasnodar airports | |
| «Гипер Лента», «Лента», «Супер Лента» | Lenta (Giper Lenta hypermarkets) | Компания пишет себя *Lenta*. *Giper Lenta* — транслитерация формата, ПРОВЕРИТЬ в EN-отчётности Lenta. |
| «Перекрёсток» | Perekrestok (X5 Group) | Проверено: [x5]. |
| ЦДМ на Лубянке | Central Children's Store on Lubyanka | Проверено: [cdm]. |
| БЦ «Малахитовая шкатулка» | Malakhitovaya Shkatulka office building | Транслитерация, ПРОВЕРИТЬ. Пояснение в скобках не нужно. |
| Prime Park | Prime Park | Только в исследовании. |
| БЦ «Северный», ТЦ «Северный» (пример в макете и плейсхолдере) | Severny | Вымышленный пример, транслитерация. |
| девелопер MR | MR Group | Проверено: [icity]. |
| iCITY (башни, Москва-Сити) | iCITY | В источниках и *iCity*; на сайте iCITY — оставляем. |
| ЖК «Симфония 34» | Symphony 34 residential complex | ПРОВЕРИТЬ: официального EN в этой сессии не нашёл. |
| Технопарк «Сколково» | Skolkovo Technopark | Общепринятое. |
| Школы №1514, №281, №1387 | School No. 1514, No. 281, No. 1387 (Moscow) | |
| РТУ МИРЭА | MIREA – Russian Technological University (RTU MIREA) | Проверено: [mirea]. |
| программа «Шагающие роботы» | "Walking Robots" program | Наш перевод названия, ПРОВЕРИТЬ. |
| ДОНМ, Департамент образования и науки Москвы | Moscow Department of Education and Science | Общепринятое, в этой сессии не проверял. |
| Департамент предпринимательства и инновационного развития | Moscow Department of Entrepreneurship and Innovative Development | Проверено: [dept]. |
| Департамент торговли и услуг | Moscow Department of Trade and Services | Не проверено. |
| ФЦ БАС | FTs BAS | ПРОВЕРИТЬ: расшифровку и EN-название не нашёл. Не расшифровывать наугад. |
| Московский инновационный кластер (МИК) | Moscow Innovation Cluster | Проверено: [mic]. |
| кластер «Ломоносов» | Lomonosov innovation cluster | Проверено: mos.ru/en, *the Lomonosov cluster* [mic]. |
| Московский политех | Moscow Polytechnic University | Общепринятое, не проверено. |
| Парк Победы, Коломенская набережная | Victory Park; Kolomenskaya Embankment | Транслитерация по общей практике. |
| Москва, Санкт-Петербург, Сочи, Волгоград, Нижний Новгород, Уфа, Ярославль | Moscow, St Petersburg, Sochi, Volgograd, Nizhny Novgorod, Ufa, Yaroslavl | Стандартные экзонимы. |

### 10.4 Источники фактов (подписи «Источник:»)

Названия СМИ оставляем латиницей так, как их пишут сами издания или международная практика. Названия статей не переводим (их и нет на странице). Пометка языка — правило в `style-guide.md`, §8.

| RU | EN |
|---|---|
| «Коммерсантъ» | Kommersant |
| «Деловой Петербург» | Delovoy Peterburg |
| РИА Новости | RIA Novosti |
| АиФ | Argumenty i Fakty (AiF) |
| Вести | Vesti |
| Фонтанка | Fontanka |
| АБН24 | ABN24 |
| Москвич Mag | Moskvich Mag |
| Т—Ж | T—Zh (personal finance magazine) — ПРОВЕРИТЬ EN-самоназвание |
| ComNews, Retail.ru, iXBT, KudaGo, RTVI, The Moscow Times, mos.ru, robo.ooo, alta.ru | без изменений |
| CORE.XP, DAKO Professional, Финам, Авито Работа | CORE.XP, DAKO Professional, Finam, Avito Rabota (Avito Jobs) — *Avito Jobs* ПРОВЕРИТЬ |
| Telegram-канал РЖД в пересказе iXBT | Russian Railways' Telegram channel, as reported by iXBT |
| по данным производителя / интегратора / дилеров | according to the manufacturer / integrator / dealers |
| в изложении | as summarized by |
| даташит производителя | manufacturer's datasheet |

---

## Источники терминологии (открыты 2026-10-06)

| Ключ | Что подтверждает | URL |
|---|---|---|
| pudu-cc1 | *commercial cleaning robot*, PUDU CC1 | https://www.pudurobotics.com/about/news/646c32df72337c00391e396b |
| gausium | *robotic floor cleaner*, Phantas | https://gausium.com/news/gausiums-phantas-named-finalist-for-european-cleaning-hygiene-awards-2023-technological-innovation-of-the-year-category/ |
| pudu-mt1 | *robotic sweeper*, MT1 | https://www.aap.com.au/aapreleases/cision20250820ae55299 |
| xhuman | X-Human, Lingkong K3 *High-Rise Flat Facade Cleaning Robot* | https://technode.global/prnasia/x-human-leading-the-future-of-high-rise-facade-cleaning-and-intelligent-robotics/ |
| skyline | *window-cleaning robot*, facade (рынок) | https://www.therobotreport.com/skyline-robotics-deploys-ozmo-window-cleaning-robot-new-york-city/ |
| rope | *rope access cleaning* | https://tvs.co.il/en/news/rope-access-cleaning |
| raas | *Robots-as-a-Service (RaaS)* | https://standardbots.com/blog/raas ; https://www.xyte.io/blog/robots-as-a-service |
| brokk | *remote-controlled demolition machines*, *demolition robot* | https://www.forconstructionpros.com/equipment/worksite/article/22172085/brokk-inc-jobsite-safety-tips-with-remote-controlled-demolition-machines |
| dji | *agricultural drones*, spraying | https://www.dji.com/global/media-center/announcements/dji-agricultural-annual-report-2025 |
| cpp | *crop protection product* = *plant protection product* | https://www.efsa.europa.eu/en/glossary/ppp ; https://sonaveeb.ee/search/unif/dlall/esterm/CPP |
| forwardx | *autonomous mobile robot (AMR)*, *follow-me* | https://www.therobotreport.com/forwardx-officially-launches-in-the-us/ |
| koham | *remote control slope mower*, KOHAM | https://kohammowers.com |
| fjd | *robotic line marker*, FJD PaintMaster | https://fjdynamics.com/product/fjd-rlm01-robotic-line-marker |
| maytronics | *robotic pool cleaner*, commercial pools | https://www.maytronics.com/global/robots-commercial-pools.html |
| husqvarna | *robotic mower*, *wire-free*, CEORA EPOS | https://www.husqvarna.com/ca-en/robotic-lawn-mowers/professional-robotic-lawn-mowers/about/ |
| mirea | MIREA – Russian Technological University | https://en.wikipedia.org/wiki/MIREA_%E2%80%93_Russian_Technological_University |
| icity | MR Group, iCity, Moscow City | https://en.wikipedia.org/wiki/ICity |
| cdm | Central Children's Store on Lubyanka | https://en.wikipedia.org/wiki/Central_Children%27s_Store_on_Lubyanka |
| mfc | "My Documents" public service centers | https://www.mos.ru/en/news/item/63743073 |
| x5 | Perekrestok, X5 Group | https://en.wikipedia.org/wiki/Perekrestok_(supermarket_chain) |
| stations | названия вокзалов Москвы | https://www.mos.ru/en/news/item/34183073/ ; https://rusmania.com/moscows-railway-stations |
| mic | Moscow Innovation Cluster; Lomonosov cluster | https://ict.moscow/en/projects/smartcitymoscow/case/i-moscow ; https://www.mos.ru/en/news/item/161828073/ |
| dept | Moscow Department of Entrepreneurship and Innovative Development | https://startupvillage.ru/en/speakers/kristina-kostroma |
| avtonomika | AVTONOMIKA LLC, Pixel | https://expodat.com/en/companies/company/137045-piksel.html |
| promobot | Promobot | https://promo-bot.ai |
| r2b | R2B (Robots to business) | https://r2b.company/eng |
| procurement | 44-FZ / 223-FZ по-английски | https://www.eastcham.fi/svkk-legal-digest-march-2017-eng ; https://credinform.ru/en-GB/publications/c7682977ca52 |

Не нашёл источников для: YaCu Robotics (EN), Waybot (официальный EN-сайт), «Ритейл Сервис», ФЦ БАС, ЦГОН, «Симфония 34», «Конкордия», Viggo (производитель), *serving robot* и *automatic door operator* (выбор по общему употреблению), английского самоназвания Т—Ж и Авито Работы.
