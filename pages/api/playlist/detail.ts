import type { NextApiRequest, NextApiResponse } from 'next'
import { playlist_detail } from 'NeteaseCloudMusicApi'

/**
 * 歌单详情API
 * 使用匿名访问模式（经验证比游客登录更稳定）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id) return res.status(400).json({ code: 400, message: '缺少歌单ID' })
  
  try {
    // 不传cookie，使用匿名访问
    const result = await playlist_detail({ 
      id: Number(id)
    })
    
    // 使用分层缓存控制：客户端缓存15分钟，CDN缓存1小时，Vercel CDN缓存3小时
    res.setHeader('Cache-Control', 'max-age=900')
    res.setHeader('CDN-Cache-Control', 'max-age=3600')
    res.setHeader('Vercel-CDN-Cache-Control', 'max-age=10800')
    res.status(200).json(result.body)
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || 'detail failed' })
  }
}
