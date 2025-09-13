import { query } from './db.js';
import { log } from './logger.js';
import { config } from './config.js';
import ytdlp from 'yt-dlp-exec';
import { v4 as uuidv4 } from 'uuid';

type Scraped = { platform: 'youtube' | 'tiktok'; video_id: string; title: string; duration_seconds: number; url: string; thumbnail?: string; niche: string };


const YT_SHORTS_URL = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}+shorts`;
const TIKTOK_URL = (q: string) => `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`;

async function ytDlpSearch(url: string, platform: 'youtube' | 'tiktok', limit: number): Promise<Scraped[]> {
  try {
    const proxy = config.brightDataProxy;
    const res: any[] = await ytdlp(url, {
      dumpSingleJson: true,
      flatPlaylist: true,
      proxy: proxy || undefined,
      noWarnings: true,
      skipDownload: true,
      extractFlat: true,
      playlistEnd: limit,
    });
    // yt-dlp returns {entries: [...]}
    const entries = Array.isArray(res.entries) ? res.entries : (Array.isArray(res) ? res : []);
    const videos = (entries as any[])
      .filter((e: any) => e.duration && e.duration < 60)
      .map((e: any) => ({
        platform,
        video_id: e.id,
        title: e.title,
        duration_seconds: e.duration,
        url: e.url || e.webpage_url,
        thumbnail: e.thumbnail || '',
        niche: '', // will be set by caller
      }));
    return videos;
  } catch (e) {
    await log('error', 'yt-dlp failed', { url, platform, error: String(e) });
    return [];
  }
}

export async function scrapeTrending(niche: string, limit = 5): Promise<Scraped[]> {
  await log('info', `Scraping trending for niche`, { niche, limit });
  // YouTube Shorts
  const yt = await ytDlpSearch(YT_SHORTS_URL(niche), 'youtube', limit);
  // TikTok
  const tt = await ytDlpSearch(TIKTOK_URL(niche), 'tiktok', limit);
  // Set niche and filter unique by url
  const all = [...yt, ...tt].map(v => ({ ...v, niche }));
  const seen = new Set();
  const unique = all.filter(v => {
    if (seen.has(v.url)) return false;
    seen.add(v.url);
    return true;
  });
  return unique.slice(0, limit * 2); // up to limit per platform
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

