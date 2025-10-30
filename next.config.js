const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' }
    ]
  },
  outputFileTracingIncludes: {
    '/*': [
      './node_modules/NeteaseCloudMusicApi/**/*',
      './node_modules/xml2js/**/*',
      './next-i18next.config.js',
      './public/locales/**/*'
    ]
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


