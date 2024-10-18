// lib/mongodb.js
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI; // 使用环境变量

let isConnected; // 跟踪连接状态

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
};
