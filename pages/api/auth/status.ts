import { apiHandler } from '@/lib/api-handler'

/**
 * 获取当前登录状态
 * 自动从httpOnly cookie读取凭证
 */
export default apiHandler({ name: 'Auth-Status' }, async (req, res) => {
  const cookie = req.cookies.NETEASE_MUSIC_COOKIE
  
  console.log('   Cookie存在:', !!cookie)
  
  if (!cookie) {
    res.status(200).json({ 
      code: 401, 
      message: '未登录',
      data: { profile: null }
    })
    return {} as any
  }
  
  console.log('   Cookie长度:', cookie.length)
  
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const login_status = require('NeteaseCloudMusicApi/module/login_status.js')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const request = require('NeteaseCloudMusicApi/util/request.js')
  
  const result = await login_status({ cookie }, request)
  
  // 兼容处理：有些情况下网易API返回的是嵌套结构
  let responseCode = result.body.code
  let profileData = result.body.profile
  
  // 如果直接获取失败，尝试从data字段获取
  if (!responseCode || responseCode === undefined) {
    responseCode = result.body.data?.code || result.status || -1
    profileData = result.body.data?.profile || result.body.profile
  }
  
  // 规范化返回格式，确保前端能正确识别
  const response = {
    code: responseCode,
    message: result.body.message || (responseCode === 200 ? '已登录' : '未登录'),
    data: {
      profile: profileData || null
    }
  }
  
  // 登录状态可以短时间缓存
  res.setHeader('Cache-Control', 'private, max-age=60')
  res.status(200).json(response)
  
  return {} as any
})

