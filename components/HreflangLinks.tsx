/**
 * Hreflang 链接组件
 * 用于 SEO，告诉搜索引擎不同语言版本页面的关系
 */

interface HreflangLinksProps {
  /** 基础域名，如 https://example.com */
  baseUrl?: string
  /** 当前页面路径（不含语言前缀），如 /playlist/123 */
  path?: string
}

export default function HreflangLinks({ baseUrl = '', path = '/' }: HreflangLinksProps) {
  const locales = ['zh', 'en']
  
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  
  return (
    <>
      {locales.map(locale => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={`${baseUrl}/${locale}${normalizedPath}`}
        />
      ))}
      {/* x-default 指向默认语言版本 */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/zh${normalizedPath}`}
      />
    </>
  )
}

