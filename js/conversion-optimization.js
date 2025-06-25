/**
 * Conversion Optimization Script
 * This script implements various techniques to improve website conversion rates
 * including exit intent popups, scroll-triggered CTAs, and A/B testing functionality.
 *
 * Ex Revolution Technology
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all conversion optimization features
    initExitIntentPopup();
    initScrollTriggeredCTAs();
    initSmartCTAPlacement();
    initFormOptimization();
    initSocialProof();
    initABTesting();
});

/**
 * Exit Intent Popup
 * Shows a popup when the user is about to leave the page
 * Improved to be less intrusive and only show after meaningful engagement
 */
function initExitIntentPopup() {
    const exitPopup = document.getElementById('exit-popup');
    const exitPopupClose = document.querySelector('#exit-popup .popup-close');

    // If popup doesn't exist on this page, return
    if (!exitPopup) return;

    // Check if the popup has been shown in this session or in the last 7 days
    const hasShownPopup = sessionStorage.getItem('exitPopupShown') || localStorage.getItem('exitPopupShown');

    if (hasShownPopup) return;

    // Variables to track user engagement
    let hasScrolled = false;
    let timeOnPage = 0;
    let exitIntentCounter = 0;
    const minTimeOnPage = 30; // Minimum time on page in seconds
    const minScrollPercentage = 25; // Minimum scroll percentage

    // Track scroll depth
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

        if (scrollPercentage > minScrollPercentage) {
            hasScrolled = true;
        }
    });

    // Track time on page
    const timeInterval = setInterval(() => {
        timeOnPage++;
    }, 1000);

    // Track mouse movement to detect exit intent
    document.addEventListener('mouseleave', function(e) {
        // Only show popup if:
        // 1. Mouse leaves the top of the page
        // 2. User has been on the page for at least 30 seconds
        // 3. User has scrolled down at least 25% of the page
        // 4. Popup hasn't been shown yet
        // 5. This is not the first exit intent (to avoid accidental triggers)
        if (e.clientY < 5 && !hasShownPopup) {
            exitIntentCounter++;

            // Only show on second exit intent and if user has engaged with the page
            if (exitIntentCounter >= 2 && timeOnPage >= minTimeOnPage && hasScrolled) {
                exitPopup.classList.add('active');

                // Store in both session and local storage
                sessionStorage.setItem('exitPopupShown', 'true');

                // Store in localStorage with expiration of 7 days
                const now = new Date();
                const expirationDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
                localStorage.setItem('exitPopupShown', expirationDate.getTime());

                // Clear the time interval
                clearInterval(timeInterval);

                // Track popup impression for analytics
                trackConversionEvent('exit_popup_shown');
            }
        }
    });

    // Close button functionality
    if (exitPopupClose) {
        exitPopupClose.addEventListener('click', function() {
            exitPopup.classList.remove('active');

            // Track popup closed for analytics
            trackConversionEvent('exit_popup_closed');
        });
    }

    // Close popup when clicking outside
    exitPopup.addEventListener('click', function(e) {
        if (e.target === exitPopup) {
            exitPopup.classList.remove('active');

            // Track popup closed for analytics
            trackConversionEvent('exit_popup_closed');
        }
    });

    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && exitPopup.classList.contains('active')) {
            exitPopup.classList.remove('active');

            // Track popup closed for analytics
            trackConversionEvent('exit_popup_closed');
        }
    });
}

/**
 * Scroll-Triggered CTAs
 * Shows call-to-action elements when the user scrolls to a certain point
 */
function initScrollTriggeredCTAs() {
    const scrollCTAs = document.querySelectorAll('.scroll-cta');

    if (scrollCTAs.length === 0) return;

    // Function to check if an element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Function to handle scroll events
    function handleScroll() {
        scrollCTAs.forEach(cta => {
            if (isInViewport(cta) && !cta.classList.contains('animated')) {
                cta.classList.add('animated');

                // Track CTA impression for analytics
                trackConversionEvent('scroll_cta_visible', {
                    cta_id: cta.id || 'unnamed_cta'
                });
            }
        });
    }

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);

    // Initial check on page load
    handleScroll();
}

/**
 * Smart CTA Placement
 * Dynamically positions CTAs based on user behavior and page content
 */
function initSmartCTAPlacement() {
    const floatingCTA = document.querySelector('.floating-cta');

    if (!floatingCTA) return;

    let lastScrollTop = 0;
    let scrollDirection = 'down';

    // Show floating CTA after user has scrolled down 30% of the page
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

        // Determine scroll direction
        scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
        lastScrollTop = scrollTop;

        // Show CTA when scrolling down and past 30% of the page
        if (scrollPercentage > 30) {
            floatingCTA.classList.add('visible');

            // Hide when scrolling up near the top
            if (scrollDirection === 'up' && scrollPercentage < 10) {
                floatingCTA.classList.remove('visible');
            }
        } else {
            floatingCTA.classList.remove('visible');
        }
    });
}

