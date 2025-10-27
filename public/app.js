/**
 * @Description: 音乐下载助手前端核心逻辑
 * @Author: 蓉儿
 * @Date: 2025-10-24
 * 
 * 核心功能模块：
 * 1. 搜索歌单
 * 2. 显示歌单详情和歌曲列表
 * 3. 批量下载歌曲（核心功能）
 */

// ===== 全局状态管理 =====
const state = {
  currentPlaylist: null,     // 当前选中的歌单
  currentSongs: [],          // 当前歌单的歌曲列表
  selectedSongs: new Set(),  // 用户选中的歌曲ID集合
  isDownloading: false,      // 是否正在下载
  searchKeyword: '',         // 当前搜索关键词
  searchResults: [],         // 搜索结果
  // 播放器状态
  player: {
    playlist: [],            // 播放列表（当前歌单的所有歌曲）
    currentIndex: -1,        // 当前播放索引
    isPlaying: false,        // 是否正在播放
    currentSong: null        // 当前播放的歌曲对象
  }
}

// ===== DOM 元素引用 =====
const elements = {
  // 主页相关
  homePage: document.getElementById('homePage'),
  homeSearchInput: document.getElementById('homeSearchInput'),
  homeSearchBtn: document.getElementById('homeSearchBtn'),
  hotPlaylistList: document.getElementById('hotPlaylistList'),
  
  // 搜索相关
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  searchResults: document.getElementById('searchResults'),
  playlistList: document.getElementById('playlistList'),
  
  // 歌单详情相关
  playlistDetail: document.getElementById('playlistDetail'),
  playlistHeroBg: document.getElementById('playlistHeroBg'),
  backBtn: document.getElementById('backBtn'),
  playlistCover: document.getElementById('playlistCover'),
  playlistName: document.getElementById('playlistName'),
  playlistCreator: document.getElementById('playlistCreator'),
  playlistDesc: document.getElementById('playlistDesc'),
  playlistTrackCount: document.getElementById('playlistTrackCount'),
  
  // 歌曲列表相关
  songList: document.getElementById('songList'),
  selectAllBtn: document.getElementById('selectAllBtn'),
  deselectAllBtn: document.getElementById('deselectAllBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  downloadBadge: document.getElementById('downloadBadge'),
  
  // 下载进度相关
  downloadProgress: document.getElementById('downloadProgress'),
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  downloadLog: document.getElementById('downloadLog'),
  
  // 播放器相关
  playerBar: document.getElementById('playerBar'),
  audioPlayer: document.getElementById('audioPlayer'),
  playerCover: document.getElementById('playerCover'),
  playerSongName: document.getElementById('playerSongName'),
  playerArtistName: document.getElementById('playerArtistName'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  currentTime: document.getElementById('currentTime'),
  totalTime: document.getElementById('totalTime'),
  progressSlider: document.getElementById('progressSlider'),
  volumeBtn: document.getElementById('volumeBtn'),
  volumeSlider: document.getElementById('volumeSlider'),
  closePlayerBtn: document.getElementById('closePlayerBtn')
}

// ===== 工具函数 =====

/**
 * 优化图片URL（添加尺寸参数，减少加载体积）
 * @param {string} url 原始图片URL
 * @param {number} size 目标尺寸（宽高相同）
 * @returns {string} 优化后的图片URL
 */
function optimizeImageUrl(url, size = 300) {
  if (!url) return ''
  // 网易云图片URL支持 ?param=宽x高 参数来压缩图片
  // 例如：?param=200x200 表示200x200的缩略图
  return `${url}?param=${size}x${size}`
}

/**
 * 格式化时长（毫秒转分:秒）
 * @param {number} ms 毫秒数
 * @returns {string} 格式化后的时长，如 "3:45"
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 清理文件名中的非法字符
 * @param {string} filename 原始文件名
 * @returns {string} 清理后的文件名
 */
function sanitizeFilename(filename) {
  // 移除或替换非法字符： / \ : * ? " < > |
  return filename.replace(/[/\\:*?"<>|]/g, '_')
}

/**
 * 添加下载日志
 * @param {string} message 日志消息
 * @param {string} type 日志类型：success/error/info
 */
function addLog(message, type = 'info') {
  const logItem = document.createElement('div')
  logItem.className = `log-item log-${type}`
  logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`
  elements.downloadLog.appendChild(logItem)
  // 自动滚动到底部
  elements.downloadLog.scrollTop = elements.downloadLog.scrollHeight
}

// ===== API 调用函数 =====

/**
 * 获取热门歌单（主页推荐）
 * @param {number} limit 获取数量
 * @returns {Promise} API响应数据
 */
async function getHotPlaylists(limit = 20) {
  try {
    const response = await fetch(`/api/playlist/hot?limit=${limit}`)
    const data = await response.json()
    
    if (data.code !== 200) {
      throw new Error(data.message || '获取热门歌单失败')
    }
    
    return data
  } catch (error) {
    console.error('获取热门歌单失败:', error)
    throw error
  }
}

/**
 * 搜索歌单
 * @param {string} keywords 搜索关键词
 * @returns {Promise} API响应数据
 */
async function searchPlaylist(keywords) {
  try {
    const response = await fetch(`/api/search/playlist?keywords=${encodeURIComponent(keywords)}&limit=30`)
    const data = await response.json()
    
    if (data.code !== 200) {
      throw new Error(data.message || '搜索失败')
    }
    
    return data
  } catch (error) {
    console.error('搜索歌单失败:', error)
    throw error
  }
}

/**
 * 获取歌单详情
 * @param {number} id 歌单ID
 * @returns {Promise} API响应数据
 */
async function getPlaylistDetail(id) {
  try {
    const response = await fetch(`/api/playlist/detail?id=${id}`)
    const data = await response.json()
    
    if (data.code !== 200) {
      throw new Error(data.message || '获取歌单详情失败')
    }
    
    return data
  } catch (error) {
    console.error('获取歌单详情失败:', error)
    throw error
  }
}

/**
 * 批量获取歌曲URL
 * @param {Array<number>} ids 歌曲ID数组
 * @param {string} level 音质等级（standard, higher, exhigh, lossless, hires）
 * @returns {Promise} API响应数据
 */
async function getSongUrls(ids, level = 'exhigh') {
  try {
    const idsStr = ids.join(',')
    // 尝试使用exhigh（超高）音质，可能获取到更完整的版本
    const response = await fetch(`/api/song/url?ids=${idsStr}&level=${level}`)
    const data = await response.json()
    
    if (data.code !== 200) {
      throw new Error(data.message || '获取歌曲链接失败')
    }
    
    return data
  } catch (error) {
    console.error('获取歌曲URL失败:', error)
    throw error
  }
}

/**
 * 判断歌曲是否为VIP歌曲
 * @param {Object} song 歌曲对象
 * @returns {boolean} 是否为VIP歌曲
 */
function isVipSong(song) {
  // fee: 0-免费, 1-VIP, 4-付费专辑, 8-低音质免费
  return song.fee === 1 || song.fee === 4
}

/**
 * 获取歌曲费用类型文本
 * @param {number} fee 费用类型
 * @returns {string} 费用类型文本
 */
function getFeeTypeText(fee) {
  const feeMap = {
    0: '',
    1: 'VIP',
    4: '付费',
    8: '试听'
  }
  return feeMap[fee] || ''
}

// ===== 视图渲染函数 =====

/**
 * 渲染主页热门歌单
 * @param {Array} playlists 歌单数组
 */
function renderHotPlaylists(playlists) {
  elements.hotPlaylistList.innerHTML = ''
  
  if (!playlists || playlists.length === 0) {
    elements.hotPlaylistList.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">暂无推荐</p>'
    return
  }
  
  playlists.forEach(playlist => {
    const card = document.createElement('div')
    card.className = 'hot-playlist-card'
    card.onclick = () => loadPlaylistDetail(playlist.id)
    
    // 优化封面图片：使用300x300的缩略图
    const coverUrl = optimizeImageUrl(playlist.coverImgUrl, 300)
    
    card.innerHTML = `
      <img src="${coverUrl}" alt="${playlist.name}" loading="lazy">
      <div class="hot-playlist-card-title" title="${playlist.name}">${playlist.name}</div>
      <div class="hot-playlist-card-count">${formatPlayCount(playlist.playCount)}</div>
    `
    
    elements.hotPlaylistList.appendChild(card)
  })
}

/**
 * 格式化播放次数
 * @param {number} count 播放次数
 * @returns {string} 格式化后的文本
 */
function formatPlayCount(count) {
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  } else {
    return count.toString()
  }
}

/**
 * 渲染歌单搜索结果列表
 * @param {Array} playlists 歌单数组
 */
function renderPlaylistList(playlists) {
  elements.playlistList.innerHTML = ''
  
  if (!playlists || playlists.length === 0) {
    elements.playlistList.innerHTML = '<p style="text-align: center; color: #999;">没有找到相关歌单</p>'
    return
  }
  
  playlists.forEach(playlist => {
    const card = document.createElement('div')
    card.className = 'playlist-card'
    card.onclick = () => loadPlaylistDetail(playlist.id)
    
    // 优化封面图片：使用300x300的缩略图，大幅减少加载体积
    const coverUrl = optimizeImageUrl(playlist.coverImgUrl, 300)
    
    card.innerHTML = `
      <img src="${coverUrl}" alt="${playlist.name}" loading="lazy">
      <div class="playlist-card-body">
        <h3 title="${playlist.name}">${playlist.name}</h3>
        <p class="creator">by ${playlist.creator?.nickname || '未知'}</p>
        <p class="track-count">共 ${playlist.trackCount} 首歌曲</p>
      </div>
    `
    
    elements.playlistList.appendChild(card)
  })
}

/**
 * 渲染歌单详情（Spotify风格）
 * @param {Object} playlist 歌单对象
 */
function renderPlaylistDetail(playlist) {
  state.currentPlaylist = playlist
  state.currentSongs = playlist.tracks || []
  
  // 设置Hero背景图（使用大尺寸原图）
  const bgUrl = optimizeImageUrl(playlist.coverImgUrl, 800)
  elements.playlistHeroBg.style.backgroundImage = `url(${bgUrl})`
  
  // 设置封面图（使用400x400的缩略图）
  elements.playlistCover.src = optimizeImageUrl(playlist.coverImgUrl, 400)
  
  // 设置歌单信息
  elements.playlistName.textContent = playlist.name
  elements.playlistCreator.textContent = playlist.creator?.nickname || '未知'
  elements.playlistDesc.textContent = playlist.description || '暂无描述'
  
  // 设置歌曲数量
  const trackCount = state.currentSongs.length
  elements.playlistTrackCount.textContent = `${trackCount} 首歌曲`
  
  // 渲染歌曲列表
  renderSongList(state.currentSongs)
  
  // SEO：根据歌单信息更新标题与描述
  const title = `${playlist.name} - 歌单详情 | 音乐下载助手`
  const desc = playlist.description || `${playlist.name} 歌单，共 ${trackCount} 首歌曲。支持在线播放与一键批量下载。`
  document.title = title
  ensureMetaDescription(desc)
  
  // 切换视图
  elements.searchResults.style.display = 'none'
  elements.playlistDetail.style.display = 'block'
}

/**
 * 渲染歌曲列表
 * @param {Array} songs 歌曲数组
 */
function renderSongList(songs) {
  elements.songList.innerHTML = ''
  
  if (!songs || songs.length === 0) {
    elements.songList.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">暂无歌曲</p>'
    return
  }
  
  songs.forEach((song, index) => {
    const songItem = document.createElement('div')
    songItem.className = 'song-item'
    
    // 歌手名称拼接
    const artists = song.ar?.map(ar => ar.name).join(', ') || '未知歌手'
    
    // VIP歌曲标识
    const isVip = isVipSong(song)
    const feeTag = getFeeTypeText(song.fee)
    const vipBadge = feeTag ? `<span class="vip-badge">${feeTag}</span>` : ''
    const vipClass = isVip ? ' vip-song' : ''
    
    songItem.innerHTML = `
      <input 
        type="checkbox" 
        class="song-checkbox" 
        data-song-id="${song.id}"
        data-fee="${song.fee || 0}"
        ${state.selectedSongs.has(song.id) ? 'checked' : ''}
      >
      <span class="song-index">${index + 1}</span>
      <span class="song-name${vipClass}" title="${song.name}">
        ${song.name}${vipBadge}
      </span>
      <span class="song-artist" title="${artists}">${artists}</span>
      <span class="song-duration">${formatDuration(song.dt)}</span>
      <button class="play-btn" data-song-index="${index}" title="播放">
        <i class="ri-play-fill"></i>
      </button>
    `
    
    elements.songList.appendChild(songItem)
  })
  
  // 绑定复选框事件
  document.querySelectorAll('.song-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleSongSelect)
  })
  
  // 绑定播放按钮事件
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const index = parseInt(btn.dataset.songIndex)
      playSongAtIndex(index)
    })
  })
  
  updateSelectedCount()
}

// ===== 事件处理函数 =====

/**
 * 处理主页搜索
 */
async function handleHomeSearch() {
  const keywords = elements.homeSearchInput.value.trim()
  
  if (!keywords) {
    alert('请输入搜索关键词')
    elements.homeSearchInput.focus()
    return
  }
  
  // 更新路由到搜索页
  router.navigateToSearch(keywords)
}

/**
 * 处理顶部搜索按钮点击事件
 */
async function handleSearch() {
  const keywords = elements.searchInput.value.trim()
  
  if (!keywords) {
    alert('请输入搜索关键词')
    return
  }
  
  // 更新路由
  router.navigateToSearch(keywords)
}

/**
 * 加载歌单详情
 * @param {number} playlistId 歌单ID
 */
async function loadPlaylistDetail(playlistId) {
  // 更新路由
  router.navigateToPlaylist(playlistId)
}

/**
 * 处理返回按钮点击
 */
function handleBack() {
  // 如果有搜索关键词，返回搜索结果页
  if (state.searchKeyword) {
    router.navigateToSearch(state.searchKeyword)
  } else {
    router.navigateToHome()
  }
}

/**
 * 处理歌曲选中/取消选中
 * @param {Event} event 事件对象
 */
function handleSongSelect(event) {
  const checkbox = event.target
  const songId = parseInt(checkbox.dataset.songId)
  
  if (checkbox.checked) {
    state.selectedSongs.add(songId)
  } else {
    state.selectedSongs.delete(songId)
  }
  
  updateSelectedCount()
}

/**
 * 全选歌曲
 */
function handleSelectAll() {
  state.currentSongs.forEach(song => {
    state.selectedSongs.add(song.id)
  })
  
  // 更新复选框状态
  document.querySelectorAll('.song-checkbox').forEach(checkbox => {
    checkbox.checked = true
  })
  
  updateSelectedCount()
}

/**
 * 取消全选
 */
function handleDeselectAll() {
  state.selectedSongs.clear()
  
  // 更新复选框状态
  document.querySelectorAll('.song-checkbox').forEach(checkbox => {
    checkbox.checked = false
  })
  
  updateSelectedCount()
}

/**
 * 更新选中数量显示
 */
function updateSelectedCount() {
  const count = state.selectedSongs.size
  
  // 控制"取消全选"按钮显示：只在有选中时显示
  if (count > 0) {
    elements.deselectAllBtn.style.display = 'inline-block'
    elements.downloadBtn.disabled = false
    
    // 显示红色数字徽章
    elements.downloadBadge.textContent = count
    elements.downloadBadge.style.display = 'flex'
  } else {
    elements.deselectAllBtn.style.display = 'none'
    elements.downloadBtn.disabled = true
    
    // 隐藏徽章
    elements.downloadBadge.style.display = 'none'
  }
}

/**
 * 处理批量下载（客户端打包成ZIP）
 * 优势：服务器零流量成本，零性能消耗
 */
async function handleBatchDownload() {
  if (state.selectedSongs.size === 0) {
    alert('请先选择要下载的歌曲')
    return
  }
  
  if (state.isDownloading) {
    alert('正在下载中，请稍候...')
    return
  }
  
  try {
    state.isDownloading = true
    elements.downloadBtn.disabled = true
    elements.downloadProgress.style.display = 'block'
    elements.downloadLog.innerHTML = ''
    
    // 获取选中的歌曲信息
    const selectedSongList = state.currentSongs.filter(song => 
      state.selectedSongs.has(song.id)
    )
    
    // 检查VIP歌曲并提示
    const vipSongs = selectedSongList.filter(song => isVipSong(song))
    if (vipSongs.length > 0) {
      const confirmMsg = `⚠️ 检测到 ${vipSongs.length} 首VIP/付费歌曲\n\n未登录VIP账号将只能下载30秒试听版\n\n是否继续下载？（免费歌曲将正常下载完整版）`
      if (!confirm(confirmMsg)) {
        state.isDownloading = false
        elements.downloadBtn.disabled = false
        elements.downloadProgress.style.display = 'none'
        return
      }
    }
    
    addLog(`开始准备 ${selectedSongList.length} 首歌曲...`, 'info')
    if (vipSongs.length > 0) {
      addLog(`⚠️ 包含 ${vipSongs.length} 首VIP歌曲（将下载试听版）`, 'warn')
    }
    addLog(`正在获取下载链接...`, 'info')
    
    // 批量获取歌曲URL
    const songIds = Array.from(state.selectedSongs)
    const urlData = await getSongUrls(songIds)
    const songUrls = urlData.data || []
    
    // 创建URL映射表（id -> url）
    const urlMap = new Map()
    songUrls.forEach(item => {
      if (item.url) {
        urlMap.set(item.id, item.url)
      }
    })
    
    // 准备歌曲列表
    const songs = []
    let skipCount = 0
    
    for (const song of selectedSongList) {
      const url = urlMap.get(song.id)
      
      if (!url) {
        addLog(`⚠️ ${song.name} - 无法获取下载链接（跳过）`, 'error')
        skipCount++
        continue
      }
      
      // 构造文件名：歌手 - 歌名.mp3
      const artists = song.ar?.map(ar => ar.name).join(', ') || '未知歌手'
      const filename = sanitizeFilename(`${artists} - ${song.name}.mp3`)
      
      songs.push({ 
        url, 
        filename,
        name: song.name,
        isVip: isVipSong(song)
      })
    }
    
    if (songs.length === 0) {
      addLog(`❌ 没有可下载的歌曲`, 'error')
      alert('没有可下载的歌曲，请检查歌曲是否需要VIP')
      return
    }
    
    addLog(`\n准备打包下载 ${songs.length} 首歌曲...`, 'info')
    addLog(`💡 在浏览器中直接打包，服务器零流量成本！`, 'success')
    
    // 创建 JSZip 实例
    const zip = new JSZip()
    
    let successCount = 0
    let failCount = 0
    
    // 逐个下载并添加到 ZIP
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i]
      
      try {
        // 更新进度
        const progress = ((i + 1) / songs.length * 100).toFixed(0)
        elements.progressFill.style.width = `${progress}%`
        elements.progressText.textContent = `${i + 1}/${songs.length}`
        
        addLog(`正在下载: ${song.name}...`, 'info')
        
        // 直接从网易云下载到浏览器（不经过服务器）
        const response = await fetch(song.url)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        // 获取音乐文件的二进制数据
        const blob = await response.blob()
        
        // 添加到 ZIP
        zip.file(song.filename, blob)
        
        // VIP歌曲标识
        const vipTag = song.isVip ? ' [试听版30秒]' : ''
        
        addLog(`✓ ${song.name}${vipTag} - 下载成功`, 'success')
        successCount++
        
      } catch (error) {
        addLog(`❌ ${song.name} - 下载失败: ${error.message}`, 'error')
        failCount++
      }
    }
    
    if (successCount === 0) {
      addLog(`❌ 所有歌曲下载失败`, 'error')
      alert('所有歌曲下载失败，请检查网络连接')
      return
    }
    
    // 生成 ZIP 文件
    addLog(`\n正在生成ZIP文件...`, 'info')
    elements.progressText.textContent = '正在打包...'
    
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 5 }
    })
    
    // 触发下载
    const zipFilename = `${state.currentPlaylist?.name || '音乐下载'}-${Date.now()}.zip`
    const url = window.URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = zipFilename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)
    
    // 更新进度
    elements.progressFill.style.width = '100%'
    elements.progressText.textContent = `${songs.length}/${songs.length}`
    
    // 下载完成
    addLog(`\n========== 打包完成 ==========`, 'info')
    addLog(`✓ 成功: ${successCount} 首`, 'success')
    if (failCount > 0) {
      addLog(`❌ 失败: ${failCount} 首`, 'error')
    }
    if (skipCount > 0) {
      addLog(`⚠️ 跳过: ${skipCount} 首（无法获取链接）`, 'error')
    }
    addLog(`📦 ZIP文件: ${zipFilename}`, 'success')
    addLog(`💾 ZIP大小: ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`, 'info')
    addLog(`============================\n`, 'info')
    
    alert(`✓ 打包完成！\n成功: ${successCount} 首\n失败: ${failCount} 首\n跳过: ${skipCount} 首\n\nZIP文件已开始下载！`)
    
  } catch (error) {
    console.error('批量下载失败:', error)
    addLog(`❌ 批量下载出错: ${error.message}`, 'error')
    alert(`下载失败: ${error.message}`)
  } finally {
    state.isDownloading = false
    elements.downloadBtn.disabled = false
  }
}

/**
 * 下载单个文件（使用 Fetch + Blob 方式）
 * @param {string} url 文件URL
 * @param {string} filename 文件名
 * @returns {Promise}
 */
async function downloadFile(url, filename) {
  try {
    // 方案1：尝试使用后端代理下载（推荐，更稳定）
    const proxyUrl = `/api/download/proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
    
    // 创建隐藏的 <a> 标签触发下载
    const link = document.createElement('a')
    link.href = proxyUrl
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    
    // 等待一段时间再清理（确保下载已开始）
    await new Promise(resolve => setTimeout(resolve, 500))
    
    document.body.removeChild(link)
    
  } catch (error) {
    console.error('下载失败:', error)
    throw error
  }
}

// ===== 事件绑定 =====

/**
 * 初始化事件监听
 */
function initEventListeners() {
  // Logo点击返回首页
  const logoLink = document.getElementById('logoLink')
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault()
      router.navigateToHome()
    })
  }
  
  // 主页搜索框
  elements.homeSearchBtn.addEventListener('click', handleHomeSearch)
  elements.homeSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleHomeSearch()
    }
  })
  
  // 顶部导航栏搜索相关
  const searchBtn = document.getElementById('searchBtn')
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch)
  }
  
  elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  })
  
  // 导航相关
  elements.backBtn.addEventListener('click', handleBack)
  
  // 歌曲选择相关
  elements.selectAllBtn.addEventListener('click', handleSelectAll)
  elements.deselectAllBtn.addEventListener('click', handleDeselectAll)
  
  // 下载相关
  elements.downloadBtn.addEventListener('click', handleBatchDownload)
  
  // 播放器相关
  initPlayerEventListeners()
}

