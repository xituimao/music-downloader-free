import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware 用于处理 sitemap.xml 和 robots.txt
 * 在 i18n 路由处理之前拦截这些请求
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 处理 /sitemap.xml
  if (pathname === '/sitemap.xml') {
    return NextResponse.rewrite(new URL('/api/sitemap.xml', request.url))
  }

  // 处理 /robots.txt
  if (pathname === '/robots.txt') {
    return NextResponse.rewrite(new URL('/api/robots.txt', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/sitemap.xml', '/robots.txt']
}
