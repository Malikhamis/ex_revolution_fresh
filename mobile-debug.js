// Mobile Layout Debug Script
// Copy and paste this into browser console on any admin page

console.log('🔧 Mobile Layout Debug Script');
console.log('================================');

function debugMobileLayout() {
    console.log('📱 Starting Mobile Layout Debug...');
    
    // Get viewport dimensions
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 768
    };
    
    console.log('📐 Viewport:', viewport);
    
    // Get main elements
    const body = document.body;
    const mainContent = document.querySelector('.main-content');
    const mobileHeader = document.querySelector('.mobile-header');
    const cards = document.querySelectorAll('.card');
    
    console.log('🔍 Element Analysis:');
    
    if (body) {
        const bodyStyles = window.getComputedStyle(body);
        console.log('- Body height:', bodyStyles.height);
        console.log('- Body display:', bodyStyles.display);
        console.log('- Body flex-direction:', bodyStyles.flexDirection);
    }
    
    if (mobileHeader) {
        const headerStyles = window.getComputedStyle(mobileHeader);
        console.log('- Mobile header height:', headerStyles.height);
        console.log('- Mobile header display:', headerStyles.display);
    }
    
    if (mainContent) {
        const contentStyles = window.getComputedStyle(mainContent);
        const contentRect = mainContent.getBoundingClientRect();
        
        console.log('- Main content padding:', contentStyles.padding);
        console.log('- Main content min-height:', contentStyles.minHeight);
        console.log('- Main content display:', contentStyles.display);
        console.log('- Main content flex-direction:', contentStyles.flexDirection);
        console.log('- Main content actual height:', contentRect.height + 'px');
        console.log('- Main content top position:', contentRect.top + 'px');
    }
    
    console.log('- Total cards found:', cards.length);
    
    cards.forEach((card, index) => {
        const cardStyles = window.getComputedStyle(card);
        const cardRect = card.getBoundingClientRect();
        console.log(`- Card ${index + 1} height:`, cardRect.height + 'px');
        console.log(`- Card ${index + 1} flex:`, cardStyles.flex);
        console.log(`- Card ${index + 1} display:`, cardStyles.display);
    });
    
    // Calculate space usage
    const usedSpace = mainContent ? mainContent.getBoundingClientRect().height : 0;
    const availableSpace = viewport.height - (mobileHeader ? 60 : 0);
    const spaceUtilization = ((usedSpace / availableSpace) * 100).toFixed(1);
    
    console.log('📊 Space Analysis:');
    console.log('- Available space:', availableSpace + 'px');
    console.log('- Used space:', usedSpace + 'px');
    console.log('- Space utilization:', spaceUtilization + '%');
    
    if (spaceUtilization < 80) {
        console.log('⚠️ LOW SPACE UTILIZATION DETECTED!');
        console.log('💡 Suggestions:');
        console.log('1. Check if flexbox is applied to main-content');
        console.log('2. Check if cards have flex: 1 property');
        console.log('3. Check if min-height is set correctly');
    } else {
        console.log('✅ Good space utilization!');
    }
    
    return {
        viewport,
        spaceUtilization: parseFloat(spaceUtilization),
        usedSpace,
        availableSpace
    };
}

function fixMobileLayout() {
    console.log('🔧 Applying Mobile Layout Fixes...');
    
    const mainContent = document.querySelector('.main-content');
    const cards = document.querySelectorAll('.card');
    const body = document.body;
    
    if (body) {
        body.style.height = '100%';
        body.style.display = 'flex';
        body.style.flexDirection = 'column';
        console.log('✅ Fixed body layout');
    }
    
    if (mainContent) {
        mainContent.style.display = 'flex';
        mainContent.style.flexDirection = 'column';
        mainContent.style.minHeight = 'calc(100vh - 70px)';
        mainContent.style.flex = '1';
        console.log('✅ Fixed main content layout');
    }
    
    if (cards.length > 0) {
        const lastCard = cards[cards.length - 1];
        lastCard.style.flex = '1';
        lastCard.style.display = 'flex';
        lastCard.style.flexDirection = 'column';
        
        const cardBody = lastCard.querySelector('.card-body');
        if (cardBody) {
            cardBody.style.flex = '1';
            cardBody.style.display = 'flex';
            cardBody.style.flexDirection = 'column';
        }
        
        const tableResponsive = lastCard.querySelector('.table-responsive');
        if (tableResponsive) {
            tableResponsive.style.flex = '1';
            tableResponsive.style.minHeight = '300px';
        }
        
        console.log('✅ Fixed card layout');
    }
    
    console.log('🎉 Mobile layout fixes applied!');
    console.log('📱 Run debugMobileLayout() again to check results');
}

// Export functions
window.debugMobileLayout = debugMobileLayout;
window.fixMobileLayout = fixMobileLayout;

console.log('📱 Available functions:');
console.log('- debugMobileLayout() - Analyze current layout');
console.log('- fixMobileLayout() - Apply layout fixes');
console.log('');
console.log('🔧 Run debugMobileLayout() to start debugging');

// Auto-run if in mobile view
if (window.innerWidth <= 768) {
    console.log('📱 Mobile view detected - running debug...');
    setTimeout(debugMobileLayout, 1000);
}
