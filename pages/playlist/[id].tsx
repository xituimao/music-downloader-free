import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SEO_ROBOTS_META } from '@/lib/seo'
import { optimizeImageUrl, ensureHttps } from '@/lib/url-utils'
import { apiGet, getErrorMessage } from '@/lib/api-client'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import HreflangLinks from '@/components/HreflangLinks'
import Footer from '@/components/Footer'
import QRLoginModal from '@/components/auth/QRLoginModal'
import { playlist_detail } from 'NeteaseCloudMusicApi'
import nextI18NextConfig from '@/next-i18next.config'

type Song = {
  id: number
  name: string
  ar?: Array<{ name: string }>
  al?: { picUrl?: string }
  dt: number
  fee?: number
}

type Playlist = {
  id: number
  name: string
  description?: string
  coverImgUrl?: string
  creator?: { nickname?: string }
  tracks?: Song[]
  playCount?: number
  updateTime?: number
}

export default function PlaylistPage({ playlist, totalTracks }: { playlist: Playlist | null, totalTracks: number }) {
  const { t } = useTranslation(['common', 'playlist', 'seo'])
  const router = useRouter()
  const locale = router.locale || 'zh'
  const [selectedSongs, setSelectedSongs] = useState<Set<number>>(new Set())
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 })
  
  // 下载状态跟踪：正在下载的歌曲ID和已完成的歌曲ID集合
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  
  // 登录弹窗状态
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [pendingDownload, setPendingDownload] = useState(false)
  
  // 播放器状态
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [prevVolume, setPrevVolume] = useState(0.8)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // 客户端加载更多歌曲的状态
  const [allTracks, setAllTracks] = useState<Song[]>(playlist?.tracks || [])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasLoadedAll, setHasLoadedAll] = useState(false)

  if (!playlist) {
    return (
      <main style={{ padding: 24, textAlign: 'center' }}>
        <p>{t('common:error.loadFailed')}</p>
        <button onClick={() => router.back()}>{t('common:error.goBack')}</button>
      </main>
    )
  }

  const count = allTracks.length
  // SEO 描述优先使用真实歌单简介，缺失时再回退到模板文案
  const title = t('seo:playlist.title', { name: playlist.name, count })
  const translatedDescription = t('seo:playlist.description', { name: playlist.name, count })
  const description = (playlist.description || '').trim() || translatedDescription
  const keywords = t('seo:playlist.keywords', { name: playlist.name, count })

  useEffect(() => {
    if (!(globalThis as any).dataLayer) (globalThis as any).dataLayer = []
    ;(globalThis as any).dataLayer.push({
      event: 'playlist_view',
      playlist_id: playlist.id,
      playlist_name: playlist.name
    })
  }, [playlist.id, playlist.name])

  // 设置初始音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [])

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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

  const isVipSong = (song: Song) => {
    return song.fee === 1 || song.fee === 4
  }

  const getFeeTypeText = (fee?: number) => {
    const feeMap: Record<number, string> = { 
      0: '', 
      1: t('playlist:fee.vip'), 
      4: t('playlist:fee.paid'), 
      8: t('playlist:fee.trial') 
    }
    return feeMap[fee || 0] || ''
  }

  // 加载更多歌曲
  const loadMoreTracks = async () => {
    if (isLoadingMore || hasLoadedAll || !playlist) return
    
    setIsLoadingMore(true)
    try {
      const data = await apiGet(`/api/playlist/detail?id=${playlist.id}`, {
        name: 'LoadFullPlaylist',
        logResponse: false
      })
      
      if (data.code === 200 && data.playlist?.tracks) {
        setAllTracks(data.playlist.tracks)
        setHasLoadedAll(true)
      }
    } catch (error) {
      console.error('加载更多歌曲失败:', getErrorMessage(error))
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleSelectAll = () => {
    const allIds = new Set(allTracks.map(s => s.id))
    setSelectedSongs(allIds)
  }

  const handleDeselectAll = () => {
    setSelectedSongs(new Set())
  }

  const toggleSongSelect = (songId: number) => {
    const newSet = new Set(selectedSongs)
    if (newSet.has(songId)) {
      newSet.delete(songId)
    } else {
      newSet.add(songId)
    }
    setSelectedSongs(newSet)
  }

  const handleDownload = async () => {
    if (selectedSongs.size === 0) {
      alert(t('common:error.selectSongsFirst'))
      return
    }
    if (isDownloading) {
      alert(t('common:error.downloadInProgress'))
      return
    }

    // ⭐ 关键修改：前置jszip检测，避免浪费服务端算力
    const JSZip = (window as any).JSZip
    if (!JSZip) {
      alert(t('common:error.jszipNotLoaded'))
      return
    }

    const selectedSongList = allTracks.filter(s => selectedSongs.has(s.id))
    const vipSongs = selectedSongList.filter(isVipSong)

    // 如果有VIP歌曲，检查登录状态
    if (vipSongs.length > 0) {
      try {
        const statusData = await apiGet('/api/auth/status', { 
          name: 'CheckAuthStatus',
          logRequest: false,
          logResponse: false
        })
        
        // 未登录，弹出登录提示
        if (statusData.code !== 200 || !statusData.data?.profile) {
          const confirmMsg = `${t('playlist:vipWarning.title', { count: vipSongs.length })}

检测到 ${vipSongs.length} 首VIP歌曲。

登录网易云账号后可下载完整版，是否立即登录？`
          if (confirm(confirmMsg)) {
            setPendingDownload(true)
            setShowLoginModal(true)
            return
          }
          // 用户选择不登录，提示仅下载试听版
          if (!confirm('未登录将只能下载30秒试听版，是否继续？')) {
            return
          }
        } else {
          // 已登录，仅提示VIP歌曲数量
          const confirmMsg = `${t('playlist:vipWarning.title', { count: vipSongs.length })}\n\n已登录，将尝试下载完整版。`
          console.log(confirmMsg)
        }
      } catch (e) {
        console.error('检查登录状态失败:', e)
        // 检查失败，继续下载（降级处理）
      }
    }

    // 重置下载状态
    setIsDownloading(true)
    setCompletedIds(new Set())
    setDownloadingId(null)

    try {
      const songIds = Array.from(selectedSongs)
      
      // ⭐ 关键修改：批量请求优化
      // 原来 batchSize = 1（一次只获取1首），现在改为50（一次获取50首）
      // 这样可以大幅减少请求次数和服务端压力
      // NeteaseCloudMusicApi 的 song_url_v1 完全支持批量获取
      const songUrls: any[] = []
      const batchSize = 50 // 每批请求50首歌曲
      
      for (let i = 0; i < songIds.length; i += batchSize) {
        const batchIds = songIds.slice(i, i + batchSize)
        try {
          const batchData = await apiGet(`/api/song/url?ids=${batchIds.join(',')}&level=exhigh`, {
            name: `GetSongUrl-Batch${Math.floor(i / batchSize) + 1}`,
            logRequest: false,
            logResponse: false
          })
          if (batchData.data && batchData.data.length > 0) {
            songUrls.push(...batchData.data)
          }
        } catch (error) {
          console.error(`获取歌曲URL批次 ${Math.floor(i / batchSize) + 1} 失败:`, getErrorMessage(error))
        }
      }
      
      // 过滤有效的URL，确保URL不为空且格式正确
      const validSongUrls = songUrls.filter((item: any) => {
        return item.url && 
               item.url !== 'null' && 
               item.url !== 'undefined' && 
               (item.url.startsWith('http://') || item.url.startsWith('https://')) &&
               item.url.length > 10
      })
      
      console.log(`获取到 ${songUrls.length} 个URL，其中 ${validSongUrls.length} 个有效`)
      
      const urlMap = new Map(validSongUrls.map((item: any) => [item.id, item.url]))

      const songs = selectedSongList
        .filter(s => urlMap.has(s.id))
        .map(s => ({
          id: s.id,
          url: urlMap.get(s.id) as string,
          filename: sanitizeFilename(`${s.ar?.map(a => a.name).join(', ') || t('playlist:player.unknown')} - ${s.name}.mp3`),
          name: s.name,
          isVip: isVipSong(s)
        }))

      if (songs.length === 0) {
        alert(t('common:error.noDownloadableSongs'))
        setIsDownloading(false)
        return
      }

      // ⭐ jszip检测已经前置到函数开始，这里无需再检查
      const zip = new JSZip()
      let successCount = 0
      let failCount = 0

      for (let i = 0; i < songs.length; i++) {
        const song = songs[i]
        setDownloadProgress({ current: i + 1, total: songs.length })
        setDownloadingId(song.id) // 标记当前正在下载的歌曲
        
        // 增加日志便于调试
        console.log(`开始下载第 ${i+1}/${songs.length} 首: ${song.name} (${song.id})`)

        try {
          // 验证URL是否有效
          if (!song.url || song.url === 'null' || song.url === 'undefined') {
            throw new Error('歌曲URL无效')
          }
          
          // 确保使用HTTPS协议，避免Mixed Content错误
          const httpsUrl = song.url.replace(/^http:/, 'https:')
          console.log(`正在下载: ${song.name} - URL: ${httpsUrl}`)
          
          const response = await fetch(httpsUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const blob = await response.blob()
          
          // 检查blob是否有效
          if (blob.size === 0) {
            throw new Error('下载的文件为空')
          }
          
          zip.file(song.filename, blob)
          
          // 标记为已完成
          setCompletedIds(prev => new Set([...Array.from(prev), song.id]))
          successCount++
          console.log(`✓ 下载成功: ${song.name}`)
        } catch (error: any) {
          console.error(`✗ 下载失败: ${song.name}`, error.message)
          failCount++
        }
        
        setDownloadingId(null) // 清除正在下载标记
      }

      if (successCount === 0) {
        alert(t('common:error.allDownloadsFailed'))
        return
      }

      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 5 } })
      const zipFilename = `${playlist.name}-${Date.now()}.zip`
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = zipFilename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      // 将打包完成的详细信息增加到提示中
      const detailMsg = `选中: ${selectedSongs.size} 首, 得到URL: ${songs.length} 首, 打包成功: ${successCount} 首`
      console.log(detailMsg) // 同时输出到控制台便于调试
      alert(t('playlist:alert.packagingComplete', { success: successCount, fail: failCount }))
      
      // 全部完成后重置状态
      setCompletedIds(new Set())
    } catch (error: any) {
      alert(t('playlist:alert.downloadFailed', { message: error.message }))
    } finally {
      setIsDownloading(false)
      setDownloadingId(null)
    }
  }

  const sanitizeFilename = (filename: string) => {
    return filename.replace(/[/\\:*?"<>|]/g, '_')
  }

  const playSongAtIndex = async (index: number) => {
    if (index < 0 || index >= allTracks.length) {
      console.error('播放索引超出范围')
      return
    }

    const song = allTracks[index]

    try {
      const urlData = await apiGet(`/api/song/url?ids=${song.id}&level=exhigh`, {
        name: 'GetSongUrl-Play',
        logRequest: false,
        logResponse: false
      })
      const songUrl = urlData.data?.[0]?.url
      if (!songUrl) {
        alert(t('playlist:player.cannotPlay', { name: song.name }))
        return
      }

      setCurrentSong(song)
      setCurrentIndex(index)

      if (audioRef.current) {
        // 确保使用HTTPS协议，避免Mixed Content警告
        audioRef.current.src = ensureHttps(songUrl)
        audioRef.current.play()
      }

      if (isVipSong(song)) {
        console.log(`🎵 正在播放VIP歌曲试听版：${song.name}`)
      }
    } catch (error) {
      alert(t('playlist:player.playFailed'))
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const playPrev = () => {
    if (currentIndex > 0) {
      playSongAtIndex(currentIndex - 1)
    } else {
      alert(t('playlist:player.alreadyFirst'))
    }
  }

  const playNext = () => {
    if (currentIndex < allTracks.length - 1) {
      playSongAtIndex(currentIndex + 1)
    } else {
      alert(t('playlist:player.alreadyLast'))
    }
  }

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    setCurrentSong(null)
    setCurrentIndex(-1)
    setIsPlaying(false)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume)
      setVolume(0)
      if (audioRef.current) {
        audioRef.current.volume = 0
      }
    } else {
      setVolume(prevVolume)
      if (audioRef.current) {
        audioRef.current.volume = prevVolume
      }
    }
  }

  const getVolumeIcon = () => {
    if (volume === 0) return 'ri-volume-mute-line'
    if (volume < 0.5) return 'ri-volume-down-line'
    return 'ri-volume-up-line'
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const progress = parseFloat(e.target.value)
    if (audioRef.current && duration > 0) {
      const time = (progress / 100) * duration
      audioRef.current.currentTime = time
    }
  }

  // 登录成功后的回调
  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    
    // 显示成功提示
    alert('✅ 登录成功！现在可以下载VIP歌曲完整版了')
    
    if (pendingDownload) {
      setPendingDownload(false)
      // 登录成功，自动重试下载
      setTimeout(() => {
        handleDownload()
      }, 300)
    }
  }

  return (
    <>
      {/* 登录弹窗 */}
      <QRLoginModal
        visible={showLoginModal}
        onSuccess={handleLoginSuccess}
        onCancel={() => {
          setShowLoginModal(false)
          setPendingDownload(false)
        }}
      />
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={`https://www.musicdownloader.cc/${locale}/playlist/${playlist.id}`} />
        <HreflangLinks path={`/playlist/${playlist.id}`} />
        <meta property="og:type" content="music.playlist" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://www.musicdownloader.cc/${locale}/playlist/${playlist.id}`} />
        <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
        {playlist.coverImgUrl && (
          <meta property="og:image" content={optimizeImageUrl(playlist.coverImgUrl, 800)} />
        )}
        <meta name="robots" content={SEO_ROBOTS_META} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MusicPlaylist',
              name: playlist.name,
              description: playlist.description || undefined,
              numTracks: count,
              track: (playlist.tracks || []).slice(0, 10).map((s, i) => ({
                '@type': 'MusicRecording',
                name: s.name,
                position: i + 1
              }))
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: locale === 'zh' ? '首页' : 'Home',
                  item: `https://www.musicdownloader.cc/${locale}/`
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: playlist.name,
                  item: `https://www.musicdownloader.cc/${locale}/playlist/${playlist.id}`
                }
              ]
            })
          }}
        />
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
          <div style={{ marginLeft: 'auto' }}>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* 主要内容区 */}
      <main className="container">
        <section id="playlistDetail" className="detail-section">
          {/* Spotify风格头部 */}
          <div className="detail-hero">
            <div
              id="playlistHeroBg"
              className="hero-bg"
              style={{ backgroundImage: `url(${optimizeImageUrl(playlist.coverImgUrl, 800)})` }}
            ></div>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <button className="btn btn-back" onClick={() => router.back()}>
                <i className="ri-arrow-left-line"></i>
                <span>{t('playlist:detail.back')}</span>
              </button>
              <div className="hero-info">
                <img
                  className="hero-cover"
                  src={optimizeImageUrl(playlist.coverImgUrl, 400)}
                  alt={t('playlist:detail.coverAlt')}
                  width={400}
                  height={400}
                />
                <div className="hero-meta">
                  <p className="hero-label">{t('playlist:detail.playlistLabel')}</p>
                  <h1 className="hero-title">{playlist.name}</h1>
                  <p className="hero-desc">{playlist.description || ''}</p>
                  <div className="hero-stats">
                    <span className="creator-name">{playlist.creator?.nickname || t('playlist:player.unknown')}</span>
                    <span className="separator">•</span>
                    <span className="track-count">{t('search:playlist.songCount', { count })}</span>
                    {playlist.playCount && (
                      <>
                        <span className="separator">•</span>
                        <span className="play-count" title="播放量">
                          <i className="ri-play-circle-fill"></i>
                          {formatPlayCount(playlist.playCount || 0)} {t('playlist:detail.playCount')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作栏 */}
          <div className="detail-actions">
            <div className="actions-left">
              <button className="btn btn-secondary" onClick={handleSelectAll}>
                {t('playlist:actions.selectAll')}
              </button>
              {selectedSongs.size > 0 && (
                <button className="btn btn-secondary" onClick={handleDeselectAll}>
                  {t('playlist:actions.deselectAll')}
                </button>
              )}
            </div>
            {/* 下载按钮：下载中时显示进度文字+loading动画 */}
            {isDownloading ? (
              <div className="download-status">
                <i className="ri-loader-4-line download-spinner"></i>
                <span>{t('playlist:download.progress', { current: downloadProgress.current, total: downloadProgress.total })}</span>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                style={{position:"relative"} as React.CSSProperties}
                onClick={handleDownload}
                disabled={selectedSongs.size === 0}
              >
                <i className="ri-download-line"></i>
                <span>{t('playlist:actions.download')}</span>
                {selectedSongs.size > 0 && (
                  <span className="download-badge">{selectedSongs.size}</span>
                )}
              </button>
            )}
          </div>

          {/* 歌曲列表 */}
          <div className="song-list-wrapper">
            <div className="song-list-header">
              <span className="col-checkbox"></span>
              <span className="col-index">#</span>
              <span className="col-name">{t('playlist:table.song')}</span>
              <span className="col-artist">{t('playlist:table.artist')}</span>
              <span className="col-duration">{t('playlist:table.duration')}</span>
              <span className="col-play"></span>
            </div>
            <div className="song-list">
              {allTracks.map((song, index) => {
                const artists = song.ar?.map(ar => ar.name).join(', ') || t('playlist:table.unknownArtist')
                const isVip = isVipSong(song)
                const feeTag = getFeeTypeText(song.fee)
                // 判断当前歌曲的下载状态
                const isCurrentDownloading = downloadingId === song.id
                const isCompleted = completedIds.has(song.id)
                
                return (
                  <div key={song.id} className="song-item">
                    <input
                      type="checkbox"
                      className="song-checkbox"
                      checked={selectedSongs.has(song.id)}
                      onChange={() => toggleSongSelect(song.id)}
                    />
                    <span className="song-index">{index + 1}</span>
                    <span className={`song-name${isVip ? ' vip-song' : ''}`} title={song.name}>
                      {song.name}
                      {feeTag && <span className="vip-badge">{feeTag}</span>}
                      {/* 下载状态图标 */}
                      {isCurrentDownloading && (
                        <i className="ri-loader-4-line song-status-icon downloading" title={t('playlist:download.downloading', { name: '' })}></i>
                      )}
                      {isCompleted && !isCurrentDownloading && (
                        <i className="ri-checkbox-circle-fill song-status-icon completed" title={t('common:loading')}></i>
                      )}
                    </span>
                    <span className="song-artist" title={artists}>
                      {artists}
                    </span>
                    <span className="song-duration">{formatDuration(song.dt)}</span>
                    <button
                      className="btn btn-circle play-btn"
                      onClick={() => playSongAtIndex(index)}
                      title={t('playlist:player.play')}
                    >
                      <i className="ri-play-fill"></i>
                    </button>
                  </div>
                )
              })}
            </div>
            
            {/* 加载更多按钮 */}
            {!hasLoadedAll && totalTracks > allTracks.length && (
              <div className="load-more-container">
                <button 
                  className="btn btn-secondary load-more-btn"
                  onClick={loadMoreTracks}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <i className="ri-loader-4-line"></i>
                      <span>{t('playlist:actions.loading')}</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-add-line"></i>
                      <span>{t('playlist:actions.loadMore', { current: allTracks.length, total: totalTracks })}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 底部播放器 - 完整版本 */}
      {currentSong && (
        <div className="player-bar" id="playerBar">
          <div className="player-info">
            <img
              className="player-cover"
              src={optimizeImageUrl(currentSong.al?.picUrl || playlist.coverImgUrl, 200)}
              alt="封面"
              width={60}
              height={60}
            />
            <div className="player-text">
              <div className="player-name">{currentSong.name}</div>
              <div className="player-artist">
                {currentSong.ar?.map(a => a.name).join(', ') || '-'}
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="player-progress">
            <span className="player-time">{formatDuration(currentTime * 1000)}</span>
            <div className="player-slider-container">
              <input
                type="range"
                className="player-slider"
                min="0"
                max="100"
                value={duration > 0 ? (currentTime / duration) * 100 : 0}
                onChange={handleProgressChange}
                style={{
                  '--progress': `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                } as any}
              />
            </div>
            <span className="player-time">{formatDuration(duration * 1000)}</span>
          </div>

          {/* 控制按钮 */}
          <div className="player-controls">
            <button className="btn btn-circle btn-ghost player-btn" id="prevBtn" onClick={playPrev} title={t('playlist:player.previous')}>
              <i className="ri-skip-back-fill"></i>
            </button>
            <button
              className="btn btn-circle player-btn player-btn-main"
              onClick={togglePlayPause}
              title={isPlaying ? t('playlist:player.pause') : t('playlist:player.play')}
            >
              <i className={isPlaying ? 'ri-pause-fill' : 'ri-play-fill'}></i>
            </button>
            <button className="btn btn-circle btn-ghost player-btn" onClick={playNext} title={t('playlist:player.next')}>
              <i className="ri-skip-forward-fill"></i>
            </button>
          </div>

          {/* 音量控制 */}
          <div className="player-volume">
            <button className="btn btn-circle btn-ghost player-btn" onClick={toggleMute} title={volume > 0 ? t('playlist:player.mute') : t('playlist:player.unmute')}>
              <i className={getVolumeIcon()}></i>
            </button>
            <div className="volume-slider-container">
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleVolumeChange}
                style={{
                  '--volume': `${volume * 100}%`
                } as any}
              />
            </div>
          </div>

          {/* 关闭按钮 */}
          <button className="btn btn-circle btn-ghost player-btn player-close" onClick={closePlayer} title={t('playlist:player.close')}>
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={playNext}
        onError={() => {
          // 如果 currentSong 为 null，说明是用户主动关闭播放器导致的，不应提示错误
          if (!currentSong) {
            console.log('播放器已关闭')
            return
          }
          console.error(t('playlist:player.loadFailed'))
          alert(t('playlist:player.networkError'))
        }}
        preload="metadata"
      />

      {/* JSZip 本地引用：必须在交互前准备好，保证首次打包不报错 */}
      <Script src="/jszip.min.js" strategy="beforeInteractive" />

      {/* 页脚 */}
      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = String(ctx.params?.id || '')
  const locale = ctx.locale || 'zh'
  try {
    // 使用顶层导入的 API 函数
    const result = await playlist_detail({ id: Number(id) })
    const fullPlaylist: Playlist | null = (result?.body as any)?.playlist || null
    
    // 优化：限制SSR数据量，只返回基本信息+前20首歌曲
    const optimizedPlaylist: Playlist | null = fullPlaylist ? {
      id: fullPlaylist.id,
      name: fullPlaylist.name,
      description: fullPlaylist.description,
      coverImgUrl: fullPlaylist.coverImgUrl,
      creator: fullPlaylist.creator,
      playCount: fullPlaylist.playCount,
      updateTime: fullPlaylist.updateTime,
      // 只保留前20首歌曲的简化信息，减少数据量
      tracks: fullPlaylist.tracks?.slice(0, 20).map(song => ({
        id: song.id,
        name: song.name,
        ar: song.ar,
        al: song.al,
        dt: song.dt,
        fee: song.fee
      })) || []
    } : null
    
    // 如果歌单不存在，返回 404
    if (!fullPlaylist) {
      return {
        notFound: true
      }
    }
    
    return { 
      props: { 
        playlist: optimizedPlaylist,
        // 添加完整歌曲数量信息，用于客户端加载更多
        totalTracks: fullPlaylist?.tracks?.length || 0,
        ...(await serverSideTranslations(locale, ['common', 'playlist', 'search', 'seo'], nextI18NextConfig as any))
      } 
    }
  } catch (e) {
    console.error('SSR获取歌单详情失败:', e)
    return { 
      notFound: true
    }
  }
}
