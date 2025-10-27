import type { NextApiRequest, NextApiResponse } from 'next'
import { song_url_v1 } from 'NeteaseCloudMusicApi'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ids, level = 'exhigh' } = req.query
  if (!ids) return res.status(400).json({ code: 400, message: '缺少歌曲ID列表' })
  try {
    const result = await song_url_v1({ id: String(ids), level: String(level) as any })
    res.status(200).json(result.body)
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || 'song url failed' })
  }
}


