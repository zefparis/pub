# Faceless Ads Autopilot

Production-ready pipeline for scraping, watermarking, publishing, and monetizing short-form videos (YouTube Shorts, TikTok, etc).

## Features
- Scrapes trending videos from YouTube Shorts and TikTok using yt-dlp + Bright Data proxy
- Filters: <60s duration, unique by source_url
- Stores metadata (title, duration, thumbnail, url) in Neon/Postgres
- FFmpeg watermarking (text/logo, configurable via .env)
- Stubs for TikTok/YouTube API upload, ready for OAuth/key-based integration
- SmartLinks with landing pages, CTA, and email capture
- Click/email logging (IP, UA, referrer), syncs emails to Brevo
- Metrics dashboard (videos, clicks, emails, revenues, per-platform charts)
- Pipeline orchestrator runs every X minutes (configurable)
- Railway-ready Dockerfiles

## Quickstart

1. **Clone & install**
   ```sh
   git clone ...
   cd pub\ pro
   cd backend && npm install
   cd ../frontend && npm install
   cd ../workers && npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env` in backend, frontend, and workers as needed.
   - Fill in required keys (Neon, Brevo, Bright Data, Amazon/AliExpress/Kingin, etc).
   - Example vars:
     ```env
     NICHES=crypto,gadgets,motivation
     VIDEOS_PER_NICHE=5
     MAX_DURATION_SECONDS=60
     WATERMARK_TEXT=IA-Solution
     WATERMARK_POS=10:10
     PUBLIC_BASE_URL=http://localhost:8787
     DATABASE_URL=postgres://...
     BRIGHTDATA_PROXY=http://user:pass@host:port
     BREVO_API_KEY=...
     AMAZON_ASSOCIATE_ID=...
     ```

3. **Run locally**
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`
   - Workers: `cd workers && npm run dev`

4. **Deploy on Railway**
   - Both backend and frontend have Dockerfiles ready for Railway.
   - Set all .env vars in Railway dashboard.
   - DB migrations auto-run on boot.

## Notes
- All external API calls are stubbed by default; fill in API keys and endpoints for production.
- Console + DB logging is enabled for observability.
- See `backend/src/pipeline.ts` for pipeline orchestration logic.

## Tech stack
- Backend: Express + TypeScript + Neon/Postgres
- Frontend: React 18 + Vite + Tailwind + shadcn/ui + recharts
- Workers: TypeScript
- DB: schema.sql (auto-migrates)

## Extending
- Add more platforms by extending `scraper.ts` and `publisher.ts`.
- Integrate real upload APIs by implementing the stubs in `publisher.ts`.
- Add affiliate offers per niche in `pipeline.ts`.

## License
MIT

# Faceless Ads Autopilot

Production-ready pipeline for scraping, watermarking, publishing, et monétisation de vidéos shorts (YouTube Shorts, TikTok, etc).

## Monorepo layout

- **backend** — Node.js (Express + TypeScript), API, SmartLinks, metrics, yt-dlp, ffmpeg
- **frontend** — React 18 + Vite + Tailwind + shadcn/ui + recharts (dashboard)
- **workers** — Orchestrateur pipeline, seed, tâches planifiées
- **db** — SQL schema pour Neon/Postgres

## Configuration (.env)

Copie `.env.example` vers `.env` **et** remplis toutes les clés nécessaires. Exemples de variables importantes :

- `DATABASE_URL` (Neon/Postgres)
- `PORT`, `API_URL`, `APP_URL`, `PUBLIC_BASE_URL`
- `NICHES`, `VIDEOS_PER_NICHE`, `MAX_DURATION_SECONDS`, `PIPELINE_EVERY_MINUTES`
- `WATERMARK_TEXT`, `WATERMARK_POS`
- `YOUTUBE_API_KEY`, `TIKTOK_API_KEY`, `BREVO_API_KEY`, `BRIGHTDATA_PROXY`, etc.
- Clés d'affiliation : `AMAZON_ASSOCIATE_ID`, `ALIEXPRESS_APP_KEY`, `KINGIN_API_KEY`, etc.

**Voir `.env.example` pour la liste complète** (toutes les intégrations et providers sont listés).

## Installation & utilisation locale

1. **Installer les dépendances (pnpm recommandé)**
   ```sh
   npm i -g pnpm
   pnpm i
   ```
2. **Lancer le backend et le frontend**
   ```sh
   pnpm dev
   # API sur http://localhost:8787, Dashboard sur http://localhost:3000
   ```
3. **Seeder des vidéos**
   ```sh
   pnpm seed
   # Lance Scrape → Process (watermark ffmpeg) → Publish (stub) → SmartLinks → Metrics
   ```

## Pipeline & modules
- **Scraper** : yt-dlp + Bright Data proxy pour YouTube Shorts/TikTok, <60s, unique, thumbnail, etc.
- **Processor** : Watermarking vidéo via ffmpeg (texte/logo configurable)
- **Publisher** : Stubs pour upload TikTok/YouTube (structure OAuth prête)
- **SmartLinks** : Landing page CTA, capture email, tracking clics (IP, UA, referrer), sync Brevo
- **Metrics** : Stats réelles (YouTube/TikTok API, DB), dashboard frontend avec charts
- **Orchestration** : Pipeline automatisé (toutes les X minutes, configurable)
- **DB** : Migrations auto au boot, schema à jour (voir `db/schema.sql`)

## Déploiement Railway
- Backend : root `backend`, Start `node dist/index.js`, Build `pnpm i && pnpm build`
- Frontend : root `frontend`, Start `serve -s dist -l 3000`, Build `pnpm i && pnpm build`
- Ajoute toutes les variables .env sur Railway (notamment `DATABASE_URL`)
- Les migrations DB sont auto-lancées
- Optionnel : pointe un domaine sur le frontend, backend privé ou sous-domaine

## Notes
- Les stubs pour upload/publish sont prêts à être remplacés par les vraies API (OAuth, clés, etc).
- Tous les logs sont en console **et** en base pour audit/observabilité.
- Pour ajouter une nouvelle niche, plateforme, ou provider, édite simplement `.env` et relance le pipeline.
- Pour debug, vérifie les logs DB (`logs` table) et la console.

## Stack technique
- Node.js, Express, TypeScript, Neon/Postgres
- React 18, Vite, Tailwind, shadcn/ui, recharts
- yt-dlp, ffmpeg, Brevo API, Bright Data

## Extensibilité
- Ajoute d'autres plateformes (Instagram, Facebook, etc) en étendant `scraper.ts`/`publisher.ts`
- Intègre des APIs d'upload réelles (TikTok/YouTube) en remplissant les stubs
- Ajoute des offres d'affiliation/niches dans `pipeline.ts`

---
-----

- Scraper/Publisher are stubs for safety; swap implementations with real APIs/yt-dlp/ffmpeg when keys and binaries are available.
- SmartLinks live under the backend at `/l/:slug`, include email capture and redirect with click logging.
- Logs go to console and the `logs` table.
- The backend serves the built frontend automatically if `frontend/dist` exists (useful for single-service deploys).

