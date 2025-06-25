/**
 * API Configuration for Admin Dashboard
 * Handles dynamic API URLs for both local and mobile access
 */

window.apiConfig = {
    baseURL: '/.netlify/functions',
    // API endpoints
    auth: {
        login: '/.netlify/functions/auth'
    },
    contacts: {
        list: '/.netlify/functions/contact',
        create: '/.netlify/functions/contact',
        update: '/.netlify/functions/contact',
        delete: '/.netlify/functions/contact'
    },
    quotes: {
        list: '/.netlify/functions/quotes',
        create: '/.netlify/functions/quotes',
        update: '/.netlify/functions/quotes'
    },
    newsletter: {
        subscribers: '/.netlify/functions/newsletter/subscribers',
        templates: '/.netlify/functions/newsletter',
        send: '/.netlify/functions/newsletter/send'
    },
    blog: {
        posts: '/.netlify/functions/blog',
        categories: '/.netlify/functions/blog/categories',
        tags: '/.netlify/functions/blog/tags',
        stats: '/.netlify/functions/blog/stats',
        duplicate: '/.netlify/functions/blog/duplicate'
    },
    health: '/.netlify/functions/health',
    // Helper methods
    get: async function(url) {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            return response;
        } catch (error) {
            console.error('API GET error:', error);
            throw error;
        }
    },
    post: async function(url, data) {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(data)
            });
            return response;
        } catch (error) {
            console.error('API POST error:', error);
            throw error;
        }
    },
    put: async function(url, data) {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(data)
            });
            return response;
        } catch (error) {
            console.error('API PUT error:', error);
            throw error;
        }
    },
    delete: async function(url) {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            return response;
        } catch (error) {
            console.error('API DELETE error:', error);
            throw error;
        }
    },
    // Authentication helpers
    setToken: function(token) {
        localStorage.setItem('adminToken', token);
    },
    getToken: function() {
        return localStorage.getItem('adminToken');
    },
    removeToken: function() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    },
    isAuthenticated: function() {
        return !!this.getToken();
    }
};

// Log configuration for debugging
console.log('API Config initialized for host:', window.location.hostname);
console.log('API Configuration:', {
    currentHost: window.location.hostname,
    baseUrl: window.apiConfig.baseURL,
    endpoints: {
        auth: window.apiConfig.auth,
        newsletter: window.apiConfig.newsletter,
        contacts: window.apiConfig.contacts,
        quotes: window.apiConfig.quotes,
        blog: window.apiConfig.blog,
        health: window.apiConfig.health
    }
});
