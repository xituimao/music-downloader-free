import type { NextApiRequest, NextApiResponse } from 'next'
import { search } from 'NeteaseCloudMusicApi'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { keywords = '', limit = '30', offset = '0' } = req.query
  try {
    const result = await search({
      keywords: String(keywords),
      limit: Number(limit),
      offset: Number(offset),
      type: 1000 // 歌单
    })
    res.status(200).json(result.body)
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || 'search failed' })
  }
}


