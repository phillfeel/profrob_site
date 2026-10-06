# EN: что решить заказчику и что решил переводчик

Агент 2 · 2026-10-06 · `i18n/en.json` (1948 сообщений, собран из `i18n/en.partial/*.json`). Здесь только то, что требует решения или проверки. Правила и термины: `glossary.md`, `style-guide.md`. Проверка: `node tools/i18n/en-lint.mjs` (0 ошибок на момент записи).

## 1. Блоки, переведённые полностью: заказчик решает, что сокращать

Переведено дословно по смыслу, без смягчений и без добавления фактов. Сокращать или убирать в EN-версии — решение заказчика, не переводчика.

| Тема | Риск (style-guide §10) | Ключи |
|---|---|---|
| «Данные хранятся в РФ», дата-центр в Сколково | R5: для зарубежного партнёра может читаться как ограничение или санкционный риск | `common.footer.status.data`, `home.platform.core.foot`, `home.why.main.foot`, `home.contact.trust.data`, `products.platform.trust.data`, `products.why.platform.text` |
| Мигранты и иностранцы в клининге (80%+, ограничения найма в 11 регионах) | R8: чувствительная тема для ESG. Переведено нейтрально: *foreign nationals*, *migrant workers*, *restrict migrant hiring* | `industries.businessCenters.problems.items.1.text`, `industries.education.problems.items.2.text`, `industries.fitnessSports.problems.items.1.text`, `industries.municipal.problems.items.0.title`, `industries.municipal.problems.items.0.text`, `industries.municipal.problems.items.1.title`, `industries.municipal.procurement.doc.listValue`, `industries.publicSpaces.staffing.text`, `industries.retail.problems.items.0.title`, `industries.retail.problems.items.0.text` |
| Госзакупки, 44-ФЗ/223-ФЗ, нацрежим, ПП № 1875 и № 1247, ОКПД2, код 29.10.59.130 | R6: целый блок «Как купить»; иностранцу объясняет рынок, но не нужен как инструкция | `industries.municipal.description`, `industries.municipal.problems.items.3.text`, `industries.municipal.sources.pp1875.label`, `industries.municipal.procurement.*` (весь блок), `industries.municipal.pilot.items.2.text`, `industries.municipal.vendorsLead`, `industries.education.economy.ways.rent.text` |
| РЖД, вокзалы, аэропорты | R10, R11: чужие внедрения, оговорка «не наши проекты» переведена полностью; названия компаний могут вызвать вопросы комплаенса | `industries.publicSpaces.*` (title, h1, lead2, audiences, directions.lead, proof.*, links), `industries.publicSpaces.proof.main.place` («RZD stations»: расшифровка RZD стоит в `industries.publicSpaces.lead2`) |
| МФЦ и госучреждения, департаменты Москвы | R11 | `industries.publicSpaces.audiences.items.2`, `industries.publicSpaces.board.items.2.zone`, `industries.publicSpaces.directions.items.1.items.items.1`, `industries.education.audiences.items.1`, `industries.education.proof.schools.announced`, `industries.retail.cases.items.2.text` |
| Медицинские формулировки | R7: *healthcare robotics*, не *medical robots*. Про FDA/CE ничего не добавлено. В RU помечено `TODO(legal)` | `industries.medicalWellness.compliance`, `common.solutionNames.medical` |

## 2. Дополнено переводчиком: проверить

| Ключ | Что добавлено сверх RU | Почему |
|---|---|---|
| `industries.municipal.procurement.notes.legal.text` | последнее предложение: *Names of Russian documents here are our own translations.* | style-guide §8.5: английские названия российских документов не официальные |
| `industries.municipal.procurement.notes.legal.text`, `industries.municipal.procurement.lead`, `industries.municipal.procurement.doc.okpd` | пояснения *Russia’s procurement laws*, *OKPD2 (Russian product classification)* | читатель не знает российских аббревиатур (style-guide §1) |
| `common.footer.about`, `home.meta.description`, `solutions.directions.items.warehouse.text`, `industries.manufacturing.directions.items.0.text`, `roi.src.floor.how.steps.freed`, `industries.businessCenters.economy.lead`, `industries.hotels.case.estimateText`, `industries.retail.economy.note` | расшифровки при первом упоминании: SLA, AMR, FTE, ROI | style-guide §7. В RU расшифровок нет |
| `industries.retail.frequency.note` | *Perekrestok (X5 Group)* | glossary §10.3 |
| `industries.publicSpaces.lead2` | *Russian Railways (RZD)* | единственная расшифровка RZD на странице |

