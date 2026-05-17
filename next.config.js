const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  // 关键修复：将 NeteaseCloudMusicApi 设为外部包，
  // 避免 Turbopack 打包时丢失动态 require 的模块文件
  serverExternalPackages: ['NeteaseCloudMusicApi'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' }
    ]
  },
  outputFileTracingIncludes: {
    '/api/playlist/hot': ['./node_modules/NeteaseCloudMusicApi/**/*'],
    '/api/playlist/detail': ['./node_modules/NeteaseCloudMusicApi/**/*'],
    '/api/search/playlist': ['./node_modules/NeteaseCloudMusicApi/**/*'],
    '/api/song/url': ['./node_modules/NeteaseCloudMusicApi/**/*'],
    '/api/auth/status': ['./node_modules/NeteaseCloudMusicApi/**/*'],
    '/api/sitemap.xml': ['./node_modules/xml2js/**/*', './node_modules/sax/**/*', './node_modules/xmlbuilder/**/*'],
    '/': ['./next-i18next.config.js', './public/locales/**/*'],
    '/playlist/[id]': ['./next-i18next.config.js', './public/locales/**/*'],
    '/search/[q]': ['./next-i18next.config.js', './public/locales/**/*'],
  },
  // 添加全局Header规则，优化缓存控制
  async headers() {
    return [
      // 为静态页面添加缓存控制
      {
        source: '/((?!api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=600, s-maxage=1800'
          }
        ]
      },
      // 为字体和图片添加更长的缓存时间
      {
        source: '/(.*)\\.(woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig


