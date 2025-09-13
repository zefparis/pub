import { query } from './db.js';
import { log } from './logger.js';

export async function getDashboardStats() {
  const [videos, posts, clicks, revenues, emails, sources] = await Promise.all([
    query<{ count: string }>('select count(*)::int as count from videos where status = $1', ['posted']),
    query<{ sum: string }>('select coalesce(sum(views),0)::int as sum from posts', []),
    query<{ count: string }>('select count(*)::int as count from clicks', []),
    query<{ sum: string }>("select coalesce(sum(amount_cents),0)::int as sum from revenues", []),
    query<{ count: string }>('select count(*)::int as count from emails', []),
    query<any>(`select platform_target, sum(views)::int as views, sum(likes)::int as likes, count(*) as posts from posts group by platform_target`, []),
  ]);
  return {
    videosPosted: Number(videos.rows[0]?.count || 0),
    views: Number(posts.rows[0]?.sum || 0),
    clicks: Number(clicks.rows[0]?.count || 0),
    revenueCents: Number(revenues.rows[0]?.sum || 0),
    emails: Number(emails.rows[0]?.count || 0),
    bySource: sources.rows || [],
  };
}

// Placeholder for real YouTube API fetch
export async function fetchYouTubeStats(postId: string, externalId: string) {
  // TODO: Call YouTube Data API for stats
  return { views: 0, likes: 0 };
}

// Placeholder for real TikTok API fetch
export async function fetchTikTokStats(postId: string, externalId: string) {
  // TODO: Call TikTok API for stats
  return { views: 0, likes: 0 };
}


export async function updateViewsForPosts() {
  // Stub: in production, poll YT/TikTok APIs to update views
  await log('info', 'Updating views for posts (stub)');
  // As a simple simulation, increment views randomly
  await query('update posts set views = views + floor(random()*50)::int, updated_at = now()');
}

