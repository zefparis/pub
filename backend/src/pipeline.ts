import { log } from './logger.js';
import { scrapeTrending, persistScraped } from './scraper.js';
import { watermark, uploadToYouTube, uploadToTikTok, markProcessed, recordPost } from './publisher.js';
import { query } from './db.js';

/**
 * Orchestration principale :
 * - scrape vidéos
 * - watermark
 * - upload stub
 * - update DB
 */
export async function runPipeline(niche = 'gadgets', limit = 3) {
  await log('info', 'Pipeline started', { niche, limit });

  // 1. Scraper trending
  const scraped = await scrapeTrending(niche, limit);
  await persistScraped(scraped);

  for (const video of scraped) {
    try {
      await log('info', 'Processing video', { id: video.video_id, title: video.title });

      // 2. Fichier local simulé (stub) → en vrai, faudrait download
      const fakeInputPath = `/tmp/${video.video_id}.mp4`;

      // 3. Watermark
      const processedPath = await watermark(fakeInputPath, `IAS - ${niche}`);

      // 4. Upload stub (YouTube + TikTok)
      const ytId = await uploadToYouTube(processedPath, video.title);
      await recordPost(video.video_id, 'youtube', ytId);

      const ttId = await uploadToTikTok(processedPath, video.title);
      await recordPost(video.video_id, 'tiktok', ttId);

      // 5. Mark processed
      await markProcessed(video.video_id, processedPath);

      await log('info', 'Video processed & posted', { video_id: video.video_id });
    } catch (err) {
      await log('error', 'Pipeline error for video', { id: video.video_id, err });
    }
  }

  await log('info', 'Pipeline finished', { niche });
}

/**
 * Job simple qui peut être appelé par workers/seed.ts
 */
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runPipeline(process.env.NICHE || 'tech', Number(process.env.LIMIT || 3))
    .then(() => {
      console.log('✅ Pipeline complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Pipeline failed', err);
      process.exit(1);
    });
}
