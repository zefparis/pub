export type Video = {
  id: string;
  platform: 'youtube' | 'tiktok';
  video_id: string;
  title?: string;
  duration_seconds?: number;
  url: string;
  niche?: string;
  status: 'scraped' | 'processed' | 'posted';
  processed_path?: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  video_id: string;
  platform_target: 'youtube' | 'tiktok';
  external_post_id?: string | null;
  views: number;
  likes: number;
  comments: number;
  posted_at?: string | null;
  updated_at?: string | null;
};

