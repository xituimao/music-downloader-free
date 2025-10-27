import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'http'
  const host = req.headers.host || 'localhost:3000'
  const base = `${proto}://${host}`
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400') // 缓存一天
  res.status(200).send([
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    `Sitemap: ${base}/api/sitemap.xml`
  ].join('\n'))
}

