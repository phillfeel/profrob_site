# Спека: перенос сайта ПРОФРОБОТ на Next.js (SSR)

Версия 1.1 · 2026-10-07 · Исполнитель: ИИ-агент (вайбкодинг) · Владелец решений: Филипп

> **Состояние легаси, на которое рассчитана эта версия:** коммит `296282e` (ветка `gh-pages`), рабочее
> дерево чистое. 28 HTML-файлов: 27 страниц и `404.html`. Легаси продолжает расти (за один день
> добавились хаб отраслей, склады, платформа, юридические страницы и статья), поэтому
> **источник истины по составу страниц — скрипт инвентаря (7.1)**, а не таблица в 2.1. Порядок
> действий при появлении новых страниц — раздел 13.
>
> **Для агента.** Это обязательный документ. Прочитай его целиком до первой правки. Если что-то в коде
> противоречит спеке, остановись и запиши противоречие в журнал (раздел 11), а не выбирай молча.
> Главный принцип: **перенос, а не редизайн**. Сайт после переноса выглядит и ведёт себя так же,
> как до него, слово в слово и пиксель в пиксель (с допуском 0,5 px). Любое «улучшение» запрещено,
> пока не пройдены все шлюзы паритета.

---

## 0. Как работать по этой спеке

1. Работа идёт фазами (раздел 8). У каждой фазы есть **шлюз**: набор команд, которые должны пройти.
   Следующую фазу не начинать, пока шлюз предыдущей не зелёный.
2. Всё механическое делается **скриптами**, а не руками: конвертация HTML в JSX, перенос ассетов,
   переписывание ссылок, сверка снимков. Скрипт можно перезапустить и проверить, ручную правку нет.
   Список скриптов, которые нужно написать, в разделе 7.
3. Один коммит = один законченный шаг с зелёными проверками. Сообщение коммита на английском.
4. Корень репозитория (легаси-сайт) **не трогать** до фазы 7. Новый сайт живёт в папке `site/`.
   Исключение: расширение инструментов в `tools/playwright/` и новые скрипты в `tools/migrate/`.
5. Не добавлять зависимости сверх списка в разделе 3.1. Нужна новая — запиши обоснование в журнал
   и проверь пакет (`npm view <pkg>`) до установки.
6. Версии, API и поведение библиотек проверяй в официальной документации той версии, что стоит в
   `site/package.json`, а не по памяти. Особенно Next.js 16 и next-intl 4: там много переименований.
7. Если шлюз не проходит после трёх осмысленных попыток, не обходи проверку (не ослабляй допуск, не
   добавляй страницу в исключения). Запиши в журнал: что сломано, где, что пробовал, и переходи к
   независимой задаче. Ослабить проверку может только владелец.

---

## 1. Цель и границы

**Цель.** Каждая страница отдаётся сервером готовым HTML с полным текстом (SSR/prerender), на двух
языках: русский по корневым адресам, английский под `/en/`. Поведение, вёрстка, анимации, тексты,
расчёты калькуляторов и i18n совпадают с текущим статическим сайтом.

**Что значит «SSR» в этом проекте.** Поисковик и пользователь без JS получают полный HTML страницы
от сервера. Для маркетингового сайта это достигается статическим пререндером при сборке (SSG) в App
Router: это серверный рендер, выполненный один раз. Рендер на каждый запрос (`ƒ Dynamic`) не нужен
и запрещён без причины, записанной в журнал. Все страницы в выводе `next build` должны быть `○` или
`●` (static / SSG).

**Входит:**
- все страницы `*.html` из корня (полный список строит скрипт инвентаря, раздел 7.1), включая хаб
  отраслей, статью базы знаний, юридические страницы (`privacy`, `consent`) и страницу 404;
- 12 отраслевых лендингов, которые сейчас генерирует `tools/industries/build.mjs`;
- общий блок навигации подвала, который синхронизирует `tools/site/footer-nav.mjs`;
- i18n: словари `i18n/ru.json`, `i18n/en.json`, `i18n/js.ru.json`, ICU-сообщения, переключатель языка;
- весь клиентский JS: GSAP + ScrollTrigger, Lenis, калькуляторы ROI, фильтры, формы, часы, ленты;
- модели расчёта `roi-model.js` и `facade-model.js` с тестами;
- метаданные: `<title>`, description, canonical, robots, og, JSON-LD;
- ассеты, на которые реально ссылаются страницы;
- Dockerfile, health check, команды запуска.

**Не входит (не делать, даже если «напрашивается»):**
- редизайн, правка текстов, переименование классов, перевод CSS на Tailwind или CSS Modules;
- `next/image` и `next/font` в фазах 1–6 (меняют разметку и имена шрифтов, ломают паритет; см. фазу 9);
- создание страниц, которых нет сейчас: страниц решений `/solutions/<slug>/` (отложены решением владельца, `docs/adr/0001-temporary-solution-urls.md`, см. 2.5) и любых других;
- бэкенд формы заявки: сейчас `data-endpoint=""`, форма имитирует отправку. Так и остаётся;
- открытие сайта для индексации: все страницы сейчас `noindex`, так и остаётся;
- обновление версий GSAP и Lenis (отдельная задача после переноса).

---

## 2. Исходное состояние (что переносим)

Факты ниже проверены по репозиторию на 2026-10-07. Сайт меняется параллельно с работой агента,
поэтому **источник истины — вывод скрипта инвентаря**, а не эта таблица.

### 2.1 Страницы и целевые адреса

Состояние на коммит `296282e`: 27 страниц и `404.html`. Целевой адрес берётся из
`<link rel="canonical">` страницы; где canonical нет, адрес указан ниже. Адрес EN всегда равен
адресу RU с префиксом `/en`.

CSS подключаются **после `styles.css` в указанном порядке** (порядок важен для каскада, см. 3.6).
JS подключаются в указанном порядке перед `</body>`. Все страницы получают `i18n/boot.js` инлайном.

| Файл | Адрес RU | CSS после `styles.css` | JS |
|---|---|---|---|
| `index.html` | `/` (canonical нет) | нет | `main.js`; GSAP, ScrollTrigger, Lenis с CDN |
| `industries.html` (хаб) | `/industries/` | `solutions.css`, `industries.css` | `solutions.js`, `industries.js` |
| `industries-<slug>.html` (12 шт.) | `/industries/<slug>/` | `solutions.css`, `industry.css`, опционально `industry-<slug>.css` | `solutions.js`, `industry.js`, опционально `industry-<slug>.js`; у части впереди `roi-model.js` |
| `solutions.html` | `/solutions/` | `solutions.css` | `solutions.js` |
| `products.html` | `/products/` | `solutions.css`, `products.css` | `solutions.js`, `products.js` |
| `platform.html` | `/platform/` | `solutions.css`, `products.css`, `platform.css` | `solutions.js`, `products.js`, `platform.js` |
| `services.html` | `/services/` | `solutions.css`, `products.css`, `services.css` | `solutions.js`, `products.js` |
| `cases.html` | `/cases/` | `solutions.css`, `products.css`, `cases.css` | `solutions.js`, `products.js`, `cases.js` |
| `knowledge.html` | `/knowledge/` | `solutions.css`, `products.css`, `knowledge.css` | `solutions.js`, `knowledge.js` |
| `knowledge-cleaning-robot-basics.html` (статья) | `/knowledge/cleaning-robot-basics/` | `solutions.css`, `products.css`, `knowledge.css`, `knowledge-article.css` | `solutions.js`, `knowledge-article.js` |
| `manufacturers.html` | `/manufacturers/` | `solutions.css`, `products.css`, `manufacturers.css` | `solutions.js`, `products.js`, `manufacturers.js` |
| `about.html` | `/about/` | `solutions.css`, `products.css`, `about.css` | `solutions.js`, `products.js` |
| `contacts.html` | `/contacts/` | `solutions.css`, `contacts.css` | `solutions.js`, `contacts.js` |
| `roi.html` | `/roi/` (canonical нет) | `roi.css` (без `solutions.css`) | `roi-model.js`, `facade-model.js`, `roi.js` (без `solutions.js`) |
| `privacy.html` | `/privacy/` (canonical нет) | `solutions.css`, `legal.css` | нет |
| `consent.html` | `/consent/` (canonical нет) | `solutions.css`, `legal.css` | нет |
| `404.html` | не маршрут, это страница «не найдено» (см. 3.3) | `solutions.css`, `legal.css` | нет |

