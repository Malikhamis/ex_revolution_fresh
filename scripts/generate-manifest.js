#!/usr/bin/env node

/**
 * Asset Manifest Generator
 * Creates a manifest file for asset versioning and cache busting
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate hash for file content
function generateFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

// Get file size in bytes
function getFileSize(filePath) {
    return fs.statSync(filePath).size;
}

// Recursively get all files in directory
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

console.log('📋 Generating asset manifest...\n');

// Asset directories to process
const assetDirs = [
    { name: 'CSS', path: 'css', extensions: ['.css'] },
    { name: 'JavaScript', path: 'js', extensions: ['.js'] },
    { name: 'Images', path: 'assets/images', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'] },
    { name: 'Fonts', path: 'assets/fonts', extensions: ['.woff', '.woff2', '.ttf', '.eot', '.otf'] }
];

const manifest = {};
const stats = {
    totalFiles: 0,
    totalSize: 0,
    categories: {}
};

// Process each asset directory
assetDirs.forEach(({ name, path: dirPath, extensions }) => {
    const fullPath = path.join(__dirname, '..', dirPath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ Directory not found: ${dirPath}`);
        return;
    }
    
    console.log(`📁 Processing ${name} files...`);
    
    const files = getAllFiles(fullPath);
    const categoryFiles = files.filter(file => 
        extensions.includes(path.extname(file).toLowerCase())
    );
    
    let categorySize = 0;
    
    categoryFiles.forEach(filePath => {
        const relativePath = path.relative(path.join(__dirname, '..'), filePath);
        const normalizedPath = relativePath.replace(/\\/g, '/'); // Normalize path separators
        
        try {
            const hash = generateFileHash(filePath);
            const size = getFileSize(filePath);
            const ext = path.extname(filePath);
            const basename = path.basename(filePath, ext);
            const dirname = path.dirname(normalizedPath);
            
            // Create versioned filename
            const versionedName = `${basename}.${hash}${ext}`;
            const versionedPath = dirname === '.' ? versionedName : `${dirname}/${versionedName}`;
            
            // Add to manifest
            manifest[normalizedPath] = versionedPath;
            
            categorySize += size;
            stats.totalFiles++;
            stats.totalSize += size;
            
            console.log(`   ✅ ${path.basename(filePath)} → ${versionedName}`);
            
        } catch (error) {
            console.error(`   ❌ Error processing ${filePath}:`, error.message);
        }
    });
    
    stats.categories[name] = {
        files: categoryFiles.length,
        size: categorySize,
        sizeFormatted: formatBytes(categorySize)
    };
    
    console.log(`   📊 ${categoryFiles.length} files, ${formatBytes(categorySize)}\n`);
});

// Generate integrity hashes for critical files
const criticalFiles = [
    'css/main.css',
    'js/app.js',
    'js/admin.js'
];

const integrity = {};

criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const hash = crypto.createHash('sha384').update(content).digest('base64');
        integrity[file] = `sha384-${hash}`;
        console.log(`🔒 Generated integrity hash for ${file}`);
    }
});

// Create comprehensive manifest
const fullManifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    assets: manifest,
    integrity: integrity,
    stats: {
        ...stats,
        totalSizeFormatted: formatBytes(stats.totalSize)
    },
    cdn: {
        enabled: process.env.CDN_ENABLED === 'true',
        baseUrl: process.env.CDN_BASE_URL || '',
        provider: process.env.CDN_PROVIDER || 'cloudflare'
    }
};

// Write manifest files
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Write full manifest
fs.writeFileSync(
    path.join(distDir, 'asset-manifest.json'),
    JSON.stringify(fullManifest, null, 2)
);

// Write simple asset mapping for quick lookups
fs.writeFileSync(
    path.join(distDir, 'assets.json'),
    JSON.stringify(manifest, null, 2)
);

// Write integrity hashes separately
fs.writeFileSync(
    path.join(distDir, 'integrity.json'),
    JSON.stringify(integrity, null, 2)
);

// Format bytes helper
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate summary
console.log('\n📊 Asset Manifest Summary:');
console.log(`   Total files: ${stats.totalFiles}`);
console.log(`   Total size: ${formatBytes(stats.totalSize)}`);
console.log(`   Categories:`);

Object.entries(stats.categories).forEach(([name, data]) => {
    console.log(`     ${name}: ${data.files} files (${data.sizeFormatted})`);
});

console.log(`\n📁 Generated files:`);
console.log(`   dist/asset-manifest.json - Full manifest with metadata`);
console.log(`   dist/assets.json - Simple asset mapping`);
console.log(`   dist/integrity.json - Subresource integrity hashes`);

console.log('\n💡 Usage Examples:');
console.log('   const manifest = require("./dist/assets.json");');
console.log('   const versionedPath = manifest["css/main.css"];');
console.log('   // Use versionedPath in your HTML templates');

console.log('\n🌐 CDN Integration:');
console.log('   • Upload versioned files to your CDN');
console.log('   • Update HTML templates to use versioned paths');
console.log('   • Set long cache times for versioned assets');
console.log('   • Use integrity hashes for security');

console.log('\n✨ Asset manifest generation completed!\n');
