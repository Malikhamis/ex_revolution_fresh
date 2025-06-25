/**
 * API Service
 * Handles all API interactions with the backend
 */

// API base URL - automatically detect the correct URL
// Use current domain for production deployment
const API_BASE_URL = `${window.location.protocol}//${window.location.host}/api`;

// For local development with proxy server (to avoid CORS issues)
// const API_BASE_URL = 'http://localhost:3000/api';          // Local proxy URL

// For production deployment (uncomment before deploying)
// const API_BASE_URL = 'https://exrev-p60oa80ui-exrevs-projects.vercel.app/api';  // Production URL

// Make API_BASE_URL available globally for other scripts
window.API_BASE_URL = API_BASE_URL;

/**
 * Contact Form API
 * Handles contact form submissions
 */
const ContactAPI = {
    /**
     * Submit contact form
     * @param {Object} formData - Contact form data
     * @returns {Promise} - API response
     */
    submitContactForm: async function(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            return await response.json();
        } catch (error) {
            console.error('Error submitting contact form:', error);
            return {
                success: false,
                message: 'Network error. Please check your connection and try again.'
            };
        }
    }
};

/**
 * Quote API
 * Handles quote request submissions
 */
const QuoteAPI = {
    /**
     * Submit quote request
     * @param {Object} formData - Quote request data
     * @returns {Promise} - API response
     */
    submitQuoteRequest: async function(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/quote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            return await response.json();
        } catch (error) {
            console.error('Error submitting quote request:', error);
            return {
                success: false,
                message: 'Network error. Please check your connection and try again.'
            };
        }
    }
};

/**
 * Newsletter API
 * Handles newsletter subscriptions
 */
const NewsletterAPI = {
    /**
     * Subscribe to newsletter
     * @param {Object} formData - Newsletter subscription data
     * @returns {Promise} - API response
     */
    subscribe: async function(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/newsletter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            return await response.json();
        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            return {
                success: false,
                message: 'Network error. Please check your connection and try again.'
            };
        }
    }
};

/**
 * Auth API
 * Handles user authentication
 */
const AuthAPI = {
    /**
     * Login user
     * @param {Object} credentials - User credentials
     * @returns {Promise} - API response
     */
    login: async function(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.success && data.token) {
                // Store token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Error logging in:', error);
            return {
                success: false,
                message: 'Network error. Please check your connection and try again.'
            };
        }
    },

    /**
     * Get current user
     * @returns {Promise} - API response
     */
    getCurrentUser: async function() {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return {
                    success: false,
                    message: 'Not authenticated'
                };
            }

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error('Error getting current user:', error);
            return {
                success: false,
                message: 'Network error. Please check your connection and try again.'
            };
        }
    },

    /**
     * Logout user
     */
    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        return {
            success: true,
            message: 'Logged out successfully'
        };
    }
};

// Export all API services
window.ExRevolutionAPI = {
    Contact: ContactAPI,
    Quote: QuoteAPI,
    Newsletter: NewsletterAPI,
    Auth: AuthAPI
};
