/**
 * 网易云音乐 API 直接调用封装
 * 
 * 不依赖 NeteaseCloudMusicApi 模块，直接使用 axios 调用网易云音乐 Web API
 * 解决 Vercel Serverless 环境中 NeteaseCloudMusicApi 动态 require 失败的问题
 */

import axios from 'axios'

/**
 * 生成设备 ID（模拟）
 */
function generateDeviceId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * 创建 axios 实例
 */
const apiClient = axios.create({
  baseURL: 'https://music.163.com',
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://music.163.com/',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
})

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
  
  const response = await apiClient.post(
    '/api/playlist/list',
    new URLSearchParams({
      cat,
      order,
      limit: String(limit),
      offset: String(offset),
      total: 'true',
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  return response.data
}

/**
 * 歌单详情
 */
export async function getPlaylistDetail(id: string | number) {
  const response = await apiClient.post(
    '/api/v3/playlist/detail',
    new URLSearchParams({
      id: String(id),
      n: '1000',
      s: '8',
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  return response.data
}

/**
 * 搜索歌单
 */
export async function searchPlaylists(keyword: string, limit = 20, offset = 0) {
  const response = await apiClient.post(
    '/cloudsearch/pc',
    new URLSearchParams({
      s: keyword,
      type: '1000', // 歌单搜索类型
      limit: String(limit),
      offset: String(offset),
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  return response.data
}

/**
 * 歌曲 URL
 */
export async function getSongUrl(ids: string | number[], level = 'exhigh') {
  const idArray = Array.isArray(ids) ? ids : [ids]
  const response = await apiClient.post(
    '/api/song/enhance/player/url/v1',
    new URLSearchParams({
      ids: JSON.stringify(idArray),
      level,
      encodeType: 'mp3',
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  return response.data
}
