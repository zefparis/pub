import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import path from 'path';
import fs from 'fs';
import { ensureSchema, query } from './db.js';
import { log } from './logger.js';
import { getDashboardStats, updateViewsForPosts } from './metrics.js';
import { handleLanding, handleRedirect, handleEmail } from './smartlinks.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get('/api/stats', async (_req, res) => {
  const stats = await getDashboardStats();
  res.json(stats);
});

app.get('/api/videos', async (_req, res) => {
  const { rows } = await query('select id, platform, video_id, title, duration_seconds, url, status, created_at from videos order by created_at desc limit 50');
  res.json(rows);
});

// SmartLinks
app.get('/l/:slug', handleLanding);
app.post('/l/:slug/email', handleEmail);
app.post('/l/:slug/go', handleRedirect);

// Optionally serve frontend if built
const maybeDist = path.resolve(process.cwd(), '../frontend/dist');
if (fs.existsSync(maybeDist)) {
  app.use(express.static(maybeDist));
  app.get('*', (_req, res) => res.sendFile(path.join(maybeDist, 'index.html')));
}

async function start() {
  await ensureSchema();
  await log('info', 'Schema ensured');
  // Simple interval to simulate metrics updates
  setInterval(() => {
    updateViewsForPosts().catch(() => {});
  }, 60_000);

  app.listen(config.port, () => {
    console.log(`API listening on ${config.port}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
