# AGENTS.md — 音乐下载助手

> 本文件供 AI 编程助手阅读。如果你正在修改本项目代码，请务必先阅读此文件。

---

## 项目概述

**音乐下载助手**（music-download-free）是一个基于 Next.js SSR 架构的音乐搜索与批量下载 Web 应用。用户可搜索网易云音乐歌单、在线试听、多选歌曲并在浏览器端打包下载 ZIP，服务器零流量压力。

- **版本**: v2.0.0
- **作者**: 蓉儿
- **许可证**: MIT
- **生产域名**: https://www.musicdownloader.cc

### 核心功能
- 首页热榜歌单 SSR 渲染
- 歌单搜索（SEO 友好路由 `/search/[关键词]`）
- 歌单详情页（Spotify 风格大封面背景、曲目列表）
- 底部在线播放器（播放/暂停/进度/音量）
- 网易云账号二维码登录（下载 VIP 歌曲完整版）
- 浏览器端使用 JSZip 打包 ZIP，服务器零带宽
- 多语言支持（中文 / 英文）
- SEO 全面优化（动态 meta、JSON-LD、sitemap、robots.txt）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 + React 18 + TypeScript 5.9 |
| 路由 | Next.js Pages Router（非 App Router） |
| 渲染 | SSR + 客户端渲染混合；部分接口使用 stale-while-revalidate 缓存 |
| API | Next.js API Routes，代理网易云音乐 API |
| 样式 | 纯 CSS（Spotify 深色主题），无 Tailwind / CSS-in-JS |
| 图标 | Remixicon（本地托管于 `public/`） |
| 国际化 | next-i18next + react-i18next |
| 分析 | Google Analytics（G-EDV8JHXRPX）+ Vercel Analytics |
| 部署 | Vercel（Region: sin1） |

### 关键依赖
- `NeteaseCloudMusicApi` — 网易云音乐 API 封装
- `next-i18next` — SSR 国际化
- `jszip` — 浏览器端 ZIP 打包（通过 `public/jszip.min.js` 本地引入）
- `xml2js` — 服务端 XML 处理（sitemap 等）
- `@vercel/og` — Open Graph 图片生成

---

## 目录结构

```
├── components/           # React 组件
│   ├── auth/             # 登录相关组件
│   │   └── QRLoginModal.tsx
│   ├── FloatingLoginButton.tsx
│   ├── Footer.tsx
│   ├── Head.tsx          # 通用 SEO Head 封装
│   ├── HreflangLinks.tsx
│   └── LanguageSwitcher.tsx
├── lib/                  # 工具库与业务逻辑
│   ├── api-client.ts     # 前端统一请求封装
│   ├── api-handler.ts    # 后端 API 统一错误处理高阶函数
│   ├── constants.ts      # 站点常量
│   ├── seo.ts            # SEO 关键词与 robots 配置
│   └── url-utils.ts      # URL 工具（HTTP→HTTPS、图片压缩）
├── pages/                # Next.js Pages Router
│   ├── api/              # API 路由
│   │   ├── auth/         # 登录相关（qr/key、qr/create、qr/check、status、logout）
│   │   ├── playlist/     # 歌单（hot、detail）
│   │   ├── search/       # 搜索（playlist）
│   │   ├── song/         # 歌曲（url）
│   │   ├── og-image.tsx  # OG 图片动态生成
│   │   ├── robots.txt.ts
│   │   └── sitemap.xml.ts
│   ├── docs/             # 文档页面（guide、quality）
│   ├── playlist/
│   │   └── [id].tsx      # 歌单详情页
│   ├── search/
│   │   └── [q].tsx       # 搜索结果页
│   ├── 500.tsx
│   ├── _app.tsx          # 全局 App 组件（含 GTM 路由追踪）
│   ├── _document.tsx     # 自定义 Document（favicon、DNS prefetch）
│   ├── index.tsx         # 首页
│   └── licenses.tsx      # 开源许可页
├── public/
│   ├── locales/          # i18n 翻译文件（zh/、en/）
│   ├── jszip.min.js      # JSZip 本地托管
│   ├── remixicon.*       # 图标字体本地托管
│   └── favicon / og-image 等静态资源
├── styles/
│   └── globals.css       # 全局样式（Spotify 主题 + 按钮规范）
├── docs/                 # 项目文档（中文）
├── scripts/
│   └── check-missing-deps.js  # postbuild 依赖完整性检测
├── server.js             # HTTPS 开发服务器（用于调试 HttpOnly Cookie）
├── middleware.ts         # Next.js Middleware（sitemap/robots 重写）
├── next.config.js
├── next-i18next.config.js
├── vercel.json           # Vercel 部署配置（Headers、Redirects、Rewrites、Cron）
└── .nvmrc                # Node.js 22.21.0
```

---

## 开发命令

```bash
# 开发模式（HTTPS，推荐，用于调试登录/Cookie）
npm run dev
# 访问 https://localhost:3000
# 首次访问需手动信任自签名证书

# HTTP 开发模式（可选）
npm run dev:http

# 生产构建
npm run build
# postbuild 会自动运行 scripts/check-missing-deps.js 检查关键依赖是否被正确打包

# 生产启动
npm start

# Vercel 部署
npm run deploy
```

### 环境要求
- **Node.js**: 22.21.0（由 `.nvmrc` 指定，推荐 20.9.0+）
- **包管理器**: npm

---

## 代码规范与开发约定

### 1. 语言约定
- 所有代码注释、文档、提交信息、日志输出均使用**中文**。
- 用户可见文本通过 `next-i18next` 国际化，支持 `zh` / `en`，默认 `zh`。

