import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { appWithTranslation } from 'next-i18next'
import '@/styles/globals.css'

declare global {
  interface Window { dataLayer: Array<Record<string, any>> }
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (!window.dataLayer) window.dataLayer = []
      window.dataLayer.push({ event: 'page_view', page_path: url })
    }
    handleRouteChange(router.asPath)
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  return <Component {...pageProps} />
}

export default appWithTranslation(MyApp)


