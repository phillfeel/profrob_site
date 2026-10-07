# Migration status

## 2026-10-07 Фаза 0 / baseline-2

- Сделано: принят `legacy-baseline-2` на `e669e55`, создана ветка `feat/nextjs-migration-2`.
- Сделано: `tools/migrate/inventory.mjs` и `tools/migrate/url-map.mjs`.
- Инвентарь: 30 HTML-файлов, 29 маршрутов + `404.html`; 0 битых внутренних ссылок/якорей; 0 отсутствующих ассетов.
- Снимки: `.migrate/base-ru` и `.migrate/base-en`, 1440 и 390 px, все 30 страниц.
- Проверки: `node --test tools/i18n/check.mjs` — OK; `node --test roi-model.test.js facade-model.test.js tools/i18n/icu.test.mjs` — OK.
- `node tools/migrate/inventory.mjs --root . --diff legacy-baseline-2` — изменений после baseline нет.
- Шлюз 0: **OK**.
- Отклонение: baseline содержит `solutions-cleaning.html` и `solutions-warehouse.html`, добавленные и одобренные ADR 0002. Версия спеки 1.1 всё ещё содержит более старое правило «не создавать страницы решений». Эти страницы не создавались агентом; они входят в замороженный baseline-2 и должны быть перенесены как часть фактического состава `*.html`.
- Вопрос владельцу: нет; продолжать перенос решениями из baseline-2.

## 2026-10-07 Фаза 1 / scaffold

- Сделано: Next.js 16.4.0 App Router + TypeScript scaffold в `site/`.
- Сделано: `next-intl` 4.14.9, `gsap` 3.12.5, `@gsap/react` 2.1.2, `lenis` 1.1.13.
- Сделано: RU/EN dictionaries, assets, CSS, `proxy.ts`, SSG `generateStaticParams`, health endpoint `/api/health/`.
- Сделано: ROI/FACADE модели перенесены в `site/src/lib/*.ts`.
- Проверки: `npm run lint` — OK; `npm run build` — OK; `/ru` и `/en` — SSG (`●`), `/api/health/` — 200.
- HTTP: `/` — 200 через внутренний rewrite в RU; `/en/` — 200 и английский H1; внешний `/ru/` — 307 на `/`.
- Фаза 1: **частично OK**.
- Блокер: browser DOM `document.documentElement.lang` остаётся `ru` и на `/en/`, хотя контент английский. Нужна корректная локализованная root-layout схема до финального SEO/HTML parity.
- Docker: `docker build -t profrobot-site:phase1 site` не запустился: локальный Docker daemon недоступен (`Cannot connect to the Docker daemon at unix:///Users/philippe/.docker/run/docker.sock`).

## 2026-10-07 Фаза 2 / root-layout + about

- Сделано: root layout перенесён в route group и locale segment, поэтому `lang` теперь берётся из `[locale]` при SSG.
- Сделано: перенесён первый реальный legacy-маршрут `about` в `site/src/app/(localized)/[locale]/about/` с сохранением контента, CSS, i18n и legacy form/runtime.
- Сделано: legacy runtime/i18n ассеты размещены в `site/public/legacy/`; английский словарь доступен по `/i18n/en.json`.
- Проверки: `npm run lint --prefix site` — 0 errors, 7 legacy/style warnings; `npm run build --prefix site` — OK.
- Проверки HTTP: `/`, `/en/`, `/api/health/`, `/en/about/` — 200.
- Browser: `/en/` и `/en/about/` — `lang=en`, английский H1, консоль без ошибок.
- Тесты: 27/27 legacy unit/i18n tests OK.
- Известное ограничение: about пока использует legacy HTML/CSS/runtime адаптер; ссылки на ещё не перенесённые маршруты остаются переходами к будущим Next routes.

## 2026-10-07 Фаза 3 / products

- Сделано: перенесён второй реальный legacy-маршрут `products` в `site/src/app/(localized)/[locale]/products/`.
- Сделано: исходный body вынесен в `site/src/content/products-body.html`; inline/external `<script>` из HTML-оболочки удалены, runtime подключается React-адаптером.
- Сделано: переиспользованы `/legacy/styles.css`, `/legacy/solutions.css`, `/legacy/products.css`, `/legacy/i18n.js`, `/legacy/solutions.js`, `/legacy/products.js`.
- Сделано: `/en/products/` использует существующий английский словарь `/i18n/en.json` и Next metadata из `products.meta`.
- Проверки: `npm run build --prefix site` — OK; `/ru/products` и `/en/products` попали в SSG.
- HTTP: `/en/products/` — 200, `html lang="en"`; `/en/about/` и `/en/` — 200.
- Тесты: `node --test roi-model.test.js facade-model.test.js tools/i18n/icu.test.mjs` — 27/27 OK.
- Lint: 0 errors, 10 warnings; новые предупреждения только 3× `no-css-tags` для products, остальные 7 уже относились к legacy/about.