/**
 * Form Optimization
 * Enhances forms for better completion rates
 */
function initFormOptimization() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        // Add progress indicators for multi-step forms
        const formSteps = form.querySelectorAll('.form-step');
        if (formSteps.length > 1) {
            createFormProgressIndicator(form, formSteps.length);
        }

        // Save form progress in localStorage
        const formInputs = form.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            // Skip password fields for security
            if (input.type === 'password') return;

            // Load saved value if exists
            const savedValue = localStorage.getItem(`form_${form.id || 'main'}_${input.name}`);
            if (savedValue) {
                input.value = savedValue;
            }

            // Save input value on change
            input.addEventListener('change', function() {
                localStorage.setItem(`form_${form.id || 'main'}_${input.name}`, input.value);
            });
        });

        // Track form submissions
        form.addEventListener('submit', function() {
            trackConversionEvent('form_submitted', {
                form_id: form.id || 'unnamed_form'
            });

            // Clear saved form data after successful submission
            formInputs.forEach(input => {
                if (input.type !== 'password') {
                    localStorage.removeItem(`form_${form.id || 'main'}_${input.name}`);
                }
            });
        });
    });
}

/**
 * Creates a progress indicator for multi-step forms
 */
function createFormProgressIndicator(form, stepCount) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'form-progress';

    for (let i = 0; i < stepCount; i++) {
        const step = document.createElement('div');
        step.className = 'form-progress-step';
        if (i === 0) step.classList.add('active');
        progressContainer.appendChild(step);
    }

    form.insertBefore(progressContainer, form.firstChild);
}

/**
 * Social Proof Elements
 * Displays social proof notifications to increase trust
 */
function initSocialProof() {
    const socialProofContainer = document.querySelector('.social-proof-container');

    if (!socialProofContainer) return;

    // Sample social proof data (in a real implementation, this would come from an API)
    const socialProofData = [
        { message: "John from Dar es Salaam just signed up for our newsletter", time: "2 minutes ago" },
        { message: "Sarah from Arusha purchased our Premium package", time: "5 minutes ago" },
        { message: "15 people are currently viewing this page", time: "Just now" },
        { message: "We've helped over 200 businesses this month", time: "This month" }
    ];

    // Display social proof notifications periodically
    let currentIndex = 0;

    function showNextProof() {
        const data = socialProofData[currentIndex];

        const proofElement = document.createElement('div');
        proofElement.className = 'social-proof-item';
        proofElement.innerHTML = `
            <p class="proof-message">${data.message}</p>
            <span class="proof-time">${data.time}</span>
        `;

        socialProofContainer.innerHTML = '';
        socialProofContainer.appendChild(proofElement);
        socialProofContainer.classList.add('active');

        // Hide after 5 seconds
        setTimeout(() => {
            socialProofContainer.classList.remove('active');
        }, 5000);

        // Move to next item
        currentIndex = (currentIndex + 1) % socialProofData.length;
    }

    // Show first notification after 10 seconds
    setTimeout(() => {
        showNextProof();

        // Then show periodically
        setInterval(showNextProof, 15000);
    }, 10000);
}

/**
 * A/B Testing Functionality
 * Simple A/B testing implementation
 */
function initABTesting() {
    // Check if A/B testing is enabled for this page
    const abTestElements = document.querySelectorAll('[data-ab-test]');

    if (abTestElements.length === 0) return;

    // Determine which variant to show (randomly or based on user ID)
    const testVariant = Math.random() < 0.5 ? 'A' : 'B';

    // Store the variant in localStorage for consistency across page views
    localStorage.setItem('ab_test_variant', testVariant);

    // Apply the appropriate variant
    abTestElements.forEach(element => {
        const variant = element.getAttribute('data-ab-test');

        if (variant === testVariant) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });

    // Track which variant is being shown
    trackConversionEvent('ab_test_impression', {
        variant: testVariant
    });
}

/**
 * Analytics Tracking
 * Tracks conversion events for analytics
 */
function trackConversionEvent(eventName, eventData = {}) {
    // Check if analytics is available
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventData);
    } else if (typeof ga === 'function') {
        ga('send', 'event', 'Conversion', eventName, JSON.stringify(eventData));
    }

    // Log event for debugging
    console.log('Conversion Event:', eventName, eventData);
}
