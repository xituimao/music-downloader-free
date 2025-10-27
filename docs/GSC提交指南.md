# Google Search Console 提交与验证指南

## 1. 验证网站所有权

### 方式一：HTML 标记验证（推荐）
1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 添加资源 → 输入你的域名（如 `https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app`）
3. 选择"HTML 标记"验证方式
4. 复制提供的 meta 标签，例如：
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
   ```
5. 将该标签添加到 `pages/_document.tsx` 的 `<Head>` 中
6. 部署后点击"验证"

### 方式二：DNS 验证
1. 在域名提供商处添加 TXT 记录
2. 记录值为 GSC 提供的验证字符串
3. 等待 DNS 生效后点击"验证"

## 2. 提交 Sitemap

1. 验证成功后，进入 GSC 控制台
2. 左侧菜单 → "站点地图"
3. 输入 sitemap URL：`https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app/sitemap.xml`
4. 点击"提交"

## 3. 监控与优化

### 关键指标
- **索引覆盖**：查看已索引/未索引页面
- **效果报告**：展示量、点击量、平均排名、CTR
- **核心网页指标**：LCP、CLS、INP
- **抓取统计**：抓取频率、错误率

### 定期检查（建议每周）
1. 查看"效果"报告，分析热门查询词与页面
2. 检查"覆盖范围"，修复错误与警告
3. 查看"核心网页指标"，优化性能问题
4. 根据真实搜索词调整 SEO 标题/描述

## 4. Bing Webmaster Tools（可选）

1. 访问 [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. 添加站点并验证（可导入 GSC 验证）
3. 提交 sitemap：`https://music-download-free-ol1pmbf2z-xituimaos-projects.vercel.app/sitemap.xml`

## 5. 百度站长平台（可选，国内用户）

1. 访问 [百度搜索资源平台](https://ziyuan.baidu.com/)
2. 添加站点并验证
3. 提交 sitemap（百度对 sitemap 支持有限，建议主动推送）

## 注意事项

- 验证后保留验证标签，不要删除
- sitemap 更新后会自动被抓取，无需重复提交
- 新站收录需要时间（通常 1-4 周），耐心等待
- 定期查看"消息"栏，及时处理 Google 的通知

