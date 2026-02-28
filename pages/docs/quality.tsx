import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import HreflangLinks from '@/components/HreflangLinks'
import Footer from '@/components/Footer'
import { SEO_ROBOTS_META } from '@/lib/seo'
import type { GetStaticProps } from 'next'
import nextI18NextConfig from '@/next-i18next.config'

export default function Quality() {
  const { t } = useTranslation(['docs', 'seo', 'common'])
  const router = useRouter()
  const locale = router.locale || 'zh'

  return (
    <>
      <Head>
        <title>{t('seo:docs.quality.title')}</title>
        <meta name="description" content={t('seo:docs.quality.description')} />
        <meta name="keywords" content={t('seo:docs.quality.keywords')} />
        <link rel="canonical" href={`https://www.musicdownloader.cc/${locale}/docs/quality`} />
        <HreflangLinks path="/docs/quality" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={t('seo:docs.quality.title')} />
        <meta property="og:description" content={t('seo:docs.quality.description')} />
        <meta property="og:url" content={`https://www.musicdownloader.cc/${locale}/docs/quality`} />
        <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
        <meta name="robots" content={SEO_ROBOTS_META} />
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
                  name: t('seo:docs.quality.title'),
                  item: `https://www.musicdownloader.cc/${locale}/docs/quality`
                }
              ]
            })
          }}
        />
      </Head>
      <main style={{ padding: 24 }}>
        <h1>音质与格式说明</h1>
        <p>简要对比 MP3/320kbps/FLAC/APE/WAV/Hi‑Res 的特点与适用场景。</p>
        <ul>
          <li>MP3：有损压缩，体积小；320kbps 为常见高码率</li>
          <li>FLAC/APE：无损压缩，体积较大，保真度更高</li>
          <li>WAV：未压缩或无损封装，体积最大，编辑友好</li>
          <li>Hi‑Res：高解析度音频，对设备与资源要求更高</li>
        </ul>
      </main>

      {/* 页脚 */}
      <Footer />
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'zh', ['docs', 'seo', 'common'], nextI18NextConfig as any))
    }
  }
}


