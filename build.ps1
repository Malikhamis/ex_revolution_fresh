# Ex Revolution Technology Build Script for Windows
# This script builds the static site for deployment

Write-Host "🚀 Building Ex Revolution Technology website..." -ForegroundColor Green

# Remove existing dist directory and create new one
if (Test-Path "dist") {
    Write-Host "🧹 Cleaning existing dist folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "dist"
}

Write-Host "📁 Creating dist directory structure..." -ForegroundColor Blue
New-Item -ItemType Directory -Path "dist" -Force | Out-Null
New-Item -ItemType Directory -Path "dist/assets/images" -Force | Out-Null
New-Item -ItemType Directory -Path "dist/css" -Force | Out-Null
New-Item -ItemType Directory -Path "dist/js" -Force | Out-Null
New-Item -ItemType Directory -Path "dist/services" -Force | Out-Null
New-Item -ItemType Directory -Path "dist/case-studies" -Force | Out-Null
New-Item -ItemType Directory -Path "dist/blog" -Force | Out-Null

# Copy main HTML files
Write-Host "📄 Copying HTML files..." -ForegroundColor Blue
Get-ChildItem -Filter "*.html" | ForEach-Object {
    Copy-Item $_.FullName -Destination "dist" -ErrorAction SilentlyContinue
    Write-Host "  ✓ Copied $($_.Name)" -ForegroundColor Gray
}

# Copy CSS files
Write-Host "🎨 Copying CSS files..." -ForegroundColor Blue
if (Test-Path "css") {
    Get-ChildItem -Path "css" -Filter "*.css" | ForEach-Object {
        Copy-Item $_.FullName -Destination "dist/css" -ErrorAction SilentlyContinue
        Write-Host "  ✓ Copied css/$($_.Name)" -ForegroundColor Gray
    }
}

# Copy JS files
Write-Host "⚡ Copying JavaScript files..." -ForegroundColor Blue
if (Test-Path "js") {
    Get-ChildItem -Path "js" -Filter "*.js" | ForEach-Object {
        Copy-Item $_.FullName -Destination "dist/js" -ErrorAction SilentlyContinue
        Write-Host "  ✓ Copied js/$($_.Name)" -ForegroundColor Gray
    }
}

# Copy assets
Write-Host "🖼️  Copying assets..." -ForegroundColor Blue
if (Test-Path "assets") {
    Copy-Item -Path "assets/*" -Destination "dist/assets" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Copied assets folder" -ForegroundColor Gray
}

# Copy service pages
Write-Host "🔧 Copying service pages..." -ForegroundColor Blue
if (Test-Path "services") {
    Get-ChildItem -Path "services" -Filter "*.html" | ForEach-Object {
        Copy-Item $_.FullName -Destination "dist/services" -ErrorAction SilentlyContinue
        Write-Host "  ✓ Copied services/$($_.Name)" -ForegroundColor Gray
    }
}

# Copy case studies
Write-Host "📊 Copying case studies..." -ForegroundColor Blue
if (Test-Path "case-studies") {
    Get-ChildItem -Path "case-studies" -Filter "*.html" | ForEach-Object {
        Copy-Item $_.FullName -Destination "dist/case-studies" -ErrorAction SilentlyContinue
        Write-Host "  ✓ Copied case-studies/$($_.Name)" -ForegroundColor Gray
    }
}

# Copy blog HTML files
Write-Host "📝 Copying blog HTML files..." -ForegroundColor Blue
if (Test-Path "blog") {
    Get-ChildItem -Path "blog" -Filter "*.html" | ForEach-Object {
        Copy-Item $_.FullName -Destination "dist/blog" -ErrorAction SilentlyContinue
        Write-Host "  ✓ Copied blog/$($_.Name)" -ForegroundColor Gray
    }
}

# Copy Netlify configuration files
Write-Host "⚙️  Copying configuration files..." -ForegroundColor Blue
if (Test-Path "_redirects") {
    Copy-Item "_redirects" -Destination "dist" -ErrorAction SilentlyContinue
    Write-Host "  ✓ Copied _redirects" -ForegroundColor Gray
}
if (Test-Path "netlify.toml") {
    Copy-Item "netlify.toml" -Destination "dist" -ErrorAction SilentlyContinue
    Write-Host "  ✓ Copied netlify.toml" -ForegroundColor Gray
}

# Create a simple robots.txt
Write-Host "🤖 Creating robots.txt..." -ForegroundColor Blue
$robotsContent = @"
User-agent: *
Allow: /

Sitemap: https://exrevolution.com/sitemap.xml
"@
$robotsContent | Out-File -FilePath "dist/robots.txt" -Encoding UTF8

Write-Host "✅ Build complete! Files ready in dist/ folder" -ForegroundColor Green

# Show build summary
$distFiles = Get-ChildItem -Path "dist" -Recurse -File
$totalSize = ($distFiles | Measure-Object -Property Length -Sum).Sum
$fileSizeKB = [math]::Round($totalSize / 1KB, 2)

Write-Host "📊 Build Summary:" -ForegroundColor Cyan
Write-Host "  Total files: $($distFiles.Count)" -ForegroundColor White
Write-Host "  Total size: $fileSizeKB KB" -ForegroundColor White
Write-Host "  Ready for deployment! 🚀" -ForegroundColor Green

# List main files
Write-Host ""
Write-Host "📋 Main files in dist:" -ForegroundColor Yellow
Get-ChildItem -Path "dist" -File | Select-Object Name, @{Name="Size(KB)"; Expression={[math]::Round($_.Length/1KB, 2)}}, LastWriteTime | Format-Table -AutoSize

# List blog files in dist/blog
if (Test-Path "dist/blog") {
    Write-Host "\n📝 Blog files in dist/blog:" -ForegroundColor Yellow
    Get-ChildItem -Path "dist/blog" -File | Select-Object Name, @{Name="Size(KB)"; Expression={[math]::Round($_.Length/1KB, 2)}}, LastWriteTime | Format-Table -AutoSize
} else {
    Write-Host "\n⚠️  dist/blog directory does not exist!" -ForegroundColor Red
}