# Vercel 部署检查清单 ✅

在部署到 Vercel 之前，请逐项检查以下内容：

## 📋 配置文件检查

### 必需文件
- [x] `package.json` - 依赖与脚本配置
- [x] `next.config.js` - Next.js 配置（含 i18n）
- [x] `tsconfig.json` - TypeScript 配置
- [x] `vercel.json` - Vercel 部署配置
- [x] `.vercelignore` - 部署忽略文件
- [x] `next-i18next.config.js` - 国际化配置

### 配置项检查
- [x] **API 超时时间**: 10 秒（免费版配置）
- [x] **部署区域**: `["sfo1"]`（旧金山，免费版单区域）
- [x] **国际化**: 支持中文（zh）和英文（en）
- [x] **SEO 配置**: sitemap.xml 和 robots.txt 路由重写
- [x] **安全头部**: X-Frame-Options, CSP 等
- [x] **缓存策略**: 静态资源 1 年缓存

## 🔍 代码检查

### 页面路由
- [x] `/` - 首页（热门歌单）
- [x] `/search/[q]` - 搜索页
- [x] `/playlist/[id]` - 歌单详情页
- [x] `/docs/guide` - 使用教程
- [x] `/docs/quality` - 音质科普
- [x] `/licenses` - 开源许可（如果有）

### API Routes
- [x] `/api/playlist/hot` - 热门歌单
- [x] `/api/playlist/detail` - 歌单详情
- [x] `/api/search/playlist` - 搜索歌单
- [x] `/api/song/url` - 歌曲链接
- [x] `/api/sitemap.xml` - 站点地图
- [x] `/api/robots.txt` - 爬虫控制

### 静态资源
- [x] `/public/jszip.min.js` - 本地 JSZip 库
- [x] `/public/remixicon.*` - 图标字体
- [x] `/public/locales/` - 国际化翻译文件

## 🌐 国际化检查

### 语言支持
- [x] 中文（zh）- 默认语言
- [x] 英文（en）

### 翻译文件
- [x] `/public/locales/zh/common.json`
- [x] `/public/locales/zh/home.json`
- [x] `/public/locales/zh/search.json`
- [x] `/public/locales/zh/playlist.json`
- [x] `/public/locales/zh/docs.json`
- [x] `/public/locales/zh/seo.json`
- [x] `/public/locales/en/...` （对应英文翻译）

## 🚀 部署步骤

### 方式一：通过 Vercel CLI（推荐）

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **首次部署**
```bash
vercel
```
按提示选择项目设置，Vercel 会自动检测 Next.js 框架

4. **生产部署**
```bash
vercel --prod
```

### 方式二：通过 GitHub 集成

1. 将代码推送到 GitHub
```bash
git add .
git commit -m "feat: 准备 Vercel 部署"
git push origin main
```

2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 导入项目
   - 选择 GitHub 仓库
   - Vercel 自动检测 Next.js
   - 点击 Deploy

3. 后续更新自动部署
```bash
git push origin main  # 每次 push 都会自动触发部署
```

## ⚙️ 环境变量配置（可选）

如需配置环境变量，在 Vercel Dashboard → Settings → Environment Variables 添加：

```env
# 站点 URL（用于 SEO）
NEXT_PUBLIC_SITE_URL=https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app

# GTM 容器 ID（已硬编码，无需配置）
NEXT_PUBLIC_GTM_ID=GTM-5GDR9Z8Z

# API 超时时间（毫秒）
API_TIMEOUT=30000
```

## 🔧 Vercel 免费版限制

如果使用 **Hobby（免费）** 版本，需注意以下限制：

### 需要调整的配置

1. **API 超时时间**：修改 `vercel.json`
```json
{
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 10  // 改为 10 秒
    }
  }
}
```

2. **部署区域**：免费版仅支持单区域
```json
{
  "regions": ["sfo1"]  // 已配置为单区域
}
```

### 免费版限制
- ✅ 带宽：100 GB/月
- ✅ 构建时间：6 小时/月
- ✅ Serverless Function 执行时间：10 秒（已配置）
- ✅ Serverless Function 调用：100 GB-小时/月
- ❌ 不支持多区域部署（已配置单区域 sfo1）
- ❌ 不支持高级分析

> 对于本项目，免费版完全够用！因为：
> - 音频下载在客户端完成，不消耗服务器流量
> - API 请求很轻量（仅返回 JSON）
> - 每月 100GB 带宽可支持数万用户

## ✅ 部署后验证

### 1. 基础功能
- [ ] 访问首页：`https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app`
- [ ] 搜索功能：`https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app/search/周杰伦`
- [ ] 歌单详情：`https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app/playlist/123456`
- [ ] 文档页面：`https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app/docs/guide`

### 2. 国际化
- [ ] 中文版：`https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app/zh`
- [ ] 英文版：`https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app/en`
- [ ] 语言切换：浏览器语言自动检测

### 3. SEO 资源
- [ ] Sitemap：`https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app/sitemap.xml`
- [ ] Robots：`https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app/robots.txt`
- [ ] 结构化数据：查看页面源代码，确认 JSON-LD

### 4. 监控埋点
- [ ] GTM 加载：打开浏览器开发者工具 → Network → 筛选 `gtm`
- [ ] 事件触发：GTM Preview 模式测试 page_view、search_submit 等

### 5. 性能检查
使用 [PageSpeed Insights](https://pagespeed.web.dev/) 检查：
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

## 🎯 部署成功后

### 1. 提交到搜索引擎
- [ ] Google Search Console 提交 sitemap
- [ ] Bing Webmaster Tools 提交 sitemap
- [ ] 百度搜索资源平台（可选）

详见：[GSC提交指南.md](./GSC提交指南.md)

### 2. 配置 Google Analytics
- [ ] 在 GTM 中创建 GA4 配置标签
- [ ] 设置 Measurement ID
- [ ] 测试事件触发

### 3. 自定义域名（可选）
- [ ] 在 Vercel Dashboard → Settings → Domains 添加域名
- [ ] 配置 DNS 记录（CNAME 或 A 记录）
- [ ] 等待 SSL 证书自动配置

## 🐛 常见问题

### 部署失败
- 检查 `package.json` 中的依赖是否完整
- 查看 Vercel 构建日志
- 确认 Node.js 版本兼容（项目使用 Node 16+）

### API 超时
- 检查 `vercel.json` 中的 `maxDuration` 配置
- 免费版最大 10 秒，Pro 版最大 60 秒

### 国际化不工作
- 确认 `next-i18next.config.js` 配置正确
- 确认 `/public/locales/` 翻译文件存在
- 检查 `next.config.js` 是否引入了 i18n 配置

### SEO 资源 404
- 确认 `pages/api/sitemap.xml.ts` 和 `pages/api/robots.txt.ts` 存在
- 检查 `vercel.json` 中的 rewrites 配置

## 📊 监控与优化

### 部署后持续监控
1. **Vercel Analytics**：查看访问量、性能指标
2. **Google Analytics**：用户行为分析
3. **Google Search Console**：搜索表现、索引状态
4. **Vercel 日志**：API 调用、错误追踪

### 性能优化建议
1. 启用 ISR（增量静态再生成）
2. 使用 `next/image` 优化图片
3. 配置 CDN 缓存策略
4. 监控 Core Web Vitals

---

**准备好了吗？开始部署吧！** 🚀

详细部署指南：[部署指南.md](./部署指南.md)

