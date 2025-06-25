/**
 * Lead Generation Script
 * This script implements various lead generation techniques including
 * lead capture forms, lead scoring, and lead nurturing functionality.
 *
 * Ex Revolution Technology
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all lead generation features
    initLeadCaptureForms();
    initLeadScoring();
    initLeadMagnetPopups();
    initChatbotLead();
    initReferralTracking();
});

/**
 * Lead Capture Forms
 * Enhances lead capture forms with validation and submission handling
 */
function initLeadCaptureForms() {
    const leadForms = document.querySelectorAll('.lead-form');

    leadForms.forEach(form => {
        // Enhanced form validation
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (validateLeadForm(form)) {
                submitLeadForm(form);
            }
        });

        // Real-time validation feedback
        const formInputs = form.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });

            // Show validation message as user types for certain fields
            if (input.type === 'email' || input.type === 'tel') {
                input.addEventListener('input', function() {
                    validateField(input);
                });
            }
        });
    });
}

/**
 * Validates an individual form field
 */
function validateField(field) {
    // Remove existing error messages
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    // Check if field is required and empty
    if (field.required && !field.value.trim()) {
        showFieldError(field, 'This field is required');
        return false;
    }

    // Email validation
    if (field.type === 'email' && field.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }

    // Phone validation
    if (field.type === 'tel' && field.value.trim()) {
        const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phonePattern.test(field.value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }

    // Field is valid
    field.classList.remove('invalid');
    field.classList.add('valid');
    return true;
}

/**
 * Displays an error message for a form field
 */
function showFieldError(field, message) {
    field.classList.add('invalid');
    field.classList.remove('valid');

    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;

    field.parentNode.appendChild(errorElement);
}

/**
 * Validates the entire lead form
 */
function validateLeadForm(form) {
    const formInputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    formInputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Submits the lead form data
 */
function submitLeadForm(form) {
    // Show loading state
    form.classList.add('submitting');
    const submitButton = form.querySelector('[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';

    // Gather form data
    const formData = new FormData(form);
    const formDataObj = {};
    formData.forEach((value, key) => {
        formDataObj[key] = value;
    });

    // Add lead source information
    formDataObj.lead_source = document.referrer || 'Direct';
    formDataObj.landing_page = window.location.href;
    formDataObj.timestamp = new Date().toISOString();

    // Submit to API
    submitLeadToAPI(formDataObj, form, submitButton, originalButtonText);
}

/**
 * Submits lead data to the API
 */
async function submitLeadToAPI(formDataObj, form, submitButton, originalButtonText) {
    try {
        // Determine the correct endpoint based on form type
        let endpoint = '/api/leads';

        // Check if this is a consultation form
        if (form.querySelector('[name="phone"]') &&
            (submitButton.textContent.toLowerCase().includes('consultation') ||
             submitButton.textContent.toLowerCase().includes('schedule'))) {
            endpoint = '/api/consultation';
        }

        console.log('Submitting lead to:', endpoint, formDataObj);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObj)
        });

        const result = await response.json();

        if (result.success) {
            console.log('Lead submitted successfully:', result);

            // Track lead submission
            trackLeadEvent('lead_form_submitted', {
                form_id: form.id || 'unnamed_form',
                lead_source: formDataObj.lead_source,
                endpoint: endpoint
            });

            // Reset form state
            form.classList.remove('submitting');
            submitButton.textContent = originalButtonText;

            // Show success message
            showFormSuccess(form, result.message);

            // Store lead data in localStorage for lead nurturing
            storeLeadData(formDataObj);

            // Reset form after successful submission
            form.reset();
        } else {
            throw new Error(result.message || 'Submission failed');
        }
    } catch (error) {
        console.error('Error submitting lead:', error);

        // Reset form state
        form.classList.remove('submitting');
        submitButton.textContent = originalButtonText;

        // Show error message
        showFormError(form, error.message);
    }
}

/**
 * Shows a success message after form submission
 */
