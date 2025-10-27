/**
 * 语言切换器组件
 * 支持中英文切换，样式保持 Spotify 风格
 */
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function LanguageSwitcher() {
  const router = useRouter()
  const { locale, asPath } = router
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ]

  const currentLang = languages.find(lang => lang.code === locale) || languages[0]

  const switchLanguage = (newLocale: string) => {
    setIsOpen(false)
    router.push(asPath, asPath, { locale: newLocale })
  }

  return (
    <div className="language-switcher">
      <button 
        className="lang-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch language"
      >
        <span className="lang-flag">{currentLang.flag}</span>
        <span className="lang-name">{currentLang.name}</span>
        <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line`}></i>
      </button>

      {isOpen && (
        <>
          <div className="lang-overlay" onClick={() => setIsOpen(false)} />
          <div className="lang-menu">
            {languages.map(lang => (
              <button
                key={lang.code}
                className={`lang-item ${locale === lang.code ? 'active' : ''}`}
                onClick={() => switchLanguage(lang.code)}
              >
                <span className="lang-flag">{lang.flag}</span>
                <span className="lang-name">{lang.name}</span>
                {locale === lang.code && <i className="ri-check-line"></i>}
              </button>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .language-switcher {
          position: relative;
          z-index: 100;
        }

        .lang-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lang-btn:hover {
          border-color: var(--spotify-green);
          background: rgba(29, 185, 84, 0.1);
        }

        .lang-flag {
          font-size: 18px;
          line-height: 1;
        }

        .lang-name {
          font-weight: 500;
        }

        .lang-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99;
        }

        .lang-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 160px;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          z-index: 100;
        }

        .lang-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }

        .lang-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .lang-item.active {
          background: rgba(29, 185, 84, 0.15);
          color: var(--spotify-green);
          font-weight: 600;
        }

        .lang-item .ri-check-line {
          margin-left: auto;
          color: var(--spotify-green);
        }

        @media (max-width: 768px) {
          .lang-btn .lang-name {
            display: none;
          }
          
          .lang-menu {
            right: -8px;
          }
        }
      `}</style>
    </div>
  )
}

