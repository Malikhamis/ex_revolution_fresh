#!/usr/bin/env node

/**
 * Production Build Script
 * Optimizes and minifies all assets for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting production build process...\n');

// Create dist directory
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('📁 Created dist directory');
}

// Build steps - production mode skips dev dependencies
const isProduction = process.env.NODE_ENV === 'production';
const buildSteps = [
    {
        name: 'Clean previous build',
        command: 'rm -rf dist/* || echo "No previous build to clean"',
        description: 'Removing previous build artifacts'
    }
];

// Only add dev-dependent steps in non-production environments
if (!isProduction) {
    buildSteps.push(
        {
            name: 'Lint JavaScript',
            command: 'npm run lint',
            description: 'Checking code quality and style'
        },
        {
            name: 'Run tests',
            command: 'npm test',
            description: 'Running unit and integration tests'
        },
        {
            name: 'Build JavaScript bundles',
            command: 'npx webpack --mode=production',
            description: 'Bundling and minifying JavaScript files'
        }
    );
} else {
    console.log('🏭 Production mode: Skipping dev-dependent build steps');
}

// Add production-safe steps
buildSteps.push(
    {
        name: 'Create directories',
        command: 'mkdir -p dist/css dist/js dist/assets',
        description: 'Creating output directories'
    }
);

// Only add these if the scripts exist and don't require dev dependencies
if (fs.existsSync(path.join(__dirname, 'optimize-css.js'))) {
    buildSteps.push({
        name: 'Optimize CSS',
        command: 'node scripts/optimize-css.js',
        description: 'Minifying and optimizing CSS files'
    });
}

if (fs.existsSync(path.join(__dirname, 'generate-manifest.js'))) {
    buildSteps.push({
        name: 'Generate asset manifest',
        command: 'node scripts/generate-manifest.js',
        description: 'Creating asset manifest for cache busting'
    });
}

// Execute build steps
let completedSteps = 0;
const totalSteps = buildSteps.length;

for (const step of buildSteps) {
    try {
        console.log(`📦 ${step.name}...`);
        console.log(`   ${step.description}`);

        const startTime = Date.now();
        execSync(step.command, {
            stdio: 'pipe',
            cwd: path.join(__dirname, '..')
        });
        const duration = Date.now() - startTime;

        completedSteps++;
        console.log(`   ✅ Completed in ${duration}ms`);
        console.log(`   Progress: ${completedSteps}/${totalSteps}\n`);

    } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);

        // Show more details for some errors
        if (step.name.includes('test') || step.name.includes('lint')) {
            console.error('   Error details:', error.stdout?.toString() || error.stderr?.toString());
        }

        console.log('\n🚨 Build failed! Please fix the errors and try again.\n');
        process.exit(1);
    }
}

// Build summary
console.log('🎉 Build completed successfully!\n');

// Generate build report
const buildReport = {
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    environment: 'production',
    steps: buildSteps.map(step => step.name),
    duration: Date.now() - process.hrtime.bigint() / 1000000n
};

fs.writeFileSync(
    path.join(distDir, 'build-report.json'),
    JSON.stringify(buildReport, null, 2)
);

console.log('📊 Build Report:');
console.log(`   Version: ${buildReport.version}`);
console.log(`   Steps completed: ${completedSteps}/${totalSteps}`);
console.log(`   Build artifacts: dist/`);
console.log(`   Report: dist/build-report.json`);

// Show file sizes
console.log('\n📁 Build Output:');
try {
    const distFiles = fs.readdirSync(distDir, { withFileTypes: true });

    distFiles.forEach(file => {
        if (file.isFile()) {
            const filePath = path.join(distDir, file.name);
            const stats = fs.statSync(filePath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`   ${file.name}: ${sizeKB} KB`);
        } else if (file.isDirectory()) {
            const subDir = path.join(distDir, file.name);
            const subFiles = fs.readdirSync(subDir);
            console.log(`   ${file.name}/: ${subFiles.length} files`);
        }
    });
} catch (error) {
    console.log('   Could not read dist directory');
}

console.log('\n✨ Ready for production deployment!\n');

// Deployment instructions
console.log('🚀 Deployment Instructions:');
console.log('   1. Upload dist/ folder to your web server');
console.log('   2. Update your HTML files to reference minified assets');
console.log('   3. Configure your web server to serve compressed files');
console.log('   4. Set appropriate cache headers for static assets');
console.log('   5. Test the production build thoroughly\n');

console.log('📚 Performance Tips:');
console.log('   • Enable gzip compression on your server');
console.log('   • Use a CDN for static assets');
console.log('   • Set long cache times for versioned assets');
console.log('   • Monitor bundle sizes and optimize regularly\n');
