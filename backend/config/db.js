import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isMongoConnected = false;
let mongoMemoryInstance = null;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finova_db';
  const isTestMode = process.env.NODE_ENV === 'test' || process.env.USE_MEMORY_DB === 'true';

  // Explicit Ephemeral TEST Mode (for automated non-persisted test isolation)
  if (isTestMode) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryInstance = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      isMongoConnected = true;
      console.log(`[MongoDB] TEST MODE: Ephemeral database active on ${conn.connection.host}`);
      return;
    } catch (memError) {
      isMongoConnected = false;
      console.error(`[MongoDB Error] Failed to start test database: ${memError.message}`);
      throw memError;
    }
  }

  // 1. Attempt connection to primary configured MONGO_URI (MongoDB Atlas or Local Daemon)
  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 6000 });
    isMongoConnected = true;
    const isAtlas = mongoUri.includes('mongodb+srv://');
    console.log(`[MongoDB] ${isAtlas ? '☁️ MongoDB Atlas Cloud Database' : '💾 Local MongoDB'} connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return;
  } catch (error) {
    console.warn(`[MongoDB Notice] Could not connect to primary MONGO_URI (${error.message}).`);
  }

  // 2. Persistent Disk Database Engine Fallback
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryInstance = await MongoMemoryServer.create();

    const persistentUri = mongoMemoryInstance.getUri();
    const conn = await mongoose.connect(persistentUri);
    isMongoConnected = true;
    console.log(`[MongoDB] Ephemeral/In-Memory MongoDB active: ${conn.connection.host}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[MongoDB Warning] Could not initialize MongoDB instance (${err.message}). Running in lightweight API mode.`);
  }
};
