/**
 * Simple Local Server for Ex Revolution Website
 * Minimal dependencies for local testing
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
// const multer = require('multer'); // Commented out for now

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// TODO: Add multer configuration for image uploads when multer is installed
/*
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
*/

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// CORS for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Simple in-memory storage for local testing
let quotes = [
    // Test quote data
    {
        id: 1,
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1-555-0123",
        company: "Smith Enterprises",
        projectType: "Web Development",
        budget: "$5,000 - $10,000",
        timeline: "2-3 months",
        description: "Need a modern, responsive website for our growing business. Looking for e-commerce functionality and mobile optimization.",
        status: "new",
        priority: "high",
        estimatedValue: 7500,
        createdAt: "2025-01-15T10:30:00.000Z",
        submittedAt: "2025-01-15T10:30:00.000Z"
    },
    {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah@techstartup.com",
        phone: "+1-555-0456",
        company: "TechStartup Inc",
        projectType: "Mobile App Development",
        budget: "$15,000 - $25,000",
        timeline: "4-6 months",
        description: "Looking to develop a cross-platform mobile app for our SaaS product. Need both iOS and Android versions with real-time sync.",
        status: "in-progress",
        priority: "medium",
        estimatedValue: 20000,
        createdAt: "2025-01-14T14:15:00.000Z",
        submittedAt: "2025-01-14T14:15:00.000Z"
    },
    {
        id: 3,
        name: "Mike Wilson",
        email: "mike.wilson@consulting.com",
        phone: "+1-555-0789",
        company: "Wilson Consulting",
        projectType: "Digital Marketing",
        budget: "$2,000 - $5,000",
        timeline: "1-2 months",
        description: "Need comprehensive digital marketing strategy including SEO, social media management, and content creation for our consulting firm.",
        status: "completed",
        priority: "low",
        estimatedValue: 3500,
        createdAt: "2025-01-13T09:45:00.000Z",
        submittedAt: "2025-01-13T09:45:00.000Z"
    }
];
let guideDownloads = [];
let blogPosts = [
    // Blog Page 1 Posts
    {
        id: 1,
        title: "How AI is Transforming Business Operations in 2025",
        slug: "ai-transforming-business",
        excerpt: "Discover how artificial intelligence is revolutionizing business operations in 2025, from automated customer service to predictive analytics and beyond.",
        content: "<p>Artificial intelligence is revolutionizing business operations in 2025, from automated customer service to predictive analytics and beyond. Companies are leveraging AI to streamline processes, reduce costs, and improve customer experiences.</p>",
        image: "/assets/images/blog1.jpg",
        author: "Shirhan Shermohamed",
        category: "Artificial Intelligence",
        tags: ["Artificial Intelligence", "Business Operations", "Digital Transformation"],
        status: "published",
        featured: true,
        targetPage: 1,
        publishedAt: "2025-05-15",
        createdAt: "2025-05-10"
    },
    {
        id: 2,
        title: "Custom vs Off-the-Shelf Software: Which is Right for Your Business?",
        slug: "custom-vs-off-the-shelf",
        excerpt: "A comprehensive comparison of custom and off-the-shelf software solutions, helping you make the right choice for your business needs and budget.",
        content: "<p>A comprehensive comparison of custom and off-the-shelf software solutions, helping you make the right choice for your business needs and budget. We explore the pros and cons of each approach.</p>",
        image: "/assets/images/blog3.jpg",
        author: "ExRevolution",
        category: "Software Development",
        tags: ["Software Development", "Business Solutions", "ROI"],
        status: "published",
        featured: false,
        targetPage: 1,
        publishedAt: "2025-04-28",
        createdAt: "2025-04-25"
    },
    {
        id: 3,
        title: "Advanced Data Visualization Techniques for Business Insights",
        slug: "data-visualization-techniques",
        excerpt: "Learn about the latest data visualization techniques that can help your business extract meaningful insights from complex datasets.",
        content: "<p>Learn about the latest data visualization techniques that can help your business extract meaningful insights from complex datasets. Modern visualization tools enable better decision-making.</p>",
        image: "/assets/images/blog2.jpg",
        author: "ExRevolution",
        category: "Data Analytics",
        tags: ["Data Analytics", "Visualization", "Business Intelligence"],
        status: "published",
        featured: false,
        targetPage: 1,
        publishedAt: "2025-04-15",
        createdAt: "2025-04-12"
    },
    // Blog Page 2 Posts
    {
        id: 4,
        title: "Top Mobile App Development Trends for 2023",
        slug: "mobile-app-trends",
        excerpt: "Stay ahead of the curve with the latest mobile app development trends that are shaping the industry in 2023.",
        content: "<p>Stay ahead of the curve with the latest mobile app development trends that are shaping the industry in 2023. From AI integration to cross-platform development.</p>",
        image: "/assets/images/blog6.jpg",
        author: "ExRevolution",
        category: "Mobile Development",
        tags: ["Mobile Apps", "Development Trends", "Technology"],
        status: "published",
        featured: true,
        targetPage: 2,
        publishedAt: "2023-05-15",
        createdAt: "2023-05-10"
    },
    {
        id: 5,
        title: "5 Digital Marketing Strategies That Actually Work in 2023",
        slug: "digital-marketing-strategies",
        excerpt: "Discover proven digital marketing strategies that deliver real results for businesses of all sizes in today's competitive landscape.",
        content: "<p>Discover proven digital marketing strategies that deliver real results for businesses of all sizes in today's competitive landscape. Focus on ROI-driven approaches.</p>",
        image: "/assets/images/blog4.jpg",
        author: "ExRevolution",
        category: "Digital Marketing",
        tags: ["Digital Marketing", "Strategy", "ROI"],
        status: "published",
        featured: false,
        targetPage: 2,
        publishedAt: "2023-04-15",
        createdAt: "2023-04-10"
    },
    {
        id: 6,
        title: "5 Critical Steps for Successful Digital Transformation",
        slug: "digital-transformation-steps",
        excerpt: "Learn the five critical steps that can make or break your organization's digital transformation journey in today's rapidly evolving business landscape.",
        content: "<p>Learn the five critical steps that can make or break your organization's digital transformation journey in today's rapidly evolving business landscape. Strategic planning is key.</p>",
        image: "/assets/images/blog5.jpg",
        author: "ExRevolution",
        category: "Digital Transformation",
        tags: ["Digital Transformation", "Business Strategy", "Technology"],
        status: "published",
        featured: false,
        targetPage: 2,
        publishedAt: "2023-03-20",
        createdAt: "2023-03-15"
    },
    // Blog Page 3 Test Post
    {
        id: 7,
        title: "Test Post for Page 3 - Cloud Computing Solutions",
        slug: "cloud-computing-solutions",
        excerpt: "Explore the latest cloud computing solutions that can transform your business operations and reduce infrastructure costs.",
        content: "<p>Cloud computing is revolutionizing how businesses operate, offering scalable solutions that reduce costs and improve efficiency. This test post demonstrates the page 3 functionality.</p>",
        image: "/assets/images/blog1.jpg",
        author: "Ex Revolution Team",
        category: "Cloud Computing",
        tags: ["Cloud Computing", "Business Solutions", "Technology"],
        status: "published",
        featured: true,
        targetPage: 3,
        publishedAt: "2025-06-02",
        createdAt: "2025-06-02"
    }
];

