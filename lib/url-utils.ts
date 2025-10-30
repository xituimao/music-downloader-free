/**
 * URL工具函数
 * 处理网易云CDN的HTTP/HTTPS协议问题
 */

/**
 * 将HTTP URL转换为HTTPS（网易云CDN支持HTTPS）
 * 避免Mixed Content警告
 */
export function ensureHttps(url?: string): string {
  if (!url) return ''
  
  // 网易云音乐CDN域名
  const musicCdnDomains = [
    'music.126.net',
    'music.163.com',
    'yyuap.com'
  ]
  
  // 如果是HTTP且是网易云CDN，转换为HTTPS
  if (url.startsWith('http://')) {
    const isNeteaseCdn = musicCdnDomains.some(domain => url.includes(domain))
    if (isNeteaseCdn) {
      return url.replace('http://', 'https://')
    }
  }
  
  return url
}

/**
 * 优化图片URL（压缩+HTTPS）
 */
export function optimizeImageUrl(url?: string, size = 300): string {
  if (!url) return ''
  
  // 先确保HTTPS
  const httpsUrl = ensureHttps(url)
  
  // 网易云图片支持param参数压缩
  if (httpsUrl.includes('music.126.net') || httpsUrl.includes('music.163.com')) {
    const separator = httpsUrl.includes('?') ? '&' : '?'
    return `${httpsUrl}${separator}param=${size}y${size}`
  }
  
  return httpsUrl
}