// ===== 播放器功能 =====

/**
 * 初始化播放器事件监听
 */
function initPlayerEventListeners() {
  // 播放/暂停按钮
  elements.playPauseBtn.addEventListener('click', togglePlayPause)
  
  // 上一首/下一首
  elements.prevBtn.addEventListener('click', playPrev)
  elements.nextBtn.addEventListener('click', playNext)
  
  // 关闭播放器
  elements.closePlayerBtn.addEventListener('click', closePlayer)
  
  // 音量控制
  elements.volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100
    elements.audioPlayer.volume = volume
    updateVolumeIcon(volume)
  })
  
  // 音量按钮（静音/取消静音）
  elements.volumeBtn.addEventListener('click', toggleMute)
  
  // 进度条拖动
  elements.progressSlider.addEventListener('input', (e) => {
    const progress = e.target.value
    const time = (progress / 100) * elements.audioPlayer.duration
    elements.audioPlayer.currentTime = time
    // 更新CSS变量，用于进度条渐变效果
    elements.progressSlider.style.setProperty('--progress', `${progress}%`)
  })
  
  // 音频事件监听
  elements.audioPlayer.addEventListener('loadedmetadata', onAudioLoaded)
  elements.audioPlayer.addEventListener('timeupdate', onTimeUpdate)
  elements.audioPlayer.addEventListener('ended', onAudioEnded)
  elements.audioPlayer.addEventListener('error', onAudioError)
  elements.audioPlayer.addEventListener('play', () => {
    state.player.isPlaying = true
    elements.playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>'
  })
  elements.audioPlayer.addEventListener('pause', () => {
    state.player.isPlaying = false
    elements.playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>'
  })
  
  // 设置初始音量
  elements.audioPlayer.volume = 0.8
}

