import type { NextApiRequest, NextApiResponse } from 'next'
import { song_url_v1 } from 'NeteaseCloudMusicApi'

/**
 * 歌曲URL获取API
 * 优先使用用户登录Cookie，未登录则匿名访问
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ids, level = 'exhigh' } = req.query
  if (!ids) return res.status(400).json({ code: 400, message: '缺少歌曲ID列表' })
  
  // 读取登录Cookie（如果用户已登录）
  const userCookie = req.cookies.NETEASE_MUSIC_COOKIE
  
  try {
    // 有Cookie则用Cookie（可获取VIP权限），无则匿名访问
    const result = await song_url_v1({ 
      id: String(ids), 
      level: String(level) as any,
      cookie: userCookie
    })
    
    // 歌曲URL需要实时性，但可以短时间缓存，并使用stale-while-revalidate策略
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=3600')
    res.status(200).json(result.body)
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || 'song url failed' })
  }
}
