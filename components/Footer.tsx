import { useTranslation } from 'next-i18next'
import Link from 'next/link'

/**
 * 网站页脚组件
 * 统一展示版权、导航和站点地图信息
 * 保持所有页面的一致性
 */
export const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="footer">
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 8
      }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          {t('common:nav.home')}
        </Link>
        <span style={{ color: '#ddd' }}>|</span>
        <Link href="/docs/guide" style={{ color: 'inherit', textDecoration: 'none' }}>
          {t('common:nav.guide')}
        </Link>
        <span style={{ color: '#ddd' }}>|</span>
        <Link href="/licenses" style={{ color: 'inherit', textDecoration: 'none' }}>
          {t('common:nav.licenses')}
        </Link>
        <span style={{ color: '#ddd' }}>|</span>
        <Link href="/sitemap.xml" style={{ color: 'inherit', textDecoration: 'none' }}>
          {t('common:nav.sitemap')}
        </Link>
      </div>
      <p>{t('common:footer.text')}</p>
    </footer>
  )
}

export default Footer
