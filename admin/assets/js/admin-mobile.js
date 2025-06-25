/**
 * Mobile Functionality for Admin Dashboard
 * Handles responsive behavior and mobile interactions
 */

class AdminMobile {
    constructor() {
        this.sidebar = null;
        this.sidebarOverlay = null;
        this.mobileToggle = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebar-overlay');
        this.mobileToggle = document.getElementById('mobile-toggle');

        // Debug logging
        console.log('AdminMobile setup:', {
            sidebar: !!this.sidebar,
            overlay: !!this.sidebarOverlay,
            toggle: !!this.mobileToggle
        });

        if (this.mobileToggle && this.sidebar && this.sidebarOverlay) {
            this.bindEvents();
            console.log('✅ Mobile navigation events bound successfully');
        } else {
            console.warn('❌ Missing mobile navigation elements:', {
                sidebar: !this.sidebar,
                overlay: !this.sidebarOverlay,
                toggle: !this.mobileToggle
            });
        }

        // Setup responsive tables
        this.setupResponsiveTables();

        // Setup responsive modals
        this.setupResponsiveModals();

        // Setup touch gestures
        this.setupTouchGestures();

        // Add mobile classes
        this.addMobileClasses();

        // Setup responsive images
        AdminMobile.setupResponsiveImages();
    }

    bindEvents() {
        // Mobile toggle button
        this.mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Mobile toggle clicked');
            this.toggleSidebar();
        });

        // Click outside sidebar to close (since overlay is removed)
        document.addEventListener('click', (e) => {
            if (this.isMobile() && this.sidebar.classList.contains('show')) {
                // Check if click is outside sidebar and toggle button
                if (!this.sidebar.contains(e.target) && !this.mobileToggle.contains(e.target)) {
                    console.log('🔄 Clicked outside sidebar - closing');
                    this.closeSidebar();
                }
            }
        });

        // Close sidebar when clicking menu items on mobile
        const menuLinks = document.querySelectorAll('.sidebar-menu a');
        console.log(`📱 Found ${menuLinks.length} menu links`);
        menuLinks.forEach(link => {
            // Only add event listener for logout button
            if (link.id === 'logout-btn') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeSidebar();
                    // Handle logout
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                });
            } else {
                // For all other links, just close sidebar on mobile without preventing navigation
                link.addEventListener('click', () => {
                    if (this.isMobile()) {
                        console.log('🔄 Menu link clicked on mobile, closing sidebar');
                        this.closeSidebar();
                        // Let browser handle navigation naturally - no preventDefault, no setTimeout
                    }
                });
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (!this.isMobile()) {
                this.closeSidebar();
            }
            this.addMobileClasses();
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar.classList.contains('show')) {
                console.log('⌨️ Escape key pressed - closing sidebar');
                this.closeSidebar();
            }
        });

        // Prevent body scroll when sidebar is open
        this.sidebar.addEventListener('transitionend', () => {
            if (this.sidebar.classList.contains('show')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    toggleSidebar() {
        const isCurrentlyOpen = this.sidebar.classList.contains('show');
        console.log(`📱 Toggling sidebar - currently ${isCurrentlyOpen ? 'open' : 'closed'}`);

        this.sidebar.classList.toggle('show');
        // No overlay needed

        console.log(`📱 Sidebar ${this.sidebar.classList.contains('show') ? 'opened' : 'closed'}`);
    }

    closeSidebar() {
        console.log('📱 Explicitly closing sidebar');
        this.sidebar.classList.remove('show');
        // No overlay to remove
    }

    isMobile() {
        return window.innerWidth <= 768;
    }

    setupResponsiveTables() {
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            if (!table.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }

    setupResponsiveModals() {
        // Adjust modal sizes for mobile
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('show.bs.modal', () => {
                if (this.isMobile()) {
                    const modalDialog = modal.querySelector('.modal-dialog');
                    if (modalDialog) {
                        modalDialog.style.margin = '10px';
                        modalDialog.style.maxWidth = 'calc(100% - 20px)';
                    }
                }
            });
        });
    }

    setupTouchGestures() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        // Swipe to open/close sidebar
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        });

        document.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;

            const diffX = currentX - startX;
            const threshold = 50;

            if (this.isMobile()) {
                // Swipe right to open sidebar (from left edge)
                if (startX < 20 && diffX > threshold) {
                    this.sidebar.classList.add('show');
                }
                // Swipe left to close sidebar
                else if (this.sidebar.classList.contains('show') && diffX < -threshold) {
                    this.closeSidebar();
                }
            }
        });
    }

    // Utility method to show notifications
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 90%;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Utility method to handle loading states
    static setLoadingState(element, isLoading, originalText = '') {
        if (isLoading) {
            element.disabled = true;
            element.dataset.originalText = element.innerHTML;
            element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        } else {
            element.disabled = false;
            element.innerHTML = element.dataset.originalText || originalText;
        }
    }

    // Utility method to format dates for mobile
    static formatDateForMobile(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Utility method to truncate text for mobile
    static truncateText(text, maxLength = 50) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Utility method to handle responsive images
    static setupResponsiveImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.style.maxWidth) {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
            }
        });
    }

    // Method to update page title for mobile
    updateMobileTitle(title) {
        const mobileTitle = document.querySelector('.mobile-title');
        if (mobileTitle) {
            mobileTitle.textContent = title;
        }
    }

    // Method to add mobile-specific classes
    addMobileClasses() {
        if (this.isMobile()) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }
}

// Auto-initialize when script loads
const adminMobile = new AdminMobile();

// Export for use in other scripts
window.AdminMobile = AdminMobile;
window.adminMobile = adminMobile;

// Add some global mobile utilities
window.showNotification = AdminMobile.showNotification;
window.setLoadingState = AdminMobile.setLoadingState;
window.formatDateForMobile = AdminMobile.formatDateForMobile;
window.truncateText = AdminMobile.truncateText;