/**
 * 播放指定索引的歌曲
 */
async function playSongAtIndex(index) {
  if (index < 0 || index >= state.currentSongs.length) {
    console.error('播放索引超出范围')
    return
  }
  
  const song = state.currentSongs[index]
  
  try {
    // 获取歌曲URL
    const urlData = await getSongUrls([song.id], 'exhigh')
    const songUrl = urlData.data?.[0]?.url
    
    if (!songUrl) {
      alert(`无法播放：${song.name}`)
      return
    }
    
    // 更新播放器状态
    state.player.currentIndex = index
    state.player.currentSong = song
    state.player.playlist = state.currentSongs
    
    // 更新播放器UI
    const artists = song.ar?.map(ar => ar.name).join(', ') || '未知歌手'
    elements.playerSongName.textContent = song.name
    elements.playerArtistName.textContent = artists
    elements.playerCover.src = optimizeImageUrl(song.al?.picUrl || state.currentPlaylist?.coverImgUrl, 200)
    
    // 显示播放器
    elements.playerBar.style.display = 'flex'
    
    // 加载并播放
    elements.audioPlayer.src = songUrl
    elements.audioPlayer.play()
    
    // VIP歌曲提示
    if (isVipSong(song)) {
      addLog(`🎵 正在播放VIP歌曲试听版：${song.name}`, 'warn')
    }
    
    console.log(`播放: ${song.name}`)
    
  } catch (error) {
    console.error('播放失败:', error)
    alert(`播放失败：${error.message}`)
  }
}

