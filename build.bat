@echo off
echo Building Ex Revolution Technology website...

REM Remove existing dist directory
if exist "dist" rmdir /s /q "dist"

REM Create dist directory structure
mkdir "dist"
mkdir "dist\assets"
mkdir "dist\assets\images"
mkdir "dist\css"
mkdir "dist\js"
mkdir "dist\services"
mkdir "dist\case-studies"

REM Copy HTML files
echo Copying HTML files...
copy "*.html" "dist\" >nul 2>&1

REM Copy CSS files
echo Copying CSS files...
if exist "css" copy "css\*.css" "dist\css\" >nul 2>&1

REM Copy JS files
echo Copying JavaScript files...
if exist "js" copy "js\*.js" "dist\js\" >nul 2>&1

REM Copy assets
echo Copying assets...
if exist "assets" xcopy "assets\*" "dist\assets\" /s /e /y >nul 2>&1

REM Copy service pages
echo Copying service pages...
if exist "services" copy "services\*.html" "dist\services\" >nul 2>&1

REM Copy case studies
echo Copying case studies...
if exist "case-studies" copy "case-studies\*.html" "dist\case-studies\" >nul 2>&1

REM Copy configuration files
if exist "_redirects" copy "_redirects" "dist\" >nul 2>&1
if exist "netlify.toml" copy "netlify.toml" "dist\" >nul 2>&1

REM Create robots.txt
echo User-agent: * > "dist\robots.txt"
echo Allow: / >> "dist\robots.txt"
echo. >> "dist\robots.txt"
echo Sitemap: https://exrevolution.com/sitemap.xml >> "dist\robots.txt"

echo.
echo ✅ Build complete! Files ready in dist/ folder
echo.
dir "dist" /b
echo.
echo Ready for deployment! 🚀