import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * 测试接口：检查Cookie是否正确设置和读取
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.cookies.NETEASE_MUSIC_COOKIE
  
  res.status(200).json({
    hasCookie: !!cookie,
    cookieLength: cookie ? cookie.length : 0,
    allCookies: Object.keys(req.cookies),
    message: cookie ? 'Cookie存在' : 'Cookie不存在'
  })
}

