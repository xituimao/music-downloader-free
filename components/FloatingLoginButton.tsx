import { useState, useEffect } from 'react'
import QRLoginModal from './auth/QRLoginModal'

/**
 * 悬浮登录按钮组件
 * 固定在页面右下角，显示登录状态和触发登录弹窗
 */
export default function FloatingLoginButton() {
  const [user, setUser] = useState<{ nickname: string; avatarUrl: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [hasPlayer, setHasPlayer] = useState(false)

  console.log('🔄 [FloatingLoginButton] Component rendered. Current user state:', user)

  const restoreUserFromStorage = () => {
    console.group('STEP 4: RESTORE USER (FloatingLoginButton)')
    try {
      const stored = localStorage.getItem('NETEASE_USER')
      console.log('📄 Value read from localStorage:', stored)
      if (stored) {
        const userInfo = JSON.parse(stored)
        console.log('🧠 Parsed user info:', userInfo)
        console.log('🚀 Calling setUser to update UI with:', userInfo)
        setUser(userInfo)
        console.groupEnd()
        return true
      } else {
        console.log('🤷 No user info found in localStorage.')
        setUser(null)
      }
    } catch (e) {
      console.error('❌ FATAL: Failed to parse or set user from localStorage:', e)
    }
    console.groupEnd()
    return false
  }

  // 智能检测播放器是否存在
  useEffect(() => {
    const checkPlayer = () => {
      const playerBar = document.querySelector('.player-bar')
      setHasPlayer(!!playerBar)
    }
    
    // 初始检测
    checkPlayer()
    
    // 监听DOM变化（播放器可能动态加载）
    const observer = new MutationObserver(checkPlayer)
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    })
    
    return () => observer.disconnect()
  }, [])

  // 组件挂载时从localStorage恢复用户
  useEffect(() => {
    console.log('🚀 [FloatingLoginButton] Component did mount, attempting initial restore.')
    restoreUserFromStorage()
  }, [])

  // 🔔 监听全局登录成功事件
  useEffect(() => {
    const handleLoginSuccess = () => {
      console.log("🔔 STEP 3: Global 'login-success' event received.")
      setTimeout(() => {
        restoreUserFromStorage()
      }, 100)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('login-success', handleLoginSuccess)
      return () => window.removeEventListener('login-success', handleLoginSuccess)
    }
  }, [])

  // 登录成功回调（来自 QRLoginModal 的 onSuccess）
  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    console.log('✅ 关闭登录弹窗')
  }

  // 退出登录
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      
      // 清除localStorage中的用户信息
      localStorage.removeItem('NETEASE_USER')
      console.log('✅ 已退出登录，清除本地用户信息')
      
      setUser(null)
      setShowMenu(false)
    } catch (e) {
      console.error('❌ 退出登录失败:', e)
    }
  }

  if (isLoading) {
    return null // 加载中不显示按钮
  }

  return (
    <>
      {/* 登录弹窗 */}
      <QRLoginModal
        visible={showLoginModal}
        onSuccess={handleLoginSuccess}
        onCancel={() => setShowLoginModal(false)}
      />

      {/* 悬浮按钮 */}
      <div className="floating-login-container">
        {user ? (
          // 已登录：显示头像
          <div className="floating-login-btn logged-in" onClick={() => setShowMenu(!showMenu)}>
            <img src={user.avatarUrl} alt={user.nickname} className="avatar" />
            <div className="glow"></div>
          </div>
        ) : (
          // 未登录：显示账号圈图标
          <div className="floating-login-btn" onClick={() => setShowLoginModal(true)}>
            <i className="ri-account-circle-line"></i>
            <div className="glow"></div>
          </div>
        )}

        {/* 已登录菜单 */}
        {showMenu && user && (
          <div className="login-menu">
            <div className="menu-header">
              <img src={user.avatarUrl} alt={user.nickname} className="menu-avatar" />
              <div className="menu-info">
                <div className="menu-nickname">{user.nickname}</div>
                <div className="menu-status">已登录</div>
              </div>
            </div>
            <div className="menu-divider"></div>
            <button className="menu-item logout" onClick={handleLogout}>
              <i className="ri-logout-box-line"></i>
              退出登录
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .floating-login-container {
          position: fixed;
          bottom: ${hasPlayer ? '120px' : '32px'}; /* 智能躲避：有播放器时120px，无则32px */
          right: 32px;
          z-index: 9998;
          transition: bottom 0.3s ease;
        }

        .floating-login-btn {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(29, 185, 84, 0.5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .floating-login-btn:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 32px rgba(29, 185, 84, 0.7);
        }

        .floating-login-btn:active {
          transform: translateY(-2px) scale(1.02);
        }

        .floating-login-btn i {
          font-size: 28px;
          color: #fff;
          z-index: 2;
        }

        .floating-login-btn.logged-in {
          background: linear-gradient(135deg, #1ed760 0%, #17c653 100%);
          box-shadow: 0 4px 16px rgba(30, 215, 96, 0.5);
        }

        .floating-login-btn.logged-in:hover {
          box-shadow: 0 8px 32px rgba(30, 215, 96, 0.7);
        }

        .avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          z-index: 2;
        }

        /* 光晕效果 */
        .glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
          animation: pulse 2s ease-in-out infinite;
          z-index: 1;
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.4;
          }
        }

        /* 登录菜单 */
        .login-menu {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 240px;
          background: #1e1e1e;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          padding: 16px;
          animation: slideUp 0.2s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .menu-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .menu-info {
          flex: 1;
        }

        .menu-nickname {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .menu-status {
          font-size: 12px;
          color: #1db954;
        }

        .menu-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 12px 0;
        }

        .menu-item {
          width: 100%;
          padding: 10px 12px;
          background: none;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s;
        }

        .menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .menu-item i {
          font-size: 18px;
        }

        .menu-item.logout {
          color: #f44336;
        }

        .menu-item.logout:hover {
          background: rgba(244, 67, 54, 0.1);
        }

        /* 移动端适配 */
        @media (max-width: 768px) {
          .floating-login-container {
            bottom: ${hasPlayer ? '80px' : '24px'}; /* 智能躲避：有播放器时80px，无则24px */
            right: 20px;
          }

          .floating-login-btn {
            width: 48px;
            height: 48px;
          }

          .floating-login-btn i {
            font-size: 24px;
          }

          .login-menu {
            bottom: 60px;
            width: 200px;
          }
        }
      `}</style>
    </>
  )
}