## 2026-10-07 Фаза 4 / services

- Сделано: перенесён третий реальный legacy-маршрут `services` в `site/src/app/(localized)/[locale]/services/`.
- Сделано: исходный body вынесен в `site/src/content/services-body.html`; legacy inline/runtime scripts удалены из injected HTML.
- Сделано: добавлен `/legacy/services.css`; переиспользованы `/legacy/styles.css`, `/legacy/solutions.css`, `/legacy/products.css`, `/legacy/i18n.js`, `/legacy/solutions.js`, `/legacy/products.js`.
- Сохранены существующие RU/EN i18n-ключи `services.*` и Next metadata с `noindex` как в legacy.

## 2026-10-07 Фаза 5 / solutions

- Сделано: перенесён четвёртый реальный legacy-маршрут `solutions` в `site/src/app/(localized)/[locale]/solutions/`.
- Сделано: исходный body вынесен в `site/src/content/solutions-body.html`; проверено точное совпадение с body из `solutions.html`.
- Сделано: legacy runtime подключается через `LegacySolutions.tsx`; для EN сохранён `i18n.js`, для RU используется текущий runtime-контракт.
- Сделано: переиспользованы `/legacy/styles.css` и `/legacy/solutions.css`; metadata берётся из `solutions.meta` и сохраняет `noindex`.
- Проверки: `npm run lint --prefix site` — 0 errors, 16 warnings; добавились только 2 `no-css-tags` для нового `solutions/page.tsx`.
- Проверки: `npm run build --prefix site` под Node 22.21.1 — OK; `/ru/solutions` и `/en/solutions` попали в SSG.
- HTTP: `/en/solutions/` — 200, `lang="en"`, английские title/description.
- `git diff --check` — OK.
- Browser automation: локальный Playwright package в `site` отсутствует, поэтому клиентскую замену текста в браузере в этой фазе не запускал.
- Docker: по-прежнему не проверен из-за недоступного daemon.

## 2026-10-07 Фаза 6 / cases

- Сделано: перенесён пятый реальный legacy-маршрут `cases` в `site/src/app/(localized)/[locale]/cases/`.
- Сделано: исходный body вынесен в `site/src/content/cases-body.html`; extraction проверен на точное совпадение с body legacy до JSON-LD и runtime scripts.
- Сделано: добавлены `/legacy/cases.css` и `/legacy/cases.js`; сохранена зависимость страницы от `/legacy/solutions.js` и `/legacy/products.js`.
- Сделано: JSON-LD из legacy shell не инжектируется; metadata остаётся в Next page с `noindex` как в legacy.
- Проверки: `npm run lint --prefix site` — 0 errors, 20 warnings; 4 новых `no-css-tags` относятся к `cases/page.tsx`.
- Проверки: `npm run build --prefix site` под Node 22.21.1 — OK; `/ru/cases` и `/en/cases` попали в SSG.
- HTTP: `/ru/cases/` после локализованного redirect — 200, `lang="ru"`, русский title/H1; `/en/cases/` — 200, `lang="en"`, английские title/description.
- `git diff --check` — OK.
- Browser automation: локальный Playwright package в `site` отсутствует, поэтому клиентскую замену текста и интерактивный фильтр в браузере в этой фазе не запускал.
- Docker: по-прежнему не проверен из-за недоступного daemon.

## 2026-10-07 Фаза 7 / remaining routes

- Сделано: перенесены все оставшиеся 23 legacy-маршрута: `contacts`, `industries` и 12 отраслей, `knowledge`, статья базы знаний, `manufacturers`, `platform`, `privacy`, `consent`, `roi`, `solutions/cleaning`, `solutions/warehouse`.
- Сделано: введён общий `LegacyPage` adapter и catch-all `[...legacy]`, поэтому новые legacy-маршруты не дублируют runtime-обвязку.
- Сделано: legacy body вынесен в `site/src/content/*-body.html`; inline scripts и JSON-LD из legacy shell не инжектируются.
- Сделано: скопированы только используемые legacy CSS/JS в `site/public/legacy/`; i18n/runtime запускается через React adapter.
- Проверка parity: все 23 извлечённых body совпали с legacy body после удаления `<script>`.
- Проверки: `npm run lint --prefix site` — 0 errors, 24 warnings (legacy lint/style warnings).
- Проверки: `npm run build --prefix site` — OK; все 23 новые маршрута SSG, всего 62 локализованных SSG path включая уже мигрированные.
- HTTP: все 23 `/en/.../` маршрута возвращают 200.
- `git diff --check` — OK.
- Известное ограничение: локальный `next start` предупреждает, что проект использует `output: standalone`; для standalone нужен `node .next/standalone/server.js`. Локализованный RU middleware сохраняет прежний redirect-контракт (`/ru/...` → unprefixed RU URL).
- Browser automation: Playwright в `site` отсутствует; Docker daemon по-прежнему недоступен.

