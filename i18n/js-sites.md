# Места в JS, где стоят строки (рабочий список для M2)

В M1 JS не менялся. Каждая строка, которую скрипт показывает посетителю, лежит в `i18n/ru.json`: в пространстве `js.*` или под ключом из разметки, если там уже есть тот же текст. Таблица говорит, где код её использует, чтобы M2 был механическим: заменить литерал на `t(ключ, переменные)`.

Переменные. `{n}` — значение. `{n, number}` просит сообщение само отформатировать число по языку (RU: `30 000` с неразрывным пробелом и `1,5`; EN: `30,000` и `1.5`), поэтому код передаёт числа, а не строки из `group()` и `dec1()`. `{n, plural, one {…} few {…} many {…} other {…}}` заменяет `plural()`. Тег в сообщении (`<b>`, `<small>`, `<br/>`, `<button>`) без атрибутов: атрибуты задаёт код, как `t.rich()` в next-intl (у `<button>` в `js.solutions.status.*` это `type="button" data-retry`). `i18n/context.json` сообщает переводчику про каждую переменную.

`node --test tools/i18n/check.mjs` падает, если у ключа `js.*` нет строки здесь или строка называет несуществующий ключ (первая ячейка строки таблицы — ключ в обратных кавычках).

## Сообщения

