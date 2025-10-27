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
    const logDir = path.join(process.cwd(), 'logs')
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
    
    // 首先尝试使用网易云API的原生排序参数
    const result = await top_playlist({
      cat: String(cat),
      limit: Number(limit),
      offset: Number(offset),
      order: orderValue as any // 尝试传入用户选择的排序
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
    
    // 测试API原生排序是否有效
    // 先收集原始数据中的时间字段信息
    if (playlists.length > 0) {
      const samplePlaylist = playlists[0]
      const timeFields = {
        createTime: samplePlaylist.createTime,
        updateTime: samplePlaylist.updateTime,
        publishTime: samplePlaylist.publishTime,
        trackUpdateTime: samplePlaylist.trackUpdateTime
      }
      logger('歌单数据结构', timeFields)
      
      // 根据排序类型执行不同的逻辑
      if (orderValue === 'new') {
        logger('开始处理「最新」排序逻辑')
        
        // 确定可用的时间字段
        let timeField = null
        if (samplePlaylist.updateTime) timeField = 'updateTime'
        else if (samplePlaylist.createTime) timeField = 'createTime'
        else if (samplePlaylist.trackUpdateTime) timeField = 'trackUpdateTime'
        else if (samplePlaylist.publishTime) timeField = 'publishTime'
        
        if (timeField) {
          logger(`使用 ${timeField} 字段进行排序`)
          
          // 存储原始排序结果的前三个条目，用于比较
          const originalOrder = playlists.slice(0, 3).map((p: any) => ({
            id: p.id,
            name: p.name,
            timeValue: p[timeField]
          }))
          
          // 排序
          playlists = playlists.sort((a: any, b: any) => {
            // 避免数据类型问题
            const aTime = typeof a[timeField] === 'number' ? a[timeField] : new Date(a[timeField] || 0).getTime()
            const bTime = typeof b[timeField] === 'number' ? b[timeField] : new Date(b[timeField] || 0).getTime()
            return bTime - aTime  // 降序排列（最新的在前）
          })
          
          // 记录排序后的前三条目，用于比较排序效果
          const newOrder = playlists.slice(0, 3).map((p: any) => ({
            id: p.id,
            name: p.name,
            timeValue: p[timeField]
          }))
          
          // 比较前后排序结果是否有变化
          const hasChanged = JSON.stringify(originalOrder) !== JSON.stringify(newOrder)
          logger(`排序完成，排序结果${hasChanged ? '有变化' : '无变化'}`, {
            original: originalOrder,
            sorted: newOrder
          })
        } else {
          logger('无法找到合适的时间字段，继续使用API原始排序')
        }
      } else {
        // 热门排序，默认使用API的排序结果，还可以考虑再次按 playCount 排序
        logger('热门排序，使用API原始排序结果')
        // 如果需要确保按播放量排序，可以取消这个注释启用下面的代码
        /*
        if (samplePlaylist.playCount !== undefined) {
          logger('使用 playCount 进行热门排序')
          playlists = playlists.sort((a: any, b: any) => {
            return b.playCount - a.playCount  // 降序排列（播放量高的在前）
          })
        }
        */
      }
    }
    
    // 返回排序后的结果
    // 添加排序相关信息
    res.status(200).json({
      ...(result.body as any),
      playlists,
      _sort: {
        order: orderValue,
        appliedServerSideSort: orderValue === 'new', // 标记是否应用了服务端排序
        count: playlists.length
      }
    })
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || 'hot playlist failed' })
  }
}

