/**
 * 动态生成OpenGraph图片
 */
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // 获取URL参数
    const title = searchParams.get('title') || 'Music Downloader'
    const subtitle = searchParams.get('subtitle') || 'musicdownloader.cc'
    
    // 动态OG图片尺寸
    const width = 1200
    const height = 630
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            color: 'white',
            background: 'linear-gradient(to bottom right, #1DB954, #191414)',
            width: '100%',
            height: '100%',
            padding: '50px 200px',
            flexDirection: 'column',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 70, fontWeight: 'bold', marginBottom: 20 }}>
            {title}
          </div>
          <div style={{ fontSize: 40, opacity: 0.8 }}>
            {subtitle}
          </div>
          <div style={{ position: 'absolute', bottom: 50, right: 50, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 30 }}>musicdownloader.cc</div>
          </div>
        </div>
      ),
      {
        width,
        height,
      }
    )
  } catch (e) {
    console.error(e)
    return new Response('Failed to generate OG image', {
      status: 500,
    })
  }
}
