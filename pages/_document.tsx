import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-CN">
        <Head>
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

          {/* Remixicon 本地引用 */}
          <link rel="stylesheet" href="/remixicon.css" />
          
          {/* DNS Prefetch for performance */}
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          {/* 网易云音乐图片域名预连接 */}
          <link rel="dns-prefetch" href="https://p1.music.126.net" />
          <link rel="dns-prefetch" href="https://p2.music.126.net" />
          <link rel="dns-prefetch" href="https://p3.music.126.net" />
          <link rel="dns-prefetch" href="https://p4.music.126.net" />
          <link rel="preconnect" href="https://p1.music.126.net" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://p2.music.126.net" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://p3.music.126.net" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://p4.music.126.net" crossOrigin="anonymous" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-EDV8JHXRPX" strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EDV8JHXRPX');`}
          </Script>
        </body>
      </Html>
    )
  }
}

export default MyDocument


