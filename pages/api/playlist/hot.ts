/**
 * 热门歌单 API
 * 支持按热门度或最新发布排序
 * @param cat 分类，默认'全部'
 * @param limit 返回数量，默认20
 * @param offset 偏移量，默认0
 * @param order 排序方式：hot（热门）或 new（最新），默认 hot
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { top_playlist } from 'NeteaseCloudMusicApi'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cat = '全部', limit = '20', offset = '0', order = 'hot' } = req.query
  
  try {
    const orderValue = String(order)
    const result = await top_playlist({
      cat: String(cat),
      limit: Number(limit),
      offset: Number(offset),
      order: (orderValue === 'new' ? 'new' : 'hot') as any // 支持 hot（热门）和 new（最新）
    })
    res.status(200).json(result.body)
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || 'hot playlist failed' })
  }
}

