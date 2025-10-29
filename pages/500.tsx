import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import type { GetStaticProps } from 'next'

export default function Custom500() {
  const { t } = useTranslation('common')
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ margin: 0 }}>500</h1>
      <p style={{ color: '#666' }}>{t('error.500') || '服务器开小差了 请稍后再试'}</p>
      <a href="/" style={{ color: '#06f' }}>{t('backHome') || '返回首页'}</a>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'zh', ['common'])),
    },
  }
}
