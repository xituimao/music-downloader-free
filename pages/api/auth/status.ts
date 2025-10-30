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
    
    console.log('🔍 调用网易API，Cookie前100字符:', cookie.substring(0, 100))
    const result = await login_status({ cookie }, request)
    
    console.log('🔍 API原始返回结构:')
    console.log('  - result.status:', result.status)
    console.log('  - result.body:', JSON.stringify(result.body, null, 2))
    console.log('  - result.body.code:', result.body.code)
    console.log('  - result.body.profile:', result.body.profile)
    
    // 兼容处理：有些情况下网易API返回的是嵌套结构
    let responseCode = result.body.code
    let profileData = result.body.profile
    
    // 如果直接获取失败，尝试从data字段获取
    if (!responseCode || responseCode === undefined) {
      responseCode = result.body.data?.code || result.status || -1
      profileData = result.body.data?.profile || result.body.profile
    }
    
    console.log('🔍 最终提取结果:')
    console.log('  - responseCode:', responseCode)
    console.log('  - profileData:', profileData)
    
    // 规范化返回格式，确保前端能正确识别
    const response = {
      code: responseCode,
      message: result.body.message || (responseCode === 200 ? '已登录' : '未登录'),
      data: {
        profile: profileData || null
      }
    }
    
    console.log('📤 最终返回数据:', JSON.stringify(response, null, 2))
    
    // 登录状态可以短时间缓存
    res.setHeader('Cache-Control', 'private, max-age=60')
    res.status(200).json(response)
  } catch (e: any) {
    console.error('❌ 获取登录状态失败:', e.message)
    res.status(500).json({ code: 500, message: e?.message || '获取状态失败' })
  }
}