Правило имён для статей базы знаний: `knowledge-<slug>.html` → `/knowledge/<slug>/`. Сейчас статья
одна; новые статьи появятся по тому же правилу.

Общие для всех: шрифты Onest и JetBrains Mono с Google Fonts, `styles.css`, инлайн-скрипт
`document.documentElement.classList.add('js')`, инлайн-скрипт выбора языка (`i18n/boot.js`).
Блоки `.reveal`, счётчик разделов и форма заявки живут в `solutions.js`.

Слаги отраслей (12): `agriculture`, `business-centers`, `construction`, `education`,
`fitness-sports`, `hotels`, `manufacturing`, `medical-wellness`, `municipal`, `public-spaces`,
`retail`, `warehouse`.

Адреса только английскими словами, без транслита (правило владельца).

### 2.2 Генератор отраслевых страниц

`industries-<slug>.html` (12 страниц) **не пишутся руками**. Их собирает `tools/industries/build.mjs` из
`tools/industries/data.mjs` (первые пять отраслей) и `tools/industries/pages/<slug>.mjs` (остальные,
сейчас семь, включая `warehouse`). Хаб `industries.html` генератором **не собирается**: он написан руками.
У каждой отрасли свой Hero, свой порядок секций и свой фирменный блок: страницы сознательно разные,
общие только токены, шрифты и компоненты. Модуль страницы экспортирует
`{ industry, brands?, renderers?, icons?, data?, templates? }`. Рендереры возвращают HTML-строки и
получают помощники `h` (`h.T`, `h.L`, `h.C`, `h.K`, `h.TH`…, `h.msg`), которые ставят ключи i18n.
Генератор считает цифры мини-калькулятора через `roi-model.js` во время сборки.

**Требование:** различия между отраслями сохраняются. Нельзя свести 12 страниц к одному шаблону
с переключателями.

### 2.3 i18n (самое хрупкое место)

Контракт описан в `i18n/README.md`, прочитай его полностью. Кратко:

- Русский текст стоит в разметке, у каждой видимой строки есть `data-i18n="key"`,
  `data-i18n-html="key"` (текст с тегами), `data-i18n-attr="alt:key;aria-label:key2"`,
  `data-i18n-args='{"n":3}'` (переменные).
- `i18n/ru.json` сейчас **генерируется** из разметки скриптом `tools/i18n/extract.mjs`.
  `i18n/en.json` написан переводчиком, ключи те же.
- Формат словаря совместим с next-intl: вложенный JSON, ICU MessageFormat (`{n, plural, …}`,
  `{n, number, ::.0}`, `select`, теги `<b>…</b>` без атрибутов).
- Правило тегов: тег в сообщении берёт атрибуты (`class`, `href`) у n-го элемента с тем же именем в
  русской разметке этого узла. В next-intl это `t.rich(key, { b: (c) => <b className="…">{c}</b> })`.
- Строки из JS живут в `i18n/js.ru.json` (пространство `js.*`), места вызова перечислены в
  `i18n/js-sites.md`. В скрипты вкомпилированы русские таблицы (`tools/i18n/embed.mjs`).
- Английский сейчас подставляется **в браузере**: `i18n/boot.js` читает `?lang=en` или
  `localStorage.lang`, прячет `body`, грузит `i18n.js`, тот подменяет тексты. Скрипты страниц ждут
  `window.i18n.ready`. Английский не индексируется, JSON-LD и `<html lang>` рантайм не трогает.
- Пространства ключей на коммите `296282e`: `common`, `home`, `solutions`, `roi`, `calc`,
  `industries` (общая оболочка и 12 отраслей), `industriesHub`, `products`, `platform`, `services`,
  `cases`, `knowledge`, `kbCleaning` (статья), `about`, `contacts`, `manufacturers`, `legal`
  (`privacy` и `consent`), `notFound`, `js`. В `ru.json` и `en.json` по 3079 сообщений, ключи
  совпадают (проверка `tools/i18n/check.mjs`). **Число и набор пространств растут вместе с
  сайтом**: список строится инвентарём, а не берётся из этой спеки.
- Числа на сайте всегда с группировкой разрядов (`useGrouping: 'always'`): «6 000», а не «6000».

### 2.4 Клиентский JS

| Файл | Что делает | На что обратить внимание |
|---|---|---|
| `main.js` | главная: лента роботов с GSAP, пины ScrollTrigger, Lenis, бренды-ленты с клонами, часы МСК в подвале | `gsap.ticker`, `gsap.matchMedia`, клоны DOM, `setInterval`, reduced motion, `(hover: hover)` |
| `solutions.js` | появление `.reveal`, счётчик разделов, форма заявки (honeypot, таймаут 12 с, имитация без endpoint) | подключён на многих страницах |
| `products.js` | пример «покупка или аренда», выбор продукта в форме, счётчик над тёмной сценой | подключён на `products`, `services`, `platform`, `cases`, `about`, `manufacturers` |
| `platform.js` | вкладки «Возможности»: клик, стрелки, автопереключение по таймеру, переход от «проблемы» к вкладке | `setTimeout`, `IntersectionObserver`, `scrollTo`; остановка при наведении |
| `industries.js` | стрелки и счётчик ленты кейсов на хабе отраслей | без GSAP |
| `contacts.js` | мини-CTA «Запросить КП» / «Заказать демо или пилот» подставляют цель в форму | форма из `solutions.js` |
| `manufacturers.js` | прожектор под курсором на карточках брендов (`--mx`/`--my`) | только при `(hover: hover)` |
| `knowledge-article.js` | подсветка раздела в оглавлении, раскрытие вопроса `<details>` по якорю `#faq-…` | `location.hash`, `scroll` на `window` |
| `industry.js`, `industry-<slug>.js` | мини-калькулятор, фирменные блоки отраслей (свои скрипты у `business-centers`, `public-spaces`, `retail`, `warehouse`) | `location.hash` |
| `cases.js`, `knowledge.js` | фильтр по `?industry=` / `?topic=` и поиск, `history.replaceState` | без JS видны все элементы, фильтр работает ссылками |
| `roi.js` | два калькулятора, параметры из `?t=&a=&m=&k=`, `localStorage` | ссылки с отраслей ведут на `roi.html?t=…&a=…&m=…` |
| `roi-model.js`, `facade-model.js` | чистые модели расчёта, UMD (`module.exports` + `window`) | есть тесты `node --test` |

Все скрипты стартуют после `window.i18n.ready`, уважают `prefers-reduced-motion` и CSS-класс
`html.js` (элементы `.reveal` скрыты, пока JS не покажет их).

### 2.5 Известные особенности легаси (переносить как есть, не чинить)

Проверено на `296282e`: битых внутренних ссылок и якорей нет (ни одной на 27 страницах).

- **Страниц решений нет.** Внутренние ссылки на решения ведут на `solutions.html#dir-<slug>`
  (карточка направления на хабе решений), а не на `/solutions/<slug>/`. Это решение владельца,
  см. `docs/adr/0001-temporary-solution-urls.md`. В новом сайте они становятся
  `/solutions/#dir-<slug>`, якоря `id="dir-<slug>"` сохраняются. Страницы решений агент **не создаёт**.
  `canonical`, JSON-LD и `url` в разметке уже боевые (`/solutions/`, `/industries/<slug>/`) и
  переносятся как есть.
