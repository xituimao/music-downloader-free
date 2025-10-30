import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * 根据key生成二维码
 * @param key 必需，从 /api/auth/qr/key 获取
 * @param qrimg 可选，是否返回base64图片（默认true）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key, qrimg = 'true' } = req.query
  
  if (!key) {
    return res.status(400).json({ code: 400, message: '缺少key参数' })
  }
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const login_qr_create = require('NeteaseCloudMusicApi/module/login_qr_create.js')
    
    const result = await login_qr_create({ 
      key: String(key),
      qrimg: qrimg === 'true'
    })
    
    // 禁止缓存
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.status(200).json(result.body)
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || '生成二维码失败' })
  }
}

