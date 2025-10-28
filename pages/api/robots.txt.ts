import type { NextApiRequest, NextApiResponse } from 'next'
import { SITE_URL } from '../../lib/constants'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 使用固定站点URL，不再依赖请求头
  const base = SITE_URL
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400') // 缓存一天
  res.status(200).send([
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    `Sitemap: ${base}/sitemap.xml`
  ].join('\n'))
}