/**
 * 播放/暂停切换
 */
function togglePlayPause() {
  if (elements.audioPlayer.paused) {
    elements.audioPlayer.play()
  } else {
    elements.audioPlayer.pause()
  }
}

/**
 * 播放上一首
 */
function playPrev() {
  if (state.player.currentIndex > 0) {
    playSongAtIndex(state.player.currentIndex - 1)
  } else {
    alert('已经是第一首了')
  }
}

/**
 * 播放下一首
 */
function playNext() {
  if (state.player.currentIndex < state.currentSongs.length - 1) {
    playSongAtIndex(state.player.currentIndex + 1)
  } else {
    alert('已经是最后一首了')
  }
}

/**
 * 关闭播放器
 */
function closePlayer() {
  elements.audioPlayer.pause()
  elements.audioPlayer.src = ''
  elements.playerBar.style.display = 'none'
  state.player.currentIndex = -1
  state.player.currentSong = null
  state.player.isPlaying = false
}

/**
 * 切换静音
 */
function toggleMute() {
  if (elements.audioPlayer.volume > 0) {
    elements.audioPlayer.dataset.prevVolume = elements.audioPlayer.volume
    elements.audioPlayer.volume = 0
    elements.volumeSlider.value = 0
    elements.volumeBtn.innerHTML = '<i class="ri-volume-mute-line"></i>'
  } else {
    const prevVolume = parseFloat(elements.audioPlayer.dataset.prevVolume || 0.8)
    elements.audioPlayer.volume = prevVolume
    elements.volumeSlider.value = prevVolume * 100
    updateVolumeIcon(prevVolume)
  }
}

