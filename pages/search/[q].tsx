import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { seoSearch, SEO_ROBOTS_META } from '@/lib/seo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import HreflangLinks from '@/components/HreflangLinks'
import Footer from '@/components/Footer'

type Playlist = {
  id: number
  name: string
  coverImgUrl?: string
  trackCount?: number
  creator?: { nickname?: string }
  playCount?: number
}

export default function SearchPage({ q, playlists }: { q: string; playlists: Playlist[] }) {
  const { t } = useTranslation(['common', 'search', 'seo'])
  const router = useRouter()
  const locale = router.locale || 'zh'
  const { title, description } = seoSearch(q, locale)

  useEffect(() => {
    if (!(globalThis as any).dataLayer) (globalThis as any).dataLayer = []
    ;(globalThis as any).dataLayer.push({ event: 'search_submit', q })
  }, [q])

  const optimizeImageUrl = (url: string, size = 300) => {
    if (!url) return ''
    return `${url}?param=${size}y${size}`
  }

  const formatPlayCount = (count: number) => {
    if (count >= 100000000) {
      return (count / 100000000).toFixed(1) + '亿'
    } else if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万'
    } else {
      return count.toString()
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://www.musicdownloader.cc/${locale}/search/${encodeURIComponent(q)}`} />
        <HreflangLinks path={`/search/${encodeURIComponent(q)}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://www.musicdownloader.cc/${locale}/search/${encodeURIComponent(q)}`} />
        <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
        <meta name="robots" content="noindex, follow" />
      </Head>

      {/* 顶部导航栏 */}
      <nav className="top-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <a href="/" className="logo-link">
              <i className="ri-music-2-fill logo-icon"></i>
              <span className="brand-name">{t('common:brand')}</span>
            </a>
          </div>
          <div className="navbar-search">
            <input
              type="text"
              id="searchInput"
              className="search-input"
              placeholder={t('common:search.placeholder')}
              autoComplete="off"
              defaultValue={q}
            />
            <button id="searchBtn" className="btn btn-primary">
              {t('common:search.button')}
            </button>
          </div>
          <div style={{ marginLeft: 16 }}>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* 主要内容区 */}
      <main className="container">
        <section id="searchResults" className="results-section">
          <h2>{t('search:results.title')}</h2>
          <div id="playlistList" className="playlist-list">
            {playlists.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999' }}>{t('common:noResults')}</p>
            ) : (
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="playlist-card"
                  onClick={() => router.push(`/playlist/${playlist.id}`)}
                >
                  <img
                    src={optimizeImageUrl(playlist.coverImgUrl, 300)}
                    alt={playlist.name}
                    width={300}
                    height={300}
                    loading="lazy"
                  />
                  <div className="playlist-card-body">
                    <h3 title={playlist.name}>{playlist.name}</h3>
                    <p className="creator">{t('search:playlist.by')} {playlist.creator?.nickname || t('search:playlist.unknown')}</p>
                    <div className="playlist-stats">
                      <span className="track-count">{t('search:playlist.songCount', { count: playlist.trackCount })}</span>
                      {playlist.playCount && (
                        <span className="play-count" title="播放量">
                          <i className="ri-play-circle-fill"></i>
                          {formatPlayCount(playlist.playCount)} {t('search:playlist.playCount')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const q = String(ctx.params?.q || '')
  const locale = ctx.locale || 'zh'
  try {
    // SSR直接调用API，避免HTTP请求
    const { cloudsearch } = require('NeteaseCloudMusicApi')
    const result = await cloudsearch({ keywords: q, type: 1000, limit: 30 })
    const playlists: Playlist[] = result?.body?.result?.playlists || []
    return { 
      props: { 
        q, 
        playlists,
        ...(await serverSideTranslations(locale, ['common', 'search', 'seo']))
      } 
    }
  } catch (e) {
    return { 
      props: { 
        q, 
        playlists: [],
        ...(await serverSideTranslations(locale, ['common', 'search', 'seo']))
      } 
    }
  }
}