## 2026-10-08 Фаза 8 / SSR, assets, links, 404, metadata, runtime

- Сделано: `[locale]/page.tsx` теперь полноценная SSR-страница из legacy body; home behavior вынесен в отдельный client island с GSAP/ScrollTrigger/Lenis.
- Сделано: GSAP/Lenis behavior импортируется из npm, а cleanup island снимает Lenis, ticker, ScrollTrigger и созданные клоны; clock interval также очищается.
- Сделано: добавлены server-rendered RU/EN body copies. EN больше не зависит от клиентского `i18n.js`; browser snapshot показывает 0 кириллических слов в видимом EN body.
- Сделано: все body assets переписаны на `/assets/...`; legacy `.html` ссылки в body устранены и заменены маршрутами Next, включая `/en/...`.
- Сделано: восстановлен общий metadata слой из legacy baseline: localized title/description, robots, RU canonical, OpenGraph и JSON-LD.
- Сделано: добавлены `not-found.tsx` и global fallback. `/nope/` и `/en/nope/` теперь HTTP 404, с `lang=ru/en` соответственно; legacy `404.html` больше не падает как 500.
- Сделано: `legacy-pages.json` теперь покрывает 29 маршрутов; общий catch-all генерирует 62 локализованных SSG paths.
- Сделано: добавлены `html-to-jsx.mjs`, `copy-assets.mjs`, `messages.mjs`, `links.mjs`, `models-golden.mjs`, `gate.mjs`; `snapshot.mjs` получил `--base-url`, `--map`, `--locale en`.
- Сделано: `copy-assets.mjs` — 60 используемых ассетов, 0 отсутствующих.
- Сделано: `links.mjs` — 58 RU/EN страниц, 113 уникальных внутренних targets, 0 битых ссылок/якорей.
- Сделано: `models-golden.mjs` — 180/180 сравнений legacy ROI/facade с TS моделями совпали точно.
- Сделано: `messages.mjs` — 3378/3378 ключей RU/EN, ICU variables/tags и отсутствие кириллицы в EN — OK.
- Сделано: полный Playwright snapshot RU и EN на 1440/390: все 29×2 страниц, overflow 0px, без console/network errors после подготовки standalone `public` и `.next/static`.
- Сделано: browser smoke: `/`, `/en/`, `/products/`, `/en/products/` — 200; `/nope/`, `/en/nope/` — 404; RU/EN `lang` корректен, overflow 0.
- Проверки: `npm run build --prefix site` — OK, 62 SSG paths; `npm run lint --prefix site` — 0 errors, 16 legacy/style warnings; `git diff --check` — OK.
- Docker: повторно проверен `docker info` — daemon зависает после `Server:`. `docker desktop restart` также завершился ошибкой: backend/virtualization процессы не остановились. Поэтому `docker builder prune -af` и production `docker compose up --build -d` не выполнены; это единственный незакрытый операционный пункт.

## 2026-10-08 Исправление дефектов 1–6