let caseStudies = [
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
let nextId = 8; // Starting from 8 for new blog posts (existing posts are 1-7, quotes are 1-3)

// Blog Post HTML Template Generator
function generateBlogPostHTML(blogPost) {
    const publishDate = blogPost.publishedAt ? new Date(blogPost.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Not Published';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blogPost.title} - Ex Revolution Technology</title>
    <meta name="description" content="${blogPost.excerpt || 'Read the latest insights from Ex Revolution Technology'}">
    <meta name="keywords" content="${blogPost.tags ? blogPost.tags.join(', ') : 'technology, business, innovation'}">

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${blogPost.title}">
    <meta property="og:description" content="${blogPost.excerpt || 'Read the latest insights from Ex Revolution Technology'}">
    <meta property="og:image" content="${blogPost.image || '../assets/images/blog-default.jpg'}">
    <meta property="og:url" content="https://exrevolution.com/blog/${blogPost.slug}.html">
    <meta property="og:type" content="article">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${blogPost.title}">
    <meta name="twitter:description" content="${blogPost.excerpt || 'Read the latest insights from Ex Revolution Technology'}">
    <meta name="twitter:image" content="${blogPost.image || '../assets/images/blog-default.jpg'}">

    <!-- Favicon -->
    <link rel="icon" href="../assets/images/favicon.ico" type="image/x-icon">

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <!-- Main Stylesheet -->
    <link rel="stylesheet" href="../css/main.css">

    <!-- Direct Mobile Menu Stylesheet -->
    <link rel="stylesheet" href="../css/direct-mobile-menu.css">

    <!-- Theme Switcher Stylesheet -->
    <link rel="stylesheet" href="../css/theme-switcher.css">

    <!-- Conversion Lead Stylesheet -->
    <link rel="stylesheet" href="../css/conversion-lead.css">

    <!-- Blog Post Stylesheet -->
    <link rel="stylesheet" href="../css/blog-post.css">
</head>
<body>
    <!-- Skip to Content Link for Accessibility -->
    <a href="#main-content" class="skip-to-content">Skip to Content</a>

    <!-- Header -->
    <header class="header">
        <div class="container header-container">
            <a href="../index.html" class="logo-link">
                <img src="../assets/images/logo.jpg" alt="Ex Revolution Technology" class="logo logo-light">
                <img src="../assets/images/logo1.jpg" alt="Ex Revolution Technology" class="logo logo-dark">
            </a>

            <nav class="main-nav">
                <ul>
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="../services.html">Services</a></li>
                    <li><a href="../case-studies.html">Case Studies</a></li>
                    <li><a href="../about.html">About Us</a></li>
                    <li><a href="../blog.html" class="active">Blog</a></li>
                    <li><a href="../contact.html">Contact</a></li>
                </ul>
            </nav>

            <a href="../quote.html" class="cta-button">Request a Quote</a>

            <!-- Mobile Toggle Button -->
            <button class="mobile-toggle" aria-label="Toggle Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>

    <!-- Main Content -->
    <main id="main-content">
        <!-- Blog Hero Section -->
        <section class="blog-hero">
            <div class="container">
                <h1 style="color: #ffffff !important; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5) !important;">${blogPost.title}</h1>
                <div class="meta">
                    <div class="meta-item" style="color: #ffffff !important; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5) !important;">
                        <i class="far fa-user" style="color: #ffffff !important;"></i>
                        <span style="color: #ffffff !important; font-weight: 500 !important;">${blogPost.author || 'Ex Revolution Team'}</span>
                    </div>
                    <div class="meta-item" style="color: #ffffff !important; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5) !important;">
                        <i class="far fa-calendar-alt" style="color: #ffffff !important;"></i>
                        <span style="color: #ffffff !important; font-weight: 500 !important;">${publishDate}</span>
                    </div>
                    <div class="meta-item" style="color: #ffffff !important; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5) !important;">
                        <i class="far fa-folder" style="color: #ffffff !important;"></i>
                        <span style="color: #ffffff !important; font-weight: 500 !important;">${blogPost.category || 'Technology'}</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Blog Content Section -->
        <section class="blog-content">
            <div class="blog-container">
                <article class="blog-post">
                    ${blogPost.image ? `<div class="blog-post-image">
                        <img src="${blogPost.image}" alt="${blogPost.title}" style="width: 100%; height: auto; border-radius: 10px; margin-bottom: 2rem;">
                    </div>` : ''}
                    <div class="blog-post-body">
                        ${blogPost.content || '<p>Content coming soon...</p>'}

                        <!-- Share Box -->
                        <div class="share-box">
                            <h3><i class="fas fa-share-alt"></i> Share This Article</h3>
                            <div class="share-buttons">
                                <a href="https://www.facebook.com/sharer/sharer.php?u=https://exrevolution.com/blog/${blogPost.slug}.html" target="_blank" class="share-button facebook" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
                                <a href="https://twitter.com/intent/tweet?url=https://exrevolution.com/blog/${blogPost.slug}.html&text=${encodeURIComponent(blogPost.title)}" target="_blank" class="share-button twitter" aria-label="Share on Twitter"><i class="fab fa-twitter"></i></a>
                                <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://exrevolution.com/blog/${blogPost.slug}.html" target="_blank" class="share-button linkedin" aria-label="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                                <a href="https://wa.me/?text=${encodeURIComponent(blogPost.title + ' - https://exrevolution.com/blog/' + blogPost.slug + '.html')}" target="_blank" class="share-button whatsapp" aria-label="Share on WhatsApp"><i class="fab fa-whatsapp"></i></a>
                            </div>
                        </div>

                        <!-- Related Posts -->
                        <div class="related-posts">
                            <h3 style="color: #ffffff !important;">Related Posts</h3>
                            <div class="related-posts-grid">
                                <div class="related-post">
                                    <img src="../assets/images/blog3.jpg" alt="Custom Software" class="related-post-image">
                                    <div class="related-post-content">
                                        <h4 class="related-post-title"><a href="custom-vs-off-the-shelf.html">Custom vs Off-the-Shelf Software</a></h4>
                                    </div>
                                </div>
                                <div class="related-post">
                                    <img src="../assets/images/blog6.jpg" alt="Data Visualization" class="related-post-image">
                                    <div class="related-post-content">
                                        <h4 class="related-post-title"><a href="data-visualization-techniques.html">Data Visualization Techniques</a></h4>
                                    </div>
                                </div>
                                <div class="related-post">
                                    <img src="../assets/images/blog4.jpg" alt="Digital Marketing" class="related-post-image">
                                    <div class="related-post-content">
                                        <h4 class="related-post-title"><a href="digital-marketing-strategies.html">Digital Marketing Strategies</a></h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-column">
                    <h3 style="color: #ffffff !important;">Ex Revolution Technology</h3><p style="color: #ffffff !important;">Innovative IT solutions for businesses of all sizes. We help you transform through technology.</p>
                    <div class="social-links">
                        <a href="#" aria-label="Facebook" style="background-color: rgba(0, 102, 204, 0.8) !important;"><i class="fab fa-facebook-f" style="color: #ffffff !important;"></i></a>
                        <a href="#" aria-label="Twitter" style="background-color: rgba(0, 102, 204, 0.8) !important;"><i class="fab fa-twitter" style="color: #ffffff !important;"></i></a>
                        <a href="#" aria-label="LinkedIn" style="background-color: rgba(0, 102, 204, 0.8) !important;"><i class="fab fa-linkedin-in" style="color: #ffffff !important;"></i></a>
                        <a href="https://www.instagram.com/exrevolution.tz?igsh=bXlocWo3dGFlMjBr" target="_blank" aria-label="Instagram" style="background-color: rgba(0, 102, 204, 0.8) !important;"><i class="fab fa-instagram" style="color: #ffffff !important;"></i></a>
                    </div>
                </div>
                <div class="footer-column">
                    <h3 style="color: #ffffff !important;">Services</h3>
                    <div class="footer-links">
                        <a href="../services/software-development.html" style="color: #ffffff !important;">Software Development</a>
                        <a href="../services/digital-marketing.html" style="color: #ffffff !important;">Digital Marketing</a>
                        <a href="../services/it-consulting.html" style="color: #ffffff !important;">IT Consulting</a>
                        <a href="../services/branding-kit.html" style="color: #ffffff !important;">Branding Kit</a>
                    </div>
                </div>
                <div class="footer-column">
                    <h3 style="color: #ffffff !important;">Company</h3><div class="footer-links"><a href="../about.html" style="color: #ffffff !important;">About Us</a>
                        <a href="../case-studies.html" style="color: #ffffff !important;">Case Studies</a>
                        <a href="../blog.html" style="color: #ffffff !important;">Blog</a>
                        <a href="../contact.html" style="color: #ffffff !important;">Contact</a>
                    </div>
                </div>
                <div class="footer-column">
                    <h3 style="color: #ffffff !important;">Contact Us</h3><div class="footer-links"><a href="tel:+255744622649" style="color: #ffffff !important;"><i class="fas fa-phone-alt mr-2"></i> +255 744 622 649</a>
                        <a href="mailto:exrevolution8@gmail.com" style="color: #ffffff !important;"><i class="fas fa-envelope mr-2"></i> exrevolution8@gmail.com</a>
                        <a href="https://maps.google.com" target="_blank" style="color: #ffffff !important;"><i class="fas fa-map-marker-alt mr-2"></i> PSSSF Samora House,
Junction of Samora and Morogoro Rd,
Dar es Salaam, Tanzania</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p class="copyright" style="color: #ffffff !important;">&copy; 2024 Ex Revolution Technology. All rights reserved.</p>
                <div class="footer-nav">
                    <a href="../privacy-policy.html" style="color: #ffffff !important;">Privacy Policy</a>
                    <a href="../terms-of-service.html" style="color: #ffffff !important;">Terms of Service</a>
                    <a href="../sitemap.html" style="color: #ffffff !important;">Sitemap</a>
                </div>
            </div>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="../js/direct-mobile-menu.js"></script>
    <script src="../js/theme-switcher.js"></script>
    <script src="../js/app.js"></script>
    <script src="../js/newsletter-handler.js"></script>

    <!-- Chatbot Container -->
    <div class="chatbot-container"></div>

    <!-- Chatbot Integration -->
    <script src="../js/chatbot.js"></script>
</body>
</html>`;
}

// Function to create slug from title
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim('-'); // Remove leading/trailing hyphens
}

// Function to save blog post HTML file
async function saveBlogPostHTML(blogPost) {
    try {
        const htmlContent = generateBlogPostHTML(blogPost);
        const fileName = `${blogPost.slug}.html`;
        const filePath = path.join(__dirname, 'blog', fileName);

        await fsPromises.writeFile(filePath, htmlContent, 'utf8');
        console.log(`✅ Generated HTML file: blog/${fileName}`);
        return true;
    } catch (error) {
        console.error(`❌ Error generating HTML file for ${blogPost.slug}:`, error);
        return false;
    }
}

// Function to delete blog post HTML file
async function deleteBlogPostHTML(slug) {
    try {
        const fileName = `${slug}.html`;
        const filePath = path.join(__dirname, 'blog', fileName);

        // Check if file exists before trying to delete
        try {
            await fsPromises.access(filePath);
            await fsPromises.unlink(filePath);
            console.log(`✅ Deleted HTML file: blog/${fileName}`);
            return true;
        } catch (accessError) {
            console.log(`ℹ️ HTML file blog/${fileName} doesn't exist, skipping deletion`);
            return true;
        }
    } catch (error) {
        console.error(`❌ Error deleting HTML file for ${slug}:`, error);
        return false;
    }
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});



