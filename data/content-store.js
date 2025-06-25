/**
 * Content Store - Shared data storage for admin and public APIs
 * This acts as a simple in-memory database for content management
 */

class ContentStore {
    constructor() {
        this.caseStudies = [
            {
                id: 1,
                title: "Custom Website for Usangu Logistics",
                slug: "usangu-logistics",
                excerpt: "We designed and developed a modern, responsive website for Usangu Logistics that showcases their transportation and logistics services, making it easier for potential clients to learn about their offerings and request quotes.",
                content: "<p>Usangu Logistics needed a professional web presence to showcase their transportation and logistics services. We created a modern, responsive website that effectively communicates their capabilities and makes it easy for potential clients to request quotes.</p><p>The website features a clean, modern design with intuitive navigation, making it easy for visitors to find information about services, request quotes, and track shipments. The responsive design ensures optimal viewing across all devices.</p>",
                image: "/assets/images/digital_marketing_concept.webp",
                client: "Usangu Logistics",
                industry: "Transportation & Logistics",
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
                content: "<p>Man Haulage Company Ltd required a comprehensive corporate website to establish their online presence and communicate their transportation services effectively. The website showcases their company values and competitive advantages.</p><p>The project included developing a professional corporate identity online, showcasing their fleet, services, and establishing trust with potential clients through testimonials and case studies.</p>",
                image: "/assets/images/web.jpg",
                client: "Man Haulage Company Ltd",
                industry: "Transportation & Logistics",
                technologies: ["HTML5", "CSS3", "JavaScript", "Mobile-First Design"],
                status: "published",
                featured: false,
                publishedAt: "2024-01-20",
                createdAt: "2024-01-15"
            },
            {
                id: 3,
                title: "Branding Kit for Epic Haulage",
                slug: "epic-haulage-branding",
                excerpt: "We developed a complete branding package for Epic Haulage, including logo design, company profile creation, and brand guidelines that established a strong, professional identity in the competitive transportation industry.",
                content: "<p>Epic Haulage needed a distinctive brand identity to stand out in the competitive transportation industry. We created a comprehensive branding package including logo design, company profile, and brand guidelines.</p><p>The branding package included logo variations, color schemes, typography guidelines, business card designs, and a complete company profile that positions Epic Haulage as a premium transportation service provider.</p>",
                image: "/assets/images/branding1.jpg",
                client: "Epic Haulage",
                industry: "Transportation & Logistics",
                technologies: ["Adobe Illustrator", "Adobe Photoshop", "Brand Strategy"],
                status: "published",
                featured: true,
                publishedAt: "2024-01-25",
                createdAt: "2024-01-20"
            },
            {
                id: 4,
                title: "Educational Website for Sprinkle Sprout Primary School",
                slug: "sprinkle-sprout-school",
                excerpt: "We designed and developed an engaging, user-friendly website for Sprinkle Sprout Primary School that effectively communicates their educational philosophy, curriculum, and school activities to parents and the community.",
                content: "<p>Sprinkle Sprout Primary School needed an engaging website to communicate with parents and the community. We created a user-friendly platform that showcases their educational philosophy and activities.</p><p>The website features bright, child-friendly design elements while maintaining professionalism for parent communication. It includes sections for news, events, curriculum information, and parent resources.</p>",
                image: "/assets/images/code_screen.jpeg",
                client: "Sprinkle Sprout Primary School",
                industry: "Education",
                technologies: ["HTML5", "CSS3", "JavaScript", "Content Management"],
                status: "published",
                featured: false,
                publishedAt: "2024-01-30",
                createdAt: "2024-01-25"
            }
        ];

        this.blogPosts = [
            {
                id: 1,
                title: "How AI is Transforming Business Operations in 2025",
                slug: "ai-transforming-business",
                excerpt: "Discover how artificial intelligence is revolutionizing business operations in 2025, from automated customer service to predictive analytics and beyond.",
                content: "<p>Artificial intelligence is no longer a futuristic concept—it's actively transforming how businesses operate across every industry in 2025.</p><p>From automating routine tasks to providing deep insights through data analysis, AI is helping businesses become more efficient, make better decisions, and deliver superior customer experiences. Machine learning algorithms are now capable of predicting customer behavior, optimizing supply chains, and even creating personalized marketing campaigns that drive unprecedented ROI.</p><p>The integration of AI into business operations has become essential for staying competitive in today's rapidly evolving marketplace. Companies that embrace AI technologies are seeing significant improvements in productivity, cost reduction, and customer satisfaction.</p>",
                image: "/assets/images/blog1.jpg",
                author: "Shirhan Shermohamed",
                category: "Artificial Intelligence",
                tags: ["Artificial Intelligence", "Business Operations", "Digital Transformation"],
                status: "published",
                featured: true,
                publishedAt: "2025-05-15",
                createdAt: "2025-05-10"
            },
            {
                id: 2,
                title: "Custom vs Off-the-Shelf Software: Which is Right for Your Business?",
                slug: "custom-vs-off-the-shelf",
                excerpt: "A comprehensive comparison of custom and off-the-shelf software solutions, helping you make the right choice for your business needs and budget.",
                content: "<p>When it comes to software solutions for your business, one of the most critical decisions you'll face is whether to invest in custom software development or opt for off-the-shelf solutions.</p><p>Custom software offers unparalleled flexibility and can be tailored to meet your exact business requirements. It provides competitive advantages, seamless integration with existing systems, and the ability to scale according to your specific needs. However, it requires a higher initial investment and longer development time.</p><p>Off-the-shelf software, on the other hand, offers immediate deployment, lower upfront costs, and proven reliability. These solutions come with established support systems and regular updates. However, they may not perfectly align with your unique business processes and could require workflow adjustments.</p><p>The decision ultimately depends on your budget, timeline, specific requirements, and long-term business goals. Consider factors such as scalability, integration needs, security requirements, and the total cost of ownership when making your choice.</p>",
                image: "/assets/images/blog3.jpg",
                author: "ExRevolution",
                category: "Software Development",
                tags: ["Software Development", "Business Solutions", "ROI"],
                status: "published",
                featured: false,
                publishedAt: "2025-04-28",
                createdAt: "2025-04-25"
            },
            {
                id: 3,
                title: "Advanced Data Visualization Techniques for Business Insights",
                slug: "data-visualization-techniques",
                excerpt: "Learn about the latest data visualization techniques that can help your business extract meaningful insights from complex datasets.",
                content: "<p>In today's data-driven business environment, the ability to visualize and interpret complex datasets has become crucial for making informed decisions and gaining competitive advantages.</p><p>Advanced data visualization techniques go beyond simple charts and graphs to create interactive, dynamic representations of data that reveal hidden patterns, trends, and correlations. These techniques include heat maps for identifying hotspots in data, treemaps for hierarchical data representation, and network diagrams for showing relationships between different data points.</p><p>Modern visualization tools leverage artificial intelligence and machine learning to automatically suggest the most appropriate visualization types based on your data characteristics. Interactive dashboards allow stakeholders to drill down into specific data segments, filter information in real-time, and collaborate on insights.</p><p>The key to effective data visualization lies in understanding your audience, choosing the right visualization type for your data, and ensuring that the visual representation clearly communicates the intended message without overwhelming the viewer with unnecessary complexity.</p>",
                image: "/assets/images/blog2.jpg",
                author: "ExRevolution",
                category: "Data Analytics",
                tags: ["Data Analytics", "Visualization", "Business Intelligence"],
                status: "published",
                featured: false,
                publishedAt: "2025-04-15",
                createdAt: "2025-04-10"
            }
        ];

        this.quotes = [];
        this.contacts = [];
        this.guideDownloads = [];
        this.nextCaseStudyId = 5;
        this.nextBlogPostId = 4;
        this.nextQuoteId = 1;
        this.nextContactId = 1;
        this.nextGuideDownloadId = 1;
    }

