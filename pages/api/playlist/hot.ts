import { apiHandler, getOptionalParam } from '@/lib/api-handler'
import { getHotPlaylists } from '@/lib/netease-api'

/**
 * 热门歌单 API
 * 使用直接 HTTP 调用，不依赖 NeteaseCloudMusicApi 模块
 * @param cat 分类，默认'全部'
 * @param limit 返回数量，默认20
 * @param offset 偏移量，默认0
 * @param order 排序方式：hot（热门）或 new（最新），默认 hot
 */
export default apiHandler({ name: 'Playlist-Hot', logResponse: false }, async (req, res) => {
  const cat = getOptionalParam(req.query.cat, '全部')
  const limit = Number(getOptionalParam(req.query.limit, '20'))
  const offset = Number(getOptionalParam(req.query.offset, '0'))
  const order = getOptionalParam(req.query.order, 'hot') as 'hot' | 'new'

  const result = await getHotPlaylists({
    cat,
    limit,
    offset,
    order,
  })

  // 热门歌单数据适合缓存，使用stale-while-revalidate模式
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=7200')
  res.status(200).json(result)

  return {} as any
})
