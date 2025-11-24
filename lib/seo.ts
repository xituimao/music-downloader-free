import i18next from 'i18next'

/**
 * 通用 SEO Robots Meta 标签配置
 */
export const SEO_ROBOTS_META = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

export const coreKeywords = [
  '一键音乐下载',
  '歌单批量下载',
  '批量下载歌曲',
  '音乐ZIP打包下载',
  '在线批量下载歌曲',
  '网易云歌单下载',
  'Netease playlist download',
  'Music Downloader',
  'Batch Download Playlists',
]

export const qualityKeywords = [
  'mp3',
  '320kbps',
  '无损',
  'FLAC',
  'APE',
  'WAV',
  'HiFi',
  'Hi-Res',
]

/**
 * 获取翻译文本
 * @param key 翻译键
 * @param locale 语言
 * @param params 参数
 */
function getTranslation(key: string, locale: string, params?: Record<string, any>) {
  // 动态加载翻译文件
  try {
    const translations = require(`../public/locales/${locale}/seo.json`)
    let text = key.split('.').reduce((obj, k) => obj?.[k], translations)
    
    // 替换参数
    if (params && typeof text === 'string') {
      Object.keys(params).forEach(paramKey => {
        text = text.replace(`{{${paramKey}}}`, params[paramKey])
      })
    }
    
    return text || key
  } catch (e) {
    return key
  }
}

export function seoHome(locale: string = 'zh') {
  const title = getTranslation('home.title', locale)
  const description = getTranslation('home.description', locale)
  return { title, description }
}

export function seoSearch(keyword: string, locale: string = 'zh') {
  const q = keyword || (locale === 'zh' ? '歌单' : 'playlist')
  const title = getTranslation('search.title', locale, { keyword: q })
  const description = getTranslation('search.description', locale, { keyword: q })
  return { title, description }
}

export function seoPlaylist(name: string, count: number, description?: string | null, locale: string = 'zh') {
  const title = getTranslation('playlist.title', locale, { name, count })
  const desc = description || getTranslation('playlist.description', locale, { name, count })
  return { title, description: desc }
}


