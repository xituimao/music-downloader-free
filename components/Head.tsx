/**
 * 通用头部组件
 * 集成页面元数据、SEO信息和链接
 */
import NextHead from 'next/head'
import { useRouter } from 'next/router'
import HreflangLinks from './HreflangLinks'
import { SITE_URL } from '../lib/constants'

interface HeadProps {
  /** 页面标题 */
  title: string
  /** 页面描述 */
  description: string
  /** 页面特殊关键词，会与通用关键词合并 */
  keywords?: string[]
  /** 是否禁止索引，默认false */
  noIndex?: boolean
  /** 自定义图片URL */
  imageUrl?: string
}

export default function Head({
  title,
  description,
  keywords = [],
  noIndex = false,
  imageUrl
}: HeadProps) {
  const router = useRouter()
  const { locale = 'zh', pathname, asPath } = router
  
  // 去掉语言前缀的路径
  const path = asPath.replace(/^\/[^/]+/, '') || '/'
  
  // 组合关键词
  const baseKeywords = [
    '音乐下载',
    '歌单下载',
    'Music Downloader',
    'Playlist Download'
  ]
  const allKeywords = [...baseKeywords, ...keywords].join(', ')
  
  // 默认图片
  const defaultImage = `${SITE_URL}/og-image.png`
  const finalImageUrl = imageUrl || defaultImage
  
  return (
    <NextHead>
      {/* 基础标签 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      
      {/* 规范链接 */}
      <link rel="canonical" href={`${SITE_URL}/${locale}${path}`} />
      
      {/* 多语言链接 */}
      <HreflangLinks path={path} />
      
      {/* 索引控制 */}
      {noIndex && (
        <meta name="robots" content="noindex, nofollow" />
      )}
      
      {/* Open Graph 标签 */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${SITE_URL}/${locale}${path}`} />
      <meta property="og:image" content={finalImageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Music Downloader" />
      
      {/* Twitter 卡片 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImageUrl} />
      
      {/* 其他元数据 */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </NextHead>
  )
}
