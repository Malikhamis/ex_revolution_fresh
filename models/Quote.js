/**
 * Quote Model
 * MongoDB schema for quote request management
 */

const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    // Client Information
    clientInfo: {
        name: {
            type: String,
            required: [true, 'Client name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        phone: {
            type: String,
            trim: true,
            maxlength: [20, 'Phone cannot exceed 20 characters']
        },
        company: {
            type: String,
            trim: true,
            maxlength: [100, 'Company name cannot exceed 100 characters']
        },
        website: {
            type: String,
            trim: true
        }
    },
    
    // Project Details
    projectInfo: {
        title: {
            type: String,
            required: [true, 'Project title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        description: {
            type: String,
            required: [true, 'Project description is required'],
            trim: true,
            maxlength: [3000, 'Description cannot exceed 3000 characters']
        },
        type: {
            type: String,
            required: [true, 'Project type is required'],
            enum: [
                'Website Development',
                'Mobile App Development',
                'Software Development',
                'Digital Marketing',
                'Branding & Design',
                'IT Consulting',
                'Data Analytics',
                'E-commerce Solution',
                'System Integration',
                'Maintenance & Support',
                'Other'
            ]
        },
        category: {
            type: String,
            enum: [
                'Small Business',
                'Enterprise',
                'Startup',
                'Non-profit',
                'Government',
                'E-commerce',
                'Educational',
                'Healthcare',
                'Finance',
                'Other'
            ]
        },
        budget: {
            range: {
                type: String,
                enum: [
                    'Under $5,000',
                    '$5,000 - $15,000',
                    '$15,000 - $50,000',
                    '$50,000 - $100,000',
                    'Over $100,000',
                    'Not Sure'
                ]
            },
            currency: {
                type: String,
                default: 'USD'
            }
        },
        timeline: {
            type: String,
            enum: [
                'ASAP',
                '1-2 weeks',
                '1 month',
                '2-3 months',
                '3-6 months',
                '6+ months',
                'Flexible'
            ]
        },
        features: [{
            type: String,
            trim: true
        }],
        technologies: [{
            type: String,
            trim: true
        }]
    },
    
    // Quote Management
    status: {
        type: String,
        enum: ['new', 'reviewing', 'quoted', 'negotiating', 'accepted', 'rejected', 'expired'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    
    // Quote Details
    quoteDetails: {
        estimatedCost: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'USD'
            }
        },
        estimatedDuration: {
            value: Number,
            unit: {
                type: String,
                enum: ['days', 'weeks', 'months'],
                default: 'weeks'
            }
        },
        breakdown: [{
            item: String,
            description: String,
            cost: Number,
            duration: String
        }],
        terms: String,
        validUntil: Date,
        notes: String
    },
    
    // Communication
    communications: [{
        type: {
            type: String,
            enum: ['email', 'phone', 'meeting', 'note'],
            required: true
        },
        subject: String,
        content: {
            type: String,
            required: true
        },
        direction: {
            type: String,
            enum: ['inbound', 'outbound'],
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Tracking
    source: {
        type: String,
        enum: ['website', 'referral', 'social-media', 'email', 'phone', 'other'],
        default: 'website'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    quotedAt: Date,
    quotedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    followUpDate: Date,
    
    // Additional Info
    attachments: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        mimetype: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [{
        type: String,
        trim: true
    }],
    archived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for quote age
QuoteSchema.virtual('ageInDays').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for estimated value
QuoteSchema.virtual('estimatedValue').get(function() {
    if (this.quoteDetails?.estimatedCost?.min && this.quoteDetails?.estimatedCost?.max) {
        return (this.quoteDetails.estimatedCost.min + this.quoteDetails.estimatedCost.max) / 2;
    }
    return null;
});

// Pre-save middleware
QuoteSchema.pre('save', function(next) {
    // Set quotedAt when status changes to quoted
    if (this.isModified('status') && this.status === 'quoted' && !this.quotedAt) {
        this.quotedAt = new Date();
    }
    
    // Auto-set priority based on budget and timeline
    if (this.isNew || this.isModified('projectInfo.budget') || this.isModified('projectInfo.timeline')) {
        const budget = this.projectInfo?.budget?.range;
        const timeline = this.projectInfo?.timeline;
        
        if (budget === 'Over $100,000' || timeline === 'ASAP') {
            this.priority = 'high';
        } else if (budget === '$50,000 - $100,000' || timeline === '1-2 weeks') {
            this.priority = 'medium';
        }
    }
    
    next();
});

// Static methods
QuoteSchema.statics.getByStatus = function(status, options = {}) {
    const { limit = 50, skip = 0 } = options;
    return this.find({ status, archived: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('assignedTo quotedBy', 'name email');
};

QuoteSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgValue: {
                    $avg: {
                        $cond: [
                            { $and: ['$quoteDetails.estimatedCost.min', '$quoteDetails.estimatedCost.max'] },
                            { $divide: [{ $add: ['$quoteDetails.estimatedCost.min', '$quoteDetails.estimatedCost.max'] }, 2] },
                            null
                        ]
                    }
                }
            }
        }
    ]);
};

// Instance methods
QuoteSchema.methods.addCommunication = function(communicationData, userId) {
    this.communications.push({
        ...communicationData,
        createdBy: userId
    });
    return this.save();
};

QuoteSchema.methods.assignTo = function(userId) {
    this.assignedTo = userId;
    return this.save();
};

// Indexes
QuoteSchema.index({ status: 1 });
QuoteSchema.index({ createdAt: -1 });
QuoteSchema.index({ priority: 1 });
QuoteSchema.index({ 'clientInfo.email': 1 });
QuoteSchema.index({ 'projectInfo.type': 1 });
QuoteSchema.index({ archived: 1 });

// Text index for search
QuoteSchema.index({
    'clientInfo.name': 'text',
    'clientInfo.email': 'text',
    'clientInfo.company': 'text',
    'projectInfo.title': 'text',
    'projectInfo.description': 'text'
});

module.exports = mongoose.model('Quote', QuoteSchema);