// Quote form endpoint (plural - for admin compatibility)
app.post('/api/quotes', (req, res) => {
    console.log('💰 New quote request (admin):', req.body);

    const quote = {
        id: nextId++,
        name: req.body.name || req.body.clientName,
        email: req.body.email,
        phone: req.body.phone,
        company: req.body.company,
        projectType: req.body.projectType || req.body.serviceType || req.body.service,
        budget: req.body.budget,
        timeline: req.body.timeline,
        description: req.body.description || req.body.projectDetails,
        status: req.body.status || 'new',
        priority: req.body.priority || 'medium',
        estimatedValue: req.body.estimatedValue || 0,
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
    };

    quotes.push(quote);

    res.json({
        success: true,
        message: 'Quote request submitted successfully',
        data: quote
    });
});

// Quote form endpoint (singular - for main website compatibility)
app.post('/api/quote', (req, res) => {
    console.log('💰 New quote request (website):', req.body);

    const quote = {
        id: nextId++,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        company: req.body.company,
        projectType: req.body.serviceType || req.body.service,
        budget: req.body.budget,
        timeline: req.body.timeline,
        description: req.body.projectDetails || req.body.details,
        status: 'new',
        priority: 'medium',
        estimatedValue: 0,
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
    };

    quotes.push(quote);

    console.log('✅ Quote request saved:', quote.name, '-', quote.projectType);

    res.json({
        success: true,
        message: 'Quote request submitted successfully! We will contact you within 24-48 hours.',
        data: quote
    });
});

