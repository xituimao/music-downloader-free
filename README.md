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

## 🚢 部署指南

### Vercel 部署（推荐）

#### 1. 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/music-download)

#### 2. 手动部署

1. **Fork 本仓库**到你的 GitHub 账号

2. **登录 [Vercel](https://vercel.com)**

3. **导入项目**
   - 点击 "Add New" → "Project"
   - 选择你 Fork 的仓库
   - 点击 "Import"

4. **配置项目**
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **环境变量**（可选）
   - 如需配置环境变量，在 "Environment Variables" 中添加

6. **部署**
   - 点击 "Deploy"
   - 等待 2-3 分钟完成构建
   - 获得免费的 `.vercel.app` 域名

#### 3. 自动部署

- 每次 push 到 main 分支，Vercel 自动重新部署
- 支持预览部署（PR 自动生成预览链接）

#### 4. 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名（如 `music.yourdomain.com`）
3. 按提示配置 DNS 记录（CNAME 或 A 记录）
4. 等待 SSL 证书自动生成（约 1 分钟）

### 自托管部署

#### Docker 部署

**1. 创建 Dockerfile**

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**2. 构建镜像**

```bash
docker build -t music-download .
```

**3. 运行容器**

```bash
docker run -p 3000:3000 music-download
```

**4. 使用 Docker Compose**

创建 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

运行：
```bash
docker-compose up -d
```

#### VPS/服务器部署

**1. 环境准备**

```bash
# 安装 Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证版本
node -v  # 应显示 v20.x.x
npm -v
```

**2. 克隆项目**

```bash
git clone https://github.com/your-username/music-download.git
cd music-download
```

**3. 安装依赖**

```bash
npm install
```

**4. 构建项目**

```bash
npm run build
```

**5. 使用 PM2 管理进程**

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "music-download" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs music-download

# 设置开机自启
pm2 startup
pm2 save
```

**6. 配置 Nginx 反向代理**

创建 `/etc/nginx/sites-available/music-download`：

```nginx
server {
    listen 80;
    server_name music.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/music-download /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**7. 配置 HTTPS（Let's Encrypt）**

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d music.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### 环境变量配置

项目支持以下环境变量（可选）：

```bash
# .env.local
NODE_ENV=production
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX  # Google Tag Manager ID
NEXT_PUBLIC_SITE_URL=https://yourdomain.com  # 网站URL
```

### 部署检查清单

- [ ] Node.js 版本 >= 20.9.0
- [ ] 依赖安装完成（`npm install`）
- [ ] 构建成功（`npm run build`）
- [ ] 生产环境使用 HTTPS
- [ ] Cookie 设置为 Secure（HTTPS环境自动启用）
- [ ] 配置自定义域名（可选）
- [ ] 配置 GTM 埋点（可选）
- [ ] 测试登录功能（需 HTTPS）
- [ ] 测试歌曲下载功能

### 常见问题

**Q: 登录功能无法使用？**
A: 确保部署环境使用 HTTPS，Cookie 需要 Secure 标记。Vercel 自动提供 HTTPS。

**Q: 构建失败？**
A: 检查 Node.js 版本是否 >= 20.9.0，运行 `npm run build` 查看详细错误。

**Q: 下载速度慢？**
A: 下载直连网易云 CDN，速度取决于用户网络环境，与部署服务器无关。

**Q: Vercel 部署后首次访问慢？**
A: Vercel 免费版有冷启动时间，首次访问约 3-5 秒，后续访问正常。

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
