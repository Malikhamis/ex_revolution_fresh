const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    // Create an in-memory MongoDB server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Connect to the in-memory database
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB In-Memory Server Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    console.log('MongoDB In-Memory Server Disconnected...');
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = { connectDB, disconnectDB };
