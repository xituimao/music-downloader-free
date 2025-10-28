import type { NextApiRequest, NextApiResponse } from 'next'
import { song_url_v1 } from 'NeteaseCloudMusicApi'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ids, level = 'exhigh' } = req.query
  if (!ids) return res.status(400).json({ code: 400, message: '缺少歌曲ID列表' })
  try {
    // 添加日志以调试手机端问题
    console.log(`获取歌曲URL - IDs: ${ids}, 请求类型: ${req.headers['user-agent']?.includes('Mobile') ? '移动端' : '桌面端'}`)
    
    const result = await song_url_v1({ id: String(ids), level: String(level) as any })
    
    // 记录返回的歌曲数量信息
    const returnedIds = result.body?.data?.map((item: any) => item.id).join(',') || ''
    const returnCount = result.body?.data?.length || 0
    console.log(`返回数量: ${returnCount}, 返回的ID: ${returnedIds}`)

    // 歌曲URL需要实时性，但可以短时间缓存，并使用stale-while-revalidate策略
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=3600')
    res.status(200).json(result.body)
  } catch (e: any) {
    console.error(`获取歌曲URL失败: ${e?.message}`)
    res.status(500).json({ code: 500, message: e?.message || 'song url failed' })
  }
}


