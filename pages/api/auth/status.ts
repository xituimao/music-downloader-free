import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * 获取当前登录状态
 * 自动从httpOnly cookie读取凭证
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.cookies.NETEASE_MUSIC_COOKIE
  
  console.log('📍 /api/auth/status 被调用')
  console.log('🔍 Cookie存在:', !!cookie)
  console.log('📦 所有Cookies:', Object.keys(req.cookies))
  
  if (!cookie) {
    console.log('❌ 未找到NETEASE_MUSIC_COOKIE')
    return res.status(200).json({ 
      code: 401, 
      message: '未登录',
      data: { profile: null }
    })
  }
  
  console.log('✅ 找到Cookie，长度:', cookie.length)
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const login_status = require('NeteaseCloudMusicApi/module/login_status.js')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const request = require('NeteaseCloudMusicApi/util/request.js')
    
    const result = await login_status({ cookie }, request)
    
    console.log('✅ 登录状态返回:', result.body.code)
    
    // 登录状态可以短时间缓存
    res.setHeader('Cache-Control', 'private, max-age=60')
    res.status(200).json(result.body)
  } catch (e: any) {
    console.error('❌ 获取登录状态失败:', e.message)
    res.status(500).json({ code: 500, message: e?.message || '获取状态失败' })
  }
}

