import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import HreflangLinks from '@/components/HreflangLinks'
import type { GetStaticProps } from 'next'

/**
 * 开源库依赖清单页面
 * 展示本项目使用的所有开源依赖及其许可证信息
 */
export default function Licenses() {
  const { t } = useTranslation(['common', 'licenses'])
  const router = useRouter()
  const locale = router.locale || 'zh'
  /** 核心运行时依赖 */
  const dependencies = [
    {
      name: 'Next.js',
      version: '^13.5.6',
      license: 'MIT',
      description: t('licenses:dependencies.nextjs'),
      url: 'https://github.com/vercel/next.js'
    },
    {
      name: 'React',
      version: '^18.3.1',
      license: 'MIT',
      description: t('licenses:dependencies.react'),
      url: 'https://github.com/facebook/react'
    },
    {
      name: 'React-DOM',
      version: '^18.3.1',
      license: 'MIT',
      description: t('licenses:dependencies.reactdom'),
      url: 'https://github.com/facebook/react'
    },
    {
      name: 'NeteaseCloudMusicApi',
      version: '^4.15.0',
      license: 'MIT',
      description: t('licenses:dependencies.neteaseapi'),
      url: 'https://github.com/Binaryify/NeteaseCloudMusicApi'
    }
  ]

  /** 开发时依赖 */
  const devDependencies = [
    {
      name: 'TypeScript',
      version: '5.9.3',
      license: 'Apache-2.0',
      description: t('licenses:dependencies.typescript'),
      url: 'https://github.com/microsoft/TypeScript'
    },
    {
      name: '@types/node',
      version: '24.9.1',
      license: 'MIT',
      description: t('licenses:dependencies.typesnode'),
      url: 'https://github.com/DefinitelyTyped/DefinitelyTyped'
    },
    {
      name: '@types/react',
      version: '19.2.2',
      license: 'MIT',
      description: t('licenses:dependencies.typesreact'),
      url: 'https://github.com/DefinitelyTyped/DefinitelyTyped'
    }
  ]

  /** 前端静态资源库 */
  const frontendLibs = [
    {
      name: 'JSZip',
      version: '3.10.1',
      license: 'MIT/GPL',
      description: t('licenses:dependencies.jszip'),
      url: 'https://github.com/Stuk/jszip'
    },
    {
      name: 'Remix Icon',
      version: '4.5.0',
      license: 'Apache-2.0',
      description: t('licenses:dependencies.remixicon'),
      url: 'https://github.com/Remix-Design/RemixIcon'
    }
  ]

  return (
    <>
      <Head>
        <title>{t('licenses:title')} | {t('common:brand')}</title>
        <meta name="description" content={t('licenses:subtitle')} />
        <link rel="canonical" href={`/${locale}/licenses`} />
        <HreflangLinks path="/licenses" />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
      </Head>

      <div className="container" style={{ 
        padding: '40px 24px',
        minHeight: 'calc(100vh - 100px)'
      }}>
        {/* 返回首页 */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ 
            color: 'var(--spotify-green)', 
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}>
            <i className="ri-arrow-left-line"></i>
            {t('licenses:backToHome')}
          </Link>
        </div>

        {/* 页面标题 */}
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 700,
          marginBottom: 16,
          color: 'var(--text-primary)'
        }}>
          <i className="ri-open-source-fill" style={{ marginRight: 12, color: 'var(--spotify-green)' }}></i>
          {t('licenses:title')}
        </h1>

        <p style={{ 
          fontSize: 16, 
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          marginBottom: 40 
        }}>
          {t('licenses:subtitle')}
        </p>

        {/* 核心依赖 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 600,
            marginBottom: 24,
            color: 'var(--text-primary)',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: 12
          }}>
            <i className="ri-stack-fill" style={{ marginRight: 8, color: 'var(--spotify-green)' }}></i>
            {t('licenses:sections.core')}
          </h2>
          
          <div style={{ display: 'grid', gap: 20 }}>
            {dependencies.map((dep) => (
              <div
                key={dep.name}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: 20,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
                  e.currentTarget.style.borderColor = 'var(--spotify-green)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12 
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 600,
                      color: 'var(--spotify-green)',
                      marginBottom: 4
                    }}>
                      <a 
                        href={dep.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: 'inherit', 
                          textDecoration: 'none'
                        }}
                      >
                        {dep.name}
                        <i className="ri-external-link-line" style={{ 
                          fontSize: 14, 
                          marginLeft: 6,
                          opacity: 0.6
                        }}></i>
                      </a>
                    </h3>
                    <code style={{ 
                      fontSize: 13, 
                      color: 'var(--text-secondary)',
                      background: 'var(--spotify-light-gray)',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>
                      {dep.version}
                    </code>
                  </div>
                  <span style={{ 
                    background: 'rgba(29, 185, 84, 0.15)',
                    color: 'var(--spotify-green)',
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500
                  }}>
                    {dep.license}
                  </span>
                </div>
                <p style={{ 
                  fontSize: 14, 
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {dep.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 开发依赖 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 600,
            marginBottom: 24,
            color: 'var(--text-primary)',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: 12
          }}>
            <i className="ri-code-s-slash-fill" style={{ marginRight: 8, color: '#9b59b6' }}></i>
            {t('licenses:sections.dev')}
          </h2>
          
          <div style={{ display: 'grid', gap: 20 }}>
            {devDependencies.map((dep) => (
              <div
                key={dep.name}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: 20,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
                  e.currentTarget.style.borderColor = '#9b59b6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12 
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 600,
                      color: '#9b59b6',
                      marginBottom: 4
                    }}>
                      <a 
                        href={dep.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: 'inherit', 
                          textDecoration: 'none'
                        }}
                      >
                        {dep.name}
                        <i className="ri-external-link-line" style={{ 
                          fontSize: 14, 
                          marginLeft: 6,
                          opacity: 0.6
                        }}></i>
                      </a>
                    </h3>
                    <code style={{ 
                      fontSize: 13, 
                      color: 'var(--text-secondary)',
                      background: 'var(--spotify-light-gray)',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>
                      {dep.version}
                    </code>
                  </div>
                  <span style={{ 
                    background: 'rgba(155, 89, 182, 0.15)',
                    color: '#9b59b6',
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500
                  }}>
                    {dep.license}
                  </span>
                </div>
                <p style={{ 
                  fontSize: 14, 
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {dep.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 前端静态资源 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 600,
            marginBottom: 24,
            color: 'var(--text-primary)',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: 12
          }}>
            <i className="ri-palette-fill" style={{ marginRight: 8, color: '#e74c3c' }}></i>
            {t('licenses:sections.frontend')}
          </h2>
          
          <div style={{ display: 'grid', gap: 20 }}>
            {frontendLibs.map((lib) => (
              <div
                key={lib.name}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: 20,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
                  e.currentTarget.style.borderColor = '#e74c3c'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12 
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 600,
                      color: '#e74c3c',
                      marginBottom: 4
                    }}>
                      <a 
                        href={lib.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: 'inherit', 
                          textDecoration: 'none'
                        }}
                      >
                        {lib.name}
                        <i className="ri-external-link-line" style={{ 
                          fontSize: 14, 
                          marginLeft: 6,
                          opacity: 0.6
                        }}></i>
                      </a>
                    </h3>
                    <code style={{ 
                      fontSize: 13, 
                      color: 'var(--text-secondary)',
                      background: 'var(--spotify-light-gray)',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>
                      {lib.version}
                    </code>
                  </div>
                  <span style={{ 
                    background: 'rgba(231, 76, 60, 0.15)',
                    color: '#e74c3c',
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500
                  }}>
                    {lib.license}
                  </span>
                </div>
                <p style={{ 
                  fontSize: 14, 
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {lib.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 许可证说明 */}
        <section style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          padding: 24,
          marginTop: 40
        }}>
          <h3 style={{ 
            fontSize: 18, 
            fontWeight: 600,
            marginBottom: 16,
            color: 'var(--text-primary)'
          }}>
            <i className="ri-information-fill" style={{ marginRight: 8, color: 'var(--spotify-green)' }}></i>
            {t('licenses:licenseInfo.title')}
          </h3>
          <ul style={{ 
            fontSize: 14, 
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
            margin: 0,
            paddingLeft: 24
          }}>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--text-primary)' }}>MIT</strong>：{t('licenses:licenseInfo.mit')}
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Apache-2.0</strong>：{t('licenses:licenseInfo.apache')}
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>MIT/GPL</strong>：{t('licenses:licenseInfo.dual')}
            </li>
          </ul>
          <p style={{ 
            fontSize: 13, 
            color: 'var(--text-secondary)',
            marginTop: 16,
            marginBottom: 0 
          }}>
            {t('licenses:licenseInfo.footer')}
          </p>
        </section>
      </div>

      {/* 页脚 */}
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
        </div>
        <p>{t('common:footer.text')}</p>
      </footer>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'zh', ['common', 'licenses']))
    }
  }
}

