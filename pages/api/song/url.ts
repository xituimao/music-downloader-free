import type { NextApiRequest, NextApiResponse } from 'next'
import { song_url_v1 } from 'NeteaseCloudMusicApi'

/**
 * 歌曲URL获取API
 * 使用匿名访问模式（经验证比游客登录更稳定）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ids, level = 'exhigh' } = req.query
  if (!ids) return res.status(400).json({ code: 400, message: '缺少歌曲ID列表' })
  
  try {
    // 不传cookie，使用匿名访问（网易云对匿名访问更宽容）
    const result = await song_url_v1({ 
      id: String(ids), 
      level: String(level) as any
    })
    
    // 歌曲URL需要实时性，但可以短时间缓存，并使用stale-while-revalidate策略
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=3600')
    res.status(200).json(result.body)
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || 'song url failed' })
  }
}