    // Case Studies methods
    getAllCaseStudies() {
        return [...this.caseStudies];
    }

    getPublishedCaseStudies() {
        return this.caseStudies.filter(cs => cs.status === 'published');
    }

    getCaseStudyById(id) {
        return this.caseStudies.find(cs => cs.id == id);
    }

    getCaseStudyBySlug(slug) {
        return this.caseStudies.find(cs => cs.slug === slug);
    }

    addCaseStudy(caseStudyData) {
        const newCaseStudy = {
            id: this.nextCaseStudyId++,
            ...caseStudyData,
            createdAt: new Date().toISOString()
        };
        this.caseStudies.push(newCaseStudy);
        return newCaseStudy;
    }

    updateCaseStudy(id, updateData) {
        const index = this.caseStudies.findIndex(cs => cs.id == id);
        if (index !== -1) {
            this.caseStudies[index] = { ...this.caseStudies[index], ...updateData };
            return this.caseStudies[index];
        }
        return null;
    }

    deleteCaseStudy(id) {
        const index = this.caseStudies.findIndex(cs => cs.id == id);
        if (index !== -1) {
            const deleted = this.caseStudies.splice(index, 1)[0];
            return deleted;
        }
        return null;
    }

    // Blog Posts methods
    getAllBlogPosts() {
        return [...this.blogPosts];
    }