- Сделано (1, шрифты): в `[locale]/layout.tsx` те же три тега Google Fonts, что в `<head>` легаси (2× preconnect, stylesheet Onest + JetBrains Mono), без `next/font`. Один `eslint-disable no-page-custom-font` с причиной.
- Сделано (1, остаточная причина): шрифты не были главной причиной. У `<body>` легаси есть классы (`sol-page pr-page ab-page`, `ind-page ind--hotels`, `roi-page` и т. д.), от которых зависят селекторы `.ab-page .sol-hero .h1` и подобные; в Next их не было. Классы добавлены в `legacy-pages.json` (`bodyClass`) и вешаются на обёртку тела страницы (`LegacyPage`), потому что `<body>` принадлежит корневому layout. Это не входило в список из 6 пунктов, но без этого паритет по рамкам недостижим.
- Сделано (2, ICU): `tools/migrate/localize-en-bodies.mjs` приводит `*-body-en.html` к виду, который даёт EN-рантайм легаси: сырые ICU-сообщения в элементах с `data-i18n-args` форматируются тем же `tools/i18n/icu.mjs` (locale en), у тегов сообщения берутся атрибуты русского элемента (`<b class="tnum">`). Скрипт идемпотентен, `--check` входит в `gate.mjs`. Проверка отрендеренного HTML: `tools/migrate/messages.mjs` теперь сканирует `site/.next/server/app/en/**/*.html` и `en.html` (без `<script>`/`<style>`) на `{n`, `plural,` и кириллицу вне privacy/consent.
- Сделано (3, 404): `notFound()` из страницы при корневом layout в динамическом сегменте `[locale]` в Next 16.4.0 отдаёт HTML-оболочку `__next_error__` без `<html lang>`, `<title>` и текста (воспроизведено на `next dev` и `next build`, в том числе с `experimental.globalNotFound`); `[locale]/not-found.tsx` на сервере не рендерится. Поэтому неизвестные адреса обрабатывает `src/proxy.ts`: `rewrite` на статическую страницу `/{ru|en}/not-found-page/` со статусом 404 (список известных маршрутов берётся из `legacy-pages.json`). Страница: `<title>`/description из `notFound.meta`, `noindex`, тело из `404-body.html` / `404-body-en.html`. Неиспользуемый `global-not-found.tsx` удалён (без флага он не работает). Неверный сегмент `[locale]` (`/x.html`) теперь 404, а не 500. Дополнительно в layout добавлены `notFound()` для неверной локали и `setRequestLocale`.
- Сделано (4, 5, метаданные): `getLegacyMeta` остаётся единым источником. `legacyMetadata()` отдаёт title, description, robots, canonical (одинаково для RU и EN, как в легаси; canonical там относительный `/about/`, а не полный URL). `og:*` выводятся только для `roi` через `legacyOgTags()` + `<LegacyOg>` (React поднимает `<meta>` в head); через `metadata.openGraph` нельзя, Next достраивает из него `twitter:*`, которых в легаси нет. Из `routing.ts` убран hreflang в заголовке `Link` (`alternateLinks: false`, спека 3.5).
- Сделано (6, калькуляторы): причина в `LegacyRuntime`: заглушка `window.i18n.ready` была уже разрешена, и скрипты страниц (`roi.js`, `products.js`, `industry.js`) считали значения до загрузки `en.json`, откатываясь на русский текст. Теперь для EN `ready` разрешается через `done()` (макс. 3 с), как в `i18n/boot.js`. Для серверного HTML начальные значения мини-калькулятора отраслей (`6,000 m²`, `≈ 15 mo`, `≈ RUB 1.8M`) и подпись `RUB … M` в ROI подставляет тот же `localize-en-bodies.mjs`.
- Сделано (мелочи): `site/.gitignore` — добавлено `!.env.example` (правило `.env*` лежало в `site/.gitignore:34`). Удалён неиспользуемый `site/src/app/(localized)/[locale]/LegacyPage.tsx` (его создавал одноразовый `tools/migrate/migrate-remaining.mjs`, не запускать повторно). В EN-телах `aria-pressed` переключателя языка теперь у EN.
- Новые проверки: `tools/migrate/not-found.mjs` (статус, lang, title, noindex, текст для `/nope/`, `/en/nope/`, `/industries/nope/`, `/en/knowledge/zzz/` и ещё двух), `tools/playwright/meta-parity.mjs` (title/description/robots/canonical/og/шрифты/JSON-LD, 29 маршрутов × RU/EN, серверный HTML без JS против DOM легаси), `tools/playwright/calc-parity.mjs` (выходы калькуляторов легаси против Next в RU/EN: начально и при 25 %/75 % ползунков; отсутствие кириллицы и сырого ICU в DOM EN после JS). `snapshot.mjs --compare` получил `--summary` (счётчики по типам и топ-10; допуски не менялись). Все они подключены в `gate.mjs`, кроме `calc-parity.mjs` (запускается отдельно).
- Проверки: `tsc --noEmit` — 0 ошибок; `eslint` — 0 errors, 13 warnings (было 16; новых нет); `npm run build` — все маршруты ○/●, динамический только `/api/health`; `node --test roi-model.test.js facade-model.test.js tools/i18n/icu.test.mjs tools/i18n/check.mjs` — 42/42; `models-golden` — 180/180; `git diff --check` — OK; `gate.mjs` — все 20 шагов OK; `links.mjs` — 58 страниц, 0 битых; `messages.mjs` — 3378/3378 + отрендеренный EN без ICU и кириллицы (30 файлов); `not-found.mjs` — 6/6; `meta-parity.mjs` — 58/58 пар идентичны; `calc-parity.mjs` — все проверки пройдены.
- Снимки (`snapshot.mjs --compare`, допуск 0,5 px не менялся): RU 74 910 → 1 796 различий, EN 81 905 → 1 796. Остаток — только «box lost/added» (RU 566/1230, EN то же): позиционные ключи рамок сдвинуты тегами в `<head>` (title/meta/link), `<body class>` → `<div class>` и `next-route-announcer`; text/attr/«box changed» — 0. Худшие снимки: cases@1440/390 (84), solutions-cleaning (60), knowledge-cleaning-robot-basics (59), index (52), platform (44). Файлы `404@*` в `.migrate/next-*` отсутствуют (404 не маршрут сайта), поэтому «60 of 60 differ».
- Отклонения: (а) 404 реализован через `proxy.ts` + `/not-found-page/`, а не `not-found.tsx` + `[...rest]` (спека 3.3), причина выше; (б) EN получил canonical, спека 3.8 требует его не ставить.
- Вопросы владельцу: (1) К решению владельца: EN-canonical указывает на RU-URL (`/about/`), как в легаси; при спеке 10 п. 3 (EN `noindex`, без hreflang) это безвредно, но при индексации EN надо менять. (2) `site/src/app/favicon.ico` — файл заготовки create-next-app, в легаси favicon нет; Next добавляет `<link rel="icon">`. Оставить, заменить или убрать? (3) Старые `*.html` (`/x.html`) не редиректят 308 (спека 3.8) и matcher `proxy.ts` их пропускает; сейчас они дают 404 с пустой оболочкой, это отдельная задача. (4) Нужен ли `export const dynamic = "force-static"`: страница `not-found-page` собралась статической и без него благодаря `setRequestLocale`; остальным страницам `setRequestLocale` в page не добавлен (вне задачи).

