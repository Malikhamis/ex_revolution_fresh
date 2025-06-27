/**
 * Content Manager - Dynamic Content Loading System
 * Connects main website with admin panel changes
 */

class ContentManager {
    constructor() {
        this.apiBase = window.location.origin;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get case studies from localStorage (admin changes) or fallback
     */
    async getCaseStudies() {
        try {
            // First, try to get data from localStorage (where admin panel saves changes)
            const adminCaseStudies = localStorage.getItem('adminCaseStudies');
            console.log('🔍 Checking localStorage for adminCaseStudies:', adminCaseStudies ? 'Found data' : 'No data');
            if (adminCaseStudies) {
                const data = JSON.parse(adminCaseStudies);
                console.log('✅ Loaded case studies from admin panel:', data.length, 'items');
                console.log('📄 Loaded data:', data);
                return data;
            }
        } catch (error) {
            console.warn('Failed to load case studies from localStorage:', error);
        }

        // Fallback to static data if no admin data
        console.log('📁 Using fallback case studies data');
        return this.getFallbackCaseStudies();
    }

    /**
     * Get blog posts from localStorage (admin changes) or fallback
     */
    async getBlogPosts() {
        try {
            // First, try to get data from localStorage (where admin panel saves changes)
            const adminBlogPosts = localStorage.getItem('adminBlogPosts');
            console.log('🔍 Checking localStorage for adminBlogPosts:', adminBlogPosts ? 'Found data' : 'No data');
            if (adminBlogPosts) {
                const data = JSON.parse(adminBlogPosts);
                console.log('✅ Loaded blog posts from admin panel:', data.length, 'items');
                const publishedPosts = data.filter(post => post.status === 'published');
                console.log('📄 Published posts:', publishedPosts.length, 'of', data.length);
                return publishedPosts;
            }
        } catch (error) {
            console.warn('Failed to load blog posts from localStorage:', error);
        }

        // Fallback to static data if no admin data
        console.log('📁 Using fallback blog posts data');
        return this.getFallbackBlogPosts();
    }

    /**
     * Get a specific case study by slug
     */
    async getCaseStudy(slug) {
        const caseStudies = await this.getCaseStudies();
        return caseStudies.find(cs => cs.slug === slug);
    }

    /**
     * Get a specific blog post by slug
     */
    async getBlogPost(slug) {
        const blogPosts = await this.getBlogPosts();
        return blogPosts.find(bp => bp.slug === slug);
    }

    /**
     * Render case studies grid
     */
    async renderCaseStudiesGrid(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Case studies container not found:', containerId);
            return;
        }

        const caseStudies = await this.getCaseStudies();
        console.log('📊 Raw case studies data:', caseStudies);
        console.log('📊 Case studies count:', caseStudies.length);
        
        const filteredStudies = options.featured ?
            caseStudies.filter(cs => cs.featured && cs.status === 'published') :
            caseStudies.filter(cs => cs.status === 'published');
            
        console.log('📊 Filtered case studies count:', filteredStudies.length);
        console.log('📊 Filtered case studies:', filteredStudies);

        const limit = options.limit || filteredStudies.length;
        const studiesToShow = filteredStudies.slice(0, limit);

        console.log('📊 Studies to show:', studiesToShow.length);

        if (studiesToShow.length === 0) {
            container.innerHTML = '<p>No case studies found.</p>';
            console.warn('⚠️ No case studies to display');
            return;
        }

        try {
            container.innerHTML = studiesToShow.map(caseStudy => {
                console.log('🏗️ Rendering case study:', caseStudy.title, 'with fields:', Object.keys(caseStudy));
                return `
                <div class="case-study-card" data-category="${String(caseStudy.industry || caseStudy.category || 'general').toLowerCase().replace(/\s+/g, '-')}">
                    <img src="${caseStudy.image || '../assets/images/placeholder.svg'}" alt="${caseStudy.title}" class="case-study-image" loading="lazy">
                    <div class="case-study-content">
                        <p class="case-study-category">${caseStudy.industry || caseStudy.category || 'General'}</p>
                        <h3 class="case-study-title">${caseStudy.title}</h3>
                        <p class="case-study-description">${caseStudy.excerpt || caseStudy.description}</p>
                        <div class="case-study-results">
                            <h4>Technologies:</h4>
                            <ul>
                                ${(caseStudy.technologies || caseStudy.tags || []).filter(tech => tech && tech.trim()).map(tech => `<li>${tech}</li>`).join('') || '<li>N/A</li>'}
                            </ul>
                        </div>
                        <a href="case-studies/${caseStudy.slug || 'details'}.html" class="case-study-link" style="color: #ffffff !important;">View Case Study</a>
                    </div>
                </div>
                `;
            }).join('');
            console.log('✅ Case studies rendered successfully');
        } catch (error) {
            console.error('❌ Error rendering case studies:', error);
            container.innerHTML = '<p>Error loading case studies.</p>';
        }
    }

