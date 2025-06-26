/**
 * Quote Form Handler
 * Handles quote form submissions using the API service
 */

document.addEventListener('DOMContentLoaded', function() {
    initQuoteForm();
});

/**
 * Initialize quote form
 */
function initQuoteForm() {
    const quoteForm = document.getElementById('quoteForm');

    if (!quoteForm) {
        // Quote form not found - this is normal for pages without quote forms
        return;
    }

    quoteForm.addEventListener('submit', async function(e) {
        // If Netlify forms are enabled, let the form submit naturally
        if (quoteForm.hasAttribute('data-netlify')) {
            console.log('Netlify quote form detected - allowing native submission');
            return; // Let the form submit to Netlify
        }
        
        e.preventDefault();

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        // Collect form data from all steps
        const formDataObj = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            company: document.getElementById('company').value,
            serviceType: Array.from(document.querySelectorAll('input[name="services[]"]:checked')).map(cb => cb.value).join(', '),
            budget: document.querySelector('input[name="budget"]:checked')?.value || '',
            timeline: document.getElementById('timeline').value,
            projectDetails: document.getElementById('project-details').value
        };

        console.log('Submitting quote request with data:', formDataObj);
        console.log('API URL:', window.ExRevolutionAPI ? 'API service loaded' : 'API service not loaded');

        try {
            // Submit form using Netlify Function endpoint
            const apiUrl = window.apiConfig.quotes.create;
            const apiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formDataObj)
            });
            const response = await apiResponse.json();
            if (apiResponse.ok && response.success) {
                showNotification('Quote request sent successfully! We\'ll get back to you soon.', 'success');
                document.getElementById('formSuccess').style.display = 'block';
                document.getElementById('formError').style.display = 'none';
                quoteForm.reset();
                goToStep(1);
            } else {
                showNotification(response.error || response.message || 'Something went wrong. Please try again.', 'error');
                document.getElementById('formError').textContent = response.error || response.message || 'Something went wrong. Please try again.';
                document.getElementById('formError').style.display = 'block';
                document.getElementById('formSuccess').style.display = 'none';
            }
        } catch (error) {
            console.error('Error submitting quote request:', error);
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
 * Navigate to a specific step in the multi-step form
 * @param {number} stepNumber - The step number to navigate to
 */
function goToStep(stepNumber) {
    const formSteps = document.querySelectorAll('.form-step');
    const stepDots = document.querySelectorAll('.step-dot');

    // Hide all steps
    formSteps.forEach(step => {
        step.classList.remove('active');
    });

    // Update step indicators
    stepDots.forEach(dot => {
        dot.classList.remove('active');
    });

    // Show the current step
    const currentStep = document.getElementById('step' + stepNumber);
    if (currentStep) {
        currentStep.classList.add('active');
    }

    // Update the active dot
    const currentDot = document.querySelector(`.step-dot[data-step="${stepNumber}"]`);
    if (currentDot) {
        currentDot.classList.add('active');
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
