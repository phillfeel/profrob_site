# CLAUDE.md — ПРОФРОБОТ (статический лендинг)

## Визуальная проверка через Playwright

Для проверки вёрстки (скриншоты блока, горизонтальный скролл, ошибки консоли, разные ширины) использовать готовый код в [tools/playwright/](tools/playwright/). Не писать одноразовые Playwright-скрипты и не ставить Playwright заново во временные папки.

```bash
cd tools/playwright && npm install   # один раз после клона; Chromium берётся из глобального кэша, при его отсутствии: npx playwright install chromium
node tools/playwright/check.mjs --page index.html --selector "#tasks" --widths 1440,390
node tools/playwright/check.mjs --page index.html --pin tasks   # секция с GSAP-пином: кадры start / mid / end
```

- Скрипт сам поднимает статический сервер из корня проекта и пишет скриншоты в `tools/playwright/out/` (в git не попадает). Смотреть их через Read.
- Нужен сценарий, которого скрипт не умеет (клики, hover, форма): расширить `check.mjs` или добавить рядом новый `*.mjs` с общими кусками, а не делать отдельный скрипт в scratchpad.
- Живой Chrome (`@browser`) только для сложной анимации и интерактива, см. общие правила в памяти.
