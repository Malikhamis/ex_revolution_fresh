/**
 * Direct Mobile Menu JavaScript
 * This script handles the mobile menu functionality without any dependencies.
 * It provides a clean, direct implementation that avoids the issues with the previous menu.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    // Create overlay element if it doesn't exist
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.classList.add('menu-overlay');
        body.appendChild(overlay);
    }
    
    /**
     * Toggle the mobile menu open/closed
     */
    function toggleMenu() {
        mobileToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        overlay.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        // Set aria-expanded attribute for accessibility
        const isExpanded = mainNav.classList.contains('active');
        mobileToggle.setAttribute('aria-expanded', isExpanded);
    }
    
    // Event listeners
    
    // Toggle menu when clicking the mobile toggle button
    mobileToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        toggleMenu();
    });
    
    // Close menu when clicking on overlay
    overlay.addEventListener('click', function() {
        if (mainNav.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Close menu when clicking on a link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't prevent default here - allow normal navigation
            if (mainNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
    
    // Close menu when ESC key is pressed
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && mainNav.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Initialize ARIA attributes for accessibility
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', 'main-nav');
    mainNav.setAttribute('id', 'main-nav');
});
