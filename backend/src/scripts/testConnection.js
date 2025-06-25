/**
 * MongoDB Connection Test Script
 * Tests the connection to MongoDB Atlas
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    // Log connection string with password masked
    const maskedUri = process.env.MONGODB_URI.replace(
      /(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.+)/,
      '$1*****$3'
    );
    console.log('Connection string:', maskedUri);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Create a simple test collection
    const testCollection = mongoose.connection.collection('test');
    
    // Insert a test document
    const result = await testCollection.insertOne({ 
      test: true, 
      message: 'This is a test document from Ex Revolution', 
      createdAt: new Date() 
    });
    
    console.log('✅ Successfully inserted a test document with ID:', result.insertedId);
    
    // Find the document
    const document = await testCollection.findOne({ test: true });
    console.log('✅ Retrieved test document:', document);
    
    // Clean up - remove the test document
    await testCollection.deleteOne({ test: true });
    console.log('✅ Cleaned up test document');
    
    console.log('🎉 All MongoDB connection tests passed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testConnection();
