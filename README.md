# 🎵 音乐下载助手

一站式「搜索歌单、试听、批量下载」工具。基于 **Next.js SSR 架构**，SEO 友好，支持服务端渲染与静态生成。浏览器端完成打包，服务器零流量压力。

🌐 **[在线体验](https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app)** | 📖 [使用文档](https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app/docs/guide)

## ✨ 功能特性

- **首页热榜**: 展示热门歌单卡片，点击即进详情（SSR 渲染）
- **歌单搜索**: 支持搜索框输入，SEO 友好的路由（`/search/[关键词]`）
- **歌单详情**: Spotify 风格大封面背景、创建者、曲目数、描述等（SSR 渲染）
- **在线播放器**: 底部播放器支持播放/暂停、进度条、音量调节、移动端自适应
- **🆕 账号登录**: 扫码登录网易云账号，下载VIP歌曲完整版
- **VIP识别**: 依据 `fee` 字段标记 VIP/付费/试听，UI 红标签提示
- **多选与批量**: 全选/取消全选，红色角标动态显示已选数量
- **客户端打包**: 浏览器端直连网易云CDN下载，使用 JSZip 在本地打包 ZIP
- **实时反馈**: 进度条、详细日志、成功/失败/跳过统计
- **SEO 优化**: 动态 meta、JSON-LD 结构化数据、sitemap、robots.txt
- **GTM 埋点**: 集成 Google Tag Manager，支持事件追踪
- **文档页面**: 使用教程（`/docs/guide`）、音质科普（`/docs/quality`）

> 🚀 **当前版本**: v2.0 已部署到生产环境，支持中英文切换、完整SEO优化、GTM埋点追踪

## 🚀 快速开始

### 环境要求
- Node.js 20+ （推荐 20.9.0+）

### 安装依赖
```bash
npm install
```

### 开发模式（HTTPS）
```bash
npm run dev
```

访问 **`https://localhost:3000`** 

> ⚠️ 首次访问会提示证书不受信任，点击"高级" → "继续前往localhost"即可

支持热更新（Next.js Fast Refresh），HTTPS环境下可测试登录功能。

### HTTP开发模式（可选）
```bash
npm run dev:http
```

### 构建生产版本
```bash
npm run build
npm start
```

## 🎯 登录功能

### PC端
1. 点击右下角悬浮按钮（绿色圆形）
2. 弹出二维码
3. 使用网易云APP扫描
4. 扫码成功后按钮变成你的头像

### 移动端
1. 点击悬浮按钮
2. 长按二维码识别或用另一台设备扫描
3. 登录成功后可下载VIP歌曲完整版

### 已登录用户
- 右下角显示头像
- 点击头像查看昵称
- 可退出登录

## 🛠 技术与架构

### 核心技术栈
- **框架**: Next.js 16（React 18 + TypeScript）
- **渲染策略**: SSR（服务端渲染）+ ISR（增量静态再生成）
- **路由**: Next.js Pages Router（SEO 友好，无 hash）
- **API**: Next.js API Routes（代理网易云音乐 API）
- **前端逻辑**: React Hooks + 原生 Fetch + JSZip
- **样式**: CSS（Spotify 深色主题，移动端自适应）
- **图标**: Remixicon（本地托管）
- **监控**: Google Tag Manager（GTM-5GDR9Z8Z）
- **登录**: 二维码扫码登录 + HttpOnly Cookie

### 架构特点
1. **SSR/ISR 混合渲染**
   - 首页：SSR 实时渲染热门歌单
   - 搜索页：SSR 动态生成 meta 和 JSON-LD
   - 歌单详情：SSR 渲染歌单信息，SEO 友好
   
2. **客户端打包（零服务器流量）**
   - 浏览器直连网易云 CDN 下载音频
   - 使用 JSZip 在本地打包 ZIP
   - 服务器零流量/零性能开销，极致扩展性
   
3. **SEO 优化**
   - 动态 meta 标签（title、description、OG）
   - JSON-LD 结构化数据（WebSite、MusicPlaylist、FAQPage）
   - 动态 sitemap 和 robots.txt
   - 关键词库与模板化管理（`lib/seo.ts`）
   
4. **登录与权限**
   - 二维码扫码登录（无需开发者账号）
   - HttpOnly Cookie 安全存储
   - 自动检测VIP歌曲并提示登录
   - 登录后自动获取高权限资源
   
5. **本地库原则**
   - 第三方库本地托管，避免 CDN 不稳定性
   - JSZip、Remixicon 均在 `public/` 目录本地提供

## 🔌 API 文档

### 页面路由
- `/` - 首页（热门歌单）
- `/search/[q]` - 搜索歌单（动态路由）
- `/playlist/[id]` - 歌单详情（动态路由）
- `/docs/guide` - 使用教程
- `/docs/quality` - 音质科普

### 登录接口
- **GET** `/api/auth/qr/key` - 生成二维码key
- **GET** `/api/auth/qr/create?key=xxx` - 创建二维码
- **GET** `/api/auth/qr/check?key=xxx` - 检查扫码状态
- **GET** `/api/auth/status` - 获取登录状态
- **POST** `/api/auth/logout` - 退出登录

### 音乐接口
- **GET** `/api/playlist/hot?cat=全部&limit=20&offset=0&order=hot`
- **GET** `/api/playlist/detail?id=歌单ID`
- **GET** `/api/search/playlist?keywords=关键词&limit=30&offset=0`
- **GET** `/api/song/url?ids=歌曲ID1,歌曲ID2&level=exhigh`

## 📖 使用说明

详见：[docs/使用指南.md](./docs/使用指南.md)

## 🔒 安全说明

- 登录使用网易云官方Web接口，无需第三方授权
- Cookie使用HttpOnly标记，防止XSS攻击
- 开发环境使用自签名HTTPS证书
- 生产环境强制HTTPS + Secure Cookie

## 📝 开发日志

- v2.0: 新增账号登录、悬浮登录按钮、智能播放器避让
- v1.5: SEO优化、GTM埋点、多语言支持
- v1.0: 基础搜索下载功能

## 📄 许可证

MIT License

---

Made with ❤️ by 蓉儿
