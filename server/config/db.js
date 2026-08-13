const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  const options = {
    autoIndex: process.env.NODE_ENV !== 'production',
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  };

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
    if (process.env.VERCEL) {
      throw new Error('MONGODB_URI is missing');
    }
    process.exit(1);
  }

  if (mongoose.connection.listenerCount('disconnected') === 0) {
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected!');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB Connected successfully to Atlas Cluster.');
    });
  }

  try {
    cachedConn = await mongoose.connect(uri, options);
    return cachedConn;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    if (!process.env.VERCEL) {
      setTimeout(connectDB, 5000);
    } else {
      throw err;
    }
  }
};

module.exports = connectDB;

