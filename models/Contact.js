/**
 * Contact Model
 * MongoDB schema for contact form submissions
 */

const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    phone: {
        type: String,
        trim: true,
        maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    company: {
        type: String,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        enum: [
            'Software Development',
            'Digital Marketing',
            'IT Consulting',
            'Data Analytics',
            'Branding & Design',
            'Website Development',
            'Mobile App Development',
            'General Inquiry',
            'Support',
            'Partnership',
            'Other'
        ]
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['new', 'in-progress', 'responded', 'closed'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    source: {
        type: String,
        enum: ['website', 'referral', 'social-media', 'email', 'phone', 'other'],
        default: 'website'
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    referrer: {
        type: String,
        trim: true
    },
    responseRequired: {
        type: Boolean,
        default: true
    },
    respondedAt: {
        type: Date
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: [{
        content: {
            type: String,
            required: true,
            maxlength: [1000, 'Note cannot exceed 1000 characters']
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    followUpDate: {
        type: Date
    },
    estimatedValue: {
        type: Number,
        min: 0
    },
    archived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for response time
ContactSchema.virtual('responseTime').get(function() {
    if (!this.respondedAt || !this.createdAt) return null;
    
    const diffMs = this.respondedAt - this.createdAt;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
});

// Virtual for urgency score
ContactSchema.virtual('urgencyScore').get(function() {
    let score = 0;
    
    // Priority weight
    const priorityWeights = { low: 1, medium: 2, high: 3, urgent: 4 };
    score += priorityWeights[this.priority] || 2;
    
    // Age weight (older = more urgent)
    const ageHours = (Date.now() - this.createdAt) / (1000 * 60 * 60);
    if (ageHours > 72) score += 3; // 3+ days
    else if (ageHours > 24) score += 2; // 1+ days
    else if (ageHours > 8) score += 1; // 8+ hours
    
    // Status weight
    if (this.status === 'new') score += 2;
    
    return Math.min(score, 10); // Cap at 10
});

// Pre-save middleware
ContactSchema.pre('save', function(next) {
    // Set respondedAt when status changes to responded
    if (this.isModified('status') && this.status === 'responded' && !this.respondedAt) {
        this.respondedAt = new Date();
    }
    
    // Auto-set priority based on keywords in message
    if (this.isModified('message') && this.priority === 'medium') {
        const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'immediately'];
        const highKeywords = ['important', 'priority', 'soon', 'quickly'];
        
        const messageText = this.message.toLowerCase();
        
        if (urgentKeywords.some(keyword => messageText.includes(keyword))) {
            this.priority = 'urgent';
        } else if (highKeywords.some(keyword => messageText.includes(keyword))) {
            this.priority = 'high';
        }
    }
    
    next();
});

// Static methods
ContactSchema.statics.getByStatus = function(status, options = {}) {
    const { limit = 50, skip = 0 } = options;
    return this.find({ status, archived: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('respondedBy', 'name email');
};

ContactSchema.statics.getUrgent = function() {
    return this.find({
        status: { $in: ['new', 'in-progress'] },
        archived: false,
        $or: [
            { priority: 'urgent' },
            { priority: 'high' },
            { createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Older than 24 hours
        ]
    }).sort({ priority: -1, createdAt: 1 });
};

ContactSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgResponseTime: {
                    $avg: {
                        $cond: [
                            { $and: ['$respondedAt', '$createdAt'] },
                            { $subtract: ['$respondedAt', '$createdAt'] },
                            null
                        ]
                    }
                }
            }
        }
    ]);
};

// Instance methods
ContactSchema.methods.addNote = function(content, userId) {
    this.notes.push({
        content,
        addedBy: userId
    });
    return this.save();
};

ContactSchema.methods.markAsResponded = function(userId) {
    this.status = 'responded';
    this.respondedAt = new Date();
    this.respondedBy = userId;
    return this.save();
};

// Indexes
ContactSchema.index({ status: 1 });
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ priority: 1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ archived: 1 });
ContactSchema.index({ subject: 1 });

// Text index for search
ContactSchema.index({
    name: 'text',
    email: 'text',
    company: 'text',
    message: 'text'
});

module.exports = mongoose.model('Contact', ContactSchema);