| ключ | место | что это | переменные |
|---|---|---|---|
| `js.roi.money.mln` | roi.js:17 | единица «млн ₽» в money(); то же в разметке (`#r-net-u` в roi.html) | — |
| `js.roi.money.thou` | roi.js:18 | единица «тыс. ₽» в money() | — |
| `js.roi.chart.year1` | roi.js:183 | подпись оси X графика | — |
| `js.roi.chart.years5` | roi.js:183 | подпись оси X графика | — |
| `js.roi.chart.paidBack` | roi.js:191 | выноска на графике в месяце окупаемости | {n} |
| `js.roi.crew.freed` | roi.js:206 | подпись под сеткой бригады; innerHTML, сейчас plural() | {free} {staff}, <b> |
| `js.roi.ctx.facade` | roi.js:220 | строка контекста результата (фасад); сейчас plural() | {area} (number) {washes} (plural) |
| `js.roi.ctx.detailFacade` | roi.js:221 | вторая часть сводки для заявки; код присоединяет её к строке контекста через « · » | {price} |
| `js.roi.ctx.floor` | roi.js:230 | строка контекста результата (помещения); тип и режим — сообщения calc.types.* и calc.modes.* | {type} {area} (number) {mode} |
| `js.roi.ctx.detailFloor` | roi.js:231 | вторая часть сводки, через « · »; сейчас plural() | {staff} (plural) |
| `js.roi.plate.unfit.title` | roi.js:237 | лаймовая плашка: фасад не подходит | — |
| `js.roi.plate.unfit.text` | roi.js:237 | лаймовая плашка: фасад не подходит | — |
| `js.roi.plate.never.title` | roi.js:239 | лаймовая плашка: не окупается за 5 лет | — |
| `js.roi.plate.never.text` | roi.js:239 | лаймовая плашка: не окупается за 5 лет | — |
| `js.roi.plate.payback.title` | roi.js:241 | лаймовая плашка: срок окупаемости в месяцах (между числом и словом неразрывный пробел); сейчас plural() | {n} (plural) |
| `js.roi.plate.payback.text` | roi.js:241 | подпись плашки | — |
| `js.roi.plate.lease.plus` | roi.js:245 | подпись плашки, лизинг в плюсе | — |
| `js.roi.plate.lease.minus` | roi.js:245 | подпись плашки, лизинг в минусе | — |
| `js.roi.plate.short.warn` | roi.js:251 | сводка в одну строку для заявки и картинки: случай предупреждения | {title} {text} |
| `js.roi.plate.short.buy` | roi.js:252 | сводка в одну строку: покупка | {n} |
| `js.roi.plate.short.lease` | roi.js:252 | сводка в одну строку: лизинг | {amount} (готовая сумма) |
| `js.roi.out.area` | roi.js:261 | значение у ползунка площади (помещения); innerHTML | {n} (number), <small> |
| `js.roi.out.area` | roi.js:282 | значение у ползунка площади (фасад); innerHTML | {n} (number), <small> |
| `js.roi.out.staff` | roi.js:262 | значение у ползунка «Уборщиков сейчас»; сейчас plural() | {n} (plural), <small> |
| `js.roi.out.wage` | roi.js:263 | значение у ползунка зарплаты (помещения) | {n} (number), <small> |
| `js.roi.out.wage` | roi.js:284 | значение у ползунка зарплаты (фасад) | {n} (number), <small> |
| `js.roi.out.price` | roi.js:283 | значение у ползунка цены мойки | {n}, <small> |
| `js.roi.aria.area` | roi.js:264 | aria-valuetext ползунка площади (помещения) | {n} (number) |
| `js.roi.aria.area` | roi.js:285 | aria-valuetext ползунка площади (фасад) | {n} (number) |
| `js.roi.aria.staff` | roi.js:265 | aria-valuetext ползунка уборщиков; сейчас plural() | {n} (plural) |
| `js.roi.aria.wage` | roi.js:266 | aria-valuetext ползунка зарплаты (помещения) | {n} (number) |
| `js.roi.aria.wage` | roi.js:287 | aria-valuetext ползунка зарплаты (фасад) | {n} (number) |
| `js.roi.aria.price` | roi.js:286 | aria-valuetext ползунка цены | {n} |
| `js.roi.scale` | roi.js:267 | минимум и максимум под ползунком площади (помещения) | {n} (number) |
| `js.roi.scale` | roi.js:288 | минимум и максимум под ползунком площади (фасад) | {n} (number) |
| `roi.floor.staff.hint` | roi.js:269 | подсказка под ползунком уборщиков; в разметке тот же текст, берётся ключ из HTML | — |
| `js.roi.staffHint.custom` | roi.js:270 | подсказка, когда значение изменено; `<button>` оживляется в roi.js:126-128 (возврат к норме) | {norm}, <button> |
| `js.roi.kpi.freedFloor` | roi.js:271 | подпись второй цифры результата (помещения); в разметке (`#r-k2-l`) тот же текст | — |
| `js.roi.kpi.load` | roi.js:295 | подпись второй цифры результата (фасад) | — |
| `js.roi.facadeHint.better` | roi.js:290-293 | подсказка под ползунком площади фасада; сейчас два предложения, теперь одно сообщение | {volume} {price} {breakEven} (number) |
| `js.roi.facadeHint.worse` | roi.js:290-293 | подсказка под ползунком площади фасада: цена слишком низкая для робота | {volume} (number) |
| `js.roi.cmp.value` | roi.js:302 | значение полосы в сравнении цен | {n} |
| `js.roi.cmp.value` | roi.js:303 | значение полосы в сравнении цен | {n} |
| `js.roi.cmp.cheaper` | roi.js:306 | примечание к сравнению: робот дешевле | {diff} |
| `js.roi.cmp.dearer` | roi.js:307 | примечание к сравнению: робот дороже | — |
| `js.roi.summary` | roi.js:340 | сводка над формой; innerHTML | {ctx} {detail} {amount} {plate}, <br/> <b> |
| `js.roi.share.text` | roi.js:380 | текст для системного окна «Поделиться» | {amount} |
| `js.roi.share.title` | roi.js:383 | заголовок для системного окна «Поделиться» | — |
| `js.roi.share.copied` | roi.js:385 | всплывающее сообщение после копирования ссылки | — |
| `js.roi.share.prompt` | roi.js:388 | текст `window.prompt`, если буфер обмена недоступен | — |
| `js.roi.card.headline` | roi.js:410 | текст на картинке для соцсетей | — |
| `js.roi.card.fiveYears` | roi.js:421 | текст на картинке; код приводит сумму к верхнему регистру | {amount} |
| `js.roi.card.shareTitle` | roi.js:426 | заголовок отправляемой картинки | — |
| `js.roi.card.saved` | roi.js:431 | всплывающее сообщение после сохранения картинки | — |
| `js.roi.card.failed` | roi.js:435 | всплывающее сообщение, если картинку собрать не удалось | — |
| `calc.types.office` | roi-model.js:8 | TYPES.office.name: показывается в roi.js:230, на кнопках roi.html и в мини-калькуляторах отраслевых страниц | — |
| `calc.types.mall` | roi-model.js:9 | TYPES.mall.name | — |
| `calc.types.warehouse` | roi-model.js:10 | TYPES.warehouse.name | — |
| `calc.types.clinic` | roi-model.js:11 | TYPES.clinic.name | — |
| `calc.types.hotel` | roi-model.js:12 | TYPES.hotel.name | — |
| `calc.modes.one` | roi-model.js:16 | MODES.one.name (MODES.h24.name «24/7» переводить не нужно) | — |
| `calc.modes.two` | roi-model.js:17 | MODES.two.name | — |
| `js.facadeModel.scenarios.portfolio` | facade-model.js:9 | название сценария SCENARIOS; пока нигде не показывается | — |
| `js.facadeModel.scenarios.bigOffice` | facade-model.js:10 | название сценария SCENARIOS; пока нигде не показывается | — |
| `js.facadeModel.scenarios.small` | facade-model.js:11 | название сценария SCENARIOS; пока нигде не показывается | — |
| `js.solutions.errors.name` | solutions.js:127 | ошибка формы (и на отраслевых страницах: они используют solutions.js) | — |
| `js.solutions.errors.phone` | solutions.js:128 | ошибка формы | — |
| `js.solutions.errors.consent` | solutions.js:136 | ошибка формы | — |
| `js.solutions.errors.contact` | solutions.js:133 | ошибка формы «Контакты»: нет ни телефона, ни e-mail | — |
| `js.solutions.errors.email` | solutions.js:134 | ошибка формы «Контакты»: e-mail написан неверно | — |
| `js.solutions.status.offline` | solutions.js:200 | статус формы; innerHTML; `<button type="button" data-retry>` создаёт код | <button> |
| `js.solutions.status.failed` | solutions.js:210 | статус формы; innerHTML | <button> |
| `js.industry.area` | industry.js:58 | значение ползунка мини-калькулятора и его aria-valuetext | {n} (number) |
| `industries.common.calc.months` | industry.js:62 | «≈ N мес» в мини-калькуляторе; в разметке тот же шаблон | {n} |
| `js.industry.notPaying` | industry.js:63 | мини-калькулятор, когда срок окупаемости бесконечен | — |
| `industries.common.calc.millions` | industry.js:64 | «≈ N млн ₽» в мини-калькуляторе, один знак после запятой; в разметке тот же шаблон | {n} (number, ::.0) |
| `industries.businessCenters.ready.verdictIntro` | industry-business-centers.js:13 | вывод до первой отметки; скрипт запоминает его при загрузке (`const intro`) и возвращает при 0 отметок | — |
| `js.industryBusinessCenters.verdict.ready` | industry-business-centers.js:19 | вывод: отмечены все пункты | — |
| `js.industryBusinessCenters.verdict.almost` | industry-business-centers.js:21 | вывод: не хватает одного пункта | {missing} |
| `js.industryBusinessCenters.verdict.partial` | industry-business-centers.js:22 | вывод: отмечена часть пунктов | {missing} |
| `js.industryBusinessCenters.verdict.start` | industry-business-centers.js:23 | вывод: отмечен один пункт или ни одного | — |
| `js.products.calc.mln` | products.js:73 | единица «млн ₽»: ось графика, значения ползунка и итогов | {n} (number, один знак) |
| `js.products.calc.thouPerMonth` | products.js:96 | значение ползунка «Аренда в месяц» | {n} (number) |
| `js.products.calc.months` | products.js:86 | значение ползунка «Срок использования» и выноска на графике в месяце равенства | {n} (number) |
| `js.products.calc.verdict.rent` | products.js:106 | вывод под итогами: аренда дешевле на этом сроке; plural по месяцам | {diff} (number) {cross} (plural) |
| `js.products.calc.verdict.buy` | products.js:107 | вывод под итогами: покупка уже обогнала аренду; plural по месяцам | {diff} (number) {cross} (plural) |
| `js.products.calc.verdict.always` | products.js:105 | вывод под итогами: аренда дешевле на всём горизонте 5 лет | — |

