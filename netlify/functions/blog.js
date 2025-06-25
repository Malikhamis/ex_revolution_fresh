// Blog Management Function for Netlify Functions
let blogPosts = [
    {
        id: 1,
        title: "The Future of Software Development in Tanzania",
        slug: "future-software-development-tanzania",
        excerpt: "Exploring the growing tech landscape in East Africa and opportunities for local businesses.",
        content: `<p>Tanzania's technology sector is experiencing unprecedented growth...</p>`,
        author: "Shirhan Shermohamed",
        status: "published",
        featured: true,
        featuredImage: "/assets/images/blog1.jpg",
        tags: ["Technology", "Tanzania", "Software Development"],
        category: "Industry Insights",
        publishedAt: "2024-01-15T10:00:00Z",
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
        views: 245,
        seoTitle: "Future of Software Development in Tanzania | Ex Revolution",
        seoDescription: "Discover the growing opportunities in Tanzania's tech sector and how local businesses can leverage software development.",
        seoKeywords: "Tanzania software development, East Africa tech, business technology"
    },
    {
        id: 2,
        title: "5 Digital Marketing Strategies That Actually Work",
        slug: "5-digital-marketing-strategies-that-work",
        excerpt: "Proven digital marketing tactics that deliver real results for small and medium businesses.",
        content: `<p>Digital marketing can be overwhelming, but these 5 strategies have proven effective...</p>`,
        author: "Ex Revolution Team",
        status: "published",
        featured: false,
        featuredImage: "/assets/images/blog2.jpg",
        tags: ["Digital Marketing", "Business Growth", "Online Marketing"],
        category: "Marketing",
        publishedAt: "2024-01-20T14:30:00Z",
        createdAt: "2024-01-20T13:00:00Z",
        updatedAt: "2024-01-20T14:30:00Z",
        views: 189,
        seoTitle: "5 Digital Marketing Strategies That Work | Ex Revolution",
        seoDescription: "Learn proven digital marketing strategies that deliver real results for businesses of all sizes.",
        seoKeywords: "digital marketing strategies, online marketing, business growth"
    }
];

let categories = [
    "Industry Insights",
    "Marketing",
    "Technology",
    "Case Studies",
    "Business Tips",
    "Web Development",
    "Software Development"
];

let tags = [
    "Technology", "Tanzania", "Software Development", "Digital Marketing", 
    "Business Growth", "Online Marketing", "Web Development", "Mobile Apps",
    "IT Consulting", "Data Analytics", "Branding", "SEO", "Social Media"
];

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const pathSegments = event.path.split('/').filter(segment => segment);
    const action = pathSegments[pathSegments.length - 1];

    try {
        switch (event.httpMethod) {
            case 'GET':
                return handleGetRequest(event, headers, action);
            case 'POST':
                return handlePostRequest(event, headers, action);
            case 'PUT':
                return handlePutRequest(event, headers);
            case 'DELETE':
                return handleDeleteRequest(event, headers);
            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Method not allowed' }),
                };
        }
    } catch (error) {
        console.error('Blog function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', details: error.message }),
        };
    }
};

function handleGetRequest(event, headers, action) {
    const { status, category, featured, limit, offset, search } = event.queryStringParameters || {};
    switch (action) {
        case 'categories':
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(categories),
            };
        case 'tags':
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(tags),
            };
        case 'stats':
            const stats = {
                total: blogPosts.length,
                published: blogPosts.filter(p => p.status === 'published').length,
                draft: blogPosts.filter(p => p.status === 'draft').length,
                featured: blogPosts.filter(p => p.featured).length,
                totalViews: blogPosts.reduce((sum, post) => sum + (post.views || 0), 0)
            };
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(stats),
            };
        default:
            let filteredPosts = [...blogPosts];
            if (status) {
                filteredPosts = filteredPosts.filter(post => post.status === status);
            }
            if (category) {
                filteredPosts = filteredPosts.filter(post => post.category === category);
            }
            if (featured === 'true') {
                filteredPosts = filteredPosts.filter(post => post.featured);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                filteredPosts = filteredPosts.filter(post => 
                    post.title.toLowerCase().includes(searchLower) ||
                    post.excerpt.toLowerCase().includes(searchLower) ||
                    post.tags.some(tag => tag.toLowerCase().includes(searchLower))
                );
            }
            filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const startIndex = parseInt(offset) || 0;
            const endIndex = limit ? startIndex + parseInt(limit) : filteredPosts.length;
            const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    posts: paginatedPosts,
                    total: filteredPosts.length,
                    offset: startIndex,
                    limit: limit ? parseInt(limit) : filteredPosts.length
                }),
            };
    }
}