/**
 * 更新音量图标
 */
function updateVolumeIcon(volume) {
  if (volume === 0) {
    elements.volumeBtn.innerHTML = '<i class="ri-volume-mute-line"></i>'
  } else if (volume < 0.5) {
    elements.volumeBtn.innerHTML = '<i class="ri-volume-down-line"></i>'
  } else {
    elements.volumeBtn.innerHTML = '<i class="ri-volume-up-line"></i>'
  }
}

/**
 * 音频加载完成
 */
function onAudioLoaded() {
  const duration = elements.audioPlayer.duration
  elements.totalTime.textContent = formatDuration(duration * 1000)
}

/**
 * 播放进度更新
 */
function onTimeUpdate() {
  const current = elements.audioPlayer.currentTime
  const duration = elements.audioPlayer.duration
  
  if (duration > 0) {
    const progress = (current / duration) * 100
    elements.progressSlider.value = progress
    
    // 更新CSS变量，用于进度条渐变效果
    elements.progressSlider.style.setProperty('--progress', `${progress}%`)
    
    // 计算剩余时间
    const remaining = duration - current
    // 移动端显示：剩余时间/总时长
    elements.totalTime.textContent = `-${formatDuration(remaining * 1000)} / ${formatDuration(duration * 1000)}`
  }
  
  elements.currentTime.textContent = formatDuration(current * 1000)
}