## 2026-10-08 Сверка статуса и решения владельца

- Независимая проверка (отдельный агент + мои проверки): сборка, tsc, eslint (0 errors), тесты 42/42, ссылки, golden, словари, метаданные 58/58, 404, калькуляторы RU/EN, Docker-образ (build, `/api/health/` 200, `/nope/` 404) — зелёные. Пиксельный паритет **не закрыт**: `snapshot.mjs --compare` RU и EN по 1 796 расхождений (только `box lost/added`, код выхода 1; сводку перепроверил, причину по отчёту исполнителя).
- Нумерация «Фаза N» в записях выше (2026-10-07/08) — внутренняя нумерация шагов исполнителя и **не совпадает** с фазами спеки §8. Статус по спеке: фаза 0 — готова; фаза 1 — готова (Docker-шлюз проверен 2026-10-08); фазы 2–5 — сделаны схемой `LegacyPage` (промежуточный этап), шлюзы страниц по спеке не пройдены; фаза 6 (главная, пины, perf) — главная отдаётся, пины и perf не проверены; фазы 7–8 — не начаты (7 отложена решением владельца).
- Решения владельца: схема `LegacyPage` — промежуточный этап (вариант A), ADR 0003, спека §10 п.8; 404 через `proxy.ts` допустим пока (п.9); EN-canonical = паритет с легаси, пересмотреть при индексации EN; фаза 7 не выполняется и не готовится.
- Сделано: удалены `site/src/app/favicon.ico` (в легаси favicon нет; `rel="icon"` в сборке больше нет), одноразовый `tools/migrate/migrate-remaining.mjs` (пересоздавал удалённый `LegacyPage.tsx`) и пять неиспользуемых SVG-заготовок create-next-app из `site/public`. `npm run build` после удаления — OK, динамический только `/api/health`.
- Добавлены документы: `docs/adr/0003-legacypage-interim.md`, `docs/migration/DEVIATIONS.md` (11 отклонений с путями), `docs/migration/TODO.md` (P0 паритет, P1 гигиена, P2 этап B, решения владельца).
- Не проверено: пины главной и анимации, `check.mjs` на 1024/768, сценарии `tools/playwright/*.mjs` против Next, гидрация сверх снимков, perf; утверждение про `notFound()` в Next 16.4.0 независимо не воспроизводилось.
- `gate.mjs` зелёный, но не означает паритет: в нём нет сравнения снимков, `check.mjs` на 4 ширинах, сценариев Playwright, проверки без JS и `calc-parity.mjs` (TODO P0-1).
- Вопросы владельцу: согласие на способ сопоставления рамок при сравнении снимков (TODO P0-2); разбивка на коммиты (TODO).