Источники фактов (названия изданий и даты) Агент 1 вынес из `ru.json`: их больше нет среди сообщений, EN-подписи для них не нужны. Пометка «Sources are in Russian unless marked otherwise» (style-guide §8.2) в разметке не появилась: предложена в `en.additions.md`.

## 3. Заглушки и неподтверждённые цифры (R9)

Перенесены как есть, цифры не менялись. Инвестор прочтёт их как отчётные.

`home.hero.metrics.ariaLabel`, `home.platformUi.ui.cards.kpiValue`, `home.platformUi.ui.cards.tasksValue`, `products.platform.board.label`, `products.platform.board.slaValue` (142 устройства, 14 объектов, SLA 98,2%, 1 284 задачи); `industries.common.form.callUs` и `roi.lead.form.sendError` (телефон +7 (495) 123-45-67). Кейсы главной (−32%, +35%, −40%, до 80%): `home.hero.robots.*.result`, `home.results.kpis.*`.

## 4. Юридические тексты

Переводил смысл, не юридическую формулировку. Нужен текст от юриста заказчика (R4): `common.form.consent`, `roi.lead.form.consent` (ссылка на 152-ФЗ), `common.footer.privacy`, `common.footer.requisites`.

## 5. Русский рынок и рубли (R2, R3, R13)

- Все суммы: `RUB 5.4M`, `RUB 67,000`, без ₽ и без пересчёта в USD/EUR. Калькулятор считает по московским данным 2026 года; в EN-версии это видно из `roi.head.lead` («Based on Moscow market data, 2026»).
- Форма принимает только «+7 и десять цифр» (`js.solutions.errors.phone`): иностранец заявку не отправит. Текст ошибки переведён как есть. Нужна доработка валидации: `en.additions.md`.
- *Moscow time* в «Мы перезвоним в рабочее время» (`common.form.sentText`) не добавлял: в RU часового пояса нет. Для зарубежного читателя стоит добавить *(Moscow time, UTC+3)*.

## 6. Названия без подтверждённого английского написания (ПРОВЕРИТЬ)

Транслитерация по BGN/PCGN, официальное написание не найдено (glossary §10): *Zhilishchnik* (ГБУ «Жилищник»), *FTs BAS* (ФЦ БАС), *YaCu Robotics*, *Waybot Avtomakon Robotics*, *Konkordiya*, *TsGON* (ЦГОН Роспотребнадзора), *“Walking Robots”* program (РТУ МИРЭА), *Symphony 34*, *Malakhitovaya Shkatulka*, *Severny* (вымышленный пример), *Avtonomika / Pixel*, *T—Zh*, *Central Children’s Store* (ЦДМ), *Moskovsky railway station*. Где используются: `grep -n` по `i18n/en.json`.

## 7. Решения переводчика, которые заметны заказчику

