// Menu Click Fix Script
// Run this in browser console if menu items are not clickable

console.log('🔧 Menu Click Fix Script');
console.log('========================');

function diagnoseMobileMenu() {
    console.log('🔍 Diagnosing mobile menu issues...');

    const elements = {
        sidebar: document.querySelector('.sidebar'),
        overlay: document.querySelector('.sidebar-overlay'),
        toggle: document.querySelector('.mobile-toggle'),
        menuLinks: document.querySelectorAll('.sidebar-menu a'),
        mobileHeader: document.querySelector('.mobile-header')
    };

    console.log('📱 Element Check:');
    console.log('- Sidebar:', elements.sidebar ? '✅' : '❌');
    console.log('- Overlay:', elements.overlay ? '✅' : '❌');
    console.log('- Toggle:', elements.toggle ? '✅' : '❌');
    console.log('- Menu Links:', elements.menuLinks.length);
    console.log('- Mobile Header:', elements.mobileHeader ? '✅' : '❌');

    // Check CSS styles
    if (elements.sidebar) {
        const sidebarStyles = window.getComputedStyle(elements.sidebar);
        console.log('📐 Sidebar Styles:');
        console.log('- Z-index:', sidebarStyles.zIndex);
        console.log('- Position:', sidebarStyles.position);
        console.log('- Transform:', sidebarStyles.transform);
        console.log('- Pointer Events:', sidebarStyles.pointerEvents);
    }

    // Check menu link styles
    if (elements.menuLinks.length > 0) {
        const linkStyles = window.getComputedStyle(elements.menuLinks[0]);
        console.log('🔗 Menu Link Styles:');
        console.log('- Z-index:', linkStyles.zIndex);
        console.log('- Position:', linkStyles.position);
        console.log('- Pointer Events:', linkStyles.pointerEvents);
        console.log('- Display:', linkStyles.display);
    }

    // Check for overlapping elements
    if (elements.menuLinks.length > 0) {
        const firstLink = elements.menuLinks[0];
        const rect = firstLink.getBoundingClientRect();
        const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);

        console.log('🎯 Click Target Check:');
        console.log('- Link position:', rect);
        console.log('- Element at point:', elementAtPoint);
        console.log('- Is clickable:', elementAtPoint === firstLink || firstLink.contains(elementAtPoint));
    }

    return elements;
}

function fixMenuClicks() {
    console.log('🔧 Applying menu click fixes...');

    // Fix sidebar z-index and pointer events
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.zIndex = '9999';
        sidebar.style.pointerEvents = 'auto';
        console.log('✅ Fixed sidebar z-index and pointer events');
    }

    // Fix overlay z-index
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.style.zIndex = '9998';
        console.log('✅ Fixed overlay z-index');
    }

    // Fix menu links
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    menuLinks.forEach((link, index) => {
        link.style.position = 'relative';
        link.style.zIndex = '10000';
        link.style.pointerEvents = 'auto';
        link.style.display = 'block';
        link.style.cursor = 'pointer';

        // Add hover effect for visual feedback
        link.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });

        link.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });

        // Add click debugging
        link.addEventListener('click', function(e) {
            console.log('🖱️ Menu link clicked:', this.href);
            console.log('- Event target:', e.target);
            console.log('- Current target:', e.currentTarget);
        });

        console.log(`✅ Fixed menu link ${index + 1}: ${link.textContent.trim()}`);
    });

    // Fix mobile toggle
    const toggle = document.querySelector('.mobile-toggle');
    if (toggle) {
        toggle.style.zIndex = '10001';
        toggle.style.pointerEvents = 'auto';
        console.log('✅ Fixed mobile toggle');
    }

    // Remove any interfering elements
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const formStyles = window.getComputedStyle(form);
        if (parseInt(formStyles.zIndex) > 1000) {
            form.style.zIndex = '1';
            console.log('✅ Fixed form z-index');
        }
    });

    console.log('🎉 Menu click fixes applied!');
    console.log('📱 Try clicking menu items now');
}

function testMenuClicks() {
    console.log('🧪 Testing menu clicks...');

    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    let workingLinks = 0;

    menuLinks.forEach((link, index) => {
        if (link.id !== 'logout-btn') {
            const rect = link.getBoundingClientRect();
            const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);

            if (elementAtPoint === link || link.contains(elementAtPoint)) {
                workingLinks++;
                console.log(`✅ Link ${index + 1} (${link.textContent.trim()}) is clickable`);
            } else {
                console.log(`❌ Link ${index + 1} (${link.textContent.trim()}) is blocked by:`, elementAtPoint);
            }
        }
    });

    console.log(`📊 Result: ${workingLinks}/${menuLinks.length - 1} menu links are clickable`);

    if (workingLinks < menuLinks.length - 1) {
        console.log('🔧 Some links are not clickable. Run fixMenuClicks() to fix them.');
    } else {
        console.log('🎉 All menu links are working correctly!');
    }

    return workingLinks === menuLinks.length - 1;
}

function forceMenuNavigation() {
    console.log('🚀 Setting up force navigation...');

    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    menuLinks.forEach(link => {
        if (link.id !== 'logout-btn') {
            // Remove ALL existing event listeners by cloning
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);

            // Add simple click handler that just navigates
            newLink.addEventListener('click', function(e) {
                console.log('🔗 Force navigating to:', this.href);

                // Close sidebar if mobile
                const sidebar = document.querySelector('.sidebar');
                const overlay = document.querySelector('.sidebar-overlay');
                if (sidebar) sidebar.classList.remove('show');
                if (overlay) overlay.classList.remove('show');

                // Navigate immediately
                window.location.href = this.href;
            });

            console.log('✅ Added force navigation to:', newLink.textContent.trim());
        }
    });

    console.log('🎉 Force navigation setup complete!');
}

function emergencyMenuFix() {
    console.log('🚨 EMERGENCY MENU FIX - Removing all event listeners...');

    // Remove all existing event listeners by cloning all menu links
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    menuLinks.forEach((link, index) => {
        if (link.id !== 'logout-btn') {
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            console.log(`✅ Cleaned link ${index + 1}: ${newLink.textContent.trim()}`);
        }
    });

    console.log('🎉 Emergency fix complete - menu links should work now!');
}

// Export functions
window.diagnoseMobileMenu = diagnoseMobileMenu;
window.fixMenuClicks = fixMenuClicks;
window.testMenuClicks = testMenuClicks;
window.forceMenuNavigation = forceMenuNavigation;
window.emergencyMenuFix = emergencyMenuFix;

console.log('📱 Available functions:');
console.log('- diagnoseMobileMenu() - Check menu status');
console.log('- fixMenuClicks() - Apply click fixes');
console.log('- testMenuClicks() - Test if links work');
console.log('- forceMenuNavigation() - Force navigation setup');
console.log('- emergencyMenuFix() - Remove all event listeners');
console.log('');
console.log('🔧 Quick fix: Run emergencyMenuFix() for immediate solution');

// Auto-run diagnosis
setTimeout(() => {
    console.log('🔍 Auto-running menu diagnosis...');
    diagnoseMobileMenu();

    if (!testMenuClicks()) {
        console.log('⚠️ Menu issues detected. Run fixMenuClicks() to fix them.');
    }
}, 1000);
