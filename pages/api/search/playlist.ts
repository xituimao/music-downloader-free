import { cloudsearch } from 'NeteaseCloudMusicApi'
import { apiHandler, getOptionalParam } from '@/lib/api-handler'

/**
 * 歌单搜索API
 * 使用匿名访问模式（经验证比游客登录更稳定）
 */
export default apiHandler({ name: 'Search-Playlist', logResponse: false }, async (req, res) => {
  const keywords = getOptionalParam(req.query.keywords, '')
  const limit = getOptionalParam(req.query.limit, '30')
  const offset = getOptionalParam(req.query.offset, '0')
  
  // 不传cookie，使用匿名访问
  const result = await cloudsearch({
    keywords,
    limit: Number(limit),
    offset: Number(offset),
    type: 1000 // 歌单
  })
  
  // 搜索结果可以短期缓存，根据查询参数变化
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600')
  res.setHeader('Vary', 'Accept-Encoding')
  res.status(200).json(result.body)
  
  return {} as any
})
