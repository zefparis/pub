import { query } from './db';
import { log } from './logger';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { config } from './config';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Ajoute un watermark texte à une vidéo avec FFmpeg.
 * @param inputPath chemin de la vidéo source
 * @param overlayText texte à afficher en watermark
 * @returns chemin du fichier watermarked
 */
export async function watermark(inputPath: string, overlayText: string): Promise<string> {
  await log('info', 'Watermarking video', { inputPath, overlayText });

  const outputPath = inputPath.replace(/(\.[\w]+)$/, `_wm$1`);
  const pos = config.watermarkPos || '10:10';
  const [x, y] = pos.split(':');

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(
        `drawtext=text='${overlayText || config.watermarkText}':x=${x || 10}:y=${y || 10}:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=5:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`
      )
      .output(outputPath)
      .on('end', async () => {
        await log('info', 'FFmpeg watermark done', { outputPath });
        resolve(outputPath);
      })
      .on('error', async (err: any) => {
        await log('error', 'FFmpeg watermark error', { err });
        reject(err); // rejet plutôt que fallback silencieux
      })
      .run();
  });
}

// ---- Stub uploads ---- //

export async function uploadToYouTube(filePath: string, title: string) {
  await log('info', 'Uploading to YouTube (stub)', { filePath, title });
  return `yt_${Date.now()}`; // fake external id
}

export async function uploadToTikTok(filePath: string, title: string) {
  await log('info', 'Uploading to TikTok (stub)', { filePath, title });
  return `tt_${Date.now()}`; // fake external id
}

// ---- DB updates ---- //

export async function markProcessed(videoId: string, processedPath: string) {
  await query(
    'update videos set status = $2, processed_path = $3 where id = $1',
    [videoId, 'processed', processedPath]
  );
}

export async function recordPost(
  videoId: string,
  platform: 'youtube' | 'tiktok',
  externalId: string
) {
  await query(
    'insert into posts(video_id, platform_target, external_post_id, posted_at) values ($1,$2,$3, now())',
    [videoId, platform, externalId]
  );
}
