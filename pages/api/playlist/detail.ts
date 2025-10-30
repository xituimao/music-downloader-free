import { playlist_detail } from 'NeteaseCloudMusicApi'
import { apiHandler, validateParam } from '@/lib/api-handler'

/**
 * 歌单详情API
 * 使用匿名访问模式（经验证比游客登录更稳定）
 */
export default apiHandler({ name: 'Playlist-Detail', logResponse: false }, async (req, res) => {
  const id = validateParam(req.query.id, 'id', '缺少歌单ID')
  
  // 不传cookie，使用匿名访问
  const result = await playlist_detail({ 
    id: Number(id)
  })
  
  // 使用分层缓存控制：客户端缓存15分钟，CDN缓存1小时，Vercel CDN缓存3小时
  res.setHeader('Cache-Control', 'max-age=900')
  res.setHeader('CDN-Cache-Control', 'max-age=3600')
  res.setHeader('Vercel-CDN-Cache-Control', 'max-age=10800')
  res.status(200).json(result.body)
  
  return {} as any
})
