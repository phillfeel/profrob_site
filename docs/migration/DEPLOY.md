# Деплой Next.js-сайта на Dokploy

Схема: `git push` в ветку `feat/nextjs-migration-2` → GitHub Actions (тесты, lint, build, сборка и smoke-тест Docker-образа) → если всё зелёное, шаг `deploy` вызывает API Dokploy → Dokploy забирает код из GitHub, собирает `site/Dockerfile` и перезапускает контейнер.

Файлы: `.github/workflows/deploy.yml`, `site/Dockerfile`. Решение и альтернативы: `docs/adr/0004-dokploy-deploy-via-github-actions.md`.

## 1. Dokploy

1. **Подключить GitHub.** Settings → Git → GitHub → создать GitHub App и установить его на репозиторий `phillfeel/profrob_site` (достаточно доступа к одному репозиторию).
2. **Создать приложение.** Project → Create Service → Application.
3. **Источник.** Provider: GitHub; Repository: `profrob_site`; Branch: `feat/nextjs-migration-2`; Build Path: `/site`.
4. **Сборка.** Build Type: Dockerfile; Dockerfile Path: `Dockerfile`; Docker Context Path: `.` (оба пути считаются от Build Path, в UI проверьте, что они не указывают на корень репозитория).
5. **Домен.** Вкладка Domains → Host, Port `3000`, HTTPS включить, Certificate: Let's Encrypt. DNS A-запись домена должна указывать на IP сервера Dokploy.
6. **Auto Deploy выключить** (вкладка General / Git). Иначе каждый push запустит деплой дважды: от GitHub App и от Actions. Деплой идёт только после зелёного CI.
7. **Переменные окружения** сейчас не нужны (`site/.env.example`). `PORT=3000` и `HOSTNAME=0.0.0.0` уже заданы в Dockerfile.
8. Первый раз нажмите **Deploy** вручную и убедитесь, что `https://<домен>/api/health/` отдаёт `{"status":"ok"}`.
9. **API-ключ.** Профиль (Settings → Profile) → API/CLI → Generate token. Скопируйте его.
10. **ID приложения.** Он есть в URL страницы приложения (`.../application/<applicationId>`). Если нет, найдите через `GET <DOKPLOY_URL>/api/project.all` с заголовком `x-api-key`.

## 2. GitHub

1. **Секреты:** репозиторий → Settings → Secrets and variables → Actions → New repository secret. Три штуки:

   | Имя | Значение |
   |---|---|
   | `DOKPLOY_URL` | адрес панели Dokploy, например `https://dokploy.example.com` (без `/api`) |
   | `DOKPLOY_API_KEY` | токен из п. 9 |
   | `DOKPLOY_APPLICATION_ID` | ID из п. 10 |

2. **Влить workflow в ветку.** Файл `.github/workflows/deploy.yml` должен лежать в `feat/nextjs-migration-2`. Запушьте ветку: Actions → CI/CD → смотрите прогон.
3. **Актуально только для ветки Next.js:** `main` остаётся статикой, триггера на `main` нет. На PR в `main` workflow гоняет только `ci` (без деплоя).
4. **Рекомендуется:** Settings → Branches → правило для ветки с обязательной проверкой `ci`, чтобы красный CI нельзя было смерджить. Само по себе это не блокирует деплой, деплой блокирует `needs: ci`.

## 3. Как проверить

- Push в ветку → Actions: `ci` зелёный → `deploy` зелёный (ответ API 200) → в Dokploy во вкладке Deployments появилась новая сборка.
- Откат: Dokploy → Deployments → предыдущая сборка → Rollback (если включён) либо `git revert` и push.

## 4. Что это за «серверный рендеринг»

Сейчас сайт запускается как Node-сервер (`next start` в standalone-режиме) с `proxy.ts`, API `/api/health/`, редиректами и языковой маршрутизацией. Страницы `/ru/*` и `/en/*` пререндерятся на этапе сборки (SSG, `generateStaticParams`) и отдаются Node-сервером как готовый HTML. Рендеринга на каждый запрос нет: контент статичен, так что это быстрее и дешевле. Per-request SSR появится, если страницы начнут читать куки, заголовки или БД.

## 5. Известные ограничения

- Docker-образ в этой сессии локально не собирался (Docker-демон был выключен). Проверено: lint, `next build`, standalone-сервер в раскладке образа (`standalone` + `.next/static` + `public`), 27 тестов. Сборку образа и healthcheck впервые проверит CI. Если первый прогон красный, смотрите шаг «Build Docker image» или «Container logs on failure».
- Имя поля Build Path и точная раскладка вкладок Dokploy могут отличаться в вашей версии. Официальная документация эти поля подробно не описывает.
- Секреты `DOKPLOY_*` пока не созданы, до их добавления шаг `deploy` будет падать на `curl`.
