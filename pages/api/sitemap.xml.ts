import type { NextApiRequest, NextApiResponse } from 'next'
import { SITE_URL, SUPPORTED_LOCALES } from '../../lib/constants'

/**
 * 动态生成多语言 sitemap
 * 为每个页面生成中英文两个版本，并添加 hreflang 链接
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 使用固定的站点URL，不再依赖请求头
  const base = SITE_URL
  
  // 支持多语言的页面路径（不含语言前缀）
  const pages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/docs/guide', priority: '0.8', changefreq: 'weekly' },
    { path: '/docs/quality', priority: '0.7', changefreq: 'weekly' },
    { path: '/licenses', priority: '0.6', changefreq: 'monthly' }
  ]
  
  const locales = SUPPORTED_LOCALES
  
  // 生成 URL 条目，每个页面包含所有语言版本的 alternate 链接
  const urlEntries = pages.map(page => {
    const alternateLinks = locales.map(locale => 
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${base}/${locale}${page.path}" />`
    ).join('\n')
    
    // 为每种语言生成一个 URL 条目
    const urlsForPage = locales.map(locale => `
  <url>
    <loc>${base}/${locale}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${alternateLinks}
  </url>`).join('')
    
    return urlsForPage
  }).join('')
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${urlEntries}
</urlset>`
  
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  res.status(200).send(xml)
}