## Форматирование, зависящее от языка (сообщений нет, в M2 код должен следовать языку)

| место | сейчас | для EN |
|---|---|---|
| main.js:6 `fmt` | числа счётчиков: десятичная запятая, пробел между тысячами | `Intl.NumberFormat(язык)`; `98,2` в HTML у элементов с `data-count` пишет JS, при загрузке он его перезаписывает |
| main.js:11 | часы в подвале `Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', … })` | локаль языка, время по-прежнему московское (подпись «МСК» — сообщение) |
| roi.js:12-14 `group`, `dec1` | тысячи через U+00A0, десятичная запятая | заменить сообщениями с `{n, number}` (см. выше) |
| roi.js:23-28, build.mjs `plural` | русские формы множественного числа | заменены ICU `plural` в сообщениях |
| roi.js:16-20 `money` | «1,8» и «млн ₽» в двух элементах (`#r-net`, `#r-net-u`) | порядок валюты в EN другой (гайд просит «RUB 1.8M»): в M2 придётся менять разметку, иначе будет «1.8 M RUB» |
| industry.js:37, 58 | `Intl.NumberFormat('ru-RU')` для значения ползунка | локаль языка |
| industry.js:64 | `toFixed(1).replace('.', ',')` | закрыто сообщением `industries.common.calc.millions` |
| build.mjs `fmtMln`, `fmtMonths` | то же при сборке | в разметке лежат шаблон и числа (`data-i18n-args`) |

