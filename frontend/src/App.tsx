import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type SourceStats = { platform_target: string; views: number; likes: number; posts: number }
type Stats = { videosPosted: number; views: number; clicks: number; revenueCents: number; emails: number; bySource: SourceStats[] }

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm bg-white dark:bg-gray-900">
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  )
}

function VideosList() {
  const [videos, setVideos] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/videos').then(r=>r.json()).then(setVideos).catch(()=>{})
  }, [])
  return (
    <div className="mt-6">
      <div className="text-sm font-medium mb-2">Recent Videos</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Platform</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {videos.map(v => (
              <tr key={v.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">{v.title || v.video_id}</td>
                <td className="py-2 pr-4">{v.platform}</td>
                <td className="py-2 pr-4"><span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">{v.status}</span></td>
                <td className="py-2 pr-4">{new Date(v.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DashboardCharts({ stats }: { stats: Stats }) {
  const data = stats.bySource.map(source => ({
    name: source.platform_target,
    views: source.views,
    likes: source.likes,
    posts: source.posts,
  }))

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">Platform Performance</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="views" fill="#8884d8" />
          <Bar dataKey="likes" fill="#82ca9d" />
          <Bar dataKey="posts" fill="#ffc107" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function DashboardFilters() {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">Filters</h2>
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 xl:w-1/3 p-2">
          <select className="block w-full p-2 pl-10 text-sm text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent">
            <option value="">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
        <div className="w-full md:w-1/2 xl:w-1/3 p-2">
          <select className="block w-full p-2 pl-10 text-sm text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent">
            <option value="">All Niches</option>
            <option value="gaming">Gaming</option>
            <option value="beauty">Beauty</option>
            <option value="fitness">Fitness</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [stats, setStats] = useState<Stats | null>(null)
  useEffect(() => {
    const load = () => fetch('/api/stats').then(r=>r.json()).then(setStats).catch(()=>{})
    load();
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Faceless Ads Autopilot</h1>
        <a href="https://github.com" className="text-sm underline text-gray-500">Docs</a>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card title="# Videos Posted" value={stats?.videosPosted ?? '—'} />
        <Card title="Views" value={stats?.views ?? '—'} />
        <Card title="Clicks" value={stats?.clicks ?? '—'} />
        <Card title="Revenue" value={stats ? `$${(stats.revenueCents/100).toFixed(2)}` : '—'} />
        <Card title="Emails" value={stats?.emails ?? '—'} />
      </div>

      <DashboardFilters />
      <DashboardCharts stats={stats!} />
      <VideosList />
    </div>
  )
}