// Get quotes (for admin)
app.get('/api/quotes', (req, res) => {
    console.log('💰 Admin: Getting all quotes');
    res.json(quotes);
});

// Update quote (for admin)
app.put('/api/quotes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log('💰 Admin: Updating quote:', id);

    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Quote not found'
        });
    }

    // Update the quote
    quotes[index] = {
        ...quotes[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    console.log('✅ Quote updated successfully:', quotes[index].name);

    res.json({
        success: true,
        message: 'Quote updated successfully',
        data: quotes[index]
    });
});

// Delete quote (for admin)
app.delete('/api/quotes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log('💰 Admin: Deleting quote:', id);

    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Quote not found'
        });
    }

    const deletedQuote = quotes.splice(index, 1)[0];

    console.log('✅ Quote deleted successfully:', deletedQuote.name);

    res.json({
        success: true,
        message: 'Quote deleted successfully',
        data: deletedQuote
    });
});

// Guide download endpoint
app.post('/api/guides/download', (req, res) => {
    console.log('📚 New guide download:', req.body);

    const { email, guide } = req.body;

    if (!email || !guide) {
        return res.status(400).json({
            success: false,
            message: 'Email and guide type are required'
        });
    }

    const guideDownload = {
        id: nextId++,
        email,
        guide,
        downloadedAt: new Date().toISOString(),
        ipAddress: req.ip || req.connection.remoteAddress,
        status: 'new'
    };

    guideDownloads.push(guideDownload);

    res.json({
        success: true,
        message: 'Guide download recorded successfully',
        data: guideDownload
    });
});

