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
const nftFiles = execSync('find .next/server -name "*.nft.json"', { encoding: 'utf-8' })
  .trim()
  .split('\n');

const missingDeps = new Set();
const checkedPackages = new Set();

for (const nftFile of nftFiles) {
  const nftData = JSON.parse(fs.readFileSync(nftFile, 'utf-8'));
  const tracedFiles = new Set(nftData.files);

  // 检查关键依赖包
  const criticalPackages = [
    'NeteaseCloudMusicApi',
    'xml2js',
    'sax',
    'xmlbuilder',
  ];

  for (const pkg of criticalPackages) {
    if (checkedPackages.has(pkg)) continue;
    checkedPackages.add(pkg);

    // 检查包的主文件是否被追踪
    const pkgPath = `node_modules/${pkg}/`;
    const pkgFiles = [...tracedFiles].filter(f => f.includes(pkgPath));

    if (pkgFiles.length === 0) {
      missingDeps.add(pkg);
      console.log(`❌ 缺失依赖: ${pkg}`);
      console.log(`   在 ${nftFile} 中未找到`);
    } else {
      console.log(`✅ 已包含: ${pkg} (${pkgFiles.length} 个文件)`);
    }
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

