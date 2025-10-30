import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

/**
 * 登出，清除cookie
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.cookies.NETEASE_MUSIC_COOKIE
  
  try {
    // 如果有cookie，调用网易云登出接口
    if (cookie) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const logout = require('NeteaseCloudMusicApi/module/logout.js')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const request = require('NeteaseCloudMusicApi/util/request.js')
      
      await logout({ cookie }, request)
    }
    
    // 清除httpOnly cookie
    res.setHeader('Set-Cookie', serialize('NETEASE_MUSIC_COOKIE', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    }))
    
    res.status(200).json({ code: 200, message: '登出成功' })
  } catch (e: any) {
    // 即使登出失败也清除cookie
    res.setHeader('Set-Cookie', serialize('NETEASE_MUSIC_COOKIE', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    }))
    
    res.status(500).json({ code: 500, message: e?.message || '登出失败' })
  }
}

