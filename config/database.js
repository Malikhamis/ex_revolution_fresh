/**
 * Database Configuration
 * MongoDB connection and setup
 */

const mongoose = require('mongoose');

/**
 * MongoDB Connection
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exrevolution';
        
        console.log('🔄 Connecting to MongoDB...');
        
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferCommands: false, // Disable mongoose buffering
            bufferMaxEntries: 0 // Disable mongoose buffering
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('📴 MongoDB connection closed through app termination');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error closing MongoDB connection:', error);
                process.exit(1);
            }
        });

        return conn;
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        
        // In development, continue with in-memory storage
        if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Falling back to in-memory storage for development');
            return null;
        }
        
        // In production, exit the process
        console.error('🚨 Database connection required in production');
        process.exit(1);
    }
};

/**
 * Database Health Check
 */
const checkDBHealth = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            // Test the connection
            await mongoose.connection.db.admin().ping();
            return {
                status: 'healthy',
                connected: true,
                database: mongoose.connection.name,
                host: mongoose.connection.host,
                port: mongoose.connection.port
            };
        } else {
            return {
                status: 'disconnected',
                connected: false,
                readyState: mongoose.connection.readyState
            };
        }
    } catch (error) {
        return {
            status: 'error',
            connected: false,
            error: error.message
        };
    }
};

/**
 * Initialize Database Indexes
 */
const initializeIndexes = async () => {
    try {
        console.log('🔄 Initializing database indexes...');
        
        // User indexes
        await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
        
        // Blog post indexes
        await mongoose.connection.collection('blogposts').createIndex({ slug: 1 }, { unique: true });
        await mongoose.connection.collection('blogposts').createIndex({ status: 1 });
        await mongoose.connection.collection('blogposts').createIndex({ publishedAt: -1 });
        
        // Case study indexes
        await mongoose.connection.collection('casestudies').createIndex({ slug: 1 }, { unique: true });
        await mongoose.connection.collection('casestudies').createIndex({ status: 1 });
        
        // Contact indexes
        await mongoose.connection.collection('contacts').createIndex({ createdAt: -1 });
        await mongoose.connection.collection('contacts').createIndex({ status: 1 });
        
        // Quote indexes
        await mongoose.connection.collection('quotes').createIndex({ createdAt: -1 });
        await mongoose.connection.collection('quotes').createIndex({ status: 1 });
        
        console.log('✅ Database indexes initialized');
        
    } catch (error) {
        console.error('❌ Error initializing indexes:', error.message);
        // Don't fail the application for index errors
    }
};

/**
 * Database Statistics
 */
const getDBStats = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return { error: 'Database not connected' };
        }

        const stats = await mongoose.connection.db.stats();
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        return {
            database: mongoose.connection.name,
            collections: collections.length,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize,
            indexes: stats.indexes,
            objects: stats.objects,
            avgObjSize: stats.avgObjSize
        };
        
    } catch (error) {
        return { error: error.message };
    }
};

module.exports = {
    connectDB,
    checkDBHealth,
    initializeIndexes,
    getDBStats
};
