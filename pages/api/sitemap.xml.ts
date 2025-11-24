import type { NextApiRequest, NextApiResponse } from 'next'
import { SITE_URL, SUPPORTED_LOCALES } from '../../lib/constants'

/**
 * 动态生成多语言 sitemap
 * 1. 包含静态页面（首页、文档页等）
 * 2. 自动获取热门歌单（Top 100）加入 sitemap
 * 3. 定期更新，使用缓存降低API调用频率
 * 4. lastmod 使用构建时间戳，静态页面保持一致性
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 使用固定的站点URL，不再依赖请求头
  const base = SITE_URL
  
  // 支持多语言的静态页面路径（不含语言前缀）
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/docs/guide', priority: '0.8', changefreq: 'weekly' },
    { path: '/docs/quality', priority: '0.7', changefreq: 'weekly' },
    { path: '/licenses', priority: '0.5', changefreq: 'monthly' }
  ]
  
  const locales = SUPPORTED_LOCALES
  
  // 生成静态页面的 URL 条目
  const staticUrlEntries = staticPages.map(page => {
    const alternateLinks = locales.map(locale => 
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${base}/${locale}${page.path}" />`
    ).join('\n')
    
    // 使用 BUILD_TIME 环境变量或固定日期，确保静态页面 lastmod 一致性
    const lastmod = process.env.BUILD_TIME || new Date().toISOString().split('T')[0]
    
    const urlsForPage = locales.map(locale => `
  <url>
    <loc>${base}/${locale}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${alternateLinks}
  </url>`).join('')
    
    return urlsForPage
  }).join('')
  
  // 动态获取热门歌单（最多100个）
  let playlistEntries = ''
  try {
    const { top_playlist } = require('NeteaseCloudMusicApi')
    
    // 分批获取热门歌单：每批50个，共2批（100个）
    const playlistIds: number[] = []
    for (let offset = 0; offset < 100; offset += 50) {
      try {
        const result = await top_playlist({
          cat: '全部',
          limit: 50,
          offset,
          order: 'hot'
        })
        const playlists = result?.body?.playlists || []
        playlists.forEach((playlist: any) => {
          if (playlist?.id) {
            playlistIds.push(playlist.id)
          }
        })
      } catch (e) {
        // 单个批次失败不影响整体，继续获取下一批
        console.error(`获取热门歌单批次失败 (offset=${offset}):`, e)
      }
    }
    
    // 去重并限制数量
    const uniqueIds = Array.from(new Set(playlistIds)).slice(0, 100)
    
    // 为每个热门歌单生成多语言URL条目
    playlistEntries = uniqueIds.map(playlistId => {
      const alternateLinks = locales.map(locale => 
        `    <xhtml:link rel="alternate" hreflang="${locale}" href="${base}/${locale}/playlist/${playlistId}" />`
      ).join('\n')
      
      // 歌单页优先级较低，更新频率设置为每周
      const urlsForPlaylist = locales.map(locale => `
  <url>
    <loc>${base}/${locale}/playlist/${playlistId}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
${alternateLinks}
  </url>`).join('')
      
      return urlsForPlaylist
    }).join('')
  } catch (e) {
    // 热门歌单获取失败不影响静态页面，继续生成sitemap
    console.error('获取热门歌单失败，仅包含静态页面:', e)
  }
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${staticUrlEntries}${playlistEntries}
</urlset>`
  
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  // 缓存1小时，CDN缓存6小时（热门歌单数据相对稳定）
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=21600')
  res.status(200).send(xml)
}

