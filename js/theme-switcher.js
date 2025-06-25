/**
 * Theme Switcher
 * Handles switching between light and dark themes
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Theme switcher initializing');

    // Create and append theme toggle button to header
    const headerContainer = document.querySelector('.header-container');
    const ctaButton = document.querySelector('.cta-button');

    if (headerContainer && ctaButton) {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Toggle dark/light mode');
        themeToggle.innerHTML = `
            <i class="fas fa-moon dark-icon theme-toggle-icon"></i>
            <i class="fas fa-sun light-icon theme-toggle-icon"></i>
        `;

        // Insert before CTA button
        headerContainer.insertBefore(themeToggle, ctaButton);

        // Check for saved theme preference or respect OS preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

        // Apply theme based on saved preference or OS preference
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
            document.body.classList.add('dark-theme');
            themeToggle.classList.add('dark-active');

            // Apply dark mode styles including logo
            applyDarkModeStyles();
        } else {
            // Apply light mode fixes immediately if we're in light mode
            applyLightModeStyles();
        }

        // Toggle theme when button is clicked
        themeToggle.addEventListener('click', function() {
            const isDarkMode = document.body.classList.toggle('dark-theme');
            this.classList.toggle('dark-active');

            // Save preference to localStorage
            if (isDarkMode) {
                localStorage.setItem('theme', 'dark');
                // Apply dark mode styles
                applyDarkModeStyles();
                // Remove any inline styles that might have been applied
                removeInlineStyles();
            } else {
                localStorage.setItem('theme', 'light');
                // Apply light mode styles
                applyLightModeStyles();
            }

            // Announce theme change for screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('class', 'sr-only');
            announcement.textContent = isDarkMode ? 'Dark theme enabled' : 'Light theme enabled';
            document.body.appendChild(announcement);

            // Remove announcement after it's been read
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        });
    }

    // Add CSS overrides for light mode
    const styleElement = document.createElement('style');
    styleElement.id = 'light-mode-overrides';
    styleElement.textContent = `
        /* Light mode overrides - only apply when not in dark mode */
        body:not(.dark-theme) .contact-form {
            background-color: #ffffff !important;
            color: #333333 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
        }

        body:not(.dark-theme) .contact-form h3 {
            color: #222222 !important;
        }

        body:not(.dark-theme) .form-group label {
            color: #333333 !important;
        }

        body:not(.dark-theme) .form-control {
            background-color: #f5f7fa !important;
            color: #333333 !important;
            border: 1px solid #e1e5eb !important;
        }

        body:not(.dark-theme) .form-control::placeholder {
            color: #6c757d !important;
        }

        body:not(.dark-theme) .form-check-label {
            color: #555555 !important;
        }

        body:not(.dark-theme) .form-submit {
            background: linear-gradient(45deg, #0066cc, #0099ff) !important;
            color: #ffffff !important;
        }

        body:not(.dark-theme) .contact-info h2 {
            color: #222222 !important;
        }

        body:not(.dark-theme) .contact-info p {
            color: #444444 !important;
        }

        body:not(.dark-theme) .contact-text h4 {
            color: #222222 !important;
        }

        body:not(.dark-theme) .contact-text p {
            color: #444444 !important;
        }

        body:not(.dark-theme) .contact-icon {
            background: linear-gradient(45deg, #0066cc, #0099ff) !important;
            color: #ffffff !important;
        }

        body:not(.dark-theme) .social-links a {
            background-color: #f5f7fa !important;
            color: #0066cc !important;
        }

        body:not(.dark-theme) .social-links a:hover {
            background-color: #0066cc !important;
            color: #ffffff !important;
        }

        /* Fix all text in light mode */
        body:not(.dark-theme) h1,
        body:not(.dark-theme) h2,
        body:not(.dark-theme) h3,
        body:not(.dark-theme) h4,
        body:not(.dark-theme) h5,
        body:not(.dark-theme) h6 {
            color: #222222 !important;
        }

        body:not(.dark-theme) p,
        body:not(.dark-theme) span:not(.post-category):not(.category-count),
        body:not(.dark-theme) li,
        body:not(.dark-theme) a:not(.btn):not(.cta-button) {
            color: #444444 !important;
        }

        /* Fix section backgrounds */
        body:not(.dark-theme) section:not(.page-header):not(.cta-section):not(.hero-section):not(.service-hero):not(.about-hero):not(.contact-hero) {
            background-color: #ffffff !important;
        }

        body:not(.dark-theme) .faq-section,
        body:not(.dark-theme) .values-section,
        body:not(.dark-theme) .process-section,
        body:not(.dark-theme) .testimonials-section {
            background-color: #f5f7fa !important;
        }

        /* Fix cards and containers */
        body:not(.dark-theme) .contact-method,
        body:not(.dark-theme) .faq-item,
        body:not(.dark-theme) .value-card,
        body:not(.dark-theme) .process-step,
        body:not(.dark-theme) .team-member,
        body:not(.dark-theme) .service-card,
        body:not(.dark-theme) .feature-card,
        body:not(.dark-theme) .testimonial-card,
        body:not(.dark-theme) .blog-card {
            background-color: #ffffff !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
        }
    `;
    document.head.appendChild(styleElement);

    // Enhanced function to apply light mode styles through CSS variables and classes
    function applyLightModeStyles() {
        document.documentElement.style.setProperty('--bg-primary', 'var(--light-bg-primary)');
        document.documentElement.style.setProperty('--bg-secondary', 'var(--light-bg-secondary)');
        document.documentElement.style.setProperty('--bg-card', 'var(--light-bg-card)');
        document.documentElement.style.setProperty('--text-primary', 'var(--light-text-primary)');
        document.documentElement.style.setProperty('--text-secondary', 'var(--light-text-secondary)');
        document.documentElement.style.setProperty('--border-color', 'var(--light-border)');
        document.documentElement.style.setProperty('--shadow-sm', 'var(--light-shadow)');
        document.documentElement.style.setProperty('--shadow-md', 'var(--light-shadow)');
        document.documentElement.style.setProperty('--shadow-lg', 'var(--light-shadow)');

        // Add a class to handle specific light mode styles that can't be handled with CSS variables
        document.body.classList.add('light-theme');

        // Ensure logo switching works correctly
        const logoLight = document.querySelector('.logo-light');
        const logoDark = document.querySelector('.logo-dark');

        if (logoLight && logoDark) {
            logoLight.style.display = 'block';
            logoDark.style.display = 'none';
        }

        // Apply specific styles for elements that need direct manipulation
        applySpecificLightModeStyles();
    }

    // Function to apply specific light mode styles to elements that need direct manipulation
    function applySpecificLightModeStyles() {
        // Apply styles to cards that might have specific styling needs
        const cards = document.querySelectorAll('.story-card, .values-card, .mission-card, .vision-card');
        cards.forEach(card => {
            card.style.backgroundColor = 'var(--light-bg-card)';
            card.style.boxShadow = 'var(--light-shadow)';
        });

        // Apply styles to icons that might need specific colors (EXCLUDE theme switcher)
        const icons = document.querySelectorAll('.stat-icon, .value-icon, .mission-icon, .vision-icon');
        icons.forEach(icon => {
            // Skip if it's inside theme switcher or theme toggle
            if (icon.closest('.theme-switcher') || icon.closest('.theme-toggle') || icon.classList.contains('theme-toggle-icon')) {
                return;
            }

            if (icon.classList.contains('stat-icon') || icon.classList.contains('mission-icon') || icon.classList.contains('vision-icon')) {
                icon.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
                icon.style.color = 'var(--white)';
            } else {
                icon.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
                icon.style.color = 'var(--white)';
            }
        });

        // Apply styles to specific text elements that might need different colors
        const headings = document.querySelectorAll('.card-header h2, .stat-number, .value-content h3, .mission-card h3, .vision-card h3');
        headings.forEach(heading => {
            heading.style.color = 'var(--light-text-primary)';
        });

        const paragraphs = document.querySelectorAll('.story-text, .stat-label, .value-content p, .mission-card p, .vision-card p');
        paragraphs.forEach(paragraph => {
            paragraph.style.color = 'var(--light-text-secondary)';
        });
    }

    // Function to apply dark mode styles
    function applyDarkModeStyles() {
        document.documentElement.style.setProperty('--bg-primary', 'var(--dark-bg-primary)');
        document.documentElement.style.setProperty('--bg-secondary', 'var(--dark-bg-secondary)');
        document.documentElement.style.setProperty('--bg-card', 'var(--dark-bg-card)');
        document.documentElement.style.setProperty('--text-primary', 'var(--dark-text-primary)');
        document.documentElement.style.setProperty('--text-secondary', 'var(--dark-text-secondary)');
        document.documentElement.style.setProperty('--border-color', 'var(--dark-border)');
        document.documentElement.style.setProperty('--shadow-sm', 'var(--dark-shadow)');
        document.documentElement.style.setProperty('--shadow-md', 'var(--dark-shadow)');
        document.documentElement.style.setProperty('--shadow-lg', 'var(--dark-shadow)');

        // Remove light theme class if it exists
        document.body.classList.remove('light-theme');

        // Ensure logo switching works correctly
        const logoLight = document.querySelector('.logo-light');
        const logoDark = document.querySelector('.logo-dark');

        if (logoLight && logoDark) {
            logoLight.style.display = 'none';
            logoDark.style.display = 'block';
        }
    }

    // Function to remove inline styles
    function removeInlineStyles() {
        // Remove inline styles from elements that had direct manipulation (EXCLUDE theme switcher)
        const styledElements = document.querySelectorAll('.story-card, .values-card, .mission-card, .vision-card, .stat-icon, .value-icon, .mission-icon, .vision-icon, .card-header h2, .stat-number, .value-content h3, .mission-card h3, .vision-card h3, .story-text, .stat-label, .value-content p, .mission-card p, .vision-card p');
        styledElements.forEach(el => {
            // Skip if it's inside theme switcher or theme toggle
            if (el.closest('.theme-switcher') || el.closest('.theme-toggle') || el.classList.contains('theme-toggle-icon')) {
                return;
            }
            el.removeAttribute('style');
        });
    }

    // Apply appropriate styles based on current theme
    if (document.body.classList.contains('dark-theme')) {
        applyDarkModeStyles();
    } else {
        applyLightModeStyles();
    }

    // Add a mutation observer to handle dynamic content changes
    const observer = new MutationObserver(function(mutations) {
        if (document.body.classList.contains('dark-theme')) {
            // If we're in dark mode, make sure dark mode styles are applied
            applyDarkModeStyles();
        } else {
            // If we're in light mode, make sure light mode styles are applied
            applySpecificLightModeStyles();
        }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });
});