// Get guide downloads (for admin)
app.get('/api/guides/downloads', (req, res) => {
    res.json(guideDownloads);
});

// Public API endpoints for content manager
app.get('/api/public/case-studies', (req, res) => {
    // Return only published case studies for public view
    const publishedCaseStudies = caseStudies.filter(cs => cs.status === 'published');
    res.json(publishedCaseStudies);
});

// Admin API endpoints for case studies management
app.get('/api/case-studies', (req, res) => {
    console.log('📚 Admin: Getting all case studies');
    res.json(caseStudies);
});

app.post('/api/case-studies', (req, res) => {
    console.log('📚 Admin: Creating new case study:', req.body);

    const newCaseStudy = {
        id: nextId++,
        ...req.body,
        createdAt: new Date().toISOString(),
        publishedAt: req.body.status === 'published' ? new Date().toISOString() : null
    };

    caseStudies.push(newCaseStudy);

    console.log('✅ Case study created successfully:', newCaseStudy.title);

    res.json({
        success: true,
        message: 'Case study created successfully',
        data: newCaseStudy
    });
});

app.put('/api/case-studies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log('📚 Admin: Updating case study:', id);

    const index = caseStudies.findIndex(cs => cs.id === id);
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Case study not found'
        });
    }

    // Update the case study
    caseStudies[index] = {
        ...caseStudies[index],
        ...req.body,
        publishedAt: req.body.status === 'published' ? new Date().toISOString() : caseStudies[index].publishedAt
    };

    console.log('✅ Case study updated successfully:', caseStudies[index].title);

    res.json({
        success: true,
        message: 'Case study updated successfully',
        data: caseStudies[index]
    });
});

app.delete('/api/case-studies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log('📚 Admin: Deleting case study:', id);

    const index = caseStudies.findIndex(cs => cs.id === id);
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Case study not found'
        });
    }

    const deletedCaseStudy = caseStudies.splice(index, 1)[0];

    console.log('✅ Case study deleted successfully:', deletedCaseStudy.title);

    res.json({
        success: true,
        message: 'Case study deleted successfully',
        data: deletedCaseStudy
    });
});

// Public API for blog posts
app.get('/api/public/blog-posts', (req, res) => {
    // Return only published blog posts for public view
    const publishedBlogPosts = blogPosts.filter(bp => bp.status === 'published');
    res.json(publishedBlogPosts);
});

// Public API for blog posts by page
app.get('/api/public/blog-posts/page/:pageNumber', (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber);
    console.log(`📝 Getting blog posts for page ${pageNumber}`);

    // Return only published blog posts for the specific page
    const publishedBlogPosts = blogPosts.filter(bp => {
        if (bp.status !== 'published') return false;

        // Convert targetPage to number for comparison if it's a string
        const targetPage = bp.targetPage === 'auto' ? 'auto' : parseInt(bp.targetPage);

        console.log(`📝 Checking post "${bp.title}": targetPage=${bp.targetPage} (${typeof bp.targetPage}), pageNumber=${pageNumber}`);

        return targetPage === pageNumber || targetPage === 'auto';
    });

    console.log(`📝 Found ${publishedBlogPosts.length} posts for page ${pageNumber}:`, publishedBlogPosts.map(p => p.title));

    // If targetPage is 'auto', sort by date and paginate
    if (publishedBlogPosts.some(bp => bp.targetPage === 'auto')) {
        const autoPosts = publishedBlogPosts.filter(bp => bp.targetPage === 'auto');
        const specificPosts = publishedBlogPosts.filter(bp => parseInt(bp.targetPage) === pageNumber);

        // Sort auto posts by date (newest first)
        autoPosts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        // Paginate auto posts (3 per page)
        const postsPerPage = 3;
        const startIndex = (pageNumber - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedAutoPosts = autoPosts.slice(startIndex, endIndex);

        // Combine specific posts with paginated auto posts
        const combinedPosts = [...specificPosts, ...paginatedAutoPosts];
        res.json(combinedPosts);
    } else {
        res.json(publishedBlogPosts);
    }
});

// Admin API endpoints for blog posts management
app.get('/api/blog-posts', (req, res) => {
    console.log('📝 Admin: Getting all blog posts');
    res.json(blogPosts);
});