    /**
     * Render blog posts grid
     */
    async renderBlogPostsGrid(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const blogPosts = await this.getBlogPosts();
        const filteredPosts = options.featured ?
            blogPosts.filter(bp => bp.featured && bp.status === 'published') :
            blogPosts.filter(bp => bp.status === 'published');

        const limit = options.limit || filteredPosts.length;
        const postsToShow = filteredPosts.slice(0, limit);

        container.innerHTML = postsToShow.map(post => `
            <article class="blog-card">
                <div class="blog-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <div class="blog-category">${post.category}</div>
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-author">
                            <i class="fas fa-user"></i> ${post.author}
                        </span>
                        <span class="blog-date">
                            <i class="fas fa-calendar"></i> ${this.formatDate(post.publishedAt)}
                        </span>
                    </div>
                    <h3 class="blog-title">
                        <a href="blog/${post.slug}.html">${post.title}</a>
                    </h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <div class="blog-tags">
                        ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                    </div>
                    <a href="blog/${post.slug}.html" class="blog-link">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `).join('');
    }

    /**
     * Render case study detail page
     */
    async renderCaseStudyDetail(slug, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const caseStudy = await this.getCaseStudy(slug);
        if (!caseStudy) {
            container.innerHTML = '<p>Case study not found.</p>';
            return;
        }

        // Update page title and meta
        document.title = `${caseStudy.title} - Case Study | Ex Revolution Technology`;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', caseStudy.excerpt);
        }

