const fs = require('fs');
const path = require('path');

// 尝试加载sharp，如果不可用则跳过PNG生成
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('⚠️  Sharp not available, skipping PNG generation');
}

// 创建一个简单的16x16像素的ICO文件
// ICO文件格式：https://en.wikipedia.org/wiki/ICO_(file_format)
function createSimpleIco() {
  // ICO文件头 (6字节)
  const fileHeader = Buffer.alloc(6);
  fileHeader.writeUInt16LE(0, 0); // Reserved
  fileHeader.writeUInt16LE(1, 2); // Type: 1 for ICO
  fileHeader.writeUInt16LE(1, 4); // Count: 1 image

  // ICO目录条目 (16字节)
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(16, 0); // Width: 16px
  dirEntry.writeUInt8(16, 1); // Height: 16px (doubled for XOR + AND mask)
  dirEntry.writeUInt8(0, 2);  // Color count: 0 for >256 colors
  dirEntry.writeUInt8(0, 3);  // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes: 1
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel: 32 (RGBA)
  dirEntry.writeUInt32LE(22, 8); // Image data size: 22 bytes header + image data
  dirEntry.writeUInt32LE(22, 12); // Image data offset: 22 bytes from start

  // 创建一个简单的16x16 RGBA图像数据
  // 绿色背景 (#1DB954) 和白色音乐符号
  const imageData = Buffer.alloc(16 * 16 * 4); // 16x16 pixels * 4 bytes per pixel (RGBA)

  // 填充绿色背景
  for (let i = 0; i < 16 * 16; i++) {
    const offset = i * 4;
    // 绿色背景 #1DB954
    imageData[offset] = 0x1D;     // R
    imageData[offset + 1] = 0xB9; // G
    imageData[offset + 2] = 0x54; // B
    imageData[offset + 3] = 0xFF; // A (opaque)
  }

  // 绘制简单的音乐符号 (大致的♪形状)
  const musicNote = [
    // 音符的点和线条
    {x: 6, y: 4}, {x: 6, y: 5}, {x: 6, y: 6}, {x: 6, y: 7}, {x: 6, y: 8},
    {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6}, {x: 7, y: 7}, {x: 7, y: 8},
    {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5}, {x: 8, y: 6}, {x: 8, y: 7}, {x: 8, y: 8},
    {x: 9, y: 3}, {x: 9, y: 4}, {x: 9, y: 5}, {x: 9, y: 6}, {x: 9, y: 7}, {x: 9, y: 8},
    {x: 10, y: 4}, {x: 10, y: 5}, {x: 10, y: 6}, {x: 10, y: 7}, {x: 10, y: 8},
    // 音符的圆点
    {x: 12, y: 5}, {x: 12, y: 6},
    {x: 13, y: 5}, {x: 13, y: 6}
  ];

  // 在音乐符号位置绘制白色像素
  musicNote.forEach(({x, y}) => {
    if (x >= 0 && x < 16 && y >= 0 && y < 16) {
      const offset = (y * 16 + x) * 4;
      imageData[offset] = 0xFF;     // R (white)
      imageData[offset + 1] = 0xFF; // G (white)
      imageData[offset + 2] = 0xFF; // B (white)
      imageData[offset + 3] = 0xFF; // A (opaque)
    }
  });

  // 组合成完整的ICO文件
  const icoBuffer = Buffer.concat([fileHeader, dirEntry, imageData]);

  return icoBuffer;
}

// 生成PNG版本用于Apple touch icon
async function createAppleTouchIcon() {
  if (!sharp) {
    console.log('⚠️  Sharp not available, creating simple PNG fallback');
    // 创建一个简单的180x180 PNG作为fallback
    const simplePng = Buffer.alloc(180 * 180 * 4);
    // 填充绿色背景
    for (let i = 0; i < 180 * 180; i++) {
      const offset = i * 4;
      simplePng[offset] = 0x1D;     // R
      simplePng[offset + 1] = 0xB9; // G
      simplePng[offset + 2] = 0x54; // B
      simplePng[offset + 3] = 0xFF; // A
    }
    return simplePng;
  }

  try {
    const svgBuffer = fs.readFileSync(path.join(__dirname, 'public/favicon.svg'));
    return await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toBuffer();
  } catch (error) {
    console.log('⚠️  Error creating PNG from SVG, using fallback');
    // 创建简单的绿色PNG作为fallback
    const fallbackPng = Buffer.alloc(180 * 180 * 4);
    for (let i = 0; i < 180 * 180; i++) {
      const offset = i * 4;
      fallbackPng[offset] = 0x1D;     // R
      fallbackPng[offset + 1] = 0xB9; // G
      fallbackPng[offset + 2] = 0x54; // B
      fallbackPng[offset + 3] = 0xFF; // A
    }
    return fallbackPng;
  }
}

// 生成并保存所有图标文件
async function generateIcons() {
  try {
    // 生成favicon.ico
    const icoBuffer = createSimpleIco();
    fs.writeFileSync(path.join(__dirname, 'public/favicon.ico'), icoBuffer);
    console.log('✅ favicon.ico created successfully!');

    // 生成Apple touch icon
    const appleTouchIconBuffer = await createAppleTouchIcon();
    fs.writeFileSync(path.join(__dirname, 'public/apple-touch-icon.png'), appleTouchIconBuffer);
    console.log('✅ apple-touch-icon.png created successfully!');

    console.log('🎵 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error creating icons:', error);
    process.exit(1);
  }
}

generateIcons();
