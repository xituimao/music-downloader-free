# 🎵 音乐下载助手

一站式「搜索歌单、试听、批量下载」工具。基于 **Next.js SSR 架构**，SEO 友好，支持服务端渲染与静态生成。浏览器端完成打包，服务器零流量压力。

## ✨ 功能特性

- **首页热榜**: 展示热门歌单卡片，点击即进详情（SSR 渲染）
- **歌单搜索**: 支持搜索框输入，SEO 友好的路由（`/search/[关键词]`）
- **歌单详情**: Spotify 风格大封面背景、创建者、曲目数、描述等（SSR 渲染）
- **在线播放器**: 底部播放器支持播放/暂停、进度条、音量调节、移动端自适应
- **VIP识别**: 依据 `fee` 字段标记 VIP/付费/试听，UI 红标签提示
- **多选与批量**: 全选/取消全选，红色角标动态显示已选数量
- **客户端打包**: 浏览器端直连网易云CDN下载，使用 JSZip 在本地打包 ZIP
- **实时反馈**: 进度条、详细日志、成功/失败/跳过统计
- **SEO 优化**: 动态 meta、JSON-LD 结构化数据、sitemap、robots.txt
- **GTM 埋点**: 集成 Google Tag Manager，支持事件追踪
- **文档页面**: 使用教程（`/docs/guide`）、音质科普（`/docs/quality`）

提示：VIP/付费歌曲在未登录会员场景下通常仅能获取试听版（约30秒），界面与日志会明确标注。

## 🚀 快速开始

### 环境要求
- Node.js 16+（推荐 18+）

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
支持热更新（Next.js Fast Refresh），启动成功后访问 `http://localhost:3000`。

