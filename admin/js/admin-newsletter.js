/**
 * Admin Newsletter Management
 * Handles newsletter creation, scheduling, and subscriber management
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize Quill editor
    const quill = new Quill('#editor-container', {
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ]
        },
        placeholder: 'Compose your newsletter content...',
        theme: 'snow'
    });

    // Use unified API configuration
    if (!window.apiConfig) {
        console.error('API Config not available');
        return;
    }

    // Load newsletters
    loadNewsletters();

    // Load subscribers
    loadSubscribers();

    // Event listeners
    document.getElementById('save-newsletter-btn').addEventListener('click', saveNewsletter);
    document.getElementById('quick-send-form').addEventListener('submit', quickSendNewsletter);
    document.getElementById('logout-btn').addEventListener('click', logout);

    /**
     * Load all newsletters
     */
    async function loadNewsletters() {
        try {
            const response = await window.apiConfig.get(window.apiConfig.newsletter.templates);

            if (!response.ok) {
                throw new Error('Failed to load newsletters');
            }

            const newsletters = await response.json();

            // Clear the table
            const tableBody = document.getElementById('newsletters-table').querySelector('tbody');
            tableBody.innerHTML = '';

            if (newsletters.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="5" class="text-center">No newsletters found</td>';
                tableBody.appendChild(row);
                return;
            }

            // Add newsletters to the table
            newsletters.forEach(newsletter => {
                const row = document.createElement('tr');

                // Format date
                const scheduledDate = newsletter.scheduledFor
                    ? new Date(newsletter.scheduledFor).toLocaleString()
                    : 'Not scheduled';

                // Determine status
                let status = '';
                if (newsletter.sent) {
                    status = `<span class="badge badge-success">Sent</span>`;
                } else if (newsletter.scheduledFor) {
                    status = `<span class="badge badge-info">Scheduled</span>`;
                } else {
                    status = `<span class="badge badge-warning">Draft</span>`;
                }

                row.innerHTML = `
                    <td>${newsletter.name}</td>
                    <td>${newsletter.subject}</td>
                    <td>${scheduledDate}</td>
                    <td>${status}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-btn" data-id="${newsletter._id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!newsletter.sent ? `
                            <button class="btn btn-sm btn-outline-success send-btn" data-id="${newsletter._id}">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${newsletter._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </td>
                `;

                tableBody.appendChild(row);
            });

            // Add event listeners to buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', () => viewNewsletter(btn.dataset.id));
            });

            document.querySelectorAll('.send-btn').forEach(btn => {
                btn.addEventListener('click', () => sendNewsletter(btn.dataset.id));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteNewsletter(btn.dataset.id));
            });

        } catch (error) {
            console.error('Error loading newsletters:', error);
            alert('Failed to load newsletters. Please try again.');
        }
    }

    /**
     * Load all subscribers
     */
    async function loadSubscribers() {
        try {
            const response = await window.apiConfig.get(window.apiConfig.newsletter.subscribers);

            if (!response.ok) {
                throw new Error('Failed to load subscribers');
            }

            const subscribers = await response.json();

            // Update subscriber counts - handle both status formats
            const totalSubscribers = subscribers.length;
            const activeSubscribers = subscribers.filter(sub =>
                sub.status === 'active' || sub.subscribed === true
            ).length;
            const unsubscribed = totalSubscribers - activeSubscribers;

            document.getElementById('total-subscribers').textContent = totalSubscribers;
            document.getElementById('active-subscribers').textContent = activeSubscribers;
            document.getElementById('unsubscribed').textContent = unsubscribed;

            // Clear the table
            const tableBody = document.getElementById('subscribers-table').querySelector('tbody');
            tableBody.innerHTML = '';

            if (subscribers.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="4" class="text-center">No subscribers found</td>';
                tableBody.appendChild(row);
                return;
            }

            // Add subscribers to the table
            subscribers.forEach(subscriber => {
                const row = document.createElement('tr');

                // Format date - handle both subscribedDate and subscribedAt
                let subscribedDate = 'N/A';
                const dateField = subscriber.subscribedAt || subscriber.subscribedDate;
                if (dateField) {
                    try {
                        subscribedDate = new Date(dateField).toLocaleDateString();
                    } catch (e) {
                        subscribedDate = 'Invalid Date';
                    }
                }

                // Determine status - handle both subscribed boolean and status string
                const isActive = subscriber.status === 'active' || subscriber.subscribed === true;
                const status = isActive
                    ? '<span class="badge badge-success">Active</span>'
                    : '<span class="badge badge-warning">Unsubscribed</span>';

                // Use id field for data attributes
                const subscriberId = subscriber.id || subscriber._id;

                row.innerHTML = `
                    <td>${subscriber.email}</td>
                    <td>${status}</td>
                    <td>${subscribedDate}</td>
                    <td>
                        ${isActive ? `
                            <button class="btn btn-sm btn-outline-warning unsubscribe-btn" data-id="${subscriberId}" title="Unsubscribe">
                                <i class="fas fa-user-minus"></i>
                            </button>
                        ` : `
                            <button class="btn btn-sm btn-outline-success resubscribe-btn" data-id="${subscriberId}" title="Resubscribe">
                                <i class="fas fa-user-plus"></i>
                            </button>
                        `}
                        <button class="btn btn-sm btn-outline-danger delete-subscriber-btn" data-id="${subscriberId}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;

                tableBody.appendChild(row);
            });

            // Add event listeners to buttons
            document.querySelectorAll('.unsubscribe-btn').forEach(btn => {
                btn.addEventListener('click', () => unsubscribeUser(btn.dataset.id));
            });

            document.querySelectorAll('.resubscribe-btn').forEach(btn => {
                btn.addEventListener('click', () => resubscribeUser(btn.dataset.id));
            });

            document.querySelectorAll('.delete-subscriber-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteSubscriber(btn.dataset.id));
            });

        } catch (error) {
            console.error('Error loading subscribers:', error);
            alert('Failed to load subscribers. Please try again.');
        }
    }

    /**
     * Save a new newsletter
     */
    async function saveNewsletter() {
        try {
            const name = document.getElementById('newsletter-name').value;
            const subject = document.getElementById('newsletter-subject').value;
            const content = quill.root.innerHTML;
            const scheduledFor = document.getElementById('newsletter-schedule').value;

            if (!name || !subject || !content) {
                alert('Please fill in all required fields');
                return;
            }

            const newsletterData = {
                name,
                subject,
                content,
                scheduledFor: scheduledFor || null
            };

            const response = await window.apiConfig.post(window.apiConfig.newsletter.templates, newsletterData);

            if (!response.ok) {
                throw new Error('Failed to save newsletter');
            }

            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('createNewsletterModal'));
            modal.hide();

            document.getElementById('create-newsletter-form').reset();
            quill.root.innerHTML = '';

            // Reload newsletters
            loadNewsletters();

            alert('Newsletter saved successfully');

        } catch (error) {
            console.error('Error saving newsletter:', error);
            alert('Failed to save newsletter. Please try again.');
        }
    }

    /**
     * Quick send a newsletter
     * @param {Event} e - The submit event
     */
    async function quickSendNewsletter(e) {
        e.preventDefault();

        try {
            const subject = document.getElementById('quick-subject').value;
            const content = document.getElementById('quick-content').value;

            if (!subject || !content) {
                alert('Please fill in all required fields');
                return;
            }

            const confirmed = confirm('Are you sure you want to send this newsletter to all active subscribers?');
            if (!confirmed) {
                return;
            }

            const response = await window.apiConfig.post(window.apiConfig.newsletter.send, { subject, content });

            if (!response.ok) {
                throw new Error('Failed to send newsletter');
            }

            const result = await response.json();

            // Reset form
            document.getElementById('quick-send-form').reset();

            alert(`Newsletter sent successfully to ${result.count} subscribers`);

        } catch (error) {
            console.error('Error sending newsletter:', error);
            alert('Failed to send newsletter. Please try again.');
        }
    }

    /**
     * Delete subscriber
     */
    async function deleteSubscriber(subscriberId) {
        if (!confirm('Are you sure you want to delete this subscriber? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await window.apiConfig.delete(`${window.apiConfig.newsletter.subscribers}/${subscriberId}`);

            if (!response.ok) {
                throw new Error('Failed to delete subscriber');
            }

            const result = await response.json();

            if (result.success) {
                alert('Subscriber deleted successfully');
                // Reload subscribers list
                loadSubscribers();
            } else {
                throw new Error(result.message || 'Failed to delete subscriber');
            }

        } catch (error) {
            console.error('Error deleting subscriber:', error);
            alert('Failed to delete subscriber. Please try again.');
        }
    }

    /**
     * Unsubscribe user
     */
    async function unsubscribeUser(subscriberId) {
        if (!confirm('Are you sure you want to unsubscribe this user?')) {
            return;
        }

        try {
            const response = await window.apiConfig.put(`${window.apiConfig.newsletter.subscribers}/${subscriberId}`, {
                status: 'unsubscribed'
            });

            if (!response.ok) {
                throw new Error('Failed to unsubscribe user');
            }

            const result = await response.json();

            if (result.success) {
                alert('User unsubscribed successfully');
                // Reload subscribers list
                loadSubscribers();
            } else {
                throw new Error(result.message || 'Failed to unsubscribe user');
            }

        } catch (error) {
            console.error('Error unsubscribing user:', error);
            alert('Failed to unsubscribe user. Please try again.');
        }
    }

    /**
     * Resubscribe user
     */
    async function resubscribeUser(subscriberId) {
        if (!confirm('Are you sure you want to resubscribe this user?')) {
            return;
        }

        try {
            const response = await window.apiConfig.put(`${window.apiConfig.newsletter.subscribers}/${subscriberId}`, {
                status: 'active'
            });

            if (!response.ok) {
                throw new Error('Failed to resubscribe user');
            }

            const result = await response.json();

            if (result.success) {
                alert('User resubscribed successfully');
                // Reload subscribers list
                loadSubscribers();
            } else {
                throw new Error(result.message || 'Failed to resubscribe user');
            }

        } catch (error) {
            console.error('Error resubscribing user:', error);
            alert('Failed to resubscribe user. Please try again.');
        }
    }

    /**
     * Logout function
     */
    function logout() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
});