## Что учесть в DOM

- `main.js` клонирует роботов героя (`cloneNode`, строка 178) и карточки лент брендов (строка 56): клоны несут те же `data-i18n*`, при смене языка их надо обновлять тоже.
- Метка счётчика разделов (`.counter .lbl`) пишется из `data-name` секции (main.js:544, solutions.js:34): после смены языка она показывает старый текст до следующей синхронизации при скролле, рантайм должен обновить её сам.
- `data-cat` и `data-res` роботов героя читаются при наведении (main.js:132): достаточно обновить атрибуты.
- roi.js перерисовывает почти все тексты результата при каждом изменении: после смены языка нужно вызвать `render()`, иначе подписи к цифрам останутся на старом языке.
- industry-business-centers.js: `title(b)` берёт названия пунктов из DOM и делает первую букву строчной (строка 14); это ломает имена собственные («Wi-Fi» станет «wi-Fi»). В EN нужны отдельные строчные варианты названий (новые ключи) или отказ от смены регистра.

## Не переводится намеренно

| место | текст | почему |
|---|---|---|
| roi.js:510, solutions.js:122 | `console.info('[ROI] заявка', …)`, `'[solutions] заявка (прототип…)'` | для разработчиков; бэкенда у прототипа нет |
| roi-model.js:56 | `new Error('Неизвестный тип объекта')` | ошибка программиста, посетитель её не видит |
| roi.js:422 | `PROFROBOT.RU/ROI` на картинке для соцсетей | латиница: домен и бренд |
| roi.js:32 | названия целей Яндекс.Метрики | идентификаторы |
| solutions.html, industries-*.html | JSON-LD (`<script type="application/ld+json">`): названия, `serviceType`, аудитория | разметка для поисковиков; английские страницы не индексируются (решение), остаётся русский |
| все страницы | `<html lang="ru">` | `lang` меняет рантайм вместе с языком |
| комментарии в JS и HTML | русский | для разработчиков |
