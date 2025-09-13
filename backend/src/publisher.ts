import { query } from './db.js';
import { log } from './logger.js';

import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { config } from './config.js';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function watermark(inputPath: string, overlayText: string): Promise<string> {
  await log('info', 'Watermarking video', { inputPath, overlayText });
  const outputPath = inputPath.replace(/(\.[\w]+)$/, `_wm$1`);
  const pos = config.watermarkPos || '10:10';
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters({
        filter: 'drawtext',
        options: {
          fontfile: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
          text: overlayText || config.watermarkText,
          fontsize: 24,
          fontcolor: 'white',
          box: 1,
          boxcolor: 'black@0.5',
          boxborderw: 5,
          x: pos.split(':')[0] || '10',
          y: pos.split(':')[1] || '10',
        }
      })
      .on('error', (err: any) => {
        log('error', 'FFmpeg watermark error', { err });
        resolve(inputPath); // fallback to input
      })
      .on('end', () => {
        log('info', 'FFmpeg watermark done', { outputPath });
        resolve(outputPath);
      })
      .save(outputPath);
  });
}

export async function uploadToYouTube(filePath: string, title: string) {
  await log('info', 'Uploading to YouTube (stub)', { filePath, title });
  // Return a fake external id
  return `yt_${Date.now()}`;
}

export async function uploadToTikTok(filePath: string, title: string) {
  await log('info', 'Uploading to TikTok (stub)', { filePath, title });
  return `tt_${Date.now()}`;
}

export async function markProcessed(videoId: string, processedPath: string) {
  await query('update videos set status = $2, processed_path = $3 where id = $1', [videoId, 'processed', processedPath]);
}

export async function recordPost(videoId: string, platform: 'youtube' | 'tiktok', externalId: string) {
  await query('insert into posts(video_id, platform_target, external_post_id, posted_at) values ($1,$2,$3, now())', [videoId, platform, externalId]);
}

