/**
 * Digital Marketing Guide Download Handler
 * Handles the form submission for the free digital marketing guide
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find the guide CTA form on the page
    const guideForms = document.querySelectorAll('.guide-cta-form');

    if (guideForms.length > 0) {
        guideForms.forEach(form => {
            form.addEventListener('submit', handleGuideFormSubmit);
        });
    }

    /**
     * Handle guide form submission
     * @param {Event} e - The submit event
     */
    async function handleGuideFormSubmit(e) {
        e.preventDefault();

        // Get the form and email input
        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const submitButton = form.querySelector('button[type="submit"]');

        if (!emailInput || !emailInput.value) {
            showMessage(form, 'Please enter a valid email address', 'error');
            return;
        }

        // Disable the form while submitting
        emailInput.disabled = true;
        submitButton.disabled = true;

        // Original button text
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Processing...';

        try {
            // Get the API base URL
            const apiBaseUrl = `${window.location.protocol}//${window.location.host}/api`;

            // Send the guide download request to the API
            const response = await fetch(`${apiBaseUrl}/guides/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value,
                    guide: 'digital-marketing'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to process your request');
            }

            // Show success message
            showSuccessContent(form);

            // Reset the form
            form.reset();

            // Create a cookie to remember that the user has downloaded the guide
            setCookie('guide_downloaded', 'true', 30);

            // Track the conversion
            if (typeof trackConversionEvent === 'function') {
                trackConversionEvent('guide_downloaded', {
                    guide: 'digital-marketing'
                });
            }

            console.log('Guide download request processed successfully');

        } catch (error) {
            console.error('Guide download error:', error);

            // Show error message
            showMessage(form, 'Failed to process your request. Please try again later.', 'error');

            // Re-enable the form
            emailInput.disabled = false;
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }

    /**
     * Show a success message and download link after form submission
     * @param {HTMLElement} form - The form element
     */
    function showSuccessContent(form) {
        // Hide the form
        form.style.display = 'none';

        // Create success content container
        const successContent = document.createElement('div');
        successContent.className = 'guide-success-content';
        successContent.innerHTML = `
            <div class="success-icon"><i class="fas fa-check-circle"></i></div>
            <h3>Thank You!</h3>
            <p>Your free digital marketing guide is on its way to your inbox.</p>
            <p>Click the button below to download it now:</p>
            <a href="/assets/guides/digital-marketing-guide.pdf" class="btn btn-primary" download>Download Guide</a>
        `;

        // Add styles
        successContent.style.textAlign = 'center';
        successContent.style.padding = '20px 0';

        // Insert the success content after the form
        form.parentNode.insertBefore(successContent, form.nextSibling);

        // Automatically trigger the download
        setTimeout(() => {
            const downloadLink = successContent.querySelector('a');
            if (downloadLink) {
                downloadLink.click();
            }
        }, 1000);
    }

    /**
     * Show a message after form submission
     * @param {HTMLElement} form - The form element
     * @param {string} message - The message to display
     * @param {string} type - The type of message (success, error, info)
     */
    function showMessage(form, message, type) {
        // Remove any existing message
        const existingMessage = form.parentNode.querySelector('.guide-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `guide-message ${type}`;
        messageElement.textContent = message;

        // Add styles based on message type
        if (type === 'success') {
            messageElement.style.color = '#28a745';
        } else if (type === 'error') {
            messageElement.style.color = '#dc3545';
        } else if (type === 'info') {
            messageElement.style.color = '#17a2b8';
        }

        // Add margin and padding
        messageElement.style.marginTop = '10px';
        messageElement.style.padding = '8px';
        messageElement.style.borderRadius = '4px';
        messageElement.style.fontSize = '14px';

        // Insert the message after the form
        form.parentNode.insertBefore(messageElement, form.nextSibling);

        // Remove the message after 5 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }

    /**
     * Set a cookie
     * @param {string} name - The name of the cookie
     * @param {string} value - The value of the cookie
     * @param {number} days - The number of days until the cookie expires
     */
    function setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }
});