app.post('/api/blog-posts', async (req, res) => {
    console.log('📝 Admin: Creating new blog post:', req.body);

    // Generate slug if not provided
    const slug = req.body.slug || createSlug(req.body.title);

    const newBlogPost = {
        id: nextId++,
        ...req.body,
        slug: slug,
        createdAt: new Date().toISOString(),
        publishedAt: req.body.status === 'published' ? new Date().toISOString() : null
    };

    blogPosts.push(newBlogPost);

    console.log('✅ Blog post created successfully:', newBlogPost.title);

    // Generate HTML file if published
    let htmlGenerated = false;
    if (newBlogPost.status === 'published') {
        htmlGenerated = await saveBlogPostHTML(newBlogPost);
    }

    res.json({
        success: true,
        message: `Blog post created successfully${htmlGenerated ? ' and HTML file generated' : ''}`,
        data: newBlogPost,
        htmlGenerated: htmlGenerated
    });
});

app.put('/api/blog-posts/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log('📝 Admin: Updating blog post:', id);

    const index = blogPosts.findIndex(bp => bp.id === id);
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Blog post not found'
        });
    }

    const oldBlogPost = { ...blogPosts[index] };
    const oldSlug = oldBlogPost.slug;

    // Generate new slug if title changed
    const newSlug = req.body.slug || (req.body.title ? createSlug(req.body.title) : oldBlogPost.slug);

    // Update the blog post
    blogPosts[index] = {
        ...blogPosts[index],
        ...req.body,
        slug: newSlug,
        publishedAt: req.body.status === 'published' ?
            (blogPosts[index].publishedAt || new Date().toISOString()) :
            blogPosts[index].publishedAt
    };

    console.log('✅ Blog post updated successfully:', blogPosts[index].title);

    let htmlGenerated = false;
    let oldHtmlDeleted = false;

    // Handle HTML file operations
    if (blogPosts[index].status === 'published') {
        // Delete old HTML file if slug changed
        if (oldSlug && oldSlug !== newSlug && oldBlogPost.status === 'published') {
            oldHtmlDeleted = await deleteBlogPostHTML(oldSlug);
        }

        // Generate new HTML file
        htmlGenerated = await saveBlogPostHTML(blogPosts[index]);
    } else if (oldBlogPost.status === 'published' && req.body.status !== 'published') {
        // Delete HTML file if post was unpublished
        oldHtmlDeleted = await deleteBlogPostHTML(oldSlug);
    }

    res.json({
        success: true,
        message: `Blog post updated successfully${htmlGenerated ? ' and HTML file generated' : ''}${oldHtmlDeleted ? ' (old HTML file removed)' : ''}`,
        data: blogPosts[index],
        htmlGenerated: htmlGenerated,
        oldHtmlDeleted: oldHtmlDeleted
    });
});

app.delete('/api/blog-posts/:id', async (req, res) => {
    const id = req.params.id;
    console.log('📝 Admin: Deleting blog post:', id, typeof id);

    // Try both string and number comparison for ID
    const index = blogPosts.findIndex(bp => bp.id == id || bp.id === parseInt(id));

    console.log('📝 Looking for post with ID:', id);
    console.log('📝 Available post IDs:', blogPosts.map(bp => `${bp.id} (${typeof bp.id})`));
    console.log('📝 Found index:', index);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Blog post not found'
        });
    }

    const deletedBlogPost = blogPosts.splice(index, 1)[0];

    console.log('✅ Blog post deleted successfully:', deletedBlogPost.title);
    console.log('📝 Remaining posts:', blogPosts.length);

    // Delete HTML file if it exists
    let htmlDeleted = false;
    if (deletedBlogPost.slug && deletedBlogPost.status === 'published') {
        htmlDeleted = await deleteBlogPostHTML(deletedBlogPost.slug);
    }

    res.json({
        success: true,
        message: `Blog post deleted successfully${htmlDeleted ? ' and HTML file removed' : ''}`,
        data: deletedBlogPost,
        htmlDeleted: htmlDeleted
    });
});

