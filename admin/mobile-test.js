// Mobile Menu Test Script
// Run this in the browser console on any admin page to test mobile functionality

console.log('🔧 Starting Mobile Menu Test...');

function testMobileComponents() {
    const results = [];
    
    // Test 1: Check if mobile elements exist
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mobileHeader = document.querySelector('.mobile-header');
    
    results.push(`Mobile Toggle Button: ${mobileToggle ? '✅ Found' : '❌ Missing'}`);
    results.push(`Sidebar Element: ${sidebar ? '✅ Found' : '❌ Missing'}`);
    results.push(`Sidebar Overlay: ${sidebarOverlay ? '✅ Found' : '❌ Missing'}`);
    results.push(`Mobile Header: ${mobileHeader ? '✅ Found' : '❌ Missing'}`);
    
    // Test 2: Check if mobile CSS is loaded
    const mobileCSS = document.querySelector('link[href*="admin-mobile.css"]');
    results.push(`Mobile CSS: ${mobileCSS ? '✅ Loaded' : '❌ Missing'}`);
    
    // Test 3: Check if mobile JS is loaded
    const mobileJS = document.querySelector('script[src*="admin-mobile.js"]');
    results.push(`Mobile JS: ${mobileJS ? '✅ Loaded' : '❌ Missing'}`);
    
    // Test 4: Check if AdminMobile class is available
    const adminMobileClass = window.AdminMobile;
    results.push(`AdminMobile Class: ${adminMobileClass ? '✅ Available' : '❌ Missing'}`);
    
    // Test 5: Check if mobile instance is available
    const adminMobileInstance = window.adminMobile;
    results.push(`AdminMobile Instance: ${adminMobileInstance ? '✅ Available' : '❌ Missing'}`);
    
    console.log('📱 Mobile Component Test Results:');
    results.forEach(result => console.log(result));
    
    return {
        mobileToggle,
        sidebar,
        sidebarOverlay,
        mobileHeader,
        allComponentsFound: mobileToggle && sidebar && sidebarOverlay && mobileHeader
    };
}

function testMobileMenuFunctionality() {
    console.log('🔄 Testing Mobile Menu Functionality...');
    
    const components = testMobileComponents();
    
    if (!components.allComponentsFound) {
        console.error('❌ Cannot test functionality - missing components');
        return false;
    }
    
    try {
        // Test opening sidebar
        console.log('🔄 Testing sidebar open...');
        components.mobileToggle.click();
        
        setTimeout(() => {
            const isOpen = components.sidebar.classList.contains('show');
            console.log(`Sidebar Open Test: ${isOpen ? '✅ Success' : '❌ Failed'}`);
            
            if (isOpen) {
                // Test closing sidebar
                console.log('🔄 Testing sidebar close...');
                components.sidebarOverlay.click();
                
                setTimeout(() => {
                    const isClosed = !components.sidebar.classList.contains('show');
                    console.log(`Sidebar Close Test: ${isClosed ? '✅ Success' : '❌ Failed'}`);
                }, 500);
            }
        }, 500);
        
        return true;
    } catch (error) {
        console.error('❌ Mobile menu test failed:', error);
        return false;
    }
}

function testMobileResponsiveness() {
    console.log('📱 Testing Mobile Responsiveness...');
    
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 768
    };
    
    console.log(`Viewport: ${viewport.width}x${viewport.height}`);
    console.log(`Mobile View: ${viewport.isMobile ? '✅ Yes' : '❌ No'}`);
    
    // Check mobile styles
    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader) {
        const headerStyle = window.getComputedStyle(mobileHeader);
        const isHeaderVisible = headerStyle.display !== 'none';
        console.log(`Mobile Header Visible: ${isHeaderVisible ? '✅ Yes' : '❌ No'}`);
    }
    
    return viewport;
}

function runFullMobileTest() {
    console.log('🚀 Running Full Mobile Test Suite...');
    console.log('=====================================');
    
    // Test 1: Components
    const components = testMobileComponents();
    
    // Test 2: Responsiveness
    const viewport = testMobileResponsiveness();
    
    // Test 3: Functionality (if components exist)
    if (components.allComponentsFound) {
        testMobileMenuFunctionality();
    }
    
    // Summary
    console.log('=====================================');
    console.log('📊 Test Summary:');
    console.log(`Components: ${components.allComponentsFound ? '✅ All Found' : '❌ Missing'}`);
    console.log(`Viewport: ${viewport.width}x${viewport.height} (${viewport.isMobile ? 'Mobile' : 'Desktop'})`);
    console.log('=====================================');
    
    return {
        components,
        viewport,
        success: components.allComponentsFound
    };
}

// Auto-run test if script is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFullMobileTest);
} else {
    runFullMobileTest();
}

// Export functions for manual testing
window.testMobileComponents = testMobileComponents;
window.testMobileMenuFunctionality = testMobileMenuFunctionality;
window.testMobileResponsiveness = testMobileResponsiveness;
window.runFullMobileTest = runFullMobileTest;

console.log('📱 Mobile test functions available:');
console.log('- testMobileComponents()');
console.log('- testMobileMenuFunctionality()');
console.log('- testMobileResponsiveness()');
console.log('- runFullMobileTest()');
