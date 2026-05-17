#!/usr/bin/env node
/**
 * 依赖完整性检测脚本
 * 检查 .nft.json 中是否包含所有运行时依赖
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 开始检测依赖完整性...\n');

// 读取所有 .nft.json 文件
const { globSync } = require('glob');
const nftFiles = globSync('.next/server/**/*.nft.json');

const missingDeps = new Set();

// 定义需要检查的关键依赖及其对应的页面路径
const criticalPackages = [
  { name: 'NeteaseCloudMusicApi', pages: ['index.js', 'playlist', 'search', 'api'] },
  { name: 'xml2js', pages: ['api/sitemap.xml'] },
  { name: 'sax', pages: ['api/sitemap.xml'] },
  { name: 'xmlbuilder', pages: ['api/sitemap.xml'] },
];

for (const pkg of criticalPackages) {
  let foundInAnyRelevantPage = false;
  let checkedAnyRelevantPage = false;

  for (const nftFile of nftFiles) {
    const relativePath = path.relative('.next/server/pages', nftFile).replace(/\\/g, '/');
    const isRelevant = pkg.pages.some(p => relativePath.includes(p));
    
    if (!isRelevant) continue;
    checkedAnyRelevantPage = true;

    const nftData = JSON.parse(fs.readFileSync(nftFile, 'utf-8'));
    const tracedFiles = new Set(nftData.files);
    const pkgPath = `node_modules/${pkg.name}/`;
    const pkgFiles = [...tracedFiles].filter(f => f.includes(pkgPath));

    if (pkgFiles.length > 0) {
      foundInAnyRelevantPage = true;
      console.log(`✅ 已包含: ${pkg.name} (${pkgFiles.length} 个文件) 在 ${relativePath}`);
      break;
    }
  }

  if (checkedAnyRelevantPage && !foundInAnyRelevantPage) {
    missingDeps.add(pkg.name);
    console.log(`❌ 缺失依赖: ${pkg.name}`);
    console.log(`   在相关页面中未找到`);
  }
}

console.log('\n' + '='.repeat(50));
if (missingDeps.size > 0) {
  console.log(`\n⚠️  发现 ${missingDeps.size} 个缺失的依赖:`);
  for (const dep of missingDeps) {
    console.log(`   - ${dep}`);
  }
  console.log('\n建议: 将这些依赖显式添加到 package.json 的 dependencies 中');
  process.exit(1);
} else {
  console.log('\n✨ 所有依赖检查通过！');
  process.exit(0);
}