- **Блоки `.reveal` без JS невидимы** (CSS скрывает их безусловно, показывает `solutions.js`). Текст
  при этом есть в HTML. Для индексации это не проблема, для посетителя без JS — проблема; решение
  за владельцем.
- **Нет canonical** у `index`, `roi`, `privacy`, `consent`, `404`. Все страницы `noindex`.
- **`404.html` содержит GitHub-Pages-хак:** инлайн-скрипт `document.write('<base href=…>')` для
  подкаталога `*.github.io/<repo>/`. Он нужен только статике на GitHub Pages и **не переносится**
  (см. 3.3).

Эти пункты попадают в отчёт (раздел 11). Чинить их будет владелец отдельно.

### 2.6 Инструменты, которые уже есть и на которые опирается проверка

- `tools/playwright/snapshot.mjs` — снимок страницы: каждое слово с позицией и шрифтом, текстовые
  атрибуты, рамки всех элементов. `--compare <до> <после>` печатает разницу и выходит с кодом 1.
  `--lang en` снимает английскую версию через настоящий рантайм. **Это главный оракул паритета.**
- `tools/playwright/check.mjs` — скриншоты, горизонтальный скролл, ошибки консоли, `--pin` для
  GSAP-пинов, `--reduce`, `--hover`.
- `tools/playwright/perf.mjs` — замер загрузки и скролла.
- `tools/playwright/<страница>.mjs` — сценарии страниц: `about`, `cases`, `contacts`,
  `industries`, `industries-hub`, `knowledge`, `knowledge-article`, `manufacturers`, `platform`,
  `products`, `roi`, `services`, `lang`. Каждый поднимает свой статический сервер из корня легаси
  (для нового сайта их надо научить принимать `--base-url`, см. 7.4).
- `tools/i18n/icu.mjs` — разбор и подстановка ICU без зависимостей; `tools/i18n/check.mjs` — проверки
  словаря.
- `roi-model.test.js`, `facade-model.test.js`, `tools/i18n/icu.test.mjs`.

### 2.7 Общий блок навигации подвала

Источник один: `tools/site/footer-nav.mjs` (списки разделов, 12 отраслей, 9 решений, компании).
Он вставляет блок между маркерами `<!-- foot-nav:start -->` и `<!-- foot-nav:end -->` во все
страницы, кроме `index.html` (у главной свой подвал со статистикой); отраслевые получают тот же
блок из `build.mjs`. В 27 файлах блок **побайтово одинаков**. В новом сайте это один серверный
компонент `FooterNav`, а не 27 копий. Его списки берутся из тех же констант, что в
`footer-nav.mjs` (перенести данные в `content/`, ключи `common.*` и `industries.<slug>.name`
сохранить). Ссылки на решения в блоке — `solutions.html#dir-<slug>` (см. 2.5).

---

## 3. Целевая архитектура

### 3.1 Стек и версии

Версии на 2026-10-07 по `npm view`. Ставить точные версии (без `^`), lockfile коммитить.

| Пакет | Версия | Зачем |
|---|---|---|
| `next` | 16.4.x (последняя 16.x на момент старта) | App Router, SSG, `proxy.ts` |
| `react`, `react-dom` | та, что ставит `create-next-app@16` | |
| `next-intl` | 4.x (последняя 4.x) | словари, ICU, локали в адресе |
| `gsap` | **3.12.5** | та же версия, что на CDN сейчас |
| `@gsap/react` | 2.x | `useGSAP` с автоматической очисткой |
| `lenis` | **1.1.13** | та же версия, что на CDN сейчас |
| `typescript` | та, что ставит `create-next-app@16` | major не поднимать вручную |
| `vitest` или `node --test` + `tsx` | | тесты моделей |
| `parse5` или `htmlparser2` | | только для скриптов конвертации в `tools/migrate/` |

Node.js ≥ 20.9 (требование Next 16).

Нельзя: Tailwind, CSS-in-JS, UI-киты, state-менеджеры, `axios`, `lodash`, анимационные библиотеки
кроме GSAP и Lenis.

Создание проекта:

```bash
npx create-next-app@16 site --ts --app --src-dir --eslint --no-tailwind --use-npm --import-alias "@/*"
```

### 3.2 Структура `site/`

```
site/
  next.config.ts            # trailingSlash: true, output: 'standalone', redirects со старых *.html
  src/
    proxy.ts                # next-intl + ?lang=; в Next 16 это бывший middleware.ts
    i18n/
      routing.ts            # locales ['ru','en'], defaultLocale 'ru', localePrefix 'as-needed'
      request.ts            # загрузка messages, formats (группировка чисел)
    messages/
      ru.json  en.json      # источник истины для текстов после переноса
    app/
      [locale]/
        layout.tsx          # <html lang>, <head>: шрифты, styles.css, инлайн-скрипт html.js
        page.tsx            # главная
        solutions/page.tsx
        products/page.tsx
        platform/page.tsx
        services/page.tsx
        cases/page.tsx
        knowledge/page.tsx
        knowledge/cleaning-robot-basics/page.tsx   # статья: своя папка на каждую статью
        about/page.tsx
        contacts/page.tsx
        manufacturers/page.tsx
        roi/page.tsx
        privacy/page.tsx
        consent/page.tsx
        industries/page.tsx          # хаб отраслей (рукописный)
        industries/[slug]/page.tsx   # generateStaticParams по 12 слагам
        not-found.tsx               # бывший 404.html
        [...rest]/page.tsx          # вызывает notFound(): локализованный 404 на неизвестных адресах
      api/health/route.ts   # GET → 200 {"status":"ok"}
    components/
      shell/                # Nav, Footer, FooterNav (2.7), LeadForm, LangSwitch, Crumbs, Sprite
      home/  solutions/  products/  …   # секции страниц
      industries/
        shared/             # общие секции оболочки отраслей
        <slug>/             # свои Hero и фирменные блоки отрасли
    behaviors/              # 'use client' острова: перенос легаси-скриптов
      MainBehavior.tsx  SolutionsBehavior.tsx  RoiBehavior.tsx  …
    content/
      industries/           # данные отраслей без русского текста (раздел 3.5)
    lib/
      roi-model.ts  facade-model.ts  format.ts
    styles/                 # styles.css, solutions.css, … без изменений содержимого
  public/
    assets/                 # только используемые файлы, пути те же, что в легаси
  Dockerfile  .dockerignore  .env.example  README.md
```

### 3.3 Рендер и компоненты

- Страницы и секции — **серверные компоненты**. `'use client'` только у островов поведения в
  `behaviors/` и у мелких интерактивных узлов, которым нужен React-стейт. Директива на целой
  странице запрещена.
- `export const dynamic` не ставить. Не читать `searchParams` в `page.tsx` и не вызывать
  `cookies()` / `headers()` в страницах: это переводит маршрут в динамический рендер.
- Параметры из адреса (`?topic=`, `?industry=`, `?t=&a=&m=&k=`) читает клиентский остров в
  `useEffect` через `window.location`, как сейчас. Сервер рендерит полный список, фильтр прячет
  лишнее. `useSearchParams` без `Suspense` не использовать: он выключает SSR до ближайшей границы.