function handlePostRequest(event, headers, action) {
    const postData = JSON.parse(event.body);
    if (action === 'duplicate') {
        const originalPost = blogPosts.find(p => p.id === parseInt(postData.id));
        if (!originalPost) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Post not found' }),
            };
        }
        const duplicatedPost = {
            ...originalPost,
            id: Date.now(),
            title: `${originalPost.title} (Copy)`,
            slug: `${originalPost.slug}-copy-${Date.now()}`,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: null,
            views: 0
        };
        blogPosts.push(duplicatedPost);
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ success: true, message: 'Post duplicated successfully', post: duplicatedPost }),
        };
    }
    const newPost = {
        id: Date.now(),
        title: postData.title || 'Untitled Post',
        slug: postData.slug || generateSlug(postData.title || 'untitled-post'),
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        author: postData.author || 'Ex Revolution Team',
        status: postData.status || 'draft',
        featured: postData.featured || false,
        featuredImage: postData.featuredImage || '',
        tags: postData.tags || [],
        category: postData.category || 'Uncategorized',
        seoTitle: postData.seoTitle || postData.title || '',
        seoDescription: postData.seoDescription || postData.excerpt || '',
        seoKeywords: postData.seoKeywords || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: postData.status === 'published' ? new Date().toISOString() : null,
        views: 0
    };
    if (newPost.tags) {
        newPost.tags.forEach(tag => {
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        });
    }
    if (newPost.category && !categories.includes(newPost.category)) {
        categories.push(newPost.category);
    }
    blogPosts.push(newPost);
    generateBlogPostHTML(newPost);
    return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, message: 'Blog post created successfully', post: newPost }),
    };
}

function handlePutRequest(event, headers) {
    const { id, ...updateData } = JSON.parse(event.body);
    const postIndex = blogPosts.findIndex(p => p.id === parseInt(id));
    if (postIndex === -1) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Post not found' }),
        };
    }
    const updatedPost = {
        ...blogPosts[postIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
    };
    if (updateData.status === 'published' && blogPosts[postIndex].status !== 'published') {
        updatedPost.publishedAt = new Date().toISOString();
    }
    if (updateData.title && updateData.title !== blogPosts[postIndex].title) {
        updatedPost.slug = updateData.slug || generateSlug(updateData.title);
    }
    blogPosts[postIndex] = updatedPost;
    if (updatedPost.tags) {
        updatedPost.tags.forEach(tag => {
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        });
    }
    if (updatedPost.category && !categories.includes(updatedPost.category)) {
        categories.push(updatedPost.category);
    }
    generateBlogPostHTML(updatedPost);
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Blog post updated successfully', post: updatedPost }),
    };
}

function handleDeleteRequest(event, headers) {
    const id = parseInt(event.queryStringParameters.id);
    const postIndex = blogPosts.findIndex(p => p.id === id);
    if (postIndex === -1) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Post not found' }),
        };
    }
    const deletedPost = blogPosts[postIndex];
    blogPosts.splice(postIndex, 1);
    // TODO: Delete the generated HTML file
    // deleteGeneratedHTML(deletedPost.slug);
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Blog post deleted successfully' }),
    };
}

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

function generateBlogPostHTML(post) {
    console.log(`Generated HTML for blog post: ${post.slug}`);
    // TODO: Implement actual HTML generation and file writing
}
