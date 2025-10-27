import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { seoPlaylist } from '@/lib/seo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import HreflangLinks from '@/components/HreflangLinks'

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

export default function PlaylistPage({ playlist }: { playlist: Playlist | null }) {
  const { t } = useTranslation(['common', 'playlist', 'seo'])
  const router = useRouter()
  const locale = router.locale || 'zh'
  const [selectedSongs, setSelectedSongs] = useState<Set<number>>(new Set())
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 })
  
  // 下载状态跟踪：正在下载的歌曲ID和已完成的歌曲ID集合
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  
  // 播放器状态
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [prevVolume, setPrevVolume] = useState(0.8)
  const audioRef = useRef<HTMLAudioElement>(null)

  if (!playlist) {
    return (
      <main style={{ padding: 24, textAlign: 'center' }}>
        <p>{t('common:error.loadFailed')}</p>
        <button onClick={() => router.back()}>{t('common:error.goBack')}</button>
      </main>
    )
  }

  const count = playlist.tracks?.length || 0
  const { title, description } = seoPlaylist(playlist.name, count, playlist.description, locale)

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

  const optimizeImageUrl = (url?: string, size = 300) => {
    if (!url) return ''
    return `${url}?param=${size}x${size}`
  }

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

  const handleSelectAll = () => {
    const allIds = new Set(playlist.tracks?.map(s => s.id) || [])
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

    const selectedSongList = (playlist.tracks || []).filter(s => selectedSongs.has(s.id))
    const vipSongs = selectedSongList.filter(isVipSong)

    if (vipSongs.length > 0) {
      const confirmMsg = `${t('playlist:vipWarning.title', { count: vipSongs.length })}\n\n${t('playlist:vipWarning.message')}\n\n${t('playlist:vipWarning.confirm')}`
      if (!confirm(confirmMsg)) return
    }

    // 重置下载状态
    setIsDownloading(true)
    setCompletedIds(new Set())
    setDownloadingId(null)

    try {
      const songIds = Array.from(selectedSongs)
      const urlData = await fetch(`/api/song/url?ids=${songIds.join(',')}&level=exhigh`).then(r => r.json())
      const songUrls = urlData.data || []
      const urlMap = new Map(songUrls.filter((item: any) => item.url).map((item: any) => [item.id, item.url]))

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

      const JSZip = (window as any).JSZip
      if (!JSZip) {
        alert(t('common:error.jszipNotLoaded'))
        setIsDownloading(false)
        return
      }

      const zip = new JSZip()
      let successCount = 0
      let failCount = 0

      for (let i = 0; i < songs.length; i++) {
        const song = songs[i]
        setDownloadProgress({ current: i + 1, total: songs.length })
        setDownloadingId(song.id) // 标记当前正在下载的歌曲

        try {
          const response = await fetch(song.url)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const blob = await response.blob()
          zip.file(song.filename, blob)
          
          // 标记为已完成
          setCompletedIds(prev => new Set([...Array.from(prev), song.id]))
          successCount++
        } catch (error: any) {
          console.error(`下载失败: ${song.name}`, error)
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
    if (index < 0 || index >= (playlist.tracks?.length || 0)) {
      console.error('播放索引超出范围')
      return
    }

    const song = playlist.tracks![index]

    try {
      const urlData = await fetch(`/api/song/url?ids=${song.id}&level=exhigh`).then(r => r.json())
      const songUrl = urlData.data?.[0]?.url
      if (!songUrl) {
        alert(t('playlist:player.cannotPlay', { name: song.name }))
        return
      }

      setCurrentSong(song)
      setCurrentIndex(index)

      if (audioRef.current) {
        audioRef.current.src = songUrl
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
    if (currentIndex < (playlist.tracks?.length || 0) - 1) {
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

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`/${locale}/playlist/${playlist.id}`} />
        <HreflangLinks path={`/playlist/${playlist.id}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
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
              {(playlist.tracks || []).map((song, index) => {
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

      {/* JSZip 本地引用 */}
      <script src="/jszip.min.js"></script>

      {/* 页脚 */}
      <footer className="footer">
        <p>{t('common:footer.text')}</p>
      </footer>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = String(ctx.params?.id || '')
  const locale = ctx.locale || 'zh'
  try {
    const proto = (ctx.req.headers['x-forwarded-proto'] as string) || 'http'
    const host = ctx.req.headers.host
    const base = `${proto}://${host}`
    const res = await fetch(`${base}/api/playlist/detail?id=${encodeURIComponent(id)}`)
    const data = await res.json()
    const playlist: Playlist | null = data?.playlist || null
    return { 
      props: { 
        playlist,
        ...(await serverSideTranslations(locale, ['common', 'playlist', 'search', 'seo']))
      } 
    }
  } catch (e) {
    return { 
      props: { 
        playlist: null,
        ...(await serverSideTranslations(locale, ['common', 'playlist', 'search', 'seo']))
      } 
    }
  }
}
