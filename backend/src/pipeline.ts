import { scrapeTrending, persistScraped } from './scraper.js';
import { log } from './logger.js';
import { query } from './db.js';
import { createSmartLink } from './smartlinks.js';
import { watermark, uploadToTikTok, uploadToYouTube, markProcessed, recordPost } from './publisher.js';
import { config } from './config.js';

const DEFAULT_NICHES = (config.niches?.split(',') || ['ads', 'gadgets', 'finance', 'motivation']).map((x: string) => x.trim());
const PIPELINE_EVERY_MINUTES = parseInt(config.pipelineEveryMinutes || '10', 10);
const VIDEOS_PER_NICHE = parseInt(config.videosPerNiche || '5', 10);
const MAX_DURATION_SECONDS = parseInt(config.maxDurationSeconds || '60', 10);

export async function runPipeline({ niches = DEFAULT_NICHES, limit = VIDEOS_PER_NICHE, targetPlatforms = ['youtube','tiktok'] as ('youtube'|'tiktok')[] } = {}) {
  await log('info', 'Pipeline started', { niches, limit });
  for (const niche of niches) {
    const items = await scrapeTrending(niche, limit);
    await persistScraped(items);
  }

  const { rows: videos } = await query<{ id: string; title: string; url: string; status: string }>(
    "select id, title, url, status from videos where status = 'scraped' limit $1",
    [limit]
  );

  for (const v of videos) {
    // Simulate watermarking with a placeholder path
    const processedPath = await watermark(v.url, config.watermarkText);
    await markProcessed(v.id, processedPath);

    for (const platform of targetPlatforms) {
      const extId = platform === 'youtube' ? await uploadToYouTube(processedPath, v.title || 'Faceless Clip') : await uploadToTikTok(processedPath, v.title || 'Faceless Clip');
      await recordPost(v.id, platform, extId);
    }

    // Smartlink to a placeholder affiliate URL; in production, map niche -> offer
    const targetUrl = `https://www.amazon.com/?tag=${config.amazonAssociateId || 'affiliate-20'}`;
    await createSmartLink(v.id, targetUrl, 'video');

    await query("update videos set status = 'posted' where id = $1", [v.id]);
  }

  await log('info', 'Pipeline completed', { processed: videos.length });
}

