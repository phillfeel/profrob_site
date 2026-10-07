# Отклонения от спеки (этап A, схема LegacyPage)

Обновлено 2026-10-08. Основание: ADR 0003 и спека §10 пп. 8–9. «Снимает» = шаг этапа B (см. `TODO.md`), после которого отклонение исчезает.

| # | Отклонение | Где | Спека | Снимает |
|---|---|---|---|---|
| 1 | Тело страницы вставляется строкой через `dangerouslySetInnerHTML` на всех 29 маршрутах, а не серверными компонентами | `site/src/components/LegacyPage.tsx`, `site/src/content/*-body.html` (30 файлов) и `*-body-en.html` | 3.3 | B: конвертер `html-to-jsx`, страница за страницей |
| 2 | Поведение страниц — legacy-скрипты, подгружаемые через `<script>` в `useEffect`, без полной очистки | `site/src/components/LegacyRuntime.tsx`, `site/public/legacy/*.js` (20 файлов, 2 121 строка) | 3.4 п.1–3 | B: острова с cleanup на каждую страницу |
| 3 | Главная: 750 строк `main-legacy.ts` с `@ts-nocheck` и `eslint-disable`; слушатели `click` и `load` не снимаются при cleanup | `site/src/behaviors/main-legacy.ts`, `site/src/components/HomeBehavior.tsx` | 3.4 п.1, «Типы» в CLAUDE.md | B: перенос главной «островами» (последней) |
| 4 | EN: динамические строки и формат чисел зависят от клиентского рантайма; серверные EN-тела получены скриптом, а не из словаря напрямую | `site/src/content/*-body-en.html`, `tools/migrate/localize-en-bodies.mjs`, `site/public/legacy/i18n-runtime.js` | 3.5 | B: рендер страниц из `messages` на сервере, удаление `*-body-en.html` |
| 5 | CSS подключается ручными `<link rel="stylesheet">` (13 предупреждений eslint `no-css-tags`) | страницы в `site/src/app/(localized)/[locale]/`, `legacy-pages.json` | 3.6 | B / фаза 9: импорты CSS, `css-collisions.mjs` |
| 6 | `export const dynamic = "force-static"` | `[locale]/page.tsx`, `[...legacy]/page.tsx` | 3.3 | A: убрать, если `next build` остаётся с ○/● (TODO P1) |
| 7 | 404 через `proxy.ts` и `/{ru|en}/not-found-page/`, нет `not-found.tsx` + `[...rest]` | `site/src/proxy.ts`, `site/src/app/(localized)/[locale]/not-found-page/` | 3.3, §10 п.9 | перепроверка на новой версии Next/next-intl |
| 8 | EN-canonical = RU-URL (паритет с легаси, относительный `/about/`); спека 3.8 требовала не ставить canonical на EN | `getLegacyMeta` / `legacyMetadata()` в `site/src/lib/legacy.ts` | 3.8, §10 п.3 | решение владельца при открытии индексации EN |
| 9 | Старые `*.html` не редиректят 308 на новые адреса; `/x.html` отдаёт 404 | `site/src/proxy.ts` (matcher пропускает адреса с точкой) | 3.8 | TODO P1 |
| 10 | `<body>` принадлежит корневому layout, поэтому классы `<body>` легаси вешаются на обёртку `<div>`; тег `next-route-announcer` и новые `<head>`-теги сдвигают ключи рамок в снимках (остаток 1 796 расхождений на язык) | `site/src/components/LegacyPage.tsx`, `legacy-pages.json` (`bodyClass`), `snapshot.mjs --compare` | 4 п.3, 5 | A: решение по сравнителю или обёртке (TODO P0) |
| 11 | `gate.mjs` не выполняет сравнение снимков с эталоном, `check.mjs` на 4 ширинах, сценарии `tools/playwright/*.mjs`, проверку без JS и `calc-parity.mjs`: зелёный gate не означает паритет | `tools/migrate/gate.mjs` | 7.10 | A: доработка gate (TODO P0) |
