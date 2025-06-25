/**
 * Contact Form Handler
 * Handles contact form submissions using the API service
 */

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
});

/**
 * Initialize contact form
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) {
        // Contact form not found - this is normal for pages without contact forms
        return;
    }

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        // Get form data as an object
        const formDataObj = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('service').value || 'Contact Form Inquiry',
            message: document.getElementById('message').value
        };

        console.log('Submitting form with data:', formDataObj);
        console.log('API URL:', window.ExRevolutionAPI ? 'API service loaded' : 'API service not loaded');

        try {
            // Submit form using Netlify Function endpoint
            const apiUrl = window.apiConfig.contacts.create;
            const apiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': window.apiConfig.getToken() ? `Bearer ${window.apiConfig.getToken()}` : ''
                },
                body: JSON.stringify(formDataObj)
            });
            const response = await apiResponse.json();
            if (apiResponse.ok && response.success) {
                showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                document.getElementById('formSuccess').style.display = 'block';
                document.getElementById('formError').style.display = 'none';
                contactForm.reset();
            } else {
                showNotification(response.error || response.message || 'Something went wrong. Please try again.', 'error');
                document.getElementById('formError').textContent = response.error || response.message || 'Something went wrong. Please try again.';
                document.getElementById('formError').style.display = 'block';
                document.getElementById('formSuccess').style.display = 'none';
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            showNotification('Network error. Please check your connection and try again.', 'error');
            document.getElementById('formError').textContent = 'Network error. Please check your connection and try again.';
            document.getElementById('formError').style.display = 'block';
            document.getElementById('formSuccess').style.display = 'none';
        } finally {
            // Restore button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

/**
 * Show form message
 * @param {HTMLElement} form - The form element
 * @param {string} type - Message type ('success' or 'error')
 * @param {string} message - Message text
 */
function showFormMessage(form, type, message) {
    // Remove any existing messages
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('form-message', `form-message-${type}`);
    messageElement.textContent = message;

    // Add message to form
    form.appendChild(messageElement);

    // Scroll to message
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Remove message after 5 seconds if it's a success message
    if (type === 'success') {
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

// Notification popup function
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} notification-popup`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}
