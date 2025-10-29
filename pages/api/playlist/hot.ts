import type { NextApiRequest, NextApiResponse } from 'next'
import { top_playlist } from 'NeteaseCloudMusicApi'

/**
 * 热门歌单 API
 * 使用匿名访问模式（经验证比游客登录更稳定）
 * @param cat 分类，默认'全部'
 * @param limit 返回数量，默认20
 * @param offset 偏移量，默认0
 * @param order 排序方式：hot（热门）或 new（最新），默认 hot（仅作标记，实际排序在客户端）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cat = '全部', limit = '20', offset = '0', order = 'hot' } = req.query

  try {
    // 不传cookie，使用匿名访问
    const result = await top_playlist({
      cat: String(cat),
      limit: Number(limit),
      offset: Number(offset),
      order: String(order) as any
    })

    // 热门歌单数据适合缓存，使用stale-while-revalidate模式
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=7200')
    res.status(200).json(result.body)
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || 'hot playlist failed' })
  }
}