| Решение | Ключи | Обоснование |
|---|---|---|
| Бренд *PROFROBOT* | везде | ждёт решения заказчика; логотип в шапке остаётся кириллическим (R1) |
| Индустрия «Бизнес-центры» = *Office buildings*; «Общественные пространства» = *Public venues and transport hubs*; «Отели и HoReCa» = *Hotels and hospitality* (в H1 страницы оставлено *HoReCa*, как в RU) | `industries.*.name`, `home.industries.items.*`, `industries.hotels.h1.items.1` | glossary §4 |
| H1 страницы общественных пространств: *Robots for stations, airports and MFCs.* Расшифровка МФЦ стоит в следующей строке (`industries.publicSpaces.audiences.items.2`). Полное *public service centers* не помещается в строку H1 | `industries.publicSpaces.h1.items.1` | ограничение +15% на строку H1 |
| Метка секции СЕЗОН = *YEAR* на странице агро (секция показывает весь год, включая межсезонье) | `industries.common.sections.season` | длина метки |
| КП = *quote* везде (в glossary было *proposal*: не помещалось в узкие метки) | `roi.*`, `home.contact.lead` | единый термин |
| «Направление» = *area* (в glossary было *Applications*; *AREAS* уже стоял на всех страницах) | `*.sections.directions`, `industries.common.hero.metrics.directions` | единый термин |
| Сайт использует *platform workflows*, а не *scenarios*, там, где речь о платформе | `home.platform.dev.*`, `home.platformUi.*`, `products.platform.ai.*` | `Multi-robot workflows` в glossary |
| *Fall*, не *Autumn* | `industries.agriculture.season.items.3.name` | американский вариант |
| Строки с ссылкой на производителя: *manufacturer’s data, Pudu*, не *according to the manufacturer, Pudu* | `industries.fitnessSports.sources.*`, `industries.fitnessSports.directions.items.*.fact.src.label` | ограничение +15% |

## 8. Превышения лимитов длины, которые убрать не удалось

Лимиты берутся из `context.json` (роль строки). `node tools/i18n/en-lint.mjs --accepted` печатает полный список (60 строк, из них 11 заголовков H1 и названий отраслей по одному правилу); причина записана у каждой в `ACCEPT` внутри скрипта.

- **Метки и теги (строго не длиннее RU), +1…+2 символа:** `CONTACT` вместо 6-буквенного «ЗАЯВКА» (`home.sections.contact`, `solutions.sections.talk`, `products.sections.talk`, `industries.common.sections.form`); `DEPLOYMENT`, `SOLUTIONS`, `SCENARIOS`, `QUOTE — FORM`, `Result`, `Spring`, `Summer`, `Agribusiness`, `Manufacturing` (тег), `DEMOLITION ZONE`, `People`.
- **Подписи на SVG:** `PHARMACY`, `LINEN ROOM`, `ELEVATOR` (медицина) и `STREET`, `RIVER`, `SIDEWALK` (схема муниципальной страницы). Проверено на скриншоте при 1440 px: помещаются.
- **Термины глоссария:** *Case studies* в навигации (`common.nav.cases`), *Solution selection*, *Case study*, `All case studies`, названия отраслей, заголовки карточек «Смотрите также» (`industries.*.links.items.*.title`), *Warehouse* (3 места).
- **Заголовки H1 (строка длиннее RU+15%, но короче самой длинной строки RU):** `industries.fitnessSports.h1.items.1`, `industries.education.h1.items.1`.
- **Остальное:** кнопка `Book an assessment` (18 при лимите 17, два места), дата `since 27 May 2026`, `School No. 281`, несколько заголовков на один символ.
- Строки роли `short` длиннее 60 символов, а также списки через « · » и ряд аудитории, проверяются как обычный текст (±20%): они переносятся в вёрстке. Для строк короче 15 символов допуск +3 символа сверх +15%. Оба правила записаны в шапке `en-lint.mjs`.
- Предупреждения (не ошибки): тексты длиннее +20% к RU, 60 строк. Сюда входит юридическая заметка `industries.municipal.procurement.notes.legal.text` (313 при ориентире 297): лишнее предложение — оговорка про собственные переводы названий документов.

## 9. Что не удалось проверить

- Верстку EN на странице `home` и `products` смотрел только по горизонтальному переполнению (0 px на 1440 и 390 для всех 14 страниц) и по отсутствию кириллицы и ошибок консоли; глазами проверил медицину, общественные пространства и муниципальную страницу.
- Официальные английские названия организаций (раздел 6) и законов: источников не нашёл.
- Терминология сверена с открытыми страницами производителей в первой фазе (список источников в конце `glossary.md`); на этом проходе внешних источников не открывал и текстов сайта наружу не отправлял.
- `ru.json` менялся во время работы (Агент 1: убраны дубли, добавлена страница `products`, источники). EN приведён в соответствие на момент записи: `node tools/i18n/en-lint.mjs` сообщает о расхождении, если `ru.json` изменится.
