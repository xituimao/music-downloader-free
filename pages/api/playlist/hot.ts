/**
 * 热门歌单 API
 * 支持按热门度或最新发布排序
 * @param cat 分类，默认'全部'
 * @param limit 返回数量，默认20
 * @param offset 偏移量，默认0
 * @param order 排序方式：hot（热门）或 new（最新），默认 hot
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { top_playlist } from 'NeteaseCloudMusicApi'
import fs from 'fs'
import path from 'path'

/**
 * 日志记录工具函数，输出到控制台并保存到日志文件
 * @param message 日志内容
 * @param data 可选的数据对象
 */
function logger(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logMsg = `${timestamp} - ${message}${data ? `: ${JSON.stringify(data, null, 2)}` : ''}`
  
  // 控制台输出
  console.log(logMsg)
  
  // 尝试写入日志文件（如果有写入权限）
  try {
    const logDir = path.join(process.cwd(), './.logs')
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    fs.appendFileSync(
      path.join(logDir, 'api-logs.txt'),
      logMsg + '\n'
    )
  } catch (e) {
    // 写入失败时忽略错误，不影响业务逻辑
    console.error('Failed to write log file:', e)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cat = '全部', limit = '20', offset = '0', order = 'hot' } = req.query

  try {
    const orderValue = String(order)
    const startTime = Date.now()
    logger('开始请求热门歌单API', { cat, limit, offset, order: orderValue })

    // 修复：网易云API的order='new'参数不工作，始终使用'hot'获取数据
    // 然后在服务端根据需要进行重新排序
    const result = await top_playlist({
      cat: String(cat),
      limit: Number(limit),
      offset: Number(offset),
      order: 'hot' as any // 固定使用hot排序获取数据
    })

    // 记录API响应时间
    const playlistCount = (result.body as any)?.playlists?.length || 0
    logger('API响应完成', {
      timeMs: Date.now() - startTime,
      resultCode: result.status,
      playlistCount
    })

    // 获取歌单列表
    let playlists = (result.body as any)?.playlists || []

    // 根据排序类型执行服务端排序
    if (playlists.length > 0) {
      if (orderValue === 'new') {
        // 最新排序：使用updateTime字段进行降序排列
        logger('开始处理「最新」排序逻辑，使用updateTime字段')

        // 存储原始排序结果的前三个条目，用于比较
        const originalOrder = playlists.slice(0, 3).map((p: any) => ({
          id: p.id,
          name: p.name,
          updateTime: p.updateTime
        }))

        // 按更新时间降序排列（最新的在前）
        playlists = playlists.sort((a: any, b: any) => {
          // 避免数据类型问题，统一转换为时间戳
          const aTime = typeof a.updateTime === 'number' ? a.updateTime : new Date(a.updateTime || 0).getTime()
          const bTime = typeof b.updateTime === 'number' ? b.updateTime : new Date(b.updateTime || 0).getTime()
          return bTime - aTime  // 降序排列（最新的在前）
        })

        // 记录排序后的前三条目，用于比较排序效果
        const newOrder = playlists.slice(0, 3).map((p: any) => ({
          id: p.id,
          name: p.name,
          updateTime: p.updateTime
        }))

        // 比较前后排序结果是否有变化
        const hasChanged = JSON.stringify(originalOrder) !== JSON.stringify(newOrder)
        logger(`最新排序完成，排序结果${hasChanged ? '有变化' : '无变化'}`, {
          original: originalOrder,
          sorted: newOrder
        })
      } else {
        // 热门排序：使用playCount字段进行降序排列，确保真正的热门歌单在前
        logger('热门排序，使用playCount进行服务端排序')

        const originalOrder = playlists.slice(0, 3).map((p: any) => ({
          id: p.id,
          name: p.name,
          playCount: p.playCount
        }))

        playlists = playlists.sort((a: any, b: any) => {
          // 避免数据类型问题
          const aCount = typeof a.playCount === 'number' ? a.playCount : 0
          const bCount = typeof b.playCount === 'number' ? b.playCount : 0
          return bCount - aCount  // 降序排列（播放量高的在前）
        })

        const newOrder = playlists.slice(0, 3).map((p: any) => ({
          id: p.id,
          name: p.name,
          playCount: p.playCount
        }))

        const hasChanged = JSON.stringify(originalOrder) !== JSON.stringify(newOrder)
        logger(`热门排序完成，排序结果${hasChanged ? '有变化' : '无变化'}`, {
          original: originalOrder,
          sorted: newOrder
        })
      }
    }

    // 返回排序后的结果
    // 添加排序相关信息
    // 热门歌单数据适合缓存，使用stale-while-revalidate模式
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=7200')
    res.status(200).json({
      ...(result.body as any),
      playlists,
      _sort: {
        order: orderValue,
        appliedServerSideSort: true, // 现在始终在服务端应用排序
        count: playlists.length
      }
    })
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || 'hot playlist failed' })
  }
}

