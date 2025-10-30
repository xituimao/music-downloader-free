import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * 调试接口：查看Cookie信息
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.cookies.NETEASE_MUSIC_COOKIE
  
  // 列出所有Cookie
  const allCookies = Object.keys(req.cookies)
  
  if (!cookie) {
    return res.status(200).json({
      hasCookie: false,
      allCookies: allCookies,
      cookieCount: allCookies.length,
      message: 'NETEASE_MUSIC_COOKIE不存在'
    })
  }
  
  // 解析Cookie字段
  const fields = cookie.split(';').map(f => f.trim())
  const parsed: any = {}
  fields.forEach(field => {
    const [key, value] = field.split('=')
    if (key && value) {
      parsed[key] = value.substring(0, 20) + (value.length > 20 ? '...' : '')
    }
  })
  
  return res.status(200).json({
    hasCookie: true,
    cookieLength: cookie.length,
    fields: Object.keys(parsed),
    preview: parsed,
    allCookies: allCookies,
    message: `✅ Cookie存在，长度${cookie.length}字符`
  })
}

