// Mobile Layout Checker Script
// Run this in browser console on any admin page to check mobile layout

console.log('🔧 Mobile Layout Checker');
console.log('========================');

function checkMobileLayout() {
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 768
    };
    
    console.log('📱 Viewport Info:', viewport);
    
    if (!viewport.isMobile) {
        console.log('⚠️ Switch to mobile view (≤768px) to test mobile layout');
        return false;
    }
    
    const results = {
        contentCentered: false,
        fullWidth: false,
        statsCards: false,
        noEmptySpace: false,
        overall: false
    };
    
    // Check main content centering
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const rect = mainContent.getBoundingClientRect();
        const leftOffset = Math.abs(rect.left);
        results.contentCentered = leftOffset < 20; // Allow small margin
        
        console.log('📐 Main Content:');
        console.log('- Left offset:', leftOffset + 'px');
        console.log('- Width:', rect.width + 'px');
        console.log('- Centered:', results.contentCentered ? '✅' : '❌');
    }
    
    // Check full width usage
    const expectedWidth = viewport.width;
    const actualWidth = mainContent ? mainContent.getBoundingClientRect().width : 0;
    const widthUsage = (actualWidth / expectedWidth) * 100;
    results.fullWidth = widthUsage > 85; // At least 85% width usage
    
    console.log('📏 Width Usage:');
    console.log('- Expected:', expectedWidth + 'px');
    console.log('- Actual:', actualWidth + 'px');
    console.log('- Usage:', widthUsage.toFixed(1) + '%');
    console.log('- Full width:', results.fullWidth ? '✅' : '❌');
    
    // Check statistics cards
    const statsRow = document.querySelector('.stats-row');
    const statsCols = document.querySelectorAll('.stats-row .col-md-3');
    results.statsCards = statsRow && statsCols.length > 0;
    
    console.log('📊 Statistics Cards:');
    console.log('- Stats row found:', statsRow ? '✅' : '❌');
    console.log('- Stats columns:', statsCols.length);
    console.log('- Stats cards working:', results.statsCards ? '✅' : '❌');
    
    // Check for empty space (right side)
    const body = document.body;
    const bodyRect = body.getBoundingClientRect();
    const rightSpace = viewport.width - (bodyRect.left + bodyRect.width);
    results.noEmptySpace = Math.abs(rightSpace) < 20;
    
    console.log('🔍 Empty Space Check:');
    console.log('- Right space:', rightSpace + 'px');
    console.log('- No empty space:', results.noEmptySpace ? '✅' : '❌');
    
    // Overall result
    results.overall = results.contentCentered && results.fullWidth && results.noEmptySpace;
    
    console.log('🎯 Overall Result:');
    console.log('- Content Centered:', results.contentCentered ? '✅' : '❌');
    console.log('- Full Width Usage:', results.fullWidth ? '✅' : '❌');
    console.log('- Statistics Cards:', results.statsCards ? '✅' : '❌');
    console.log('- No Empty Space:', results.noEmptySpace ? '✅' : '❌');
    console.log('- OVERALL:', results.overall ? '✅ PASS' : '❌ FAIL');
    
    if (!results.overall) {
        console.log('');
        console.log('🔧 Quick Fix - Run this to force centering:');
        console.log('forceMobileCentering()');
    }
    
    return results;
}

function forceMobileCentering() {
    console.log('🔧 Applying emergency mobile centering...');
    
    // Force body and html
    document.documentElement.style.width = '100%';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100%';
    document.body.style.overflowX = 'hidden';
    
    // Force main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.marginLeft = '0';
        mainContent.style.marginRight = '0';
        mainContent.style.width = '100%';
        mainContent.style.maxWidth = '100%';
        mainContent.style.left = '0';
        mainContent.style.right = '0';
        mainContent.style.position = 'relative';
        mainContent.style.transform = 'translateX(0)';
        mainContent.style.padding = '70px 15px 20px 15px';
        mainContent.style.boxSizing = 'border-box';
    }
    
    // Force rows
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
        row.style.margin = '0 -10px';
        row.style.width = '100%';
        row.style.maxWidth = '100%';
        row.style.display = 'flex';
        row.style.flexWrap = 'wrap';
        row.style.justifyContent = 'center';
    });
    
    // Force columns
    const cols = document.querySelectorAll('[class*="col-"]');
    cols.forEach(col => {
        col.style.padding = '0 10px';
        col.style.width = '100%';
        col.style.maxWidth = '100%';
        col.style.flex = '0 0 100%';
    });
    
    // Special stats columns
    const statsCols = document.querySelectorAll('.stats-row .col-md-3');
    statsCols.forEach(col => {
        col.style.flex = '0 0 50%';
        col.style.maxWidth = '50%';
    });
    
    console.log('✅ Emergency centering applied!');
    console.log('📱 Run checkMobileLayout() again to verify');
}

function testAllPages() {
    const pages = [
        'dashboard.html',
        'users.html', 
        'contacts.html',
        'quotes.html',
        'newsletter.html',
        'settings.html'
    ];
    
    console.log('🔄 Testing all admin pages...');
    console.log('📱 Make sure you\'re in mobile view (≤768px)');
    console.log('');
    
    pages.forEach((page, index) => {
        console.log(`${index + 1}. ${page} - Open and run checkMobileLayout()`);
    });
    
    console.log('');
    console.log('🎯 All pages should show "✅ PASS" for mobile layout');
}

// Export functions to global scope
window.checkMobileLayout = checkMobileLayout;
window.forceMobileCentering = forceMobileCentering;
window.testAllPages = testAllPages;

console.log('📱 Available functions:');
console.log('- checkMobileLayout() - Test current page mobile layout');
console.log('- forceMobileCentering() - Apply emergency centering fix');
console.log('- testAllPages() - Get list of pages to test');
console.log('');

// Auto-run if in mobile view
if (window.innerWidth <= 768) {
    console.log('📱 Mobile view detected - running layout check...');
    setTimeout(checkMobileLayout, 500);
} else {
    console.log('💻 Desktop view - switch to mobile view to test layout');
}