function showFormSuccess(form, customMessage = null) {
    // Hide the form
    const formElements = form.querySelectorAll('.form-group, [type="submit"]');
    formElements.forEach(el => {
        el.style.display = 'none';
    });

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.innerHTML = `
        <div class="success-icon"><i class="fas fa-check-circle"></i></div>
        <h3>Thank You!</h3>
        <p>${customMessage || 'Your information has been submitted successfully. One of our representatives will contact you shortly.'}</p>
    `;

    form.appendChild(successMessage);

    // Reset form after 5 seconds
    setTimeout(() => {
        successMessage.remove();
        formElements.forEach(el => {
            el.style.display = '';
        });
    }, 5000);
}

/**
 * Shows an error message after form submission failure
 */
function showFormError(form, errorMessage) {
    // Remove any existing error messages
    const existingError = form.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }

    // Show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.innerHTML = `
        <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <p><strong>Error:</strong> ${errorMessage}</p>
        <p>Please check your information and try again.</p>
    `;

    // Insert error message at the top of the form
    form.insertBefore(errorDiv, form.firstChild);

    // Remove error message after 8 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 8000);
}

/**
 * Lead Scoring
 * Implements a basic lead scoring system based on user behavior
 */
function initLeadScoring() {
    // Initialize lead score if not already set
    if (!localStorage.getItem('lead_score')) {
        localStorage.setItem('lead_score', '0');
    }

    // Track page views
    incrementLeadScore(1);

    // Track time on page
    let timeOnPage = 0;
    const timeInterval = setInterval(() => {
        timeOnPage += 10;

        // Increment score for every minute spent on the page
        if (timeOnPage % 60 === 0) {
            incrementLeadScore(2);
        }
    }, 10000);

    // Track clicks on high-value elements
    const highValueElements = document.querySelectorAll('.high-value-element, .cta-button, .service-link');
    highValueElements.forEach(element => {
        element.addEventListener('click', function() {
            incrementLeadScore(5);
        });
    });

    // Track form interactions
    const formFields = document.querySelectorAll('form input, form textarea, form select');
    formFields.forEach(field => {
        field.addEventListener('focus', function() {
            incrementLeadScore(3);
        });
    });
}

/**
 * Increments the lead score by the specified amount
 */
function incrementLeadScore(amount) {
    const currentScore = parseInt(localStorage.getItem('lead_score') || '0');
    const newScore = currentScore + amount;
    localStorage.setItem('lead_score', newScore.toString());

    // Check if lead score threshold is reached
    checkLeadScoreThresholds(newScore);
}

/**
 * Checks if lead score has reached important thresholds
 */
function checkLeadScoreThresholds(score) {
    // If score reaches 20, show lead magnet popup
    if (score >= 20 && !sessionStorage.getItem('lead_magnet_shown')) {
        showLeadMagnetPopup();
    }

    // If score reaches 50, show chatbot
    if (score >= 50 && !sessionStorage.getItem('chatbot_shown')) {
        showChatbot();
    }
}

/**
 * Lead Magnet Popups
 * Displays targeted content offers to capture leads
 */
function initLeadMagnetPopups() {
    const leadMagnetTriggers = document.querySelectorAll('[data-lead-magnet]');

    leadMagnetTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();

            const magnetId = this.getAttribute('data-lead-magnet');
            showLeadMagnetPopup(magnetId);
        });
    });
}

/**
 * Shows a lead magnet popup
 */
function showLeadMagnetPopup(magnetId = 'default') {
    // Don't show if already shown in this session
    if (sessionStorage.getItem('lead_magnet_shown')) return;

    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'lead-magnet-popup';
    popup.id = `lead-magnet-${magnetId}`;

    // Popup content based on magnet ID
    let popupContent = '';

    switch (magnetId) {
        case 'ebook':
            popupContent = `
                <div class="lead-magnet-content">
                    <button class="popup-close">&times;</button>
                    <h3>Free E-Book: Digital Transformation Guide</h3>
                    <p>Learn how to transform your business with our comprehensive guide to digital transformation.</p>
                    <form class="lead-form">
                        <div class="form-group">
                            <input type="email" name="email" placeholder="Your Email Address" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Get Your Free E-Book</button>
                    </form>
                </div>
            `;
            break;

        case 'checklist':
            popupContent = `
                <div class="lead-magnet-content">
                    <button class="popup-close">&times;</button>
                    <h3>Website Optimization Checklist</h3>
                    <p>Get our 25-point checklist to ensure your website is fully optimized for conversions and SEO.</p>
                    <form class="lead-form">
                        <div class="form-group">
                            <input type="email" name="email" placeholder="Your Email Address" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Download Checklist</button>
                    </form>
                </div>
            `;
            break;

        default:
            popupContent = `
                <div class="lead-magnet-content">
                    <button class="popup-close">&times;</button>
                    <h3>Get a Free Consultation</h3>
                    <p>Sign up for a free 30-minute consultation with our experts to discuss your project needs.</p>
                    <form class="lead-form">
                        <div class="form-group">
                            <input type="text" name="name" placeholder="Your Name" required>
                        </div>
                        <div class="form-group">
                            <input type="email" name="email" placeholder="Your Email Address" required>
                        </div>
                        <div class="form-group">
                            <input type="tel" name="phone" placeholder="Your Phone Number">
                        </div>
                        <button type="submit" class="btn btn-primary">Schedule Consultation</button>
                    </form>
                </div>
            `;
    }

    popup.innerHTML = popupContent;
    document.body.appendChild(popup);

    // Show popup with animation
    setTimeout(() => {
        popup.classList.add('active');
    }, 100);

    // Mark as shown in this session
    sessionStorage.setItem('lead_magnet_shown', 'true');

    // Track lead magnet impression
    trackLeadEvent('lead_magnet_shown', {
        magnet_id: magnetId
    });

    // Close button functionality
    const closeButton = popup.querySelector('.popup-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            popup.classList.remove('active');
            setTimeout(() => {
                popup.remove();
            }, 300);
        });
    }

    // Initialize form in the popup
    initLeadCaptureForms();
}

/**
 * Chatbot Lead Generation
 * Note: Chatbot implementation moved to js/chatbot.js to avoid duplicates
 */
function initChatbotLead() {
    // Chatbot is now handled by js/chatbot.js
    // This function is kept for compatibility but does nothing
    return;
}

// Chatbot functions removed - now handled by js/chatbot.js

// All chatbot functions moved to js/chatbot.js to avoid duplicates

/**
 * Referral Tracking
 * Tracks and rewards referrals
 */
function initReferralTracking() {
    // Check for referral parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');

    if (referralCode) {
        // Store referral information
        localStorage.setItem('referral_code', referralCode);
        localStorage.setItem('referral_timestamp', new Date().toISOString());

        // Track referral
        trackLeadEvent('referral_visit', {
            referral_code: referralCode
        });
    }
}

/**
 * Stores lead data for lead nurturing
 */
function storeLeadData(leadData) {
    // Get existing leads or initialize empty array
    const existingLeads = JSON.parse(localStorage.getItem('leads') || '[]');

    // Add new lead data
    existingLeads.push({
        ...leadData,
        timestamp: new Date().toISOString(),
        lead_score: localStorage.getItem('lead_score') || '0'
    });

    // Store updated leads
    localStorage.setItem('leads', JSON.stringify(existingLeads));
}

/**
 * Analytics Tracking for Lead Generation
 */
function trackLeadEvent(eventName, eventData = {}) {
    // Check if analytics is available
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventData);
    } else if (typeof ga === 'function') {
        ga('send', 'event', 'Lead', eventName, JSON.stringify(eventData));
    }

    // Log event for debugging
    console.log('Lead Event:', eventName, eventData);
}
