import { serialize } from 'cookie'
import { apiHandler } from '@/lib/api-handler'

/**
 * 登出，清除cookie
 */
export default apiHandler({ name: 'Auth-Logout' }, async (req, res) => {
  const cookie = req.cookies.NETEASE_MUSIC_COOKIE
  
  // 定义清除cookie的函数
  const clearCookie = () => {
    res.setHeader('Set-Cookie', serialize('NETEASE_MUSIC_COOKIE', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    }))
  }
  
  try {
    // 如果有cookie，调用网易云登出接口
    if (cookie) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const logout = require('NeteaseCloudMusicApi/module/logout.js')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const request = require('NeteaseCloudMusicApi/util/request.js')
      
      await logout({ cookie }, request)
    }
    
    clearCookie()
    res.status(200).json({ code: 200, message: '登出成功' })
    return {} as any
  } catch (e: any) {
    // 即使登出失败也清除cookie
    clearCookie()
    throw e
  }
})

