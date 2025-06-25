const fs = require('fs');
const path = require('path');

console.log('🚀 Building Ex Revolution Technology website...');

// Helper function to copy files
function copyFile(src, dest) {
    try {
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`  ✓ Copied ${path.basename(src)}`);
            return true;
        }
    } catch (error) {
        console.log(`  ❌ Failed to copy ${src}: ${error.message}`);
    }
    return false;
}

// Helper function to copy directory
function copyDir(src, dest) {
    try {
        if (fs.existsSync(src)) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            
            const files = fs.readdirSync(src);
            files.forEach(file => {
                const srcPath = path.join(src, file);
                const destPath = path.join(dest, file);
                
                if (fs.statSync(srcPath).isDirectory()) {
                    copyDir(srcPath, destPath);
                } else {
                    fs.copyFileSync(srcPath, destPath);
                }
            });
            console.log(`  ✓ Copied ${src} folder`);
            return true;
        }
    } catch (error) {
        console.log(`  ❌ Failed to copy directory ${src}: ${error.message}`);
    }
    return false;
}

// Remove existing dist directory
if (fs.existsSync('dist')) {
    console.log('🧹 Cleaning existing dist folder...');
    fs.rmSync('dist', { recursive: true, force: true });
}

// Create dist directory structure
console.log('📁 Creating dist directory structure...');
const dirs = [
    'dist',
    'dist/assets',
    'dist/assets/images',
    'dist/css',
    'dist/js',
    'dist/services',
    'dist/case-studies',
    'dist/admin',
    'dist/admin/assets',
    'dist/admin/assets/css',
    'dist/admin/assets/js'
];

dirs.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
});

// Copy HTML files
console.log('📄 Copying HTML files...');
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
    copyFile(file, path.join('dist', file));
});

// Copy CSS files
console.log('🎨 Copying CSS files...');
if (fs.existsSync('css')) {
    copyDir('css', 'dist/css');
}

// Copy JS files
console.log('⚡ Copying JavaScript files...');
if (fs.existsSync('js')) {
    copyDir('js', 'dist/js');
}

// Copy assets
console.log('🖼️  Copying assets...');
if (fs.existsSync('assets')) {
    copyDir('assets', 'dist/assets');
}

// Copy service pages
console.log('🔧 Copying service pages...');
if (fs.existsSync('services')) {
    copyDir('services', 'dist/services');
}

// Copy case studies
console.log('📊 Copying case studies...');
if (fs.existsSync('case-studies')) {
    copyDir('case-studies', 'dist/case-studies');
}

// Copy admin panel
console.log('👨‍💼 Copying admin panel...');
if (fs.existsSync('admin')) {
    copyDir('admin', 'dist/admin');
}

// Copy configuration files
console.log('⚙️  Copying configuration files...');
copyFile('_redirects', 'dist/_redirects');
copyFile('netlify.toml', 'dist/netlify.toml');

// Create robots.txt
console.log('🤖 Creating robots.txt...');
const robotsContent = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://exrevolution.com/sitemap.xml`;

fs.writeFileSync('dist/robots.txt', robotsContent);

// Copy blog HTML files
console.log('📝 Copying blog HTML files...');
if (fs.existsSync('blog')) {
    const blogFiles = fs.readdirSync('blog').filter(file => file.endsWith('.html'));
    if (!fs.existsSync('dist/blog')) {
        fs.mkdirSync('dist/blog', { recursive: true });
    }
    blogFiles.forEach(file => {
        copyFile(path.join('blog', file), path.join('dist/blog', file));
    });
}

// Show build summary
console.log('✅ Build complete! Files ready in dist/ folder');

try {
    const distFiles = fs.readdirSync('dist', { recursive: true });
    console.log(`📊 Build Summary:`);
    console.log(`  Total files: ${distFiles.length}`);
    console.log(`  Ready for deployment! 🚀`);
    
    console.log('\n📋 Main files in dist:');
    fs.readdirSync('dist').forEach(file => {
        const filePath = path.join('dist', file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            const sizeKB = Math.round(stats.size / 1024 * 100) / 100;
            console.log(`  ${file} (${sizeKB} KB)`);
        } else {
            console.log(`  ${file}/ (folder)`);
        }
    });
} catch (error) {
    console.log('Build completed successfully!');
}