        // Render content (this would be expanded based on your case study template)
        container.innerHTML = `
            <div class="case-study-detail">
                <h1>${caseStudy.title}</h1>
                <div class="case-study-meta">
                    <span>Client: ${caseStudy.client}</span>
                    <span>Industry: ${caseStudy.industry}</span>
                    <span>Published: ${this.formatDate(caseStudy.publishedAt)}</span>
                </div>
                <img src="${caseStudy.image}" alt="${caseStudy.title}" class="case-study-hero-image">
                <div class="case-study-content">
                    ${caseStudy.content}
                </div>
                <div class="case-study-technologies">
                    <h3>Technologies Used:</h3>
                    <div class="tech-tags">
                        ${caseStudy.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render blog post detail page
     */
    async renderBlogPostDetail(slug, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const blogPost = await this.getBlogPost(slug);
        if (!blogPost) {
            container.innerHTML = '<p>Blog post not found.</p>';
            return;
        }

        // Update page title and meta
        document.title = `${blogPost.title} | Ex Revolution Technology Blog`;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', blogPost.excerpt);
        }

        // Render content (this would be expanded based on your blog template)
        container.innerHTML = `
            <article class="blog-post-detail">
                <header class="blog-post-header">
                    <div class="blog-post-meta">
                        <span class="category">${blogPost.category}</span>
                        <span class="date">${this.formatDate(blogPost.publishedAt)}</span>
                        <span class="author">By ${blogPost.author}</span>
                    </div>
                    <h1>${blogPost.title}</h1>
                    <p class="blog-post-excerpt">${blogPost.excerpt}</p>
                </header>
                <img src="${blogPost.image}" alt="${blogPost.title}" class="blog-post-hero-image">
                <div class="blog-post-content">
                    ${blogPost.content}
                </div>
                <footer class="blog-post-footer">
                    <div class="blog-post-tags">
                        ${blogPost.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </footer>
            </article>
        `;
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return 'Not published';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Clear cache to force refresh
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Refresh content on the page
     */
    async refreshContent() {
        this.clearCache();

        // Re-render case studies if container exists
        const caseStudiesContainer = document.getElementById('case-studies-container');
        if (caseStudiesContainer) {
            await this.renderCaseStudiesGrid('case-studies-container');
        }

        // Re-render blog posts if container exists
        const blogPostsContainer = document.getElementById('blog-posts-container');
        if (blogPostsContainer) {
            await this.renderBlogPostsGrid('blog-posts-container');
        }

        console.log('✅ Content refreshed successfully');
    }

    /**
     * Set up auto-refresh for content changes
     */
    setupAutoRefresh(intervalMinutes = 5) {
        setInterval(() => {
            this.refreshContent();
        }, intervalMinutes * 60 * 1000);
    }

    /**
     * Set up real-time content synchronization
     */
    setupRealTimeSync() {
        // Listen for localStorage changes (from admin panel)
        let lastUpdateCheck = localStorage.getItem('contentUpdated') || '0';

        // Check for updates every 2 seconds for better responsiveness
        setInterval(() => {
            const currentUpdate = localStorage.getItem('contentUpdated') || '0';
            if (currentUpdate !== lastUpdateCheck) {
                console.log('🔄 Content update detected via localStorage, refreshing...');
                this.refreshContent();
                lastUpdateCheck = currentUpdate;
            }
        }, 2000);

        // Listen for direct messages from admin panel
        window.addEventListener('message', (event) => {
            if (event.origin === window.location.origin && event.data.type === 'CONTENT_UPDATED') {
                console.log('🔄 Direct content update signal received, refreshing...');
                this.refreshContent();
            }
        });

        // Listen for storage events (cross-tab communication)
        window.addEventListener('storage', (event) => {
            if (event.key === 'contentUpdated') {
                console.log('🔄 Content update detected via storage event, refreshing...');
                this.refreshContent();
            }
        });

        console.log('✅ Real-time content synchronization enabled');
    }

    /**
     * Fallback case studies data
     */
    getFallbackCaseStudies() {
        return [
            {
                id: 1,
                title: "Custom Website for Usangu Logistics",
                slug: "usangu-logistics",
                excerpt: "We designed and developed a modern, responsive website for Usangu Logistics that showcases their transportation and logistics services, making it easier for potential clients to learn about their offerings and request quotes.",
                content: "<p>Usangu Logistics needed a professional web presence to showcase their transportation and logistics services.</p>",
                image: "/assets/images/digital_marketing_concept.webp",
                client: "Usangu Logistics",
                industry: "Website Development",
                technologies: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
                status: "published",
                featured: true,
                publishedAt: "2024-01-15",
                createdAt: "2024-01-10"
            },
            {
                id: 2,
                title: "Corporate Website for Man Haulage Company Ltd",
                slug: "man-haulage",
                excerpt: "We created a comprehensive corporate website for Man Haulage Company Ltd that effectively communicates their transportation services, company values, and competitive advantages to potential clients in Tanzania and beyond.",
                content: "<p>Man Haulage Company Ltd required a professional corporate website to establish their online presence.</p>",
                image: "/assets/images/web.jpg",
                client: "Man Haulage Company Ltd",
                industry: "Website Development",
                technologies: ["HTML5", "CSS3", "JavaScript", "Mobile Responsive", "SEO"],
                status: "published",
                featured: true,
                publishedAt: "2024-02-10",
                createdAt: "2024-02-05"
            },
            {
                id: 3,
                title: "Branding Kit for Epic Haulage",
                slug: "epic-haulage-branding",
                excerpt: "We developed a complete branding package for Epic Haulage, including logo design, company profile creation, and brand guidelines that established a strong, professional identity in the competitive transportation industry.",
                content: "<p>Epic Haulage needed a complete branding solution to establish their market presence.</p>",
                image: "/assets/images/branding1.jpg",
                client: "Epic Haulage",
                industry: "Branding",
                technologies: ["Logo Design", "Brand Guidelines", "Company Profile", "Visual Identity"],
                status: "published",
                featured: true,
                publishedAt: "2024-03-05",
                createdAt: "2024-03-01"
            },
            {
                id: 4,
                title: "Educational Website for Sprinkle Sprout Primary School",
                slug: "sprinkle-sprout-school",
                excerpt: "We designed and developed an engaging, user-friendly website for Sprinkle Sprout Primary School that effectively communicates their educational philosophy, curriculum, and school activities to parents and the community.",
                content: "<p>Sprinkle Sprout Primary School needed a modern website to connect with parents and showcase their educational programs.</p>",
                image: "/assets/images/code_screen.jpeg",
                client: "Sprinkle Sprout Primary School",
                industry: "Website Development",
                technologies: ["HTML5", "CSS3", "JavaScript", "CMS", "Parent Portal"],
                status: "published",
                featured: true,
                publishedAt: "2024-04-12",
                createdAt: "2024-04-08"
            }
        ];
    }

    /**
     * Fallback blog posts data
     */
    getFallbackBlogPosts() {
        return [
            {
                id: 1,
                title: "The Future of Predictive Analytics in Inventory Management",
                slug: "predictive-analytics-inventory",
                excerpt: "Discover how predictive analytics is revolutionizing inventory management and helping businesses optimize their supply chains.",
                content: "<p>Predictive analytics is transforming how businesses manage their inventory. With advanced algorithms and machine learning capabilities, companies can now forecast demand with unprecedented accuracy.</p><p>This technology enables businesses to optimize stock levels, reduce waste, and improve customer satisfaction through better product availability.</p>",
                image: "/assets/images/predictive-analytics.jpg",
                author: "Ex Revolution Team",
                category: "Technology",
                tags: ["Analytics", "Inventory", "AI", "Supply Chain"],
                status: "published",
                featured: true,
                publishedAt: "2024-01-25",
                createdAt: "2024-01-20"
            },
            {
                id: 2,
                title: "Digital Transformation Strategies for Small Businesses",
                slug: "digital-transformation-small-business",
                excerpt: "Learn how small businesses can leverage digital transformation to compete with larger enterprises and improve operational efficiency.",
                content: "<p>Digital transformation is no longer a luxury for small businesses—it's a necessity. In today's competitive landscape, small businesses must embrace technology to remain relevant and competitive.</p>",
                image: "/assets/images/digital-transformation.jpg",
                author: "Ex Revolution Team",
                category: "Business",
                tags: ["Digital Transformation", "Small Business", "Technology", "Strategy"],
                status: "published",
                featured: false,
                publishedAt: "2024-02-15",
                createdAt: "2024-02-10"
            },
            {
                id: 3,
                title: "Building Responsive Websites: Best Practices for 2024",
                slug: "responsive-websites-best-practices-2024",
                excerpt: "Explore the latest techniques and best practices for creating responsive websites that work seamlessly across all devices.",
                content: "<p>Responsive web design has evolved significantly over the years. With the increasing variety of devices and screen sizes, creating websites that adapt flawlessly to any viewport is more important than ever.</p>",
                image: "/assets/images/responsive-design.jpg",
                author: "Ex Revolution Team",
                category: "Web Development",
                tags: ["Responsive Design", "Web Development", "CSS", "Mobile"],
                status: "published",
                featured: true,
                publishedAt: "2024-03-10",
                createdAt: "2024-03-05"
            }
        ];
    }
    /**
     * Debug function to check localStorage content
     */
    debugLocalStorage() {
        console.log('🔍 Debug localStorage content:');
        console.log('- adminCaseStudies:', localStorage.getItem('adminCaseStudies') ? 'EXISTS' : 'MISSING');
        console.log('- adminBlogPosts:', localStorage.getItem('adminBlogPosts') ? 'EXISTS' : 'MISSING');
        
        if (localStorage.getItem('adminCaseStudies')) {
            try {
                const cases = JSON.parse(localStorage.getItem('adminCaseStudies'));
                console.log('📄 Case Studies:', cases.length, 'items');
            } catch (e) {
                console.error('❌ Invalid case studies data');
            }
        }
        
        if (localStorage.getItem('adminBlogPosts')) {
            try {
                const posts = JSON.parse(localStorage.getItem('adminBlogPosts'));
                console.log('📄 Blog Posts:', posts.length, 'items');
            } catch (e) {
                console.error('❌ Invalid blog posts data');
            }
        }
    }
}

// Create global instance
window.contentManager = new ContentManager();

// Make debug function globally available
window.debugContentSync = () => window.contentManager.debugLocalStorage();
