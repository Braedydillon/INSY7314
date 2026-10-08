import mongoose from 'mongoose';
import config from './env.js';

mongoose.set('strictQuery', true);

export async function connectDB(uri = config.MONGODB_URI) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`Mongo db connected: ${mongoose.connection.name}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
