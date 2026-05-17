/**
 * 网易云音乐 API 直接调用封装
 * 
 * 不依赖 NeteaseCloudMusicApi 模块，直接使用 fetch 调用网易云音乐 Web API
 * 解决 Vercel Serverless 环境中 NeteaseCloudMusicApi 动态 require 失败的问题
 */

const BASE_URL = 'https://music.163.com'

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://music.163.com/',
  'Content-Type': 'application/x-www-form-urlencoded',
}

async function request(path: string, data: Record<string, string>) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: new URLSearchParams(data).toString(),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

/**
 * 热门歌单
 */
export async function getHotPlaylists(params: {
  cat?: string
  limit?: number
  offset?: number
  order?: 'hot' | 'new'
}) {
  const { cat = '全部', limit = 20, offset = 0, order = 'hot' } = params
  
  return request('/api/playlist/list', {
    cat,
    order,
    limit: String(limit),
    offset: String(offset),
    total: 'true',
  })
}

/**
 * 歌单详情
 */
export async function getPlaylistDetail(id: string | number) {
  return request('/api/v3/playlist/detail', {
    id: String(id),
    n: '1000',
    s: '8',
  })
}

/**
 * 搜索歌单
 */
export async function searchPlaylists(keyword: string, limit = 20, offset = 0) {
  return request('/cloudsearch/pc', {
    s: keyword,
    type: '1000',
    limit: String(limit),
    offset: String(offset),
  })
}

/**
 * 歌曲 URL
 */
export async function getSongUrl(ids: string | number[], level = 'exhigh') {
  const idArray = Array.isArray(ids) ? ids : [ids]
  return request('/api/song/enhance/player/url/v1', {
    ids: JSON.stringify(idArray),
    level,
    encodeType: 'mp3',
  })
}
