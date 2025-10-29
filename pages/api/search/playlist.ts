import type { NextApiRequest, NextApiResponse } from 'next'
import { cloudsearch } from 'NeteaseCloudMusicApi'

/**
 * 歌单搜索API
 * 使用匿名访问模式（经验证比游客登录更稳定）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { keywords = '', limit = '30', offset = '0' } = req.query
  
  try {
    // 不传cookie，使用匿名访问
    const result = await cloudsearch({
      keywords: String(keywords),
      limit: Number(limit),
      offset: Number(offset),
      type: 1000 // 歌单
    })
    
    // 搜索结果可以短期缓存，根据查询参数变化
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600')
    res.setHeader('Vary', 'Accept-Encoding')
    res.status(200).json(result.body)
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || 'search failed' })
  }
}
