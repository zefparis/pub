import { Pool } from 'pg';
import { config } from './config.js';

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }>{
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return { rows: res.rows as T[] };
  } finally {
    client.release();
  }
}

export async function ensureSchema() {
  await query(`
  create extension if not exists "uuid-ossp";
  create table if not exists logs (
    id uuid primary key default uuid_generate_v4(),
    level text not null,
    message text not null,
    context jsonb,
    created_at timestamptz not null default now()
  );

  create table if not exists videos (
    id uuid primary key default uuid_generate_v4(),
    platform text not null,
    video_id text not null,
    title text,
    duration_seconds int,
    url text not null,
    niche text,
    status text not null default 'scraped',
    processed_path text,
    created_at timestamptz not null default now()
  );

  create unique index if not exists videos_unique_platform_video on videos(platform, video_id);

  create table if not exists posts (
    id uuid primary key default uuid_generate_v4(),
    video_id uuid not null references videos(id) on delete cascade,
    platform_target text not null,
    external_post_id text,
    views int not null default 0,
    likes int not null default 0,
    comments int not null default 0,
    posted_at timestamptz,
    updated_at timestamptz default now()
  );

  create table if not exists smartlinks (
    id uuid primary key default uuid_generate_v4(),
    video_id uuid references videos(id) on delete set null,
    slug text unique not null,
    target_url text not null,
    source_platform text,
    clicks int not null default 0,
    created_at timestamptz not null default now()
  );

  create table if not exists clicks (
    id uuid primary key default uuid_generate_v4(),
    smartlink_id uuid not null references smartlinks(id) on delete cascade,
    ts timestamptz not null default now(),
    source text,
    device text,
    ip text,
    user_agent text,
    referrer text
  );

  create table if not exists emails (
    id uuid primary key default uuid_generate_v4(),
    email text not null,
    source_smartlink_id uuid references smartlinks(id) on delete set null,
    created_at timestamptz not null default now()
  );

  create table if not exists revenues (
    id uuid primary key default uuid_generate_v4(),
    source text not null,
    amount_cents int not null,
    currency text not null default 'USD',
    ts timestamptz not null default now(),
    metadata jsonb
  );
  `);
}

