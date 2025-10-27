/**
 * @Description: 音乐下载网站后端服务器
 * @Author: 蓉儿
 * @Date: 2025-10-24
 * 
 * 核心功能：
 * 1. 提供静态文件服务（前端页面）
 * 2. 封装网易云音乐API接口
 * 3. 处理跨域请求
 */

const express = require('express')
const cors = require('cors')
const path = require('path')

// 导入网易云音乐API模块
const { 
  search,           // 搜索
  playlist_detail,  // 歌单详情
  song_url_v1,      // 歌曲URL（v1版本，支持批量获取）
  song_detail,      // 歌曲详情
  top_playlist      // 热门歌单
} = require('NeteaseCloudMusicApi')

const app = express()
const PORT = 3000

// 中间件配置
app.use(cors())  // 允许跨域
app.use(express.json())  // 解析JSON请求体
app.use(express.static('public'))  // 静态文件服务

// ---- 基础 SEO 资源：robots 与 sitemap ----
// robots.txt：默认允许抓取，并指向 sitemap
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send([
    'User-agent: *',
    'Allow: /',
    'Sitemap: ' + `${req.protocol}://${req.get('host')}/sitemap.xml`
  ].join('\n'))
})

// sitemap.xml：简单列出首页，以及哈希路由的两个入口（供搜索引擎参考）
app.get('/sitemap.xml', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`
  const urls = [
    '/',
    '/#search/',
    '/#playlist/'
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `\n  <url><loc>${base}${u}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`).join('') +
    `\n</urlset>`
  res.type('application/xml').send(xml)
})

/**
 * 搜索歌单接口
 * @query {string} keywords - 搜索关键词
 * @query {number} limit - 返回数量，默认30
 * @query {number} offset - 偏移量，默认0
 */
app.get('/api/search/playlist', async (req, res) => {
  try {
    const { keywords, limit = 30, offset = 0 } = req.query
    
    if (!keywords) {
      return res.status(400).json({ code: 400, message: '缺少搜索关键词' })
    }

    // 调用网易云API搜索歌单（type=1000表示歌单）
    const result = await search({
      keywords,
      limit,
      offset,
      type: 1000
    })

    res.json(result.body)
  } catch (error) {
    console.error('搜索歌单失败:', error)
    res.status(500).json({ code: 500, message: '搜索失败', error: error.message })
  }
})

/**
 * 获取歌单详情及歌曲列表接口
 * @query {number} id - 歌单ID
 */
app.get('/api/playlist/detail', async (req, res) => {
  try {
    const { id } = req.query
    
    if (!id) {
      return res.status(400).json({ code: 400, message: '缺少歌单ID' })
    }

    // 调用网易云API获取歌单详情
    const result = await playlist_detail({ id })

    res.json(result.body)
  } catch (error) {
    console.error('获取歌单详情失败:', error)
    res.status(500).json({ code: 500, message: '获取歌单详情失败', error: error.message })
  }
})

/**
 * 批量获取歌曲下载链接接口
 * @query {string} ids - 歌曲ID列表，逗号分隔
 * @query {string} level - 音质等级，默认standard（支持：standard, higher, exhigh, lossless, hires, jyeffect, sky, jymaster）
 */
app.get('/api/song/url', async (req, res) => {
  try {
    const { ids, level = 'standard' } = req.query
    
    if (!ids) {
      return res.status(400).json({ code: 400, message: '缺少歌曲ID列表' })
    }

    // 调用网易云API批量获取歌曲URL（v1版本支持批量）
    const result = await song_url_v1({
      id: ids,
      level
    })

    res.json(result.body)
  } catch (error) {
    console.error('获取歌曲URL失败:', error)
    res.status(500).json({ code: 500, message: '获取歌曲URL失败', error: error.message })
  }
})

/**
 * 获取歌曲详细信息接口
 * @query {string} ids - 歌曲ID列表，逗号分隔
 */
app.get('/api/song/detail', async (req, res) => {
  try {
    const { ids } = req.query
    
    if (!ids) {
      return res.status(400).json({ code: 400, message: '缺少歌曲ID列表' })
    }

    // 调用网易云API获取歌曲详情
    const result = await song_detail({ ids })

    res.json(result.body)
  } catch (error) {
    console.error('获取歌曲详情失败:', error)
    res.status(500).json({ code: 500, message: '获取歌曲详情失败', error: error.message })
  }
})

/**
 * 获取热门歌单接口（主页推荐使用）
 * @query {string} cat - 歌单分类，默认"全部"
 * @query {number} limit - 返回数量，默认20
 * @query {number} offset - 偏移量，默认0
 */
app.get('/api/playlist/hot', async (req, res) => {
  try {
    const { cat = '全部', limit = 20, offset = 0 } = req.query

    // 调用网易云API获取热门歌单
    const result = await top_playlist({
      cat,
      limit,
      offset,
      order: 'hot'  // 按热度排序
    })

    res.json(result.body)
  } catch (error) {
    console.error('获取热门歌单失败:', error)
    res.status(500).json({ code: 500, message: '获取热门歌单失败', error: error.message })
  }
})

// 注意：下载和打包功能已移至客户端实现，服务器不再中转音乐流量

// 启动服务器
app.listen(PORT, () => {
  console.log(`🎵 音乐下载服务已启动！`)
  console.log(`📡 服务地址: http://localhost:${PORT}`)
  console.log(`💡 请在浏览器中打开上述地址使用`)
})

