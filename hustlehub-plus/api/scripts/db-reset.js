import mongoose from 'mongoose';
import config from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

try {
  await connectDB(config.MONGODB_URI);
  const { name } = mongoose.connection;
  await mongoose.connection.dropDatabase();
  console.log(`Database "${name}" dropped.`);
  await disconnectDB();
} catch (error) {
  console.error(`Could not reset the database: ${error.message}`);
  process.exit(1);
}
