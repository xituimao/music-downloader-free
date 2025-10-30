import { top_playlist } from 'NeteaseCloudMusicApi'
import { apiHandler, getOptionalParam } from '@/lib/api-handler'

/**
 * 热门歌单 API
 * 使用匿名访问模式（经验证比游客登录更稳定）
 * @param cat 分类，默认'全部'
 * @param limit 返回数量，默认20
 * @param offset 偏移量，默认0
 * @param order 排序方式：hot（热门）或 new（最新），默认 hot（仅作标记，实际排序在客户端）
 */
export default apiHandler({ name: 'Playlist-Hot', logResponse: false }, async (req, res) => {
  const cat = getOptionalParam(req.query.cat, '全部')
  const limit = getOptionalParam(req.query.limit, '20')
  const offset = getOptionalParam(req.query.offset, '0')
  const order = getOptionalParam(req.query.order, 'hot')

  // 不传cookie，使用匿名访问
  const result = await top_playlist({
    cat,
    limit: Number(limit),
    offset: Number(offset),
    order: order as any
  })

  // 热门歌单数据适合缓存，使用stale-while-revalidate模式
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=7200')
  res.status(200).json(result.body)
  
  return {} as any
})

