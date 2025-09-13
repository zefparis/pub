import { query } from './db.js';
import { log } from './logger.js';
import { config } from './config.js';
import { v4 as uuidv4 } from 'uuid';
import youtubedl from 'youtube-dl-exec';

type Scraped = {
  platform: 'youtube' | 'tiktok';
  video_id: string;
  title: string;
  duration_seconds: number;
  url: string;
  thumbnail?: string;
  niche: string;
};

const YT_SHORTS_URL = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}+shorts`;

const TIKTOK_URL = (q: string) =>
  `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`;

async function ytDlpSearch(
  url: string,
  platform: 'youtube' | 'tiktok',
  limit: number
): Promise<Scraped[]> {
  try {
    const proxy = config.brightDataProxy;

    // Hack TS : cast en any pour utiliser les flags non typés (extractFlat)
    const raw: any = await youtubedl(url, {
      dumpSingleJson: true,
      flatPlaylist: true,
      noWarnings: true,
      skipDownload: true,
      extractFlat: true, // TS croit que ça n'existe pas, mais yt-dlp oui
      playlistEnd: limit,
      ...(proxy ? { proxy } : {}),
    } as any);

    const entries = Array.isArray(raw.entries)
      ? raw.entries
      : Array.isArray(raw)
      ? raw
      : [];

    const videos = (entries as any[])
      .filter((e: any) => e.duration && e.duration < 60)
      .map(
        (e: any): Scraped => ({
          platform,
          video_id: e.id || uuidv4(),
          title: e.title || 'Untitled',
          duration_seconds: e.duration || 0,
          url: e.url || e.webpage_url,
          thumbnail: e.thumbnail || '',
          niche: '', // défini plus tard
        })
      );

    return videos;
  } catch (e) {
    await log('error', 'yt-dlp failed', { url, platform, error: String(e) });
    return [];
  }
}

export async function scrapeTrending(
  niche: string,
  limit = 5
): Promise<Scraped[]> {
  await log('info', `Scraping trending for niche`, { niche, limit });

  const yt = await ytDlpSearch(YT_SHORTS_URL(niche), 'youtube', limit);
  const tt = await ytDlpSearch(TIKTOK_URL(niche), 'tiktok', limit);

  const all = [...yt, ...tt].map((v) => ({ ...v, niche }));
  const seen = new Set<string>();
  const unique = all.filter((v) => {
    if (seen.has(v.url)) return false;
    seen.add(v.url);
    return true;
  });

  return unique.slice(0, limit * 2); // max limit par plateforme
}

export async function persistScraped(videos: Scraped[]) {
  for (const v of videos) {
    try {
      await query(
        `insert into videos(platform, video_id, title, duration_seconds, url, niche, status)
         values ($1,$2,$3,$4,$5,$6,'scraped')
         on conflict (platform, video_id) do nothing`,
        [v.platform, v.video_id, v.title, v.duration_seconds, v.url, v.niche]
      );
    } catch (e) {
      await log('warn', 'Failed to insert video', { v, error: String(e) });
    }
  }
  await log('info', `Persisted scraped`, { count: videos.length });
}