若遇到端口占用，可先清理 3000 端口：
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
npm run dev
```
以上做法是我们一贯的标准流程，避免端口冲突导致的假失败 [[memory:10292525]]。

### 生产构建与启动
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🧭 使用指引

### 1. 首页（`/`）
- 居中搜索框，输入关键词即可搜索歌单
- 下方展示热门歌单卡片（SSR 渲染，SEO 友好）
- 点击歌单卡片进入详情页

### 2. 搜索歌单（`/search/[关键词]`）
- 输入关键词并回车/点击搜索按钮
- 结果以卡片列表展示，包含封面、标题、创建者、歌曲数
- 点击任意歌单进入详情页
- SEO 友好：支持搜索引擎抓取和索引

### 3. 歌单详情（`/playlist/[ID]`）
- Spotify 风格大封面背景+渐变遮罩
- 左侧封面、右侧标题/作者/数量/描述
- 列表支持勾选、全选/取消全选
- 右侧播放按钮可直接试听单曲
- SSR 渲染，支持分享和 SEO

### 4. 播放器
- 底部悬浮播放器，显示封面、歌名、歌手
- 支持播放/暂停、进度条、音量调整
- 移动端针对性简化控件

### 5. 批量下载
- 勾选歌曲后点击"下载"
- 浏览器逐首直连获取音频（零服务器流量）
- 完成后在本地打包为 ZIP 并触发保存
- 日志面板同步显示进度与每首结果
- VIP/付费歌曲会提示"试听版30秒"

### 6. 文档页面
- [使用教程](/docs/guide) - 详细使用说明与常见问题
- [音质科普](/docs/quality) - 音质格式说明（MP3/FLAC/APE 等）

更多细节：
- [使用指南.md](./docs/使用指南.md)
- [播放器使用说明.md](./docs/播放器使用说明.md)
- [VIP歌曲说明.md](./docs/VIP歌曲说明.md)

## 🛠 技术与架构

### 核心技术栈
- **框架**: Next.js 13（React 18 + TypeScript）
- **渲染策略**: SSR（服务端渲染）+ ISR（增量静态再生成）
- **路由**: Next.js App Router（SEO 友好，无 hash）
- **API**: Next.js API Routes（代理网易云音乐 API）
- **前端逻辑**: React Hooks + 原生 Fetch + JSZip
- **样式**: CSS（Spotify 深色主题，移动端自适应）
- **图标**: Remixicon（本地托管）
- **监控**: Google Tag Manager（GTM-5GDR9Z8Z）

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
   
4. **本地库原则**
   - 第三方库本地托管，避免 CDN 不稳定性 [[memory:10292620]]
   - JSZip、Remixicon 均在 `public/` 目录本地提供

## 🔌 API 文档

所有接口均为 Next.js API Routes（GET 请求）：

### 页面路由
- `/` - 首页（热门歌单）
- `/search/[q]` - 搜索歌单（动态路由）
- `/playlist/[id]` - 歌单详情（动态路由）
- `/docs/guide` - 使用教程
- `/docs/quality` - 音质科普

### API 接口
- **GET** `/api/playlist/hot`
  - 用途: 获取热门歌单（首页推荐）
  - 参数: `cat`(默认"全部") `limit`(默认20) `offset`(默认0)
  - 返回: 网易云原始结构（含 `playlists`）

- **GET** `/api/search/playlist`
  - 用途: 搜索歌单
  - 参数: `keywords`(必填) `limit` `offset`
  - 返回: 网易云原始结构（`result.playlists`）

- **GET** `/api/playlist/detail`
  - 用途: 获取歌单详情与曲目
  - 参数: `id`(必填)
  - 返回: `playlist`（含 `tracks`）

- **GET** `/api/song/url`
  - 用途: 批量获取歌曲直链
  - 参数: `ids`(必填，逗号分隔) `level`(默认 standard；可选 standard/higher/exhigh/lossless/hires...)
  - 返回: `data[ { id, url, br, ... } ]`

### SEO 资源
- **GET** `/api/sitemap.xml` - 站点地图
- **GET** `/api/robots.txt` - 爬虫控制文件

说明：站内试听默认尝试 `exhigh`，批量下载使用接口返回的可用直链，失败会在日志中标注并跳过。

## 📦 数据与业务规则

- `fee` 含义: 0 免费，1 VIP，4 付费专辑，8 低音质免费；VIP/付费会标“VIP/付费/试听”。
- 文件名规范: `歌手 - 歌名.mp3`，自动清理非法字符。
- 图片优化: 通过 `?param=WxH` 请求缩略图（如 `200x200`）以降低体积。
- 下载与打包: 浏览器串行下载每首歌后写入 ZIP（更稳定、内存友好）。

## ⚙️ 部署与运维

### Vercel 部署（推荐）

**快速开始**：
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录并部署
vercel login
vercel

# 3. 后续更新（自动部署）
git push
```

**部署文档**：
- 📋 [Vercel部署检查清单.md](./docs/Vercel部署检查清单.md) - 部署前必读
- 📖 [部署指南.md](./docs/部署指南.md) - 详细步骤说明

**配置文件**：
- `vercel.json` - Vercel 部署配置（API 超时、区域、缓存等）
- `.vercelignore` - 排除不需要部署的文件
- `next.config.js` - Next.js 配置（i18n、图片优化）

### 自托管部署

1. **构建生产版本**
```bash
npm install
npm run build
```

2. **启动服务**
```bash
npm start
# 或使用 PM2 守护进程
pm2 start npm --name "music-download" -- start
```

3. **反向代理（可选）**
使用 Nginx/Caddy 配置反向代理，启用 HTTPS 和缓存策略。

### 注意事项
- 默认端口 3000，可通过环境变量 `PORT` 修改
- 若端口被占用，先清理进程再启动，避免多实例冲突 [[memory:10292525]]
- 生产建议使用进程守护（如 pm2/systemd）
- Vercel 部署后记得在 Google Search Console 提交 sitemap

## ❓常见问题（FAQ）

- 为什么有些歌曲没有直链/只能试听？
  - 版权与会员限制导致，接口会返回空 `url` 或仅提供试听版。

