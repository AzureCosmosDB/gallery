/**
 * Image Optimization Script for GitHub Pages Deployment
 * Optimizes all images in static/img for production use
 * - Converts PNG/JPG to WebP with quality 70
 * - Generates responsive image variants (300w, 600w, 1200w)
 * - Optimizes SVGs
 * - Maintains original files as fallback
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { optimize } = require('svgo');

const QUALITY = 70; // Balanced quality
const SIZES = [300, 600, 1200]; // Responsive breakpoints
const INPUT_DIR = path.join(__dirname, '../static/img');
const OUTPUT_DIR = path.join(__dirname, '../static/img-optimized');

// File size formatter
function formatBytes(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function optimizeSvg(inputPath, outputPath) {
  try {
    const svgContent = await fs.readFile(inputPath, 'utf8');
    const result = optimize(svgContent, {
      path: inputPath,
      multipass: true,
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
              cleanupIds: false,
            },
          },
        },
        'removeDimensions',
        'removeScriptElement',
      ],
    });

    await fs.writeFile(outputPath, result.data);
    
    const originalSize = (await fs.stat(inputPath)).size;
    const optimizedSize = result.data.length;
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(2);
    
    console.log(`✓ ${path.basename(inputPath)}: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savings}% saved)`);
  } catch (error) {
    console.error(`✗ Error optimizing ${inputPath}:`, error.message);
  }
}

async function optimizeRasterImage(inputPath, outputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const basename = path.basename(inputPath, ext);
    const outputDir = path.dirname(outputPath);
    
    await ensureDir(outputDir);
    
    const originalSize = (await fs.stat(inputPath)).size;
    let totalSaved = 0;
    
    // Generate optimized original format
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Optimize in original format
    if (ext === '.png') {
      await image
        .png({ quality: QUALITY, compressionLevel: 9, adaptiveFiltering: true })
        .toFile(outputPath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await image
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(outputPath);
    }
    
    const optimizedSize = (await fs.stat(outputPath)).size;
    totalSaved += (originalSize - optimizedSize);
    
    // Generate WebP versions at different sizes
    // Always generate all sizes up to the original width (or the size itself if larger)
    for (const size of SIZES) {
      const webpPath = path.join(outputDir, `${basename}-${size}w.webp`);
      // If size is larger than original, use original dimensions
      const targetWidth = size < metadata.width ? size : metadata.width;
      await sharp(inputPath)
        .resize(targetWidth, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(webpPath);
    }
    
    // Generate full-size WebP
    const webpPath = path.join(outputDir, `${basename}.webp`);
    await sharp(inputPath)
      .webp({ quality: QUALITY })
      .toFile(webpPath);
    
    const webpSize = (await fs.stat(webpPath)).size;
    totalSaved += (originalSize - webpSize);
    
    const savings = ((totalSaved / (originalSize * 2)) * 100).toFixed(2);
    console.log(`✓ ${path.basename(inputPath)}: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} + WebP ${formatBytes(webpSize)} (${savings}% avg saved)`);
    
  } catch (error) {
    console.error(`✗ Error optimizing ${inputPath}:`, error.message);
  }
}

async function processDirectory(inputDir, outputDir) {
  try {
    const entries = await fs.readdir(inputDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const inputPath = path.join(inputDir, entry.name);
      const outputPath = path.join(outputDir, entry.name);
      
      if (entry.isDirectory()) {
        await ensureDir(outputPath);
        await processDirectory(inputPath, outputPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
          await optimizeRasterImage(inputPath, outputPath);
        } else if (ext === '.svg') {
          await optimizeSvg(inputPath, outputPath);
        } else {
          // Copy other files as-is
          await fs.copyFile(inputPath, outputPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${inputDir}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting image optimization for GitHub Pages...\n');
  console.log(`Input:  ${INPUT_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Quality: ${QUALITY}%\n`);
  
  await ensureDir(OUTPUT_DIR);
  await processDirectory(INPUT_DIR, OUTPUT_DIR);
  
  console.log('\n✨ Image optimization complete!');
  console.log('📝 Note: Update imports to use img-optimized folder or use the OptimizedImage component');
}

main().catch(console.error);

