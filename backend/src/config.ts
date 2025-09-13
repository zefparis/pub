import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8787', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  tikTokApiKey: process.env.TIKTOK_API_KEY || '',
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  amazonAssociateId: process.env.AMAZON_ASSOCIATE_ID || '',
  aliexpressAppKey: process.env.ALIEXPRESS_APP_KEY || '',
  kinginApiKey: process.env.KINGIN_API_KEY || '',
  brevoApiKey: process.env.BREVO_API_KEY || '',
  brightDataProxy: process.env.BRIGHTDATA_PROXY || '',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:8787',
  watermarkText: process.env.WATERMARK_TEXT || 'Faceless Ads Autopilot',
  watermarkPos: process.env.WATERMARK_POS || '10:10',
  niches: process.env.NICHES,
  videosPerNiche: process.env.VIDEOS_PER_NICHE,
  maxDurationSeconds: process.env.MAX_DURATION_SECONDS,
  pipelineEveryMinutes: process.env.PIPELINE_EVERY_MINUTES,
};

