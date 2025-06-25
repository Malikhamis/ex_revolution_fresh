/**
 * BlogPost Model
 * MongoDB schema for blog post management
 */

const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    excerpt: {
        type: String,
        required: [true, 'Excerpt is required'],
        trim: true,
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    image: {
        type: String,
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true,
        maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        enum: [
            'Technology',
            'Software Development', 
            'Digital Marketing',
            'Data Analytics',
            'Artificial Intelligence',
            'Business',
            'IT Consulting',
            'Web Development',
            'Mobile Development',
            'Cybersecurity'
        ]
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters']
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    readingTime: {
        type: Number, // in minutes
        default: 0
    },
    seoTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    seoDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    seoKeywords: [{
        type: String,
        trim: true
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted publish date
BlogPostSchema.virtual('formattedPublishDate').get(function() {
    if (!this.publishedAt) return null;
    return this.publishedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for reading time calculation
BlogPostSchema.virtual('estimatedReadingTime').get(function() {
    if (!this.content) return 0;
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to generate slug from title
BlogPostSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim('-'); // Remove leading/trailing hyphens
    }
    
    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    // Calculate reading time
    if (this.isModified('content')) {
        this.readingTime = this.estimatedReadingTime;
    }
    
    // Auto-generate SEO fields if not provided
    if (!this.seoTitle && this.title) {
        this.seoTitle = this.title.substring(0, 60);
    }
    
    if (!this.seoDescription && this.excerpt) {
        this.seoDescription = this.excerpt.substring(0, 160);
    }
    
    next();
});

// Static method to get published posts
BlogPostSchema.statics.getPublished = function(options = {}) {
    const { limit = 10, skip = 0, featured = null, category = null } = options;
    
    let query = { status: 'published' };
    
    if (featured !== null) {
        query.featured = featured;
    }
    
    if (category) {
        query.category = category;
    }
    
    return this.find(query)
        .sort({ publishedAt: -1 })
        .limit(limit)
        .skip(skip)
        .select('-content'); // Exclude full content for list views
};

// Static method to get featured posts
BlogPostSchema.statics.getFeatured = function(limit = 3) {
    return this.find({ status: 'published', featured: true })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .select('-content');
};

// Static method to get related posts
BlogPostSchema.statics.getRelated = function(postId, category, limit = 3) {
    return this.find({
        _id: { $ne: postId },
        status: 'published',
        category: category
    })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('-content');
};

// Instance method to increment views
BlogPostSchema.methods.incrementViews = function() {
    return this.updateOne({ $inc: { views: 1 } });
};

// Instance method to toggle featured status
BlogPostSchema.methods.toggleFeatured = function() {
    this.featured = !this.featured;
    return this.save();
};

// Indexes for performance
BlogPostSchema.index({ slug: 1 }, { unique: true });
BlogPostSchema.index({ status: 1 });
BlogPostSchema.index({ publishedAt: -1 });
BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ featured: 1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ createdAt: -1 });

// Text index for search functionality
BlogPostSchema.index({
    title: 'text',
    excerpt: 'text',
    content: 'text',
    tags: 'text'
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);