/**
 * 音频播放结束
 */
function onAudioEnded() {
  // 自动播放下一首
  if (state.player.currentIndex < state.currentSongs.length - 1) {
    playNext()
  } else {
    console.log('播放列表结束')
  }
}

/**
 * 音频加载错误
 */
function onAudioError() {
  console.error('音频加载失败')
  addLog(`❌ 播放失败：${state.player.currentSong?.name || '未知歌曲'}`, 'error')
  alert('播放失败，可能是网络问题或该歌曲暂不支持播放')
}

// ===== 路由管理 =====

/**
 * 路由管理器
 * 支持：#/search/:keyword 和 #/playlist/:id
 */
const router = {
  /**
   * 获取当前路由
   */
  getCurrentRoute() {
    const hash = window.location.hash.slice(1) // 去掉 #
    if (!hash) return { path: 'home' }
    
    const [path, param] = hash.split('/')
    return { path, param }
  },
  
  /**
   * 导航到搜索页
   */
  navigateToSearch(keyword) {
    window.location.hash = `#search/${encodeURIComponent(keyword)}`
  },
  
  /**
   * 导航到歌单详情页
   */
  navigateToPlaylist(playlistId) {
    window.location.hash = `#playlist/${playlistId}`
  },
  
  /**
   * 导航到首页
   */
  navigateToHome() {
    window.location.hash = ''
  },
  
  /**
   * 路由处理
   */
  async handleRoute() {
    const route = this.getCurrentRoute()
    
    console.log('当前路由:', route)
    
    switch (route.path) {
      case 'search':
        // 搜索页面
        if (route.param) {
          const keyword = decodeURIComponent(route.param)
          // SEO：更新标题与描述
          document.title = `${keyword} - 歌单搜索 | 音乐下载助手`
          ensureMetaDescription(`搜索“${keyword}”相关歌单，支持在线预览与一键批量下载。`)
          await restoreSearchResults(keyword)
        }
        break
        
      case 'playlist':
        // 歌单详情页
        if (route.param) {
          // 先设置一个过渡标题，待详情加载后再细化
          document.title = `歌单详情 #${route.param} | 音乐下载助手`
          ensureMetaDescription('查看歌单详情与歌曲列表，支持批量下载与在线播放。')
          await restorePlaylistDetail(route.param)
        }
        break
        
      case 'home':
      default:
        // 首页
        document.title = '音乐下载助手 - 一键音乐下载'
        ensureMetaDescription('搜索歌单，一键批量下载；浏览器本地打包ZIP，零服务器流量。')
        showHomePage()
        break
    }
  }
}

