import slugify from 'slugify';
import { query } from './db.js';
import { log } from './logger.js';
import { Request, Response } from 'express';
import { addToBrevoList } from './brevo.js';

export async function createSmartLink(videoId: string, targetUrl: string, sourcePlatform?: string) {
  const slug = `${slugify(targetUrl.split('/').slice(-1)[0] || 'offer', { lower: true })}-${Math.random().toString(36).slice(2,7)}`;
  const { rows } = await query<{ id: string }>('insert into smartlinks(video_id, slug, target_url, source_platform) values ($1,$2,$3,$4) returning id', [videoId, slug, targetUrl, sourcePlatform || null]);
  return { id: rows[0].id, slug };
}

export async function handleLanding(req: Request, res: Response) {
  const { slug } = req.params;
  const { rows } = await query('select id, target_url from smartlinks where slug = $1', [slug]);
  if (rows.length === 0) return res.status(404).send('Not found');
  const link = rows[0];
  res.type('html').send(`<!doctype html>
  <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Continue to offer</title>
  <style>body{font-family:system-ui,Segoe UI,Roboto,Arial;padding:20px;max-width:520px;margin:auto} .card{border:1px solid #eee;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.04)} input,button{padding:10px;border-radius:8px;border:1px solid #ddd;width:100%;margin-top:8px} button{background:#111;color:#fff;border:none}</style>
  </head>
  <body>
    <div class="card">
      <h2>Unlock the deal</h2>
      <p>Enter your email to get exclusive offers and updates. Then click continue.</p>
      <form method="POST" action="/l/${slug}/email">
        <input type="email" name="email" placeholder="you@example.com" required />
        <button type="submit">Get updates</button>
      </form>
      <form method="POST" action="/l/${slug}/go">
        <button type="submit" style="margin-top:12px;background:#2563eb">Continue to offer</button>
      </form>
    </div>
  </body></html>`);
}

export async function handleEmail(req: Request, res: Response) {
  const { slug } = req.params;
  const email = String(req.body?.email || '').trim();
  if (!email) return res.redirect(`/l/${slug}`);
  const { rows } = await query('select id from smartlinks where slug = $1', [slug]);
  if (rows.length === 0) return res.status(404).send('Not found');
  const smartlinkId = rows[0].id;
  await query('insert into emails(email, source_smartlink_id) values ($1,$2)', [email, smartlinkId]);
  await log('info', 'Captured email', { email, slug });
  // Fire-and-forget Brevo sync
  addToBrevoList(email).catch(() => {});
  res.redirect(`/l/${slug}`);
}

export async function handleRedirect(req: Request, res: Response) {
  const { slug } = req.params;
  const { rows } = await query('select id, target_url, clicks from smartlinks where slug = $1', [slug]);
  if (rows.length === 0) return res.status(404).send('Not found');
  const link = rows[0];
  const source = String(req.query.src || 'unknown');
  const device = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || '';
  const user_agent = req.headers['user-agent'] || '';
  const referrer = req.headers['referer'] || '';
  await query('insert into clicks(smartlink_id, source, device, ip, user_agent, referrer) values ($1,$2,$3,$4,$5,$6)', [link.id, source, device, ip, user_agent, referrer]);
  await query('update smartlinks set clicks = clicks + 1 where id = $1', [link.id]);
  res.redirect(302, link.target_url);
}
