import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import HreflangLinks from '@/components/HreflangLinks'
import type { GetStaticProps } from 'next'

/**
 * 使用指南页面
 * 提供完整的使用教程、常见问题和免责声明
 */
export default function Guide() {
  const { t } = useTranslation(['docs', 'seo', 'common'])
  const router = useRouter()
  const locale = router.locale || 'zh'
  return (
    <>
      <Head>
        <title>{t('seo:docs.guide.title')}</title>
        <meta name="description" content={t('seo:docs.guide.description')} />
        <link rel="canonical" href={`/${locale}/docs/guide`} />
        <HreflangLinks path="/docs/guide" />
        <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: '如何批量下载歌单？',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '搜索歌单，勾选需要的歌曲，点击下载按钮，浏览器本地打包 ZIP 后自动保存。',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'VIP 歌曲是否能下载完整版？',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '未登录 VIP 时仅能下载试听版；免费歌曲可下载完整版。',
                  },
                },
                {
                  '@type': 'Question',
                  name: '为什么有些歌曲无法下载？',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '部分歌曲因版权限制或需要VIP权限无法下载，建议选择其他歌曲。',
                  },
                },
              ],
            }),
          }}
        />
      </Head>

      <div className="container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 100px)' }}>
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
            返回首页
          </Link>
        </div>

        {/* 页面标题 */}
        <h1 style={{ 
          fontSize: 36, 
          fontWeight: 700,
          marginBottom: 16,
          color: 'var(--text-primary)'
        }}>
          <i className="ri-book-open-fill" style={{ marginRight: 12, color: 'var(--spotify-green)' }}></i>
          使用指南
        </h1>

        <p style={{ 
          fontSize: 16, 
          lineHeight: 1.8,
          color: 'var(--text-secondary)',
          marginBottom: 40 
        }}>
          欢迎使用音乐下载助手！本指南将帮助你快速上手，了解功能特性和注意事项。
        </p>

        {/* 快速开始 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ 
            fontSize: 28, 
            fontWeight: 600,
            marginBottom: 24,
            color: 'var(--text-primary)',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: 12
          }}>
            <i className="ri-rocket-fill" style={{ marginRight: 8, color: 'var(--spotify-green)' }}></i>
            快速开始
          </h2>
          
          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginTop: 24, marginBottom: 16 }}>
              步骤一：搜索歌单
            </h3>
            <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}>在首页搜索框输入歌单名称（例如："周杰伦"、"欧美经典"、"华语流行"）</li>
              <li style={{ marginBottom: 8 }}>点击"搜索"按钮或按回车键</li>
              <li style={{ marginBottom: 8 }}>浏览搜索结果，查看歌单封面、创建者和播放量</li>
            </ol>

            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginTop: 24, marginBottom: 16 }}>
              步骤二：选择歌单
            </h3>
            <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}>点击任意歌单卡片进入详情页</li>
              <li style={{ marginBottom: 8 }}>查看歌单完整信息（封面、描述、标签等）</li>
              <li style={{ marginBottom: 8 }}>浏览完整的歌曲列表</li>
            </ol>

            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginTop: 24, marginBottom: 16 }}>
              步骤三：选择歌曲
            </h3>
            <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}>勾选想要下载的歌曲</li>
              <li style={{ marginBottom: 8 }}>使用"全选"快速选中所有歌曲，或"取消全选"清空选择</li>
              <li style={{ marginBottom: 8 }}>右上角会显示已选中的歌曲数量</li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--warning-color)' }}>注意：</strong>
                VIP歌曲会显示为<span style={{ color: 'var(--danger-color)' }}>红色</span>并带有"VIP"标识
              </li>
            </ol>

            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginTop: 24, marginBottom: 16 }}>
              步骤四：批量下载
            </h3>
            <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}>点击"批量下载选中歌曲"按钮</li>
              <li style={{ marginBottom: 8 }}>如果选中了VIP歌曲，会弹出警告提示</li>
              <li style={{ marginBottom: 8 }}>确认后，系统会自动获取下载链接并打包成ZIP文件</li>
              <li style={{ marginBottom: 8 }}>下载进度和日志会实时显示在页面下方</li>
              <li style={{ marginBottom: 8 }}>下载完成后，ZIP文件会自动保存到浏览器的下载目录</li>
            </ol>
          </div>
        </section>

        {/* VIP歌曲说明 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ 
            fontSize: 28, 
            fontWeight: 600,
            marginBottom: 24,
            color: 'var(--text-primary)',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: 12
          }}>
            <i className="ri-vip-crown-fill" style={{ marginRight: 8, color: 'var(--warning-color)' }}></i>
            VIP歌曲说明
          </h2>

          <div style={{ 
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            padding: 24,
            marginBottom: 24
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              <i className="ri-error-warning-fill" style={{ color: 'var(--warning-color)', marginRight: 8 }}></i>
              重要提示
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 12 }}>
              部分歌曲为<strong style={{ color: 'var(--danger-color)' }}>VIP专属</strong>，未登录VIP账号时，只能下载<strong>30秒试听版</strong>，这是网易云音乐的版权保护机制。
            </p>
            <ul style={{ paddingLeft: 24, fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: 8 }}>
                <strong>免费歌曲 (fee=0)</strong>：可下载完整版，支持高音质
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--danger-color)' }}>VIP歌曲 (fee=1)</strong>：未登录VIP仅30秒试听版
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>付费专辑 (fee=4)</strong>：需购买专辑
              </li>
            </ul>
          </div>

          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginTop: 24, marginBottom: 16 }}>
              如何识别VIP歌曲？
            </h3>
            <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}>歌曲名称显示为<span style={{ color: 'var(--danger-color)' }}>红色</span></li>
              <li style={{ marginBottom: 8 }}>歌名后显示"VIP"或"付费"徽章</li>
              <li style={{ marginBottom: 8 }}>下载前会弹出警告提示</li>
              <li style={{ marginBottom: 8 }}>下载日志会标注"[试听版30秒]"</li>
            </ul>
          </div>
        </section>

        {/* 常见问题 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ 
            fontSize: 28, 
            fontWeight: 600,
            marginBottom: 24,
            color: 'var(--text-primary)',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: 12
          }}>
            <i className="ri-question-answer-fill" style={{ marginRight: 8, color: 'var(--spotify-green)' }}></i>
            常见问题
          </h2>

          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            {[
              {
                q: '为什么有些歌曲显示"无法获取下载链接"？',
                a: '部分歌曲可能需要VIP权限，或者因版权原因无法下载。这是网易云音乐API的限制，建议选择其他歌曲。'
              },
              {
                q: '下载的文件保存在哪里？',
                a: '文件会保存到浏览器的默认下载目录。Windows: C:\\Users\\用户名\\Downloads；macOS: /Users/用户名/Downloads；Linux: /home/用户名/Downloads'
              },
              {
                q: '可以同时下载多少首歌？',
                a: '理论上没有限制，但建议每次下载不超过50首，避免浏览器卡顿和请求被限制。'
              },
              {
                q: '下载速度慢怎么办？',
                a: '下载速度取决于网易云服务器响应速度、你的网络带宽和浏览器限制。建议分批下载，不要一次选择太多歌曲。'
              },
              {
                q: '为什么搜索不到某些歌单？',
                a: '可能原因：歌单名称拼写错误、歌单已被删除或设为私密、网易云API搜索结果有限制。尝试换个关键词重新搜索。'
              },
              {
                q: '能不能破解VIP限制？',
                a: '不能，也不应该。这涉及版权问题，我们强烈建议支持正版音乐，购买网易云VIP会员。'
              }
            ].map((item, idx) => (
              <div key={idx} style={{ 
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: 20,
                marginBottom: 16
              }}>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                  Q{idx + 1}: {item.q}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>
                  <strong style={{ color: 'var(--spotify-green)' }}>A:</strong> {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 免责声明 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ 
            fontSize: 28, 
            fontWeight: 600,
            marginBottom: 24,
            color: 'var(--text-primary)',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: 12
          }}>
            <i className="ri-file-shield-fill" style={{ marginRight: 8, color: 'var(--danger-color)' }}></i>
            免责声明
          </h2>

          <div style={{ 
            background: 'var(--card-bg)',
            border: '2px solid var(--danger-color)',
            borderRadius: 8,
            padding: 24
          }}>
            <ul style={{ paddingLeft: 24, fontSize: 15, lineHeight: 2, color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: 12 }}>
                <strong style={{ color: 'var(--text-primary)' }}>学习交流用途：</strong>
                本工具仅供技术学习和个人研究使用，请勿用于商业用途。
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong style={{ color: 'var(--text-primary)' }}>版权尊重：</strong>
                所有音乐版权归原作者和平台所有，下载后请在24小时内删除，如需长期使用请购买正版。
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong style={{ color: 'var(--text-primary)' }}>支持正版：</strong>
                我们强烈建议购买<a href="https://music.163.com/#/member" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--spotify-green)', textDecoration: 'none' }}>网易云VIP会员</a>，支持音乐创作者。
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong style={{ color: 'var(--text-primary)' }}>合理使用：</strong>
                请勿频繁调用API，避免对平台服务器造成压力，可能导致IP被限制。
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong style={{ color: 'var(--text-primary)' }}>责任声明：</strong>
                用户使用本工具产生的任何法律责任由用户自行承担，开发者不承担任何连带责任。
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>数据来源：</strong>
                本工具使用的数据来自网易云音乐公开API，不涉及任何破解或非法行为。
              </li>
            </ul>
          </div>
        </section>

        {/* 小贴士 */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.1) 0%, rgba(29, 185, 84, 0.05) 100%)',
          border: '1px solid rgba(29, 185, 84, 0.3)',
          borderRadius: 8,
          padding: 20,
          marginTop: 40
        }}>
          <p style={{ 
            fontSize: 15, 
            lineHeight: 1.8,
            color: 'var(--text-primary)',
            margin: 0 
          }}>
            <i className="ri-lightbulb-flash-fill" style={{ color: 'var(--spotify-green)', marginRight: 8 }}></i>
            <strong>小贴士：</strong>
            第一次使用建议先搜索热门歌单（如"华语热歌榜"）测试功能，优先选择免费歌曲获得最佳体验。
          </p>
        </div>
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


