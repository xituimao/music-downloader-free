import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import HreflangLinks from '@/components/HreflangLinks'
import type { GetStaticProps } from 'next'

export default function Quality() {
  const { t } = useTranslation(['docs', 'seo', 'common'])
  const router = useRouter()
  const locale = router.locale || 'zh'

  return (
    <>
      <Head>
        <title>{t('seo:docs.quality.title')}</title>
        <meta name="description" content={t('seo:docs.quality.description')} />
        <link rel="canonical" href={`/${locale}/docs/quality`} />
        <HreflangLinks path="/docs/quality" />
        <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
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
      <footer className="footer">
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 8
        }}>
          <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            {t('common:nav.home')}
          </a>
          <span style={{ color: '#ddd' }}>|</span>
          <a href="/docs/guide" style={{ color: 'inherit', textDecoration: 'none' }}>
            {t('common:nav.guide')}
          </a>
          <span style={{ color: '#ddd' }}>|</span>
          <a href="/licenses" style={{ color: 'inherit', textDecoration: 'none' }}>
            {t('common:nav.licenses')}
          </a>
        </div>
        <p>{t('common:footer.text')}</p>
      </footer>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'zh', ['docs', 'seo', 'common']))
    }
  }
}


