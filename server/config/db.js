const mongoose = require('mongoose');

const connectDB = async () => {
  const options = {
    autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production to prevent performance issues
    maxPoolSize: 10, // Connection pooling limit
    serverSelectionTimeoutMS: 5000, // Timeout after 5s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4 // Use IPv4
  };

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  // Handle disconnections
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected! Attempting to reconnect...');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('connected', () => {
    console.log('MongoDB Connected successfully to Atlas Cluster.');
  });

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(uri, options);
    } catch (err) {
      console.error('Failed to connect to MongoDB on startup. Retrying in 5 seconds...', err.message);
      setTimeout(connectWithRetry, 5000);
    }
  };

  await connectWithRetry();
};

module.exports = connectDB;