### 2. 样式规范（Spotify 风格）
- **全局主题色**定义在 `styles/globals.css` 的 `:root` 中：
  - `--spotify-green: #1DB954`
  - `--spotify-black: #121212`
  - `--spotify-gray: #181818`
  - `--spotify-light-gray: #282828`
- **按钮系统**：所有按钮必须基于 `.btn` 基础类，通过修饰符组合变体：
  - 颜色：`.btn-primary`、`.btn-secondary`、`.btn-ghost`、`.btn-back`
  - 尺寸：`.btn-lg`、`.btn-sm`、`.btn-xs`
  - 形状：`.btn-circle`
  - 详见 `docs/按钮组件规范.md`
- **禁止**在组件中使用内联 `style`，优先使用 CSS 类组合。

### 3. 网络请求规范
- **前端请求**：必须使用 `lib/api-client.ts` 中的 `apiGet` / `apiPost`，禁止裸写 `fetch`。
  - 错误处理使用 `getErrorMessage(error, '默认提示')`。
  - 频繁轮询（如二维码状态检查）应关闭日志：`logRequest: false, logResponse: false`。
- **后端 API**：必须使用 `lib/api-handler.ts` 中的 `apiHandler` 高阶函数包裹 handler，禁止手动写 `try-catch`。
  - 参数校验用 `validateParam()`，可选参数用 `getOptionalParam()`。
  - 详情参考 `docs/网络请求架构改进总结.md`。

### 4. API 路由开发模式
```typescript
import { apiHandler, validateParam, getOptionalParam } from '@/lib/api-handler'

export default apiHandler(
  { name: 'API-名称', logResponse: false },
  async (req, res) => {
    const id = validateParam(req.query.id, 'id')
    const limit = getOptionalParam(req.query.limit, '20')
    // ... 业务逻辑
    res.status(200).json(result.body)
    return {} as any
  }
)
```

### 5. SEO 规范
- 每个页面使用 `components/Head.tsx` 封装 `<Head>`，传入 `title`、`description`、`keywords`。
- 多语言链接由 `HreflangLinks` 组件自动处理。
- SEO 关键词集中管理于 `lib/seo.ts` 和 `public/locales/*/seo.json`。

### 6. 路径别名
- `tsconfig.json` 配置 `"@/*": ["./*"]`， import 时使用 `@/lib/xxx`、`@/components/xxx`。

---

## 架构特点

### 1. SSR / 缓存策略
- **首页**: `getServerSideProps` 实时获取热门歌单，服务端渲染。
- **API 缓存**: 热门歌单使用 `public, max-age=300, s-maxage=1800, stale-while-revalidate=7200`；歌曲 URL 使用短缓存 `max-age=30`。
- **静态资源**: 字体/图片 immutable 缓存一年（由 `vercel.json` 和 `next.config.js` 同时控制）。

### 2. 客户端打包（零服务器流量）
- 浏览器端直接请求网易云 CDN 下载音频文件。
- 使用 `JSZip`（`public/jszip.min.js` 本地引入）在浏览器内存中打包 ZIP，通过 `URL.createObjectURL` 触发下载。
- 服务器不参与音频数据传输，可承受高并发。

### 3. 登录与权限
- 二维码扫码登录（`pages/api/auth/qr/*`），依赖网易云官方 Web 接口。
- 登录凭证以 **HttpOnly Cookie**（`NETEASE_MUSIC_COOKIE`）存储，开发环境需 HTTPS（`server.js` 提供自签名证书）。
- 已登录用户可获取 VIP 歌曲完整版 URL；未登录时 `fee` 字段标识 VIP/付费/试听，UI 显示红色标签提示。

### 4. 安全头
`vercel.json` 统一配置：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- HTTP → HTTPS 强制跳转（生产域名）

---

## 测试与调试

- **本项目暂无自动化测试框架**（无 Jest / Vitest / Playwright 配置）。
- 调试依赖前后端结构化日志：
  - 前端日志输出到浏览器控制台（`🔵 [API请求]` / `✅ [API成功]` / `❌ [API错误]`）。
  - 后端日志输出到终端（`🔵 [API名称] 请求开始` / `✅ ... 请求成功` / `❌ ... 请求失败`）。
  - 通过 `reqId` 可追踪全链路。
- 登录功能调试必须使用 `npm run dev`（HTTPS），否则 HttpOnly Cookie 无法正常工作。

---

## 部署流程

### Vercel（推荐）
1. `vercel.json` 已完整配置：Headers、Redirects、Rewrites、Cron（每日自动生成 sitemap）。
2. 构建命令：`next build`
3. 输出目录：`.next`
4. Region：`sin1`（新加坡）
5. 每次 push 到 main 分支自动部署；PR 自动生成预览链接。

### 环境变量（可选）
```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 构建后检查
- `npm run build` 后会自动执行 `scripts/check-missing-deps.js`，检测 `NeteaseCloudMusicApi`、`xml2js` 等关键依赖是否被 Next.js 正确包含在输出追踪中。

---

## 注意事项

- **Node.js 版本**：必须 >= 20.9.0，推荐与 `.nvmrc` 一致（22.21.0）。
- **HTTPS 要求**：登录功能、Cookie 安全标记依赖 HTTPS，生产环境强制 HTTPS。
- **第三方库本地托管**：JSZip、Remixicon 均放在 `public/` 本地提供，避免外部 CDN 不稳定。
- **网易云 API 依赖**：`NeteaseCloudMusicApi` 模块路径有时需直接 `require` 子模块（如 `login_status.js`、`request.js`），这在登录状态接口中有体现。
- **图片协议处理**：网易云 CDN 返回的 URL 可能是 `http://`，统一通过 `lib/url-utils.ts` 的 `ensureHttps()` 转为 HTTPS，避免 Mixed Content 警告。