- **404.** `404.html` становится `not-found.tsx` внутри `[locale]` плюс `[...rest]/page.tsx` с
  `notFound()` (схема из документации next-intl, https://next-intl.dev/docs/environments/error-files).
  Ответ обязан иметь **статус 404** и `noindex`, как сейчас. Для адресов вне локали next-intl
  предлагает `global-not-found.tsx`: проверить в документации Next 16.4, нужен ли для него флаг, и
  закрепить поведение e2e-тестом (`/nope/` и `/en/nope/` → 404 с текстом на своём языке).
  Хак `document.write('<base href=…>')` из `404.html` **не переносится**: все ссылки в новом сайте
  абсолютные от корня, `<base>` не нужен.
- `setRequestLocale(locale)` в каждом layout и page, `generateStaticParams` для локалей и слагов
  (по документации next-intl для статического рендера).

### 3.4 Поведение (JS) — перенос «островами»

Легаси-скрипты переносятся **почти дословно**, а не переписываются на React-стейт:

```tsx
'use client';
export function SolutionsBehavior() {
  useEffect(() => {
    // тело solutions.js, без обёртки window.i18n.ready
    return () => { /* снять слушатели, observers, интервалы, таймеры */ };
  }, []);
  return null;
}
```

Правила:
1. У каждого эффекта есть полная очистка: `removeEventListener`, `observer.disconnect()`,
   `clearInterval/clearTimeout`, удаление созданных клонов DOM, `lenis.destroy()`,
   `ScrollTrigger.getAll().forEach(t => t.kill())` в пределах острова, `gsap.ticker.remove(...)`.
   Для GSAP использовать `useGSAP(() => {...}, { scope })` или `gsap.context()` с `revert()`.
   Причина: React Strict Mode в dev вызывает эффект дважды. Без очистки ленты брендов
   клонируются дважды, часы тикают двумя интервалами, Lenis запускается два раза.
2. Порядок запуска сохраняется. Сейчас `solutions.js` подключён раньше `industry.js` и
   `products.js`, и они рассчитывают на это.
3. Обёртка `window.i18n.ready` убирается: текст уже на нужном языке с сервера. Тексты, которые
   скрипт собирает сам (`js.*`), берутся через `useTranslations('js')` и передаются в остров
   пропсом или через `NextIntlClientProvider` **только с пространством `js`**, не весь словарь.
4. Форматирование чисел в островах: русский — как сейчас в `main.js` (запятая, неразрывный пробел
   между тысячами), английский — `Intl.NumberFormat('en', { useGrouping: 'always' })`. Вынести в
   `lib/format.ts` и использовать везде, где легаси форматирует сам.
5. GSAP и Lenis импортируются из npm (`import gsap from 'gsap'`,
   `import { ScrollTrigger } from 'gsap/ScrollTrigger'`, `import Lenis from 'lenis'`), CDN-теги
   удаляются. `gsap.registerPlugin(ScrollTrigger)` внутри клиентского модуля.
6. Инлайн-обработчики (`onsubmit="return false"` у форм калькуляторов и чек-листа) переходят в
   остров: `form.addEventListener('submit', e => e.preventDefault())` или проп `onSubmit` у
   клиентского компонента. В серверной разметке строковых обработчиков быть не может.

### 3.5 i18n в Next.js

**Источник истины меняется.** После переноса русский текст живёт только в
`site/src/messages/ru.json`. В компонентах и данных русского текста нет. Скрипт
`extract.mjs` (сборка `ru.json` из разметки) больше не нужен в новом сайте.

Механический перевод атрибутов в вызовы:

| Легаси | Next.js |
|---|---|
| `<h1 data-i18n="home.hero.title">Текст</h1>` | `<h1>{t('home.hero.title')}</h1>` |
| `<p data-i18n-html="k">Текст <b class="x">жирно</b></p>` | `<p>{t.rich('k', { b: (c) => <b className="x">{c}</b> })}</p>` |
| `data-i18n-attr="alt:k1;aria-label:k2"` | `alt={t('k1')} aria-label={t('k2')}` |
| `data-i18n-args='{"n":3}'` | `t('k', { n: 3 })` |
| `<title data-i18n>` и `<meta data-i18n-attr="content:…">` | `generateMetadata` с `getTranslations` |

Атрибуты `data-i18n*` в новой разметке не оставлять.

Данные отраслей (`data.mjs`, `pages/*.mjs`) превращаются в TS-модули `content/industries/` без
строк для посетителя: в них остаются числа, иконки, ссылки, порядок секций, варианты раскладки.
Текст берётся по ключу из того же пути, что строил генератор
(`industries.<camelSlug>.problems.items.2.title`; у элемента с `id`/`key` — по нему). Ключи общих
имён из таблицы `NAMES` в `build.mjs` (`common.solutionNames.*`, `common.linkNames.*`,
`common.sources.*`) сохраняются.

**Числа (проверить тестом).** Легаси форматирует числа в сообщениях через
`Intl.NumberFormat(locale, { useGrouping: 'always' })` (`tools/i18n/icu.mjs`), next-intl — своими
настройками по умолчанию. Для `ru` и `en` в Node 20+ вывод совпадает («6 000» с U+00A0, «6,000»),
но скелеты (`::.0`), `plural` с `#` и разделитель в разных ICU-сборках могут разойтись. Если
разойдутся, задать `formats` в `i18n/request.ts`. Шлюз: тест, который прогоняет **каждое**
сообщение `ru.json` и `en.json` с переменными через next-intl и через `icu.mjs` и требует
одинаковый результат.

**Маршрутизация языков.**

| Случай | Требуемое поведение |
|---|---|
| Первый визит на `/products/`, браузер на английском | русская страница (язык браузера не учитывается, как сейчас) |
| Клик по «EN» в шапке на `/products/` | переход на `/en/products/`, выбор запоминается |
| Повторный визит на `/products/` после выбора EN | `/en/products/` (как сейчас через `localStorage`) |
| Клик по «RU» на `/en/products/` | переход на `/products/`, выбор запоминается |
| Ссылка `/products/?lang=en` | 307 на `/en/products/`, параметр `lang` убран, выбор запомнен |
| Ссылка `/en/products/?lang=ru` | 307 на `/products/` |
| Поисковый робот без cookie | всегда получает запрошенный адрес без редиректа |

Реализация: `defineRouting({ locales: ['ru','en'], defaultLocale: 'ru', localePrefix: 'as-needed' })`
и `proxy.ts`. Обработку `?lang=` дописать в `proxy.ts` перед вызовом next-intl. Как именно
next-intl 4 сочетает `localeDetection: false` с cookie `NEXT_LOCALE`, по документации однозначно не
ясно: проверить на установленной версии и закрепить таблицу выше e2e-тестом. Если стандартными
опциями не выходит, cookie обрабатывается вручную в `proxy.ts`.

Кнопки переключателя остаются кнопками с `data-lang` и `aria-pressed` (вид и разметка не меняются),
поведение даёт маленький клиентский остров.

`<html lang>` равен локали. Английские страницы пока не индексируются: у них тот же
`robots: noindex`, что и у русских; `hreflang` не добавлять (решение владельца, раздел 10).

### 3.6 CSS

- Все `.css` из корня копируются в `site/src/styles/` **байт в байт**. Правка CSS разрешена только
  для путей `url(...)`, если такие найдутся (сейчас в CSS только `data:`-URI).
- Подключение: глобальные `import` в layout/page **того же набора и в том же порядке**, что
  `<link>` в легаси-странице. Порядок важен для каскада.
- Ссылки между страницами в фазах 1–6 — обычные `<a href>`, **не** `next/link`. Каждый переход
  загружает страницу заново, как сейчас. Это убирает две проблемы сразу: CSS одной страницы не
  «протекает» на другую при клиентской навигации, и скрипты не надо переинициализировать между
  маршрутами. `next/link` — фаза 9, только после проверки коллизий CSS (раздел 7.7).
- Шрифты в фазах 1–6 подключаются тем же `<link>` на Google Fonts в `<head>`, что сейчас.
  CSS уже использует переменные `--sans` и `--mono`, поэтому переход на `next/font` позже
  сводится к смене значения переменных.
- Инлайн-скрипт `document.documentElement.classList.add('js')` ставится в `<head>` layout до
  стилей, синхронно (`<script dangerouslySetInnerHTML>`). У `<html>` — `suppressHydrationWarning`,
  иначе React ругается на добавленный класс.

### 3.7 Ассеты

- Скрипт собирает все ссылки на файлы из HTML, CSS и JS легаси (`src`, `href`, `srcset`, `url()`,
  строки путей в JS) и копирует в `site/public/` **только используемые**, сохраняя путь:
  `assets/robots/robot-amr.webp` → `public/assets/robots/robot-amr.webp`.
- Все относительные пути становятся абсолютными: `assets/…` → `/assets/…`. Иначе на
  `/industries/retail/` картинка будет искаться в `/industries/retail/assets/…`. Это касается и
  путей, которые собирает JS.
- `<img>` остаются `<img>` с теми же `width`, `height`, `loading`, `alt`. `next/image` — фаза 9.
- Не копировать: `assets/robots/_backup/`, `assets/роботс/`, `.pptx`, `.pdf`, если на них нет ссылок
  (скрипт решает по факту ссылок и печатает список пропущенного).

### 3.8 Метаданные, JSON-LD, ссылки

- `<title>`, description, robots, canonical, og — через `generateMetadata` с текстами из словаря.
  Значения для RU совпадают с легаси символ в символ. `index` и `roi` без canonical, как сейчас.
  EN: canonical не ставить (страницы `noindex`), решение владельца в разделе 10.
- JSON-LD переносится как есть: `<script type="application/ld+json">` в теле страницы с тем же
  содержимым. На EN — тот же русский JSON-LD, как в легаси (рантайм его не переводил).
- Внутренние ссылки переписывает скрипт по карте адресов (7.2). Правило: файл → адрес из
  canonical, если его нет — по таблице 2.1; `query` и `#якорь` сохраняются как есть.

  | Легаси | Новый сайт |
  |---|---|
  | `index.html`, `index.html#platform` | `/`, `/#platform` |
  | `industries.html` | `/industries/` |
  | `industries-warehouse.html`, `industries-hotels.html#delivery` | `/industries/warehouse/`, `/industries/hotels/#delivery` |
  | `solutions.html#dir-cleaning` | `/solutions/#dir-cleaning` (страницы `/solutions/cleaning/` нет, см. 2.5) |
  | `products.html#raas`, `platform.html`, `services.html#pilot` | `/products/#raas`, `/platform/`, `/services/#pilot` |
  | `cases.html?industry=manufacturing`, `cases.html#list` | `/cases/?industry=manufacturing`, `/cases/#list` |
  | `knowledge.html?topic=roi#materials` | `/knowledge/?topic=roi#materials` |
  | `knowledge-cleaning-robot-basics.html` | `/knowledge/cleaning-robot-basics/` |
  | `roi.html?k=facade`, `roi.html?t=…&a=…&m=…` | `/roi/?k=facade`, `/roi/?t=…&a=…&m=…` |
  | `privacy.html`, `consent.html` | `/privacy/`, `/consent/` |
  | `contacts.html#talk` | `/contacts/#talk` |

  Ссылки, которые собирает JS (`roi.html?t=…`), тоже. На `/en/`-страницах внутренние ссылки
  ведут на `/en/…`. Ссылка на файл, которого нет в карте, — ошибка конвертера. Ссылки на `/privacy/`
  и `/consent/` из формы (`target="_blank" rel="noopener"`) сохраняют эти атрибуты.
- `<meta name="robots" content="noindex">` в выводе должен совпасть с легаси дословно. Если
  `metadata.robots = { index: false }` отдаёт другую строку (например, добавляет `nofollow`),
  использовать форму, которая даёт ровно `noindex`; проверяет инвариант 10.
- Старые адреса `*.html` отдают 308 на новые (`redirects` в `next.config.ts`), с сохранением
  query и hash.
- `trailingSlash: true`: адреса со слешем на конце, как в canonical.

### 3.9 Формы

Поведение формы заявки сохраняется полностью: валидация, honeypot, таймаут 12 с, имитация
отправки при пустом `data-endpoint`, обязательный чекбокс согласия (`name="consent"`) со ссылкой
на `/consent/`, атрибут `data-source` у каждой страницы. Значения `data-source` берутся из легаси
как есть (на данный момент: `about`, `cases`, `contacts`, `industries`, `industries/<slug>`,
`knowledge`, `knowledge-article`, `manufacturers`, `platform`, `products`, `services`; у `solutions`
атрибута нет, и `solutions.js` подставляет `solutions` сам); у `roi` своя форма
(`#f-consent`, `id="lead-form"` с классом `roi-form`) и логика в `roi.js`. Тест сверяет набор
значений `data-source` с инвентарём. Endpoint берётся из
`NEXT_PUBLIC_LEAD_ENDPOINT` (по умолчанию пусто, то есть имитация), переменная описана в
`.env.example`. Серверной обработки заявок не делать.

### 3.10 Развёртывание

SSR-сайту нужен Node-сервер: GitHub Pages его не запускает. Целевой вариант по умолчанию:
`output: 'standalone'`, многоэтапный `Dockerfile` на `node:20-alpine` или новее, порт из `PORT`,
`HEALTHCHECK` на `/api/health/`. В `site/README.md` — точные команды:

```bash
cd site && npm ci && npm run dev        # разработка
npm run build && npm start               # прод локально
docker build -t profrobot-site . && docker run -p 3000:3000 profrobot-site
```

Где хостить, решает владелец (раздел 10). Ветка `gh-pages` продолжает отдавать легаси до решения.

---

## 4. Инварианты: что нельзя потерять

Каждый пункт проверяется автоматически в шлюзах.

1. **Текст.** Каждое слово каждой страницы на RU и EN на месте, тем же шрифтом, в той же позиции
   (снимок `snapshot.mjs`, допуск 0,5 px).
2. **Атрибуты.** `alt`, `title`, `aria-*`, `placeholder`, `content` у meta, `data-name`, `data-cat`,
   `data-res` — те же значения.
3. **Рамки элементов.** Те же размеры и положения при 1440 и 390 px.
4. **Без JS.** Сервер отдаёт в HTML полный текст каждой страницы (проверка по DOM без
   выполнения скриптов, а не по видимости: `.reveal` без JS скрыт и в легаси, см. 6.11); фильтры кейсов и базы
   знаний показывают все элементы; ссылки работают.
5. **Анимации.** Пины ScrollTrigger на главной (кадры start / mid / end), лента роботов, ленты
   брендов, появление `.reveal`, часы в подвале, фирменные блоки отраслей ведут себя как в легаси.
   При `prefers-reduced-motion` анимации выключены так же, как сейчас.
6. **Калькуляторы.** Для одинаковых входов `roi.html` и мини-калькуляторы отраслей показывают те же
   цифры. Параметры из адреса подхватываются.
7. **Консоль.** Ноль ошибок и ноль предупреждений гидрации на всех страницах в обоих языках.
8. **Горизонтальный скролл.** Нет ни на одной странице при 1440, 1024, 768, 390 px.
9. **Ссылки.** Все внутренние ссылки и якоря ведут на существующие страницы и элементы, исключений нет.
10. **Метаданные.** title, description, robots, canonical, JSON-LD совпадают с легаси.
11. **Сборка.** `next build` без ошибок, все страницы статические (`○`/`●`), `tsc --noEmit` и
    `eslint` чистые.
12. **Отраслевые страницы разные.** Hero и фирменный блок у каждой свои (следует из пункта 3).

---

## 5. Оракул паритета

Сравнение идёт всегда с **замороженным снимком легаси**, а не с живым корнем.

1. В начале работы владелец коммитит текущее состояние, агент ставит тег `legacy-baseline`.
2. Скрипт разворачивает тег во временную папку:
   `git archive legacy-baseline | tar -x -C ../legacy-baseline`.
3. Снимки легаси:
   ```bash
   node tools/playwright/snapshot.mjs --root ../legacy-baseline --out .migrate/base-ru --widths 1440,390
   node tools/playwright/snapshot.mjs --root ../legacy-baseline --out .migrate/base-en --widths 1440,390 --lang en
   ```
4. Снимки нового сайта с работающего `next start` (после доработки `snapshot.mjs`, раздел 7.4):
   ```bash
   node tools/playwright/snapshot.mjs --base-url http://localhost:3000 --map tools/migrate/url-map.json --out .migrate/next-ru
   node tools/playwright/snapshot.mjs --base-url http://localhost:3000 --map tools/migrate/url-map.json --locale en --out .migrate/next-en
   ```
5. Сравнение: `node tools/playwright/snapshot.mjs --compare .migrate/base-ru .migrate/next-ru`
   и то же для EN. Код выхода 0 = паритет.

`.migrate/` добавить в `.gitignore`.

Если легаси меняется во время переноса (на 2026-10-07 страницы ещё добавляются), владелец ставит
новый тег, агент пересобирает базовые снимки и переносит разницу. Правки легаси после тега без
нового тега агент не учитывает.

---

## 6. Ловушки, на которых ломаются переносы HTML → JSX

Конвертер (7.3) обязан обрабатывать их все; снимок покажет пропуск.

1. **Пробелы.** JSX выбрасывает пробелы на переносах строк между элементами, HTML схлопывает их в
   один. `<span>Решение:</span>\n<a>Клининг</a>` в JSX слипнется в «Решение:Клининг». Конвертер
   ставит `{' '}` везде, где в HTML между строчным содержимым был пробельный символ.
2. **Сущности.** `&nbsp;` → ` `, `&mdash;` и прочие → символы. Неразрывные пробелы в цифрах
   («12 000 м²») должны остаться неразрывными.
3. **Атрибуты.** `class` → `className`, `for` → `htmlFor`, `tabindex` → `tabIndex`,
   `stroke-width` → `strokeWidth`, `xlink:href` → `xlinkHref`, `viewbox` → `viewBox`,
   `crossorigin` → `crossOrigin`, `style="a:b"` → `style={{ a: 'b' }}` (CSS-переменные
   `--x` остаются строковыми ключами), булевы атрибуты (`novalidate` → `noValidate`, `hidden`,
   `disabled`). `data-*` и `aria-*` без изменений.
4. **Пустые и самозакрывающиеся** (`<br>`, `<img>`, `<input>`, `<path>`) → `<br />`.
5. **SVG-спрайт** `<svg><defs><symbol id="i-…">` в начале тела переносится как один серверный
   компонент `Sprite`, без изменений геометрии.
6. **`<template>`, `<noscript>`, комментарии.** `<template>` переносится через
   `dangerouslySetInnerHTML` на самом `<template>`; `<noscript>` — как есть; HTML-комментарии
   выбрасываются.
7. **Элементы, которые добавляет Next.** `next-route-announcer`, служебные `<script>` и `<link>`
   исключаются из снимка (`--ignore`), иначе сравнение рамок падает.
8. **Гидрация.** Всё, что зависит от времени, `Math.random`, `window` или языка браузера, на
   сервере не рендерится. Часы в подвале: сервер отдаёт тот же текст-заглушку, что в легаси HTML,
   остров заменяет его после монтирования.
9. **Порядок `<link>` CSS.** Next может переставить импорты. Проверить итоговый порядок
   `<link rel="stylesheet">` в отданном HTML против легаси.
10. **`<details>` и якоря.** В статье базы знаний вопрос `<details class="kb-q">` раскрывается по
    `#faq-…`. Атрибут `open` ставит только остров после монтирования, на сервере его нет, иначе
    ломается гидрация. Якоря с `id` на странице сохраняются без изменений (на них ведут ссылки
    с других страниц, см. 3.8).
11. **Видимость без JS.** В легаси `.reveal` скрыт CSS безусловно (`opacity: 0`), показывает его
    `solutions.js`; без JS такие блоки остаются невидимыми, хотя текст в HTML есть. Это
    поведение переносится как есть и не чинится. Класс `js` у `<html>` ставится только инлайн-
    скриптом (3.6), а не серверным рендером.

---

## 7. Скрипты, которые пишет агент

Все в `tools/migrate/`, ESM (`.mjs`), Node ≥ 20, без зависимостей кроме парсера HTML. Каждый
скрипт идемпотентен: повторный запуск даёт тот же результат.

### 7.1 `inventory.mjs` — инвентарь легаси
Вход: корень легаси (`--root`). Выход: `tools/migrate/inventory.json` и человекочитаемый
`docs/migration/INVENTORY.md`. Для каждой страницы: файл, целевой адрес (canonical или карта из
2.1), подключённые CSS и JS по порядку, CDN-скрипты, инлайн-скрипты (кратко), наличие JSON-LD,
robots, формы (`id`, `data-source`, `data-endpoint`), параметры адреса, которые читает JS,
используемые ассеты, число ключей `data-i18n*`. Для каждой страницы: рукописная она или
сгенерирована `build.mjs`, есть ли в ней блок `foot-nav` (2.7), есть ли `document.write` и
`<base>` (как в `404.html`). Отдельно: битые внутренние ссылки и якоря, отсутствующие файлы.
Падает, если нашёл страницу без адреса в карте. Режим `--diff <тег>` печатает страницы,
добавленные, удалённые и изменённые после тега (для раздела 13). На `296282e` ожидаемый результат:
27 страниц и `404.html`, ни одной битой ссылки.

### 7.2 `url-map.mjs` — карта адресов
Строит `tools/migrate/url-map.json` из инвентаря: `{ "products.html": "/products/", … }`. Его
используют переписывание ссылок, редиректы `next.config.ts` и снимки.

### 7.3 `html-to-jsx.mjs` — конвертер разметки
Вход: легаси-страница (или вывод генератора отрасли). Выход: TSX серверного компонента тела
страницы. Делает всё из раздела 6, переводит `data-i18n*` в вызовы `t()` / `t.rich()` (раздел 3.5),
переписывает ссылки и пути ассетов по карте. Для `data-i18n-html` строит отображение тегов по
правилу «n-й элемент с тем же именем», сверяясь с сообщением в `ru.json`. Тег, которого нет в
сообщении или в разметке, — ошибка конвертера, не молчаливый пропуск. Блок между
`<!-- foot-nav:start -->` и `<!-- foot-nav:end -->` заменяется на `<FooterNav />` (2.7), при условии
что блок побайтово совпадает с эталоном из `footer-nav.mjs`; иначе ошибка. Юнит-тесты на каждый
пункт раздела 6.

Разделять вывод на компоненты (секции, оболочку) после конвертации можно и вручную, но паритет
проверяется после каждого шага.

### 7.4 Доработка `tools/playwright/snapshot.mjs`
Добавить: `--base-url` (снимать с живого сервера вместо статического), `--map` (имя снимка по
легаси-файлу, адрес по карте), `--locale en` (для нового сайта: префикс `/en/`, без рантайма),
список исключений по умолчанию для служебных элементов Next. Существующее поведение не ломать:
старые команды из `i18n/README.md` работают как раньше.

### 7.5 `copy-assets.mjs`
Копирует используемые ассеты из инвентаря в `site/public/`, печатает пропущенные и отсутствующие.

### 7.6 `messages.mjs` — словари
1. Копирует `i18n/ru.json` (уже включает `js.*`) и `i18n/en.json` в `site/src/messages/`.
2. Проверки: одинаковые ключи в RU и EN, одинаковые переменные и теги, валидный ICU
   (через `tools/i18n/icu.mjs`), нет кириллицы в EN.
3. Каждый ключ, используемый в `site/src` (статический разбор `t('…')` и шаблонов ключей отраслей),
   есть в словаре; каждый ключ словаря используется. Динамические ключи отраслей разворачиваются
   по данным `content/industries/`.
4. Сверка форматирования: для каждого сообщения с переменными результат next-intl равен результату
   `icu.mjs` (раздел 3.5, «Числа»).

### 7.7 `css-collisions.mjs` (нужен только для фазы 9)
Для каждой страницы P и каждого CSS-файла F, который P не подключает, проверяет в Playwright,
совпадает ли хоть одно правило F с элементами P. Пустой результат = можно включать `next/link`.

### 7.8 `links.mjs` — проверка ссылок
Обходит все страницы `next start` на обоих языках, проверяет, что каждая внутренняя ссылка
отдаёт 200 (или 308 на 200), якоря существуют на целевой странице. Список исключений пуст (на `296282e` битых ссылок нет); любое исключение вносит только владелец.

### 7.9 `models-golden.mjs` — паритет расчётов
Прогоняет сетку входов (все типы объектов × все режимы × 10 площадей по диапазону; все сценарии
фасада × 10 площадей) через легаси `roi-model.js` / `facade-model.js` и через новые TS-модули.
Требует точного совпадения всех полей результата.

### 7.10 `gate.mjs` — шлюз одной командой
Запускает по порядку: `tsc --noEmit`, `eslint`, тесты, `next build` (с проверкой, что нет
динамических маршрутов), `next start`, снимки RU/EN и сравнение, `links.mjs`, `check.mjs` на
горизонтальный скролл и консоль при 1440/1024/768/390, сценарии `tools/playwright/*.mjs`,
поведение без JS. Печатает итоговую таблицу и выходит с кодом 1 при любой ошибке.
Флаг `--only <страница>` для работы над одной страницей.

---

## 8. Фазы и шлюзы

### Фаза 0. Подготовка
- Рабочее дерево должно быть чистым (`git status` пуст; на момент версии 1.1 спеки так и есть,
  коммит `296282e`). Агент ставит тег `legacy-baseline` на текущий коммит ветки `gh-pages` и
  создаёт ветку `feat/nextjs-migration` от него. Если дерево грязное, остановиться и спросить
  владельца: базой нельзя делать незакоммиченное состояние.
- Скрипты 7.1, 7.2. Снимки легаси RU и EN (раздел 5).
- Журнал `docs/migration/STATUS.md` (раздел 11).

**Шлюз 0:** `inventory.json` покрывает все `*.html` корня (на `296282e` это 28 файлов); снимки легаси сняты при 1440 и 390 на
обоих языках; `node --test roi-model.test.js facade-model.test.js tools/i18n/icu.test.mjs` и
`node --test tools/i18n/check.mjs` на легаси зелёные (если `check.mjs` красный на легаси,
записать в журнал и сообщить владельцу до фазы 1).

### Фаза 1. Каркас
- `create-next-app`, зависимости из 3.1, `next.config.ts` (trailingSlash, standalone, редиректы),
  next-intl (`routing.ts`, `request.ts`, `proxy.ts`), `[locale]/layout.tsx` с `<head>` как в легаси,
  `api/health`, Dockerfile, `.env.example`, `site/README.md`.
- Перенос CSS (3.6), ассетов (7.5), словарей (7.6, пункты 1–2).
- Модели `lib/roi-model.ts`, `lib/facade-model.ts`, перенос тестов, `models-golden.mjs`.
- Тест форматирования чисел (7.6, пункт 4).

**Шлюз 1:** сборка и Docker-образ поднимаются, `/api/health/` → 200; тесты моделей и golden
зелёные; форматирование всех сообщений совпадает с `icu.mjs`; таблица языковой маршрутизации
(3.5) закрыта e2e-тестом.

### Фаза 2. Оболочка
Шапка, меню, переключатель языка, подвал (с часами и подсветкой вордмарка), форма заявки,
крошки, SVG-спрайт, `FooterNav` — серверные компоненты + острова. Обкатка в два шага. Сначала
`privacy`: нет ни JS, ни формы, проверяет только оболочку, i18n и конвейер снимков. Затем
`solutions`: добавляет форму, `.reveal` и счётчик разделов (GSAP там нет).

**Шлюз 2:** `gate.mjs --only privacy` и `gate.mjs --only solutions` зелёные на RU и EN.

### Фаза 3. Простые страницы
Рукописные страницы: `products`, `platform`, `services`, `cases`, `knowledge`,
`knowledge/cleaning-robot-basics`, `about`, `contacts`, `manufacturers`. Затем `consent` и
`not-found` (3.3). По одной: конвертер → компоненты → остров → шлюз страницы → коммит.

**Шлюз 3:** `gate.mjs --only <страница>` зелёный для каждой; фильтры `cases` и `knowledge`
работают с параметром в адресе и без JS; вкладки `platform` переключаются кликом, стрелками и
по таймеру, таймер останавливается при наведении; якорь `#faq-…` в статье раскрывает вопрос;
`/nope/` и `/en/nope/` отдают 404 с текстом на своём языке.

### Фаза 4. ROI
`roi` с двумя калькуляторами, параметрами адреса и `localStorage`.

**Шлюз 4:** шлюз страницы зелёный; `tools/playwright/roi.mjs` проходит; для 20 случайных
комбинаций входов цифры на странице равны цифрам легаси-страницы.

### Фаза 5. Отраслевые лендинги
- Данные `data.mjs` и `pages/*.mjs` → `content/industries/*.ts` без русского текста (3.5).
- Рендереры → компоненты: общие секции в `industries/shared/`, свои Hero и фирменные блоки
  в `industries/<slug>/`. Таблица «секция → компонент» на каждую отрасль, как в генераторе.
- Мини-калькулятор считает через `lib/roi-model.ts` на сервере, как генератор при сборке.
- Острова `industry.js` и `industry-<slug>.js` (`business-centers`, `public-spaces`, `retail`,
  `warehouse`).
- Порядок: сначала одна отрасль из `data.mjs` (`hotels`), потом одна из `pages/` со своим CSS и JS
  (`warehouse`), затем `retail`, дальше остальные.
- Хаб `industries` (рукописный) последним: его карточки и лента кейсов используют данные отраслей.

**Шлюз 5:** шлюз страницы зелёный для хаба и всех 12 отраслей; `tools/playwright/industries.mjs`
и `tools/playwright/industries-hub.mjs` проходят.

### Фаза 6. Главная и догон
`index` последней: GSAP-пины, лента роботов, Lenis, бренды-ленты. Перед шлюзом выполнить
процедуру раздела 13 (страницы, появившиеся в легаси после тега).

**Шлюз 6:** снимки RU/EN совпадают; `check.mjs --pin <секция>` даёт те же кадры start / mid / end,
что у легаси (сравнение скриншотов, допускается только сглаживание шрифтов); `perf.mjs` не хуже
легаси более чем на 10 % по каждой метрике (если хуже, записать цифры в журнал); полный
`gate.mjs` зелёный на всех страницах.

### Фаза 7. Переключение (только с подтверждения владельца)
- Агент готовит, но не выполняет без явного «да» владельца: перенос `site/` в корень или смену
  корня деплоя, архивацию легаси-файлов в `legacy/`, отключение `extract.mjs`/`embed.mjs`,
  обновление `CLAUDE.md`, `docs/README.md`, `i18n/README.md` под новую схему.
- ADR `docs/adr/0002-nextjs-migration.md` (номер 0001 занят: `0001-temporary-solution-urls.md`): контекст, решение, альтернативы, последствия.

### Фаза 8. Отчёт
Итоговый отчёт в `docs/migration/REPORT.md` (раздел 11).

### Фаза 9. После паритета (отдельные задачи, не в рамках переноса)
`next/link` после `css-collisions.mjs`; `next/font` (самостоятельный хостинг шрифтов);
`next/image`; обновление GSAP и Lenis; бэкенд формы; индексация и `hreflang`. Каждая задача —
своя ветка и свой шлюз паритета.

---

## 9. Запреты (частые ошибки ИИ-агентов)

- Не переписывать тексты, даже «очевидные опечатки». Опечатку записать в журнал.
- Не переименовывать CSS-классы, `id`, `data-*`: на них завязаны CSS, JS и тесты Playwright.
- Не «упрощать» анимации и не заменять GSAP на CSS или Framer Motion.
- Не сводить отраслевые страницы к одному шаблону.
- Не создавать страницы решений `/solutions/<slug>/` и не менять ссылки `solutions.html#dir-<slug>` на них (ADR 0001).
- Не переносить GitHub-Pages-хак `<base href>` из `404.html`.
- Не ставить `'use client'` на страницу или секцию целиком ради одного обработчика.
- Не читать `searchParams`, `cookies()`, `headers()` в страницах.
- Не заглушать ошибки гидрации через `suppressHydrationWarning` нигде, кроме `<html>`.
- Не ослаблять допуски, не добавлять страницы в исключения проверок, не отключать тесты.
- Не оставлять `TODO`, заглушек и «остальное аналогично»: страница считается перенесённой только
  с зелёным шлюзом.
- Не трогать файлы легаси в корне до фазы 7 (кроме `tools/playwright/` и `tools/migrate/`).
- Не придумывать пакеты и API: проверить `npm view` и документацию установленной версии.
- Не добавлять `hreflang`, sitemap, индексацию, аналитику, cookie-баннеры.

---

## 10. Решения владельца

Агент работает с указанными значениями по умолчанию и не ждёт ответа. Ответ владельца может
поменять только этот пункт.

| # | Вопрос | По умолчанию в этой спеке | Что изменится при другом ответе |
|---|---|---|---|
| 1 | Где хостить Node-сервер | Docker-образ, площадку выбирает владелец; `gh-pages` пока отдаёт легаси | Vercel: Dockerfile не обязателен. Только статика: `output: 'export'`, нет `proxy.ts`, языковой редирект по cookie и `?lang=` уходит в клиентский скрипт |
| 2 | Английский под `/en/` | да, `localePrefix: 'as-needed'` | поддомен `en.` — другая настройка next-intl и редиректов |
| 3 | Индексировать ли EN | нет, `noindex`, без `hreflang` | при «да»: `hreflang`, canonical для EN, перевод JSON-LD |
| 4 | Заморозка правок легаси на время переноса | не нужна: легаси растёт быстро, поэтому действует протокол раздела 13 (тег, диф, догон) | при заморозке раздел 13 не понадобится |
| 5 | Где живёт Next-проект после переключения | в корне репозитория, легаси в `legacy/` | |
| 6 | Адреса юридических страниц | `/privacy/` и `/consent/` | другие слаги меняют только карту адресов (7.2) |
| 7 | Страницы решений `/solutions/<slug>/` | не создаём, ссылки остаются якорями на `/solutions/` (ADR 0001) | когда страницы появятся в легаси, они переносятся по протоколу раздела 13, а ссылки возвращаются по инструкции из ADR |
| 8 | Схема `LegacyPage` (тело страницы из `content/*.html` через `dangerouslySetInnerHTML` + legacy-скрипты) | принято 2026-10-08: **промежуточный этап**. Сначала паритет с легаси, настоящий перенос в серверные компоненты и острова (разделы 3.3–3.4) — отдельный этап B после паритета (ADR 0003). До этапа B отклонения от 3.3–3.4 допустимы и перечислены в `docs/migration/DEVIATIONS.md` | напрямую к этапу B: конвертер `html-to-jsx`, страница за страницей с `gate.mjs --only` |
| 9 | 404 через `proxy.ts` вместо `not-found.tsx` + `[...rest]` (3.3) | принято 2026-10-08, пока в Next 16.4.0 `notFound()` при корневом layout в `[locale]` отдаёт пустую оболочку без `lang` и `title` (утверждение агента, независимо не воспроизведено; перепроверить при обновлении Next/next-intl, см. `docs/migration/TODO.md`) | если схема из 3.3 заработает — вернуть и удалить `/not-found-page/` и rewrite в `proxy.ts` |

---

## 11. Журнал и отчёт

`docs/migration/STATUS.md` ведётся по ходу работы:

```
## 2026-10-08 Фаза 2 / solutions
- Сделано: …
- Шлюз: gate.mjs --only solutions → OK (RU 0 diff, EN 0 diff, links OK, console 0)
- Отклонения: …
- Вопросы владельцу: …
```

`docs/migration/REPORT.md` в конце: что перенесено (страницы × языки), результаты шлюзов с
командами и выводом, перенесённые дефекты легаси (2.5), отклонения и их причины, замеры
`perf.mjs` до и после, открытые решения из раздела 10, список задач фазы 9.

---

## 12. Источники

Проверено 2026-10-07.

- Next.js, `proxy.js` (бывший middleware, переименован в v16.0.0, по умолчанию Node.js runtime,
  не работает со static export): https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- next-intl, конфигурация маршрутизации (`localePrefix`, `localeDetection`, cookie `NEXT_LOCALE`):
  https://next-intl.dev/docs/routing/configuration
- next-intl, локализованные страницы «не найдено» (`not-found.tsx`, catch-all, `global-not-found`):
  https://next-intl.dev/docs/environments/error-files
- next-intl, числа в сообщениях (глобальные `formats`, скелеты `::`):
  https://next-intl.dev/docs/usage/numbers
- Версии пакетов: `npm view` на 2026-10-07 — next 16.4.0, next-intl 4.14.9, gsap 3.15.0
  (используем 3.12.5), lenis 1.3.26 (используем 1.1.13), @gsap/react 2.1.2, typescript 7.0.2,
  playwright 1.63.0. Требование Next 16 к Node: `>=20.9.0`.
- Внутренние: `i18n/README.md`, `tools/industries/build.mjs`, `tools/playwright/snapshot.mjs`,
  `design-system/README.md`, `CLAUDE.md` проекта.

Не проверено: совместимость TypeScript 7 с Next 16 (поэтому версия TS — та, что ставит
`create-next-app`); точное поведение `localeDetection: false` вместе с cookie в next-intl 4
(закрывается e2e-тестом в шлюзе 1).

---

## 13. Протокол: легаси меняется во время переноса

Легаси развивается параллельно (хаб отраслей, склады, платформа, юридические страницы и статья
появились за один день перед этой версией спеки). Чтобы перенос не гонялся за движущейся целью:

1. Эталон — тег `legacy-baseline`. Всё, что сделано в легаси после тега, агент в текущей фазе
   **не трогает** и не переносит.
2. В начале каждой фазы и перед шлюзом 6 агент запускает `node tools/migrate/inventory.mjs
   --diff legacy-baseline` и записывает результат в журнал: какие страницы добавлены, удалены,
   изменены и какие общие файлы (`styles.css`, `solutions.js`, `i18n/*.json`) затронуты.
3. Если диф не пуст, агент сообщает владельцу и **ждёт нового тега** (`legacy-baseline-2`), если
   владелец хочет, чтобы изменения вошли. Без нового тега изменения не переносятся. Владелец
   вправе отложить их на после фазы 8.
4. После нового тега: инвентарь и снимки эталона пересоздаются; новые страницы идут по конвейеру
   фаз 2–3 (конвертер → компоненты → шлюз страницы); изменения в уже перенесённых страницах
   переносятся правкой соответствующих компонентов, после чего шлюз этих страниц запускается
   заново; словари `messages` обновляются скриптом 7.6.
5. Новая страница в карте адресов добавляется скриптом 7.2. Если у неё нет canonical и её адрес
   не следует из правил 2.1, агент берёт адрес по смыслу английскими словами и записывает его
   в журнал как решение к подтверждению (раздел 10).
6. Сгенерированные страницы (отрасли): менять нужно данные в `content/industries/`, а не
   компоненты, если различие только в данных. Если легаси добавило новый тип блока в
   `build.mjs`, это новый компонент в `industries/<slug>/` (или `shared/`).
