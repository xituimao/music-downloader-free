import { apiHandler, validateParam, getOptionalParam } from '@/lib/api-handler'

/**
 * 根据key生成二维码
 * @param key 必需，从 /api/auth/qr/key 获取
 * @param qrimg 可选，是否返回base64图片（默认true）
 */
export default apiHandler({ name: 'QR-Create' }, async (req, res) => {
  const key = validateParam(req.query.key, 'key', '缺少key参数')
  const qrimg = getOptionalParam(req.query.qrimg, 'true')
  
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const login_qr_create = require('NeteaseCloudMusicApi/module/login_qr_create.js')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const request = require('NeteaseCloudMusicApi/util/request.js')
  
  const result = await login_qr_create({ 
    key,
    qrimg: qrimg === 'true'
  }, request)
  
  // 禁止缓存
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.status(200).json(result.body)
  
  return {} as any
})

