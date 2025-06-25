// Mobile Centering Fix Script
// Copy and paste this into browser console on any admin page

console.log('🔧 Mobile Centering Fix Script');
console.log('===============================');

function debugMobileAlignment() {
    console.log('📱 Analyzing mobile layout alignment...');
    
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 768
    };
    
    console.log('📐 Viewport:', viewport);
    
    if (!viewport.isMobile) {
        console.log('⚠️ Not in mobile view. Switch to mobile view first.');
        return;
    }
    
    // Get main elements
    const body = document.body;
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');
    
    console.log('🔍 Layout Analysis:');
    
    if (body) {
        const bodyRect = body.getBoundingClientRect();
        console.log('- Body width:', bodyRect.width + 'px');
        console.log('- Body left:', bodyRect.left + 'px');
        console.log('- Body right:', bodyRect.right + 'px');
    }
    
    if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const sidebarStyles = window.getComputedStyle(sidebar);
        console.log('- Sidebar transform:', sidebarStyles.transform);
        console.log('- Sidebar left:', sidebarRect.left + 'px');
        console.log('- Sidebar width:', sidebarRect.width + 'px');
        console.log('- Sidebar visible:', sidebarRect.left >= -sidebarRect.width);
    }
    
    if (mainContent) {
        const contentRect = mainContent.getBoundingClientRect();
        const contentStyles = window.getComputedStyle(mainContent);
        
        console.log('- Main content left:', contentRect.left + 'px');
        console.log('- Main content width:', contentRect.width + 'px');
        console.log('- Main content margin-left:', contentStyles.marginLeft);
        console.log('- Main content margin-right:', contentStyles.marginRight);
        console.log('- Main content padding:', contentStyles.padding);
        console.log('- Main content position:', contentStyles.position);
        console.log('- Main content transform:', contentStyles.transform);
        
        // Check if content is centered
        const expectedLeft = 0;
        const actualLeft = contentRect.left;
        const isProperlyAligned = Math.abs(actualLeft - expectedLeft) < 5;
        
        console.log('📊 Alignment Check:');
        console.log('- Expected left position:', expectedLeft + 'px');
        console.log('- Actual left position:', actualLeft + 'px');
        console.log('- Is properly aligned:', isProperlyAligned);
        
        if (!isProperlyAligned) {
            console.log('❌ CONTENT IS NOT CENTERED!');
            console.log('💡 Content is offset by:', (actualLeft - expectedLeft) + 'px');
        } else {
            console.log('✅ Content is properly centered!');
        }
    }
    
    return {
        viewport,
        isAligned: mainContent ? Math.abs(mainContent.getBoundingClientRect().left) < 5 : false
    };
}

function forceMobileCentering() {
    console.log('🔧 Applying mobile centering fixes...');
    
    // Force body to full width
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100%';
    document.body.style.maxWidth = '100%';
    document.body.style.overflowX = 'hidden';
    
    // Force main content centering
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
        console.log('✅ Main content centered');
    }
    
    // Force all rows to be centered
    const rows = document.querySelectorAll('.row');
    rows.forEach((row, index) => {
        row.style.margin = '0 -10px';
        row.style.width = '100%';
        row.style.maxWidth = '100%';
        row.style.display = 'flex';
        row.style.flexWrap = 'wrap';
        row.style.justifyContent = 'center';
        console.log(`✅ Row ${index + 1} centered`);
    });
    
    // Force all columns to full width on mobile
    const cols = document.querySelectorAll('[class*="col-"]');
    cols.forEach((col, index) => {
        col.style.padding = '0 10px';
        col.style.width = '100%';
        col.style.maxWidth = '100%';
        col.style.flex = '0 0 100%';
        console.log(`✅ Column ${index + 1} fixed`);
    });
    
    // Special handling for stats cards (2 columns)
    const statsCols = document.querySelectorAll('.stats-row .col-md-3');
    statsCols.forEach((col, index) => {
        col.style.flex = '0 0 50%';
        col.style.maxWidth = '50%';
        col.style.padding = '0 8px';
        console.log(`✅ Stats column ${index + 1} set to 50% width`);
    });
    
    console.log('🎉 Mobile centering fixes applied!');
    console.log('📱 Run debugMobileAlignment() to verify results');
}

// Export functions
window.debugMobileAlignment = debugMobileAlignment;
window.forceMobileCentering = forceMobileCentering;

console.log('📱 Available functions:');
console.log('- debugMobileAlignment() - Check current alignment');
console.log('- forceMobileCentering() - Apply centering fixes');
console.log('');
console.log('🔧 Run debugMobileAlignment() to start debugging');

// Auto-run if in mobile view
if (window.innerWidth <= 768) {
    console.log('📱 Mobile view detected - running alignment check...');
    setTimeout(debugMobileAlignment, 1000);
}
