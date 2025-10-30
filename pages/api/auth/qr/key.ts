import { apiHandler } from '@/lib/api-handler'

/**
 * 生成二维码登录的唯一key
 * 用于创建二维码和后续轮询状态
 */
export default apiHandler({ name: 'QR-Key' }, async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const login_qr_key = require('NeteaseCloudMusicApi/module/login_qr_key.js')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const request = require('NeteaseCloudMusicApi/util/request.js')
  
  const result = await login_qr_key({}, request)
  
  // 二维码key有效期5分钟，禁止缓存
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.status(200).json(result.body)
  
  // 返回空对象，因为已经手动调用了 res.json()
  return {} as any
})

