// Mobile Navigation Test Script
// Copy and paste this into browser console on any admin page

console.log('🔧 Mobile Navigation Test Script');
console.log('================================');

function testMobileNavigation() {
    console.log('🚀 Starting Mobile Navigation Test...');
    
    // 1. Check if elements exist
    const toggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    
    console.log('📱 Element Check:');
    console.log('- Toggle button:', !!toggle);
    console.log('- Sidebar:', !!sidebar);
    console.log('- Overlay:', !!overlay);
    console.log('- Menu links:', menuLinks.length);
    
    if (!toggle || !sidebar || !overlay) {
        console.error('❌ Missing required elements!');
        return false;
    }
    
    // 2. Check mobile state
    const isMobile = window.innerWidth <= 768;
    console.log('- Is mobile view:', isMobile);
    
    // 3. Test toggle functionality
    console.log('\n🔄 Testing toggle functionality...');
    
    // Simulate toggle click
    toggle.click();
    
    setTimeout(() => {
        const isOpen = sidebar.classList.contains('show');
        console.log('- Sidebar opened:', isOpen);
        
        if (isOpen) {
            // Test menu link click
            console.log('\n🔗 Testing menu link navigation...');
            
            // Find a navigation link (not logout)
            const navLink = Array.from(menuLinks).find(link => 
                !link.getAttribute('href').startsWith('#') && 
                link.id !== 'logout-btn'
            );
            
            if (navLink) {
                console.log('- Testing link:', navLink.textContent.trim(), '->', navLink.getAttribute('href'));
                
                // Add temporary listener to see what happens
                navLink.addEventListener('click', function(e) {
                    console.log('✅ Link clicked successfully!');
                    console.log('- Target:', e.target.getAttribute('href'));
                    console.log('- Default prevented:', e.defaultPrevented);
                }, { once: true });
                
                // Simulate click
                navLink.click();
            }
        } else {
            console.error('❌ Sidebar did not open!');
        }
    }, 500);
    
    return true;
}

function forceNavigation(page) {
    console.log(`🔄 Force navigating to: ${page}`);
    window.location.href = page;
}

function setupTestToken() {
    localStorage.setItem('token', 'test-token-12345');
    console.log('✅ Test token set');
}

// Export functions
window.testMobileNavigation = testMobileNavigation;
window.forceNavigation = forceNavigation;
window.setupTestToken = setupTestToken;

console.log('\n📱 Available test functions:');
console.log('- testMobileNavigation() - Test the mobile menu');
console.log('- forceNavigation("users.html") - Force navigate to page');
console.log('- setupTestToken() - Set authentication token');
console.log('\n🔧 Run testMobileNavigation() to start testing');

// Auto-run if in mobile view
if (window.innerWidth <= 768) {
    console.log('\n🔄 Auto-running test (mobile view detected)...');
    setTimeout(testMobileNavigation, 1000);
}
