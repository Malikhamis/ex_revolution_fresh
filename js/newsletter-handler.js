/**
 * Newsletter Handler
 * Handles newsletter subscription functionality
 */

console.log('Newsletter handler loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Newsletter handler initializing');
    
    // Find newsletter forms
    const newsletterForms = document.querySelectorAll('.newsletter-form, #newsletter-form, [data-newsletter-form]');
    
    if (newsletterForms.length > 0) {
        console.log(`Found ${newsletterForms.length} newsletter form(s)`);
        
        newsletterForms.forEach(form => {
            form.addEventListener('submit', handleNewsletterSubmission);
        });
    }
    
    // Also handle newsletter inputs with buttons
    const newsletterInputs = document.querySelectorAll('input[type="email"][placeholder*="email" i], input[name*="newsletter" i], input[id*="newsletter" i]');
    
    newsletterInputs.forEach(input => {
        const parentForm = input.closest('form');
        if (parentForm && !parentForm.hasAttribute('data-newsletter-handled')) {
            parentForm.setAttribute('data-newsletter-handled', 'true');
            parentForm.addEventListener('submit', handleNewsletterSubmission);
        }
    });
});

/**
 * Handle newsletter form submission
 * @param {Event} event - Form submission event
 */
async function handleNewsletterSubmission(event) {
    const form = event.target;
    
    // If Netlify forms are enabled, let the form submit naturally
    if (form.hasAttribute('data-netlify')) {
        console.log('Netlify newsletter form detected - allowing native submission');
        return; // Let the form submit to Netlify
    }
    
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get email from form
    let email = formData.get('email') || formData.get('newsletter_email') || formData.get('newsletter');
    
    // If no email found in form data, try to find email input
    if (!email) {
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput) {
            email = emailInput.value;
        }
    }
    
    if (!email) {
        showNewsletterMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        showNewsletterMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';
    
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Subscribing...';
    }
    
    try {
        // Submit newsletter subscription
        const response = await submitNewsletterSubscription({
            email: email,
            source: 'website'
        });
        
        if (response.success) {
            showNewsletterMessage('Thank you for subscribing! Check your email for confirmation.', 'success');
            form.reset();
        } else {
            showNewsletterMessage(response.message || 'Subscription failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        showNewsletterMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Restore button state
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }
}

/**
 * Submit newsletter subscription to API
 * @param {Object} subscriptionData - Newsletter subscription data
 * @returns {Promise} - API response
 */
async function submitNewsletterSubscription(subscriptionData) {
    try {
        const apiUrl = `${window.location.protocol}//${window.location.host}/api/newsletter`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriptionData)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error submitting newsletter subscription:', error);
        return {
            success: false,
            message: 'Network error. Please check your connection and try again.'
        };
    }
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show newsletter message to user
 * @param {string} message - Message to show
 * @param {string} type - Message type (success, error, info)
 */
function showNewsletterMessage(message, type = 'info') {
    // Try to find existing message container
    let messageContainer = document.querySelector('.newsletter-message, .alert-container');
    
    if (!messageContainer) {
        // Create message container
        messageContainer = document.createElement('div');
        messageContainer.className = 'newsletter-message';
        messageContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(messageContainer);
    }
    
    // Set message and style based on type
    messageContainer.textContent = message;
    
    switch (type) {
        case 'success':
            messageContainer.style.backgroundColor = '#28a745';
            break;
        case 'error':
            messageContainer.style.backgroundColor = '#dc3545';
            break;
        default:
            messageContainer.style.backgroundColor = '#007bff';
    }
    
    // Show message
    messageContainer.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        if (messageContainer) {
            messageContainer.style.display = 'none';
        }
    }, 5000);
}

// Export for use in other scripts if needed
if (typeof window !== 'undefined') {
    window.NewsletterHandler = {
        subscribe: submitNewsletterSubscription,
        showMessage: showNewsletterMessage
    };
}
