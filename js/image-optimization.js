/**
 * Image Optimization Script
 * Handles WebP fallbacks, lazy loading, and responsive images
 * Ex Revolution Technology
 */

document.addEventListener('DOMContentLoaded', function() {
    initImageOptimization();
});

/**
 * Initialize image optimization features
 */
function initImageOptimization() {
    // Check WebP support
    checkWebPSupport().then(supportsWebP => {
        if (supportsWebP) {
            console.log('WebP supported - using optimized images');
            convertToWebP();
        } else {
            console.log('WebP not supported - using fallback images');
        }
    });

    // Initialize lazy loading for images without native support
    if (!('loading' in HTMLImageElement.prototype)) {
        initLazyLoadingPolyfill();
    }

    // Initialize responsive images
    initResponsiveImages();

    // Add image error handling
    addImageErrorHandling();
}

/**
 * Check if browser supports WebP
 */
function checkWebPSupport() {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = function () {
            resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
}

/**
 * Convert images to WebP where supported
 */
function convertToWebP() {
    const images = document.querySelectorAll('img[src$=".jpg"], img[src$=".jpeg"], img[src$=".png"]');

    // List of images that have WebP versions available
    const webpAvailable = [
        'data_analytics_team.webp',
        'digital_marketing_concept.webp'
        // Add more as WebP versions are created
    ];

    images.forEach(img => {
        const originalSrc = img.src;
        const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const webpFilename = webpSrc.split('/').pop();

        // Only try to load WebP if we know it exists
        if (webpAvailable.includes(webpFilename)) {
            // Create a new image to test if WebP version exists
            const testImg = new Image();
            testImg.onload = function() {
                // WebP version exists, use it
                img.src = webpSrc;
                img.setAttribute('data-original-src', originalSrc);
                console.log(`✓ Using WebP: ${webpFilename}`);
            };
            testImg.onerror = function() {
                // WebP version doesn't exist, keep original (shouldn't happen with our list)
                console.log(`WebP failed to load: ${webpFilename}`);
            };
            testImg.src = webpSrc;
        }
        // For images without WebP versions, we keep the original format
        // This prevents 404 errors in the console
    });
}

/**
 * Lazy loading polyfill for older browsers
 */
function initLazyLoadingPolyfill() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if (lazyImages.length === 0) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Initialize responsive images
 */
function initResponsiveImages() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        // Add responsive attributes if not present
        if (!img.hasAttribute('sizes')) {
            // Default responsive sizes
            img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
        }

        // Add responsive classes
        img.classList.add('responsive-img');
    });
}

/**
 * Add error handling for images
 */
function addImageErrorHandling() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        img.addEventListener('error', function() {
            // If WebP fails, try original format
            if (this.dataset.originalSrc && this.src !== this.dataset.originalSrc) {
                console.log(`WebP failed, falling back to: ${this.dataset.originalSrc}`);
                this.src = this.dataset.originalSrc;
                return;
            }

            // If original also fails, use placeholder
            if (!this.dataset.errorHandled) {
                this.dataset.errorHandled = 'true';
                const placeholder = this.dataset.placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                this.src = placeholder;
                this.alt = 'Image not available';
                console.log(`Image failed to load: ${this.dataset.originalSrc || this.src}`);
            }
        });
    });
}

/**
 * Preload critical images
 */
function preloadCriticalImages() {
    // Only preload images that are actually on the current page
    const currentPage = window.location.pathname;

    // Define critical images per page
    const criticalImagesByPage = {
        '/': ['assets/images/hero-image.jpg', 'assets/images/logo.jpg', 'assets/images/logo1.jpg'],
        '/index.html': ['assets/images/hero-image.jpg', 'assets/images/logo.jpg', 'assets/images/logo1.jpg'],
        '/services.html': ['assets/images/logo.jpg', 'assets/images/logo1.jpg'],
        '/blog.html': ['assets/images/logo.jpg', 'assets/images/logo1.jpg'],
        '/about.html': ['assets/images/logo.jpg', 'assets/images/logo1.jpg'],
        '/contact.html': ['assets/images/logo.jpg', 'assets/images/logo1.jpg']
    };

    const criticalImages = criticalImagesByPage[currentPage] || ['assets/images/logo.jpg', 'assets/images/logo1.jpg'];

    criticalImages.forEach(src => {
        // Check if the image actually exists on the page before preloading
        const imgExists = document.querySelector(`img[src="${src}"]`);
        if (imgExists) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        }
    });
}

// Initialize critical image preloading
preloadCriticalImages();
