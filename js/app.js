/**
 * Main Application JavaScript
 * Handles general website functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Initialize form validation
    initFormValidation();
    
    // Initialize animations
    initAnimations();
});

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Get the target's position relative to the viewport
                const rect = targetElement.getBoundingClientRect();
                
                // Get the current scroll position
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Calculate the target scroll position
                const targetPosition = rect.top + scrollTop - 100; // 100px offset for header
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                console.log('Smooth scrolled to:', targetId);
            }
        });
    });
}

/**
 * Initialize form validation
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            // Check all required fields
            requiredFields.forEach(function(field) {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Create or update error message
                    let errorMessage = field.nextElementSibling;
                    if (!errorMessage || !errorMessage.classList.contains('error-message')) {
                        errorMessage = document.createElement('div');
                        errorMessage.classList.add('error-message');
                        field.parentNode.insertBefore(errorMessage, field.nextSibling);
                    }
                    errorMessage.textContent = 'This field is required';
                } else {
                    field.classList.remove('error');
                    
                    // Remove error message if it exists
                    const errorMessage = field.nextElementSibling;
                    if (errorMessage && errorMessage.classList.contains('error-message')) {
                        errorMessage.remove();
                    }
                    
                    // Validate email fields
                    if (field.type === 'email' && !isValidEmail(field.value)) {
                        isValid = false;
                        field.classList.add('error');
                        
                        // Create or update error message
                        let errorMessage = field.nextElementSibling;
                        if (!errorMessage || !errorMessage.classList.contains('error-message')) {
                            errorMessage = document.createElement('div');
                            errorMessage.classList.add('error-message');
                            field.parentNode.insertBefore(errorMessage, field.nextSibling);
                        }
                        errorMessage.textContent = 'Please enter a valid email address';
                    }
                }
            });
            
            // Prevent form submission if validation fails
            if (!isValid) {
                e.preventDefault();
                console.log('Form validation failed');
            } else {
                console.log('Form validation passed');
            }
        });
    });
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Initialize animations
 */
function initAnimations() {
    // Add animation classes when elements come into view
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length > 0) {
        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });
        
        // Observe each element
        animatedElements.forEach(element => {
            observer.observe(element);
        });
        
        console.log('Scroll animations initialized');
    }
}

/**
 * Initialize dark mode toggle
 * Note: This is commented out as it's not currently used, but can be enabled if needed
 */
/*
function initDarkMode() {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    
    if (darkModeToggle) {
        // Check for saved user preference
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // Check for system preference
        const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial mode
        if (savedDarkMode || (systemDarkMode && savedDarkMode === null)) {
            document.body.classList.add('dark-mode');
            darkModeToggle.setAttribute('aria-pressed', 'true');
        }
        
        // Toggle dark mode on click
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            this.setAttribute('aria-pressed', isDarkMode);
            console.log('Dark mode:', isDarkMode ? 'enabled' : 'disabled');
        });
        
        console.log('Dark mode initialized');
    }
}
*/