// Bulk generate HTML files for existing published blog posts
app.post('/api/blog-posts/generate-html', async (req, res) => {
    console.log('📝 Admin: Generating HTML files for all published blog posts');

    const publishedPosts = blogPosts.filter(bp => bp.status === 'published');
    const results = [];

    for (const post of publishedPosts) {
        if (!post.slug) {
            post.slug = createSlug(post.title);
        }

        const success = await saveBlogPostHTML(post);
        results.push({
            id: post.id,
            title: post.title,
            slug: post.slug,
            success: success
        });
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log(`✅ Generated ${successCount}/${totalCount} HTML files`);

    res.json({
        success: true,
        message: `Generated ${successCount}/${totalCount} HTML files`,
        results: results,
        summary: {
            total: totalCount,
            successful: successCount,
            failed: totalCount - successCount
        }
    });
});

// TODO: Image upload endpoints (requires multer)
/*
app.post('/api/upload/image', upload.single('image'), (req, res) => {
    console.log('📸 Image upload request:', req.file);

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No image file provided'
        });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    console.log('✅ Image uploaded successfully:', imageUrl);

    res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            url: imageUrl,
            fullUrl: `http://localhost:${PORT}${imageUrl}`
        }
    });
});
*/

// Placeholder image upload endpoint (without multer)
app.post('/api/upload/image', (req, res) => {
    console.log('📸 Image upload request (placeholder)');

    // For now, return a placeholder response
    res.json({
        success: true,
        message: 'Image upload placeholder - multer not installed',
        data: {
            filename: 'placeholder.jpg',
            originalName: 'placeholder.jpg',
            size: 0,
            url: '/assets/images/placeholder.jpg',
            fullUrl: `http://localhost:${PORT}/assets/images/placeholder.jpg`
        }
    });
});

// Newsletter storage
let newsletters = [];
let subscribers = [
    // Test subscriber data
    {
        id: 1,
        email: "john.doe@example.com",
        status: "active",
        subscribedAt: "2025-01-10T08:30:00.000Z",
        source: "website"
    },
    {
        id: 2,
        email: "sarah.smith@company.com",
        status: "active",
        subscribedAt: "2025-01-12T14:20:00.000Z",
        source: "website"
    },
    {
        id: 3,
        email: "mike.wilson@email.com",
        status: "unsubscribed",
        subscribedAt: "2025-01-08T11:45:00.000Z",
        source: "website"
    }
];

// Newsletter subscription endpoint (for main website)
app.post('/api/newsletter', (req, res) => {
    console.log('📰 Newsletter subscription:', req.body);

    const { email, source = 'website' } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }

    // Check if already subscribed
    const existingSubscriber = subscribers.find(s => s.email === email);
    if (existingSubscriber) {
        if (existingSubscriber.status === 'active') {
            return res.json({
                success: true,
                message: 'You are already subscribed to our newsletter!'
            });
        } else {
            // Reactivate subscription
            existingSubscriber.status = 'active';
            existingSubscriber.subscribedAt = new Date().toISOString();
            console.log('✅ Newsletter subscription reactivated:', email);
        }
    } else {
        // Add new subscriber
        const newSubscriber = {
            id: nextId++,
            email,
            status: 'active',
            subscribedAt: new Date().toISOString(),
            source
        };
        subscribers.push(newSubscriber);
        console.log('✅ New newsletter subscriber:', email);
    }

    res.json({
        success: true,
        message: 'Newsletter subscription successful! Thank you for subscribing.'
    });
});

// Newsletter admin endpoints
app.get('/api/newsletter/subscribers', (req, res) => {
    console.log('📰 Admin: Getting newsletter subscribers');
    res.json(subscribers);
});

app.get('/api/newsletter/templates', (req, res) => {
    console.log('📰 Admin: Getting newsletter templates');
    res.json(newsletters);
});

app.post('/api/newsletter/templates', (req, res) => {
    console.log('📰 Admin: Creating newsletter template:', req.body);

    const newsletter = {
        id: nextId++,
        ...req.body,
        createdAt: new Date().toISOString(),
        status: 'draft'
    };

    newsletters.push(newsletter);

    res.json({
        success: true,
        message: 'Newsletter template created successfully',
        data: newsletter
    });
});

app.post('/api/newsletter/send', (req, res) => {
    console.log('📰 Admin: Sending newsletter:', req.body);

    // For now, just simulate sending
    res.json({
        success: true,
        message: 'Newsletter sent successfully to all subscribers',
        data: {
            sentTo: subscribers.filter(s => s.status === 'active').length,
            sentAt: new Date().toISOString()
        }
    });
});

// Delete newsletter subscriber
app.delete('/api/newsletter/subscribers/:id', (req, res) => {
    const subscriberId = parseInt(req.params.id);
    console.log('📰 Admin: Deleting newsletter subscriber:', subscriberId);

    const subscriberIndex = subscribers.findIndex(s => s.id === subscriberId);

    if (subscriberIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Subscriber not found'
        });
    }

    const deletedSubscriber = subscribers.splice(subscriberIndex, 1)[0];
    console.log('✅ Newsletter subscriber deleted:', deletedSubscriber.email);

    res.json({
        success: true,
        message: 'Subscriber deleted successfully',
        data: deletedSubscriber
    });
});

// Update newsletter subscriber status (subscribe/unsubscribe)
app.put('/api/newsletter/subscribers/:id', (req, res) => {
    const subscriberId = parseInt(req.params.id);
    const { status } = req.body;
    console.log('📰 Admin: Updating newsletter subscriber status:', subscriberId, status);

    const subscriber = subscribers.find(s => s.id === subscriberId);

    if (!subscriber) {
        return res.status(404).json({
            success: false,
            message: 'Subscriber not found'
        });
    }

    subscriber.status = status;
    if (status === 'active') {
        subscriber.subscribedAt = new Date().toISOString();
        delete subscriber.unsubscribedAt;
    } else {
        subscriber.unsubscribedAt = new Date().toISOString();
    }

    console.log('✅ Newsletter subscriber status updated:', subscriber.email, status);

    res.json({
        success: true,
        message: `Subscriber ${status === 'active' ? 'resubscribed' : 'unsubscribed'} successfully`,
        data: subscriber
    });
});

// Consultation/Lead generation endpoints
let consultations = [];

app.post('/api/consultation', (req, res) => {
    console.log('🎯 New consultation request:', req.body);

    const consultation = {
        id: nextId++,
        ...req.body,
        type: 'consultation',
        status: 'new',
        submittedAt: new Date().toISOString()
    };

    consultations.push(consultation);

    console.log('✅ Consultation request saved:', consultation.name, '-', consultation.email);

    res.json({
        success: true,
        message: 'Thank you for your interest! We will contact you within 24 hours to schedule your free consultation.',
        data: consultation
    });
});

