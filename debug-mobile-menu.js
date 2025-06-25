// Debug Mobile Menu - Run this in browser console on dashboard page
console.log('🔧 Debug Mobile Menu Navigation');

function debugMobileMenu() {
    console.log('=== MOBILE MENU DEBUG ===');
    
    // Check elements
    const toggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    
    console.log('Elements found:');
    console.log('- Toggle button:', !!toggle);
    console.log('- Sidebar:', !!sidebar);
    console.log('- Overlay:', !!overlay);
    console.log('- Menu links:', menuLinks.length);
    
    // Check mobile state
    const isMobile = window.innerWidth <= 768;
    console.log('- Is mobile view:', isMobile);
    
    // Check AdminMobile
    console.log('- AdminMobile class:', !!window.AdminMobile);
    console.log('- AdminMobile instance:', !!window.adminMobile);
    
    // Test menu links
    console.log('\nMenu links:');
    menuLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        console.log(`${index + 1}. "${text}" -> ${href}`);
    });
    
    // Test click simulation
    if (menuLinks.length > 1) {
        console.log('\n🔄 Testing menu link click...');
        const testLink = menuLinks[1]; // Users link
        console.log('Testing link:', testLink.textContent.trim(), '->', testLink.getAttribute('href'));
        
        // Add temporary click listener to see what happens
        testLink.addEventListener('click', function(e) {
            console.log('🔄 Link clicked!', e.target.getAttribute('href'));
            console.log('Default prevented:', e.defaultPrevented);
        }, { once: true });
        
        // Simulate click
        testLink.click();
    }
}

// Run debug
debugMobileMenu();

// Export for manual use
window.debugMobileMenu = debugMobileMenu;
