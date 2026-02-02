import mongoose from 'mongoose';
import config from './index';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(config.mongodbUri, {
      // Mongoose 9.x uses new default options
      // Connection pooling is enabled by default
    });

    isConnected = true;
    console.log('MongoDB connected successfully');

    // Connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

export function getConnectionState(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
}
