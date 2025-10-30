import { song_url_v1 } from 'NeteaseCloudMusicApi'
import { apiHandler, validateParam, getOptionalParam } from '@/lib/api-handler'

/**
 * 歌曲URL获取API
 * 优先使用用户登录Cookie，未登录则匿名访问
 */
export default apiHandler({ name: 'Song-URL', logResponse: false }, async (req, res) => {
  const ids = validateParam(req.query.ids, 'ids', '缺少歌曲ID列表')
  const level = getOptionalParam(req.query.level, 'exhigh')
  
  // 读取登录Cookie（如果用户已登录）
  const userCookie = req.cookies.NETEASE_MUSIC_COOKIE
  
  console.log(`   获取歌曲URL: ids=${ids}, level=${level}, 登录状态=${userCookie ? '已登录' : '未登录'}`)
  
  // 有Cookie则用Cookie（可获取VIP权限），无则匿名访问
  const result = await song_url_v1({ 
    id: ids, 
    level: level as any,
    cookie: userCookie
  })
  
  // 验证返回数据
  if (!result.body || !result.body.data) {
    throw new Error('API返回数据格式错误')
  }
  
  // 详细分析返回的歌曲数据
  const songs = result.body.data as any[]
  const dataLength = Array.isArray(songs) ? songs.length : 0
  
  if (dataLength === 0) {
    console.warn(`⚠️  未返回任何歌曲数据`)
  } else {
    // 统计可用和不可用的歌曲
    let availableCount = 0
    let unavailableCount = 0
    
    songs.forEach((song: any, index: number) => {
      if (song.url && song.code === 200) {
        availableCount++
      } else {
        unavailableCount++
        // 记录不可用歌曲的详细信息
        console.warn(`⚠️  歌曲 [${index}] 不可用:`)
        console.warn(`     ID: ${song.id}`)
        console.warn(`     状态码: ${song.code}`)
        console.warn(`     URL: ${song.url || 'null'}`)
        console.warn(`     原因: ${getUnavailableReason(song)}`)
        
        // 打印完整的歌曲对象以便调试
        if (song.code === 404) {
          console.warn(`     完整数据: ${JSON.stringify(song)}`)
        }
      }
    })
    
    console.log(`   返回歌曲数: ${dataLength}, 可用: ${availableCount}, 不可用: ${unavailableCount}`)
  }
  
  // 歌曲URL需要实时性，但可以短时间缓存，并使用stale-while-revalidate策略
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=3600')
  res.status(200).json(result.body)
  
  return {} as any
})

/**
 * 分析歌曲不可用的可能原因
 */
function getUnavailableReason(song: any): string {
  if (song.code === 404) {
    return '歌曲不存在或已下架'
  }
  if (song.code === 200 && !song.url) {
    return '未知原因（API返回成功但无URL）'
  }
  if (song.freeTrialPrivilege) {
    const { resConsumable, userConsumable } = song.freeTrialPrivilege
    if (!resConsumable) return 'VIP歌曲（需要会员）'
    if (!userConsumable) return '试听次数已用完'
  }
  return `未知（状态码: ${song.code}）`
}
