/**
 * CaseStudy Model
 * MongoDB schema for case study management
 */

const mongoose = require('mongoose');

const CaseStudySchema = new mongoose.Schema({
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
        trim: true
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
    client: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true,
        maxlength: [100, 'Client name cannot exceed 100 characters']
    },
    industry: {
        type: String,
        required: [true, 'Industry is required'],
        trim: true,
        enum: [
            'Transportation & Logistics',
            'Education',
            'Healthcare',
            'Finance',
            'E-commerce',
            'Manufacturing',
            'Technology',
            'Real Estate',
            'Hospitality',
            'Government',
            'Non-profit',
            'Other'
        ]
    },
    technologies: [{
        type: String,
        trim: true,
        maxlength: [50, 'Technology name cannot exceed 50 characters']
    }],
    projectType: {
        type: String,
        enum: [
            'Website Development',
            'Mobile App',
            'Software Development',
            'Digital Marketing',
            'Branding',
            'IT Consulting',
            'Data Analytics',
            'E-commerce',
            'System Integration'
        ],
        required: true
    },
    duration: {
        type: String,
        trim: true // e.g., "3 months", "6 weeks"
    },
    teamSize: {
        type: Number,
        min: 1
    },
    budget: {
        range: {
            type: String,
            enum: ['Under $5K', '$5K-$15K', '$15K-$50K', '$50K-$100K', 'Over $100K']
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
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
    completedAt: {
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
    results: {
        metrics: [{
            name: String,
            value: String,
            description: String
        }],
        testimonial: {
            quote: String,
            author: String,
            position: String,
            company: String
        }
    },
    challenges: [{
        title: String,
        description: String,
        solution: String
    }],
    gallery: [{
        url: String,
        caption: String,
        type: {
            type: String,
            enum: ['image', 'video', 'screenshot'],
            default: 'image'
        }
    }],
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

// Virtual for formatted completion date
CaseStudySchema.virtual('formattedCompletionDate').get(function() {
    if (!this.completedAt) return null;
    return this.completedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Pre-save middleware
CaseStudySchema.pre('save', function(next) {
    // Generate slug from title if not provided
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    
    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    // Auto-generate SEO fields
    if (!this.seoTitle && this.title) {
        this.seoTitle = this.title.substring(0, 60);
    }
    
    if (!this.seoDescription && this.excerpt) {
        this.seoDescription = this.excerpt.substring(0, 160);
    }
    
    next();
});

// Static methods
CaseStudySchema.statics.getPublished = function(options = {}) {
    const { limit = 10, skip = 0, featured = null, industry = null } = options;
    
    let query = { status: 'published' };
    
    if (featured !== null) {
        query.featured = featured;
    }
    
    if (industry) {
        query.industry = industry;
    }
    
    return this.find(query)
        .sort({ publishedAt: -1 })
        .limit(limit)
        .skip(skip);
};

CaseStudySchema.statics.getFeatured = function(limit = 3) {
    return this.find({ status: 'published', featured: true })
        .sort({ publishedAt: -1 })
        .limit(limit);
};

// Instance methods
CaseStudySchema.methods.incrementViews = function() {
    return this.updateOne({ $inc: { views: 1 } });
};

// Indexes
CaseStudySchema.index({ slug: 1 }, { unique: true });
CaseStudySchema.index({ status: 1 });
CaseStudySchema.index({ publishedAt: -1 });
CaseStudySchema.index({ industry: 1 });
CaseStudySchema.index({ featured: 1 });
CaseStudySchema.index({ projectType: 1 });

module.exports = mongoose.model('CaseStudy', CaseStudySchema);