app.post('/api/leads', (req, res) => {
    console.log('🎯 New lead submission:', req.body);

    const lead = {
        id: nextId++,
        ...req.body,
        type: 'lead',
        status: 'new',
        submittedAt: new Date().toISOString()
    };

    consultations.push(lead);

    console.log('✅ Lead saved:', lead.name || lead.email);

    res.json({
        success: true,
        message: 'Thank you! We have received your information and will be in touch soon.',
        data: lead
    });
});

// Get consultations/leads (for admin)
app.get('/api/consultations', (req, res) => {
    console.log('🎯 Admin: Getting consultations/leads');
    res.json(consultations);
});

// Contact form submissions
let contacts = [
    {
        id: 1001,
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0123',
        subject: 'Website Development Inquiry',
        message: 'Hi, I am interested in developing a new website for my business. Could you please provide more information about your services and pricing?',
        type: 'contact',
        status: 'new',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
        id: 1002,
        name: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        phone: '+1-555-0456',
        subject: 'Mobile App Development',
        message: 'We need a mobile app for our e-commerce business. Can you help us with iOS and Android development?',
        type: 'contact',
        status: 'in-progress',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
        id: 1003,
        name: 'Mike Wilson',
        email: 'mike.wilson@email.com',
        phone: '+1-555-0789',
        subject: 'Digital Marketing Services',
        message: 'Looking for comprehensive digital marketing services including SEO, social media management, and PPC advertising.',
        type: 'contact',
        status: 'completed',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    }
];

app.post('/api/contact', (req, res) => {
    console.log('📧 New contact form submission:', req.body);

    const contact = {
        id: nextId++,
        ...req.body,
        type: 'contact',
        status: 'new',
        submittedAt: new Date().toISOString()
    };

    contacts.push(contact);

    console.log('✅ Contact form saved:', contact.name, '-', contact.email);

    res.json({
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.',
        data: contact
    });
});

// Get contact form submissions (for admin)
app.get('/api/contacts', (req, res) => {
    console.log('📧 Admin: Getting contact form submissions');
    res.json(contacts);
});

// Update contact status (for admin)
app.put('/api/contacts/:id', (req, res) => {
    const contactId = parseInt(req.params.id);
    const { status } = req.body;
    console.log('📧 Admin: Updating contact status:', contactId, status);

    const contact = contacts.find(c => c.id === contactId);

    if (!contact) {
        return res.status(404).json({
            success: false,
            message: 'Contact not found'
        });
    }

    contact.status = status;
    contact.updatedAt = new Date().toISOString();

    console.log('✅ Contact status updated:', contact.email, status);

    res.json({
        success: true,
        message: 'Contact status updated successfully',
        data: contact
    });
});

// Delete contact (for admin)
app.delete('/api/contacts/:id', (req, res) => {
    const contactId = parseInt(req.params.id);
    console.log('📧 Admin: Deleting contact:', contactId);

    const contactIndex = contacts.findIndex(c => c.id === contactId);

    if (contactIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Contact not found'
        });
    }

    const deletedContact = contacts.splice(contactIndex, 1)[0];
    console.log('✅ Contact deleted:', deletedContact.email);

    res.json({
        success: true,
        message: 'Contact deleted successfully',
        data: deletedContact
    });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// Simple admin authentication (for local testing)
app.post('/api/auth/login', (req, res) => {
    console.log('🔐 Login attempt received:');
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);

    const { username, password } = req.body;

    console.log('Extracted credentials:');
    console.log('Username:', username);
    console.log('Password:', password ? '[PROVIDED]' : '[MISSING]');

    // Simple hardcoded credentials for local testing
    if (username === 'exadmin' && password === 'swordfish123') {
        console.log('✅ Login successful for:', username);
        res.json({
            success: true,
            message: 'Login successful',
            token: 'local-test-token'
        });
    } else {
        console.log('❌ Login failed for:', username);
        console.log('Expected: exadmin / swordfish123');
        console.log('Received:', username, '/', password);
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

// Serve the PDF guide
app.get('/assets/guides/digital-marketing-guide.pdf', (req, res) => {
    const pdfPath = path.join(__dirname, 'assets', 'guides', 'digital-marketing-guide.html');

    if (fs.existsSync(pdfPath)) {
        // For local testing, serve the HTML version
        res.sendFile(pdfPath);
    } else {
        res.status(404).json({
            success: false,
            message: 'Guide not found'
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    // Get local IP address for mobile access
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIP = 'localhost';

    // Find the first non-internal IPv4 address
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIP = iface.address;
                break;
            }
        }
        if (localIP !== 'localhost') break;
    }

    console.log('\n🎉 ===== EX REVOLUTION TECHNOLOGY SERVER =====');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('🖥️  Local access:');
    console.log(`   Homepage: http://localhost:${PORT}/`);
    console.log(`   Admin:    http://localhost:${PORT}/admin/login.html`);
    console.log('📱 Mobile access:');
    console.log(`   Homepage: http://${localIP}:${PORT}/`);
    console.log(`   Admin:    http://${localIP}:${PORT}/admin/login.html`);
    console.log('✅ All systems operational!');
    console.log('===============================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Server shutting down gracefully...');
    process.exit(0);
});