/**
 * 显示首页
 */
async function showHomePage() {
  // 添加主页状态标记（用于隐藏顶部搜索框）
  document.body.classList.add('home-active')
  
  // 显示主页，隐藏其他区域
  elements.homePage.style.display = 'flex'
  elements.searchResults.style.display = 'none'
  elements.playlistDetail.style.display = 'none'
  elements.downloadProgress.style.display = 'none'
  
  // 清空搜索框
  elements.homeSearchInput.value = ''
  elements.searchInput.value = ''
  
  // 聚焦到主页搜索框
  setTimeout(() => elements.homeSearchInput.focus(), 100)
  
  // 加载热门歌单（检查是否有实际的歌单卡片）
  const hasPlaylists = elements.hotPlaylistList.querySelector('.hot-playlist-card')
  if (!hasPlaylists) {
    try {
      console.log('开始加载热门歌单...')
      const data = await getHotPlaylists(20)
      const playlists = data.playlists || []
      console.log('热门歌单数据:', playlists.length, '个')
      renderHotPlaylists(playlists)
    } catch (error) {
      console.error('加载热门歌单失败:', error)
      elements.hotPlaylistList.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">加载失败，请刷新重试</p>'
    }
  }
}

/**
 * 恢复搜索结果
 */
async function restoreSearchResults(keyword) {
  try {
    // 移除主页状态标记
    document.body.classList.remove('home-active')
    
    // 隐藏主页
    elements.homePage.style.display = 'none'
    
    elements.searchInput.value = keyword
    elements.searchBtn.disabled = true
    elements.searchBtn.textContent = '加载中...'
    
    const data = await searchPlaylist(keyword)
    const playlists = data.result?.playlists || []
    
    state.searchKeyword = keyword
    state.searchResults = playlists
    
    renderPlaylistList(playlists)
    elements.searchResults.style.display = 'block'
    elements.playlistDetail.style.display = 'none'
    
  } catch (error) {
    console.error('恢复搜索结果失败:', error)
    alert(`加载失败: ${error.message}`)
  } finally {
    elements.searchBtn.disabled = false
    elements.searchBtn.textContent = '搜索'
  }
}

/**
 * 恢复歌单详情
 */
async function restorePlaylistDetail(playlistId) {
  try {
    // 移除主页状态标记
    document.body.classList.remove('home-active')
    
    // 隐藏主页
    elements.homePage.style.display = 'none'
    
    const data = await getPlaylistDetail(playlistId)
    const playlist = data.playlist
    
    renderPlaylistDetail(playlist)
    
    // 清空选中状态
    state.selectedSongs.clear()
    updateSelectedCount()
    
  } catch (error) {
    console.error('恢复歌单详情失败:', error)
    alert(`加载歌单失败: ${error.message}`)
    router.navigateToHome()
  }
}

// ===== 应用初始化 =====

/**
 * 初始化应用
 */
function init() {
  console.log('🎵 音乐下载助手已启动')
  initEventListeners()
  
  // 初始化路由
  router.handleRoute()
  
  // 监听路由变化
  window.addEventListener('hashchange', () => {
    router.handleRoute()
  })
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

// ===== SEO辅助：确保或更新 meta description =====
function ensureMetaDescription(content) {
  let meta = document.querySelector('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}
