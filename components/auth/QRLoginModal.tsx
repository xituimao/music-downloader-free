import { useState, useEffect, useRef } from 'react'
import { apiGet, getErrorMessage } from '@/lib/api-client'

interface QRLoginModalProps {
  visible: boolean
  onSuccess: () => void
  onCancel: () => void
}

type LoginState = 'loading' | 'scanning' | 'done'

/**
 * 二维码登录弹窗组件
 * 用于用户下载VIP歌曲时按需触发登录
 */
export default function QRLoginModal({ visible, onSuccess, onCancel }: QRLoginModalProps) {
  const [state, setState] = useState<LoginState>('loading')
  const [qrKey, setQrKey] = useState('')
  const [qrImg, setQrImg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化：获取key并生成二维码
  const initQR = async () => {
    setState('loading')
    setErrorMsg('')
    
    try {
      // 1. 获取key
      const keyData = await apiGet('/api/auth/qr/key', { name: 'QR-Key' })
      
      const key = keyData.data?.unikey
      if (!key) {
        throw new Error('获取key失败：响应格式异常')
      }
      setQrKey(key)
      
      // 2. 生成二维码
      const qrData = await apiGet(`/api/auth/qr/create?key=${key}&qrimg=true`, { 
        name: 'QR-Create' 
      })
      
      if (!qrData.data?.qrimg) {
        throw new Error('生成二维码失败：响应格式异常')
      }
      setQrImg(qrData.data.qrimg)
      setState('scanning')
      
      // 3. 开始轮询状态
      startPolling(key)
    } catch (error: any) {
      setErrorMsg(getErrorMessage(error, '初始化失败'))
      setState('done')
    }
  }

  // 轮询检查扫码状态
  const startPolling = (key: string) => {
    let pollCount = 0
    const maxPolls = 150 // 5分钟（150次 × 2秒）
    
    const poll = async () => {
      try {
        const data = await apiGet(`/api/auth/qr/check?key=${key}`, { 
          name: 'QR-Check',
          logRequest: false,
          logResponse: false
        })
        
        pollCount++
        
        switch (data.code) {
          case 800: // 已过期，自动刷新二维码
            clearPolling()
            initQR()
            break
          case 801: // 等待扫码
            // 继续轮询
            break
          case 802: // 已扫码待确认
            // 继续轮询（可选显示提示）
            break
          case 803: // 登录成功
            clearPolling()
            setState('done')

            console.group('✅ STEP 1: LOGIN SUCCESS (QRLoginModal)')
            console.log('🔍 完整API响应数据:', JSON.stringify(data, null, 2))
            console.log('🔍 data.profile 类型:', typeof data.profile)
            console.log('🔍 data.profile 值:', data.profile)
            console.log('🔍 data.profile 是否为空对象:', JSON.stringify(data.profile) === '{}')

            if (data.profile) {
              const userInfo = {
                nickname: data.profile.nickname,
                avatarUrl: data.profile.avatarUrl,
                userId: data.profile.userId,
              }
              const userString = JSON.stringify(userInfo)
              console.log('💾 Saving to localStorage:', userString)
              localStorage.setItem('NETEASE_USER', userString)

              const verify = localStorage.getItem('NETEASE_USER')
              console.log('🔬 Verifying write from localStorage:', verify)
              if (verify === userString) {
                console.log('✅ localStorage write successful.')
              } else {
                console.error('❌ FATAL: localStorage write FAILED. Data mismatch.')
              }
            } else {
              console.error('❌ FATAL: Login success response, but missing profile data!')
              console.error('🔍 检查其他可能的用户信息字段:')
              console.error('  - data.nickname:', data.nickname)
              console.error('  - data.avatarUrl:', data.avatarUrl)
              console.error('  - data.userId:', data.userId)
              console.error('  - data.account:', data.account)
            }

            if (typeof window !== 'undefined') {
              console.log("🚀 STEP 2: Dispatching global 'login-success' event.")
              window.dispatchEvent(new Event('login-success'))
            }
            console.groupEnd()

            setTimeout(() => {
              onSuccess()
            }, 1500)
            break
          default:
            // 未知状态，继续轮询
            break
        }
        
        // 超时停止轮询
        if (pollCount >= maxPolls) {
          clearPolling()
          setErrorMsg('二维码已过期，请刷新')
          setState('done')
        }
      } catch (error: any) {
        console.error('轮询失败:', getErrorMessage(error))
        // 继续轮询，不中断
      }
    }
    
    // 立即执行一次
    poll()
    
    // 每2秒轮询一次
    timerRef.current = setInterval(poll, 2000)
  }

  // 清除轮询
  const clearPolling = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // 弹窗显示时初始化二维码
  useEffect(() => {
    if (visible) {
      initQR()
    } else {
      clearPolling()
      setState('loading')
      setQrKey('')
      setQrImg('')
      setErrorMsg('')
    }
    
    return () => {
      clearPolling()
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="qr-login-overlay" onClick={onCancel}>
      <div className="qr-login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-login-header">
          <h3>登录网易云音乐</h3>
          <button className="close-btn" onClick={onCancel}>
            <i className="ri-close-line"></i>
          </button>
        </div>
        
        <div className="qr-login-body">
          {state === 'loading' && (
            <div className="qr-loading">
              <i className="ri-loader-4-line spin"></i>
              <p>加载中...</p>
            </div>
          )}
          
          {state === 'scanning' && qrImg && (
            <div className="qr-content">
              <img src={qrImg} alt="登录二维码" className="qr-image" />
              <p className="qr-tip">
                <i className="ri-scan-line"></i>
                请使用网易云音乐APP扫描二维码
              </p>
            </div>
          )}
          
          {state === 'done' && !errorMsg && (
            <div className="qr-success">
              <i className="ri-checkbox-circle-fill success-icon"></i>
              <p className="success-text">登录成功！</p>
              <p className="success-tip">正在为你准备...</p>
            </div>
          )}
          
          {errorMsg && (
            <div className="qr-error">
              <i className="ri-error-warning-fill"></i>
              <p>{errorMsg}</p>
              <button className="btn" onClick={initQR}>
                重新获取二维码
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .qr-login-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        
        .qr-login-modal {
          background: #1e1e1e;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .qr-login-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .qr-login-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: #999;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        
        .qr-login-body {
          padding: 32px 24px;
          min-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .qr-loading,
        .qr-success,
        .qr-error {
          text-align: center;
          color: #fff;
        }
        
        .qr-loading i,
        .qr-success i,
        .qr-error i {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }
        
        .qr-loading i {
          color: #1db954;
        }
        
        .qr-success i {
          color: #1db954;
        }
        
        .success-icon {
          animation: successPop 0.5s ease-out;
        }
        
        @keyframes successPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .success-text {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .success-tip {
          font-size: 14px;
          color: #999;
          margin: 0;
        }
        
        .qr-error i {
          color: #f44336;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .qr-content {
          text-align: center;
        }
        
        .qr-image {
          width: 240px;
          height: 240px;
          border-radius: 8px;
          background: #fff;
          padding: 12px;
          margin-bottom: 16px;
        }
        
        .qr-tip {
          color: #b3b3b3;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .qr-tip i {
          font-size: 18px;
        }
        
        .qr-error .btn {
          margin-top: 16px;
          background: #1db954;
          color: #fff;
          border: none;
          padding: 10px 24px;
          border-radius: 24px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .qr-error .btn:hover {
          background: #1ed760;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}

