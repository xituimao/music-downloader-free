/**
 * 首页组件
 * 1. 支持SSR，热门歌单服务端渲染提升SEO
 * 2. 支持按"热门/最新"排序切换
 * 3. Google风格的搜索界面
 */
// Analytics now integrated in _app.tsx
import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { seoHome } from '@/lib/seo'
import { optimizeImageUrl } from '@/lib/url-utils'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import HreflangLinks from '@/components/HreflangLinks'
import Footer from '@/components/Footer'
import type { GetServerSideProps } from 'next'
import { SEO_ROBOTS_META } from '../lib/seo'
import nextI18NextConfig from '../next-i18next.config'

interface HomeProps {
  initialPlaylists: any[]
  initialOrder: 'hot' | 'new'
}

export default function Home({ initialPlaylists, initialOrder }: HomeProps) {
  const { t } = useTranslation(['common', 'home', 'seo'])
  const router = useRouter()
  const locale = router.locale || 'zh'
  const { title, description } = seoHome(locale)
  const [homeSearchInput, setHomeSearchInput] = useState('')
  const [hotPlaylists, setHotPlaylists] = useState<any[]>(initialPlaylists)
  const [order, setOrder] = useState<'hot' | 'new'>(initialOrder)

  /**
   * 客户端排序逻辑
   * 按照指定方式对歌单进行排序
   */
  const sortPlaylists = (playlists: any[], sortOrder: 'hot' | 'new') => {
    const sorted = [...playlists]
    if (sortOrder === 'new') {
      // 按更新时间降序（最新的在前）
      return sorted.sort((a, b) => {
        const aTime = typeof a.updateTime === 'number' ? a.updateTime : new Date(a.updateTime || 0).getTime()
        const bTime = typeof b.updateTime === 'number' ? b.updateTime : new Date(b.updateTime || 0).getTime()
        return bTime - aTime
      })
    } else {
      // 按播放量降序（热门的在前）
      return sorted.sort((a, b) => {
        const aCount = typeof a.playCount === 'number' ? a.playCount : 0
        const bCount = typeof b.playCount === 'number' ? b.playCount : 0
        return bCount - aCount
      })
    }
  }

  /**
   * 切换排序方式
   * 客户端直接排序，无需重新请求API（节省服务端算力）
   */
  const handleOrderChange = (newOrder: 'hot' | 'new') => {
    if (newOrder === order) return
    setOrder(newOrder)
    setHotPlaylists(sortPlaylists(hotPlaylists, newOrder))
  }

  const handleHomeSearch = () => {
    const keywords = homeSearchInput.trim()
    if (!keywords) {
      alert(t('common:error.inputKeyword'))
      return
    }
    router.push(`/search/${encodeURIComponent(keywords)}`)
  }

  const formatPlayCount = (count: number) => {
    const formattedCount = formatPlayCountNumber(count)
    return `${formattedCount} ${t('home:playCount.label')}`
  }

  const formatPlayCountNumber = (count: number) => {
    let formattedCount = ''
    if (count >= 100000000) {
      formattedCount = (count / 100000000).toFixed(1) + t('home:playCount.hundredMillion')
    } else if (count >= 10000) {
      formattedCount = (count / 10000).toFixed(1) + t('home:playCount.tenThousand')
    } else {
      formattedCount = count.toString()
    }
    return `${formattedCount}`
  }

  /**
   * 根据时间戳格式化显示时间
   * 1. 当天显示：小时:分钟
   * 2. 当年显示：日期/月份
   * 3. 跨年显示：月份/年份
   * @param timestamp 时间戳
   * @returns 格式化后的时间字符串
   */
  const formatUpdateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    
    // 判断是否是同一天
    const isSameDay = 
      date.getDate() === now.getDate() && 
      date.getMonth() === now.getMonth() && 
      date.getFullYear() === now.getFullYear()
    
    // 判断是否是同一年
    const isSameYear = date.getFullYear() === now.getFullYear()
    
    if (isSameDay) {
      // 当天显示：小时:分钟
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })
    } else if (isSameYear) {
      // 当年显示：日期/月份
      return date.toLocaleDateString(locale, { day: 'numeric', month: 'numeric' })
    } else {
      // 跨年显示：月份/年份
      return date.toLocaleDateString(locale, { month: 'numeric', year: 'numeric' })
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://musicdownloader.cc/${locale}/`} />
        <HreflangLinks path="/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://musicdownloader.cc/${locale}/`} />
        <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
        <meta name="robots" content={SEO_ROBOTS_META} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: locale === 'zh' ? '音乐下载助手' : 'Music Downloader',
              url: `https://musicdownloader.cc/${locale}/`,
              potentialAction: {
                '@type': 'SearchAction',
                target: `https://musicdownloader.cc/${locale}/search/{search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: locale === 'zh' ? '音乐下载助手' : 'Music Downloader',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web',
              url: `https://musicdownloader.cc/${locale}/`,
              description: description
            })
          }}
        />
      </Head>

      {/* 主页区域（Google风格） */}
      <section id="homePage" className="home-section">
        {/* 语言切换器 */}
        <div style={{ position: 'absolute', top: 24, right: 24 }}>
          <LanguageSwitcher />
        </div>

        {/* 居中搜索框 */}
        <div className="home-search-wrapper">
          <h1 className="home-logo">
            <i className="ri-music-2-fill"></i>
            <span>{t('common:brand')}</span>
          </h1>
          <div className="home-search-box">
            <input
              type="text"
              id="homeSearchInput"
              className="home-search-input"
              placeholder={t('common:search.placeholder')}
              autoComplete="off"
              value={homeSearchInput}
              onChange={(e) => setHomeSearchInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleHomeSearch()
                }
              }}
            />
            <button
              id="homeSearchBtn"
              className="btn btn-circle home-search-btn"
              onClick={handleHomeSearch}
            >
              <i className="ri-search-line"></i>
            </button>
          </div>
        </div>

        {/* 热门推荐歌单 */}
        <div className="home-playlists">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h2 className="home-section-title" style={{ margin: 0 }}>
              <i className="ri-fire-fill"></i>
              <span>{t('home:hotPlaylist.title')}</span>
            </h2>
            {/* 排序切换按钮 */}
            <div className="order-tabs">
              <button 
                className={`order-tab ${order === 'hot' ? 'active' : ''}`}
                onClick={() => handleOrderChange('hot')}
              >
                <i className="ri-fire-fill"></i>
                <span>{t('home:order.hot')}</span>
              </button>
              <button 
                className={`order-tab ${order === 'new' ? 'active' : ''}`}
                onClick={() => handleOrderChange('new')}
              >
                <i className="ri-time-fill"></i>
                <span>{t('home:order.new')}</span>
              </button>
            </div>
          </div>
          <div id="hotPlaylistList" className="hot-playlist-grid">
            {hotPlaylists.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', gridColumn: '1/-1' }}>
                {t('home:noData')}
              </p>
            ) : (
              hotPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="hot-playlist-card"
                  onClick={() => router.push(`/playlist/${playlist.id}`)}
                >
                  <img
                    src={optimizeImageUrl(playlist.coverImgUrl, 300)}
                    alt={playlist.name}
                    loading="lazy"
                  />
                  <div className="hot-playlist-card-title" title={playlist.name}>
                    {playlist.name}
                  </div>
                  <div className="hot-playlist-card-stats">
                    <span className="play-count" title={`${t('home:playCount.fullLabel')}: ${formatPlayCount(playlist.playCount)}`}>
                      <i className="ri-play-circle-fill"></i>
                      {formatPlayCountNumber(playlist.playCount)
                      }
                    </span>
                    <span className="update-time" title={`${t('home:updateTime.fullLabel')}: ${new Date(playlist.updateTime).toLocaleString(locale, { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}>
                      <i className="ri-time-line"></i>
                      {formatUpdateTime(playlist.updateTime)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <Footer />

    </>
  )
}

/**
 * 服务端渲染（SSR）
 * 1. 获取初始热门歌单原始数据
 * 2. 提升首屏渲染速度和SEO效果
 * 3. 排序逻辑由客户端处理，降低服务端负载
 * 4. 使用匿名访问模式（经验证比游客登录更稳定）
 */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale } = ctx as any
  try {
    // 使用ES模块导入（匿名访问模式）
    const { top_playlist } = require('NeteaseCloudMusicApi')
    
    const result = await top_playlist({
      cat: '全部',
      limit: 20,
      offset: 0,
      order: 'hot'
      // 不传cookie，使用匿名访问
    })

    let playlists: any[] = (result?.body as any)?.playlists || []
    
    // 客户端会处理排序，这里返回原始数据即可
    return {
      props: {
        ...(await serverSideTranslations(locale || 'zh', ['common', 'home', 'seo'], nextI18NextConfig as any)),
        initialPlaylists: playlists,
        initialOrder: 'hot' as const
      }
    }
  } catch (error) {
    console.error('获取热门歌单失败:', error)
    // 出错时返回空数据，前端会显示"暂无数据"
    return {
      props: {
        ...(await serverSideTranslations(locale || 'zh', ['common', 'home', 'seo'], nextI18NextConfig as any)),
        initialPlaylists: [],
        initialOrder: 'hot' as const
      }
    }
  }
}
