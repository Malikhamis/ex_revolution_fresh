#!/usr/bin/env node

/**
 * CSS Optimization Script
 * Minifies and optimizes CSS files for production
 */

const fs = require('fs');
const path = require('path');

// Simple CSS minification function
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        // Remove whitespace around specific characters
        .replace(/\s*{\s*/g, '{')
        .replace(/;\s*/g, ';')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*:\s*/g, ':')
        // Remove trailing semicolons
        .replace(/;}/g, '}')
        // Remove leading/trailing whitespace
        .trim();
}

// Get file size in KB
function getFileSizeKB(filePath) {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
}

console.log('🎨 Optimizing CSS files...\n');

// Create dist/css directory
const distCssDir = path.join(__dirname, '../dist/css');
if (!fs.existsSync(distCssDir)) {
    fs.mkdirSync(distCssDir, { recursive: true });
}

// CSS files to optimize
const cssDir = path.join(__dirname, '../css');
const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));

let totalOriginalSize = 0;
let totalMinifiedSize = 0;
const optimizedFiles = [];

cssFiles.forEach(file => {
    const inputPath = path.join(cssDir, file);
    const outputPath = path.join(distCssDir, file.replace('.css', '.min.css'));
    
    try {
        // Read original CSS
        const originalCSS = fs.readFileSync(inputPath, 'utf8');
        const originalSize = Buffer.byteLength(originalCSS, 'utf8');
        
        // Minify CSS
        const minifiedCSS = minifyCSS(originalCSS);
        const minifiedSize = Buffer.byteLength(minifiedCSS, 'utf8');
        
        // Write minified CSS
        fs.writeFileSync(outputPath, minifiedCSS);
        
        // Calculate savings
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        const originalKB = (originalSize / 1024).toFixed(2);
        const minifiedKB = (minifiedSize / 1024).toFixed(2);
        
        console.log(`✅ ${file}`);
        console.log(`   Original: ${originalKB} KB`);
        console.log(`   Minified: ${minifiedKB} KB`);
        console.log(`   Savings: ${savings}%\n`);
        
        totalOriginalSize += originalSize;
        totalMinifiedSize += minifiedSize;
        
        optimizedFiles.push({
            file,
            originalSize: originalKB,
            minifiedSize: minifiedKB,
            savings
        });
        
    } catch (error) {
        console.error(`❌ Error optimizing ${file}:`, error.message);
    }
});

// Create combined CSS file
console.log('📦 Creating combined CSS file...');

const combinedCSS = cssFiles
    .map(file => {
        const filePath = path.join(cssDir, file);
        return fs.readFileSync(filePath, 'utf8');
    })
    .join('\n');

const combinedMinified = minifyCSS(combinedCSS);
const combinedPath = path.join(distCssDir, 'combined.min.css');
fs.writeFileSync(combinedPath, combinedMinified);

const combinedOriginalKB = (Buffer.byteLength(combinedCSS, 'utf8') / 1024).toFixed(2);
const combinedMinifiedKB = (Buffer.byteLength(combinedMinified, 'utf8') / 1024).toFixed(2);
const combinedSavings = ((Buffer.byteLength(combinedCSS, 'utf8') - Buffer.byteLength(combinedMinified, 'utf8')) / Buffer.byteLength(combinedCSS, 'utf8') * 100).toFixed(1);

console.log(`✅ combined.min.css`);
console.log(`   Original: ${combinedOriginalKB} KB`);
console.log(`   Minified: ${combinedMinifiedKB} KB`);
console.log(`   Savings: ${combinedSavings}%\n`);

// Generate CSS optimization report
const report = {
    timestamp: new Date().toISOString(),
    totalFiles: cssFiles.length,
    totalOriginalSize: (totalOriginalSize / 1024).toFixed(2) + ' KB',
    totalMinifiedSize: (totalMinifiedSize / 1024).toFixed(2) + ' KB',
    totalSavings: ((totalOriginalSize - totalMinifiedSize) / totalOriginalSize * 100).toFixed(1) + '%',
    files: optimizedFiles,
    combined: {
        originalSize: combinedOriginalKB + ' KB',
        minifiedSize: combinedMinifiedKB + ' KB',
        savings: combinedSavings + '%'
    }
};

fs.writeFileSync(
    path.join(distCssDir, 'optimization-report.json'),
    JSON.stringify(report, null, 2)
);

// Summary
console.log('📊 CSS Optimization Summary:');
console.log(`   Files processed: ${cssFiles.length}`);
console.log(`   Total original size: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
console.log(`   Total minified size: ${(totalMinifiedSize / 1024).toFixed(2)} KB`);
console.log(`   Total savings: ${((totalOriginalSize - totalMinifiedSize) / totalOriginalSize * 100).toFixed(1)}%`);
console.log(`   Combined file: combined.min.css (${combinedMinifiedKB} KB)`);
console.log(`   Report: dist/css/optimization-report.json\n`);

console.log('💡 Usage Tips:');
console.log('   • Use combined.min.css for maximum performance');
console.log('   • Individual .min.css files for modular loading');
console.log('   • Enable gzip compression for additional 60-80% savings');
console.log('   • Consider critical CSS inlining for above-the-fold content\n');

console.log('✨ CSS optimization completed!\n');