- 批量下载会很慢吗？
  - 串行策略更稳健；建议单次不超过 50 首，以平衡速度与稳定性。

- 下载的文件在哪里？
  - 浏览器默认下载目录；ZIP 文件名包含歌单名与时间戳。

- 403/429 报错？
  - 可能是网络或频率限制，稍候重试或减少请求量。

更多问题与技巧请参见：[使用指南.md](./docs/使用指南.md)

## 📁 目录结构

```
music-download/
├── pages/                    # Next.js 页面与 API Routes
│   ├── index.tsx             # 首页（热门歌单）
│   ├── search/[q].tsx        # 搜索页（动态路由）
│   ├── playlist/[id].tsx     # 歌单详情页（动态路由）
│   ├── docs/
│   │   ├── guide.tsx         # 使用教程
│   │   └── quality.tsx       # 音质科普
│   ├── api/
│   │   ├── playlist/
│   │   │   ├── hot.ts        # 热门歌单 API
│   │   │   └── detail.ts     # 歌单详情 API
│   │   ├── search/
│   │   │   └── playlist.ts   # 搜索歌单 API
│   │   ├── song/
│   │   │   └── url.ts        # 歌曲链接 API
│   │   ├── sitemap.xml.ts    # 动态 sitemap
│   │   └── robots.txt.ts     # 动态 robots.txt
│   ├── _app.tsx              # App 入口（GTM 埋点）
│   └── _document.tsx         # Document（GTM 脚本）
├── lib/
│   └── seo.ts                # SEO 配置与关键词库
├── styles/
│   └── globals.css           # 全局样式（Spotify 风格）
├── public/                   # 静态资源（本地托管，无 CDN）
│   ├── jszip.min.js          # 本地 JSZip 库
│   └── remixicon.*           # 图标字体
├── vercel.json               # Vercel 部署配置
├── .vercelignore             # Vercel 部署忽略文件
├── next.config.js            # Next.js 配置
├── tsconfig.json             # TypeScript 配置
├── package.json              # 脚本与依赖
├── README.md                 # 本文档
└── docs/                     # 技术文档
    ├── Vercel部署检查清单.md # 部署前检查项
    ├── 部署指南.md           # 详细部署步骤
    ├── SEO优化总结.md        # SEO 优化说明
    ├── GSC提交指南.md        # 搜索引擎提交指南
    ├── 使用指南.md           # 用户使用手册
    ├── 播放器使用说明.md     # 播放器功能说明
    └── VIP歌曲说明.md        # VIP 歌曲限制说明
```

## 🔥 重构变化（v2.0）

### 架构升级
- ✅ **Express 静态服务 → Next.js SSR** - 全面拥抱服务端渲染
- ✅ **原生 JS → TypeScript + React** - 类型安全与组件化开发
- ✅ **Hash 路由 → 无 hash 路由** - SEO 友好的路由系统

### SEO 优化
- ✅ **结构化数据** - JSON-LD（WebSite、MusicPlaylist、FAQPage）
- ✅ **动态 meta** - 每个页面独立的 title、description、OG 标签
- ✅ **Sitemap & Robots** - 动态生成，支持搜索引擎抓取
- ✅ **关键词库** - 配置化管理 SEO 关键词与模板

### 监控埋点
- ✅ **GTM 集成** - Google Tag Manager（GTM-5GDR9Z8Z）
- ✅ **事件追踪** - page_view、search_submit、playlist_view

### 新增功能
- ✅ **文档页面** - 使用教程、音质科普
- ✅ **ISR 支持** - 增量静态再生成，提升性能

详细变化见：[SEO优化总结.md](./docs/SEO优化总结.md)

## ⚠️ 法律与合规

- 本项目仅供学习与交流，请勿用于商业或任何侵权用途；请支持正版音乐。
- 若涉及第三方版权，请遵循相应平台与法律法规。

## 📄 License

MIT

—— Made with ❤️ by 蓉儿 | 仅供学习交流使用

