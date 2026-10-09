# ADR 0004. Деплой на Dokploy через GitHub Actions и API

Дата: 2026-10-09. Статус: предложено (ждёт подтверждения владельца).

## Контекст

Нужен автоматический деплой Next.js-ветки `feat/nextjs-migration-2` на сервер с Dokploy. Спека (раздел «Где хостить», строка 1 таблицы решений) предполагает Docker-образ на площадке, которую выбирает владелец. Сайт запускается как Node-сервер (`output: "standalone"`, `proxy.ts`, `/api/health/`).

## Решение

GitHub Actions на push в ветку: тесты моделей, lint, `next build`, сборка Docker-образа, smoke-тест контейнера. Если всё зелёное, отдельный job вызывает `POST /api/application.deploy` Dokploy (заголовок `x-api-key`, документированный путь для CI/CD). Dokploy сам забирает код через GitHub App и собирает `site/Dockerfile`. Auto Deploy в Dokploy выключен, чтобы не было двойных деплоев.

## Альтернативы

- **Только Auto Deploy Dokploy по GitHub App.** Проще (без workflow), но деплой идёт независимо от тестов: сломанная сборка уходит на сервер. Подходит, если CI не нужен.
- **Сборка образа в Actions, push в GHCR, Dokploy тянет образ.** Сборка идёт на GitHub, а не на сервере Dokploy (меньше нагрузка на сервер), но нужны registry-доступ и вебхук/тег, сложнее и больше секретов.

## Последствия

- Деплой блокируется красным CI (`needs: ci`). Образ собирается дважды: в CI и на сервере Dokploy.
- Три секрета в GitHub: `DOKPLOY_URL`, `DOKPLOY_API_KEY`, `DOKPLOY_APPLICATION_ID`.
- Workflow привязан к имени ветки: при слиянии Next.js в `main` (фаза 7) поправить `on.push.branches` и ветку в Dokploy.
- Node 22 вместо 20: Node 20 вышел из поддержки 2026-04-30 (Node 22 — до 2027-04-30; endoflife.date, 2026-10-09). Next 16.4.0 требует `>=20.9.0`, проверено в `node_modules/next/package.json`.