    getPublishedBlogPosts() {
        return this.blogPosts.filter(bp => bp.status === 'published');
    }

    getBlogPostById(id) {
        return this.blogPosts.find(bp => bp.id == id);
    }

    getBlogPostBySlug(slug) {
        return this.blogPosts.find(bp => bp.slug === slug);
    }

    addBlogPost(blogPostData) {
        const newBlogPost = {
            id: this.nextBlogPostId++,
            ...blogPostData,
            createdAt: new Date().toISOString()
        };
        this.blogPosts.push(newBlogPost);
        return newBlogPost;
    }

    updateBlogPost(id, updateData) {
        const index = this.blogPosts.findIndex(bp => bp.id == id);
        if (index !== -1) {
            this.blogPosts[index] = { ...this.blogPosts[index], ...updateData };
            return this.blogPosts[index];
        }
        return null;
    }

    deleteBlogPost(id) {
        const index = this.blogPosts.findIndex(bp => bp.id == id);
        if (index !== -1) {
            const deleted = this.blogPosts.splice(index, 1)[0];
            return deleted;
        }
        return null;
    }

    // Quote methods
    getAllQuotes() {
        return [...this.quotes];
    }

    getQuoteById(id) {
        return this.quotes.find(q => q.id == id);
    }

    addQuote(quoteData) {
        const newQuote = {
            id: this.nextQuoteId++,
            ...quoteData,
            status: 'new',
            createdAt: new Date().toISOString()
        };
        this.quotes.push(newQuote);
        return newQuote;
    }

    updateQuote(id, updateData) {
        const index = this.quotes.findIndex(q => q.id == id);
        if (index !== -1) {
            this.quotes[index] = { ...this.quotes[index], ...updateData };
            return this.quotes[index];
        }
        return null;
    }

    deleteQuote(id) {
        const index = this.quotes.findIndex(q => q.id == id);
        if (index !== -1) {
            const deleted = this.quotes.splice(index, 1)[0];
            return deleted;
        }
        return null;
    }

    // Contact methods
    getAllContacts() {
        return [...this.contacts];
    }

    getContactById(id) {
        return this.contacts.find(c => c.id == id);
    }

    addContact(contactData) {
        const newContact = {
            id: this.nextContactId++,
            ...contactData,
            status: 'new',
            createdAt: new Date().toISOString()
        };
        this.contacts.push(newContact);
        return newContact;
    }

    updateContact(id, updateData) {
        const index = this.contacts.findIndex(c => c.id == id);
        if (index !== -1) {
            this.contacts[index] = { ...this.contacts[index], ...updateData };
            return this.contacts[index];
        }
        return null;
    }

    deleteContact(id) {
        const index = this.contacts.findIndex(c => c.id == id);
        if (index !== -1) {
            const deleted = this.contacts.splice(index, 1)[0];
            return deleted;
        }
        return null;
    }

    // Guide Download methods
    getAllGuideDownloads() {
        return [...this.guideDownloads];
    }

    getGuideDownloadById(id) {
        return this.guideDownloads.find(gd => gd.id == id);
    }

    addGuideDownload(guideDownloadData) {
        const newGuideDownload = {
            id: this.nextGuideDownloadId++,
            ...guideDownloadData,
            status: 'new',
            createdAt: new Date().toISOString()
        };
        this.guideDownloads.push(newGuideDownload);
        return newGuideDownload;
    }

    updateGuideDownload(id, updateData) {
        const index = this.guideDownloads.findIndex(gd => gd.id == id);
        if (index !== -1) {
            this.guideDownloads[index] = { ...this.guideDownloads[index], ...updateData };
            return this.guideDownloads[index];
        }
        return null;
    }

    deleteGuideDownload(id) {
        const index = this.guideDownloads.findIndex(gd => gd.id == id);
        if (index !== -1) {
            const deleted = this.guideDownloads.splice(index, 1)[0];
            return deleted;
        }
        return null;
    }
}

// Create and export singleton instance
const contentStore = new ContentStore();
module.exports = contentStore;
