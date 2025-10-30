import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

/**
 * 检查二维码扫描状态
 * @param key 必需，二维码key
 * @returns 
 *   800: 二维码已过期
 *   801: 等待扫码
 *   802: 待确认（已扫码未授权）
 *   803: 授权登录成功（下发cookie）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query
  
  if (!key) {
    return res.status(400).json({ code: 400, message: '缺少key参数' })
  }
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const login_qr_check = require('NeteaseCloudMusicApi/module/login_qr_check.js')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const request = require('NeteaseCloudMusicApi/util/request.js')
    
    const result = await login_qr_check({ key: String(key) }, request)
    
    // 🔍 详细调试：打印完整API返回结构
    console.log('🔍 [QR Check] 完整API返回结构:')
    console.log('  - result.status:', result.status)
    console.log('  - result.body:', JSON.stringify(result.body, null, 2))
    console.log('  - result.cookie:', result.cookie)
    
    // 在802阶段（授权中）就返回用户信息给前端
    if (result.body.code === 802) {
      console.log('🔍 [QR Check] 802阶段 - 返回用户信息')
      console.log('  - nickname:', result.body.nickname)
      console.log('  - avatarUrl:', result.body.avatarUrl)
      
      // 将用户信息保存到响应中
      result.body.profile = {
        nickname: result.body.nickname || '',
        avatarUrl: result.body.avatarUrl || '',
        userId: result.body.userId || null,
      }
    }
    
    // 如果登录成功（code=803），提取关键Cookie字段
    if (result.body.code === 803 && result.body.cookie) {
      const fullCookie = result.body.cookie
      
      console.log('✅ 登录成功，原始Cookie长度:', fullCookie.length)
      
      // 提取关键字段：MUSIC_U（用户token）和 MUSIC_A（账号信息）
      // 网易云API只需要这两个字段即可完成鉴权
      const musicU = fullCookie.match(/MUSIC_U=([^;]+)/)?.[1]
      const musicA = fullCookie.match(/MUSIC_A=([^;]+)/)?.[1]
      
      if (!musicU) {
        console.error('❌ 未找到MUSIC_U字段')
        return res.status(500).json({ code: 500, message: '登录失败：无效的Cookie' })
      }
      
      // 重新构建精简Cookie（只保留必要字段）
      const essentialCookie = `MUSIC_U=${musicU}${musicA ? `; MUSIC_A=${musicA}` : ''}`
      console.log('✅ 精简后Cookie长度:', essentialCookie.length)
      
      // 设置httpOnly cookie（防止XSS攻击）
      res.setHeader('Set-Cookie', serialize('NETEASE_MUSIC_COOKIE', essentialCookie, {
        httpOnly: true,
        secure: true, // HTTPS环境
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30天
        path: '/'
      }))
      
      // 803阶段：主动获取用户信息
      console.log('🔍 [QR Check] 803阶段 - 主动获取用户信息')
      
      try {
        // 使用刚获取的Cookie调用用户信息接口
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const login_status = require('NeteaseCloudMusicApi/module/login_status.js')
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const request = require('NeteaseCloudMusicApi/util/request.js')
        
        const userInfoResult = await login_status({ cookie: essentialCookie }, request)
        console.log('🔍 [QR Check] 用户信息接口返回:', JSON.stringify(userInfoResult.body, null, 2))
        
        // 兼容两种返回格式：直接结构和嵌套data结构
        const profileData = userInfoResult.body.data?.profile || userInfoResult.body.profile
        const accountData = userInfoResult.body.data?.account || userInfoResult.body.account
        const responseCode = userInfoResult.body.data?.code || userInfoResult.body.code
        
        if (responseCode === 200 && profileData) {
          result.body.profile = {
            nickname: profileData.nickname || '',
            avatarUrl: profileData.avatarUrl || '',
            userId: profileData.userId || accountData?.id || null,
          }
          console.log('✅ [QR Check] 成功获取用户信息:', result.body.profile)
        } else {
          console.log('⚠️ [QR Check] 用户信息接口返回异常，使用兜底方案')
          console.log('  - responseCode:', responseCode)
          console.log('  - profileData:', profileData)
          result.body.profile = {
            nickname: '',
            avatarUrl: '',
            userId: null,
          }
        }
      } catch (e: any) {
        console.error('❌ [QR Check] 获取用户信息失败:', e.message)
        result.body.profile = {
          nickname: '',
          avatarUrl: '',
          userId: null,
        }
      }
      
      // 从响应体中移除敏感cookie信息
      delete result.body.cookie
    }
    
    // 禁止缓存
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    
    // 🔍 最终响应调试
    console.log('🔍 [QR Check] 最终响应数据:', JSON.stringify(result.body, null, 2))
    res.status(200).json(result.body)
  } catch (e: any) {
    res.status(500).json({ code: 500, message: e?.message || '检查状态失败' })
  }
}

