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
