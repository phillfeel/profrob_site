# ПРОФРОБОТ — Next.js

Next.js 16 App Router migration target for the static ПРОФРОБОТ site.

## Development

```bash
npm run dev
```

## Checks

```bash
npm run lint
npm run build
npm start
```

The migration is incremental. Legacy HTML remains the parity oracle until Phase 7.

## Docker and deploy

```bash
docker build -t profrobot-site . && docker run -p 3000:3000 profrobot-site
```

Health check: `GET /api/health/`. Push to `feat/nextjs-migration-2` runs CI and deploys to Dokploy, setup steps are in `docs/migration/DEPLOY.md` (repo root).
