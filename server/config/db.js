import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';

// Define MongoDB Connection URL
const MONGO_URI = process.env.MONGO_URI || 'mongodb://rgl0ogno8m_db_user:kllG1V4lDZOiUzqg@ac-f3s2kej-shard-00-00.xzwb3vq.mongodb.net:27017,ac-f3s2kej-shard-00-01.xzwb3vq.mongodb.net:27017,ac-f3s2kej-shard-00-02.xzwb3vq.mongodb.net:27017/abugoura?ssl=true&replicaSet=atlas-1468q9-shard-0&authSource=admin&appName=Cluster0';

// Local JSON Database Fallback Path
const LOCAL_DB_PATH = path.join(process.cwd(), 'abugoura_db.json');

// Ensure local fallback database exists on startup
if (!fs.existsSync(LOCAL_DB_PATH)) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ admins: [], orders: [], settings: { whatsappNumber: '201012345678' }, ratings: [], users: [], categories: [], menuItems: [] }, null, 2));
}

let isMongoConnected = false;

// Simple Mutex for async file operations to prevent race conditions
class Mutex {
  constructor() {
    this._queue = [];
    this._locked = false;
  }
  
  async lock() {
    return new Promise(resolve => {
      if (!this._locked) {
        this._locked = true;
        resolve();
      } else {
        this._queue.push(resolve);
      }
    });
  }
  
  unlock() {
    if (this._queue.length > 0) {
      const resolve = this._queue.shift();
      resolve();
    } else {
      this._locked = false;
    }
  }

  isLocked() {
    return this._locked;
  }
}

// Fine-grained specialized mutexes for production concurrency Isolation
export const dbMutex = new Mutex(); // General fallback
export const ordersMutex = new Mutex();
export const ratingsMutex = new Mutex();
export const settingsMutex = new Mutex();
export const adminMutex = new Mutex();
export const usersMutex = new Mutex();

let connectionAttempts = 0;
let isConnecting = false;

/**
 * Connects to MongoDB in a non-blocking background task.
 * Allows the Express server to start immediately on port 3000.
 */
export async function connectMongoDB() {
  if (isConnecting) {
    console.log('⏳ MongoDB connection is already in progress, skipping duplicate call.');
    return;
  }
  if (getIsMongoConnected()) {
    return;
  }
  isConnecting = true;
  console.log('⚡ Starting background MongoDB connection...');
  try {
    // Attempt Mongoose connection with reasonable timeouts so it fails fast if offline
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isMongoConnected = true;
    connectionAttempts = 0; // Reset attempts on successful connection
    console.log('✅ MongoDB connected successfully! (Cloud DB Active)');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB. Falling back to local file-based database.', err.message);
    isMongoConnected = false;

    // Schedule automatic reconnection attempt (exponential backoff up to 30 seconds)
    connectionAttempts++;
    const delay = Math.min(5000 * connectionAttempts, 30000);
    console.log(`🔄 Scheduling MongoDB reconnection attempt #${connectionAttempts} in ${delay / 1000}s...`);
    setTimeout(() => {
      if (!getIsMongoConnected()) {
        connectMongoDB().catch(() => {});
      }
    }, delay);
  } finally {
    isConnecting = false;
  }
}

/**
 * Checks if MongoDB is currently connected and ready.
 */
export function getIsMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Ensures MongoDB connection is established, waiting up to a timeout if connection is currently in progress.
 * Prevents cold-start race conditions where incoming requests hit the server before MongoDB finishes connecting.
 */
export async function ensureMongoConnection(timeoutMs = 2500) {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return true;
    }
    
    // If completely disconnected (0) or disconnecting (3), initiate/trigger a background reconnection
    if (mongoose.connection && (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3)) {
      console.log('🔄 MongoDB is disconnected. Triggering background self-healing reconnection...');
      connectMongoDB().catch((err) => console.error('⚠️ Reconnection attempt failed:', err.message));
    }

    if (mongoose.connection && mongoose.connection.readyState === 2) {
      const start = Date.now();
      while (mongoose.connection.readyState === 2 && (Date.now() - start < timeoutMs)) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
    return mongoose.connection && mongoose.connection.readyState === 1;
  } catch (err) {
    console.error('⚠️ Error in ensureMongoConnection:', err.message);
    return false;
  }
}

let cachedDB = null;
let readPromise = null;
let isWriting = false;
let needsWrite = false;
let lastWriteTime = 0;
const MIN_WRITE_INTERVAL = 2000; // Write to disk at most once every 2 seconds
let writeTimeout = null;

/**
 * Reads local JSON database asynchronously with retry and non-destructive fallbacks.
 * Employs in-memory caching and a concurrent read protector.
 */
export async function getLocalDB() {
  if (cachedDB) {
    return cachedDB;
  }
  if (readPromise) {
    return readPromise;
  }

  readPromise = (async () => {
    let attempts = 0;
    const maxAttempts = 5;
    while (attempts < maxAttempts) {
      try {
        const content = await fsPromises.readFile(LOCAL_DB_PATH, 'utf-8');
        if (!content || content.trim() === '') {
          throw new Error('Local DB file is empty');
        }
        const data = JSON.parse(content);
        if (!data.settings) {
          data.settings = { whatsappNumber: '201012345678' };
        }
        if (!data.admins) data.admins = [];
        if (!data.orders) data.orders = [];
        if (!data.ratings) data.ratings = [];
        if (!data.users) data.users = [];
        if (!data.categories) data.categories = [];
        if (!data.menuItems) data.menuItems = [];
        if (!data.deletedOrderIds) data.deletedOrderIds = [];
        if (!data.deletedCategoryIds) data.deletedCategoryIds = [];
        if (!data.deletedMenuItemIds) data.deletedMenuItemIds = [];
        cachedDB = data;
        readPromise = null;
        return data;
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.warn('⚠️ Local backup DB file is missing. Instantly recreating default database...');
          const defaultData = {
            admins: [],
            orders: [],
            settings: { whatsappNumber: '201012345678' },
            ratings: [],
            users: [],
            categories: [],
            menuItems: [],
            deletedOrderIds: [],
            deletedCategoryIds: [],
            deletedMenuItemIds: []
          };
          try {
            await fsPromises.writeFile(LOCAL_DB_PATH, JSON.stringify(defaultData, null, 2));
            console.log('✅ Successfully recreated missing local backup DB file.');
          } catch (writeErr) {
            console.error('❌ Failed to write recreated local JSON DB:', writeErr.message);
          }
          cachedDB = defaultData;
          readPromise = null;
          return defaultData;
        }

        attempts++;
        console.warn(`⚠️ [Attempt #${attempts}/${maxAttempts}] Failed to read or parse local JSON DB:`, err.message);
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        } else {
          console.error('❌ Critical: Failed to read local JSON DB after maximum attempts. Returning safe runtime fallback without overwriting DB file.');
          const fallbackData = { 
            admins: [], 
            orders: [], 
            settings: { whatsappNumber: '201012345678' }, 
            ratings: [], 
            users: [], 
            categories: [], 
            menuItems: [], 
            deletedOrderIds: [],
            deletedCategoryIds: [],
            deletedMenuItemIds: []
          };
          cachedDB = fallbackData;
          readPromise = null;
          return fallbackData;
        }
      }
    }
  })();

  return readPromise;
}

/**
 * Saves data into the local JSON database file atomically to prevent corruption.
 * Updates in-memory cache instantly and uses a throttled non-blocking background task to write to disk.
 */
export async function saveLocalDB(data) {
  cachedDB = data;
  needsWrite = true;
  triggerBackgroundWrite();
}

function triggerBackgroundWrite() {
  if (isWriting) {
    return; // Write is already in progress, it will run again if needsWrite is true
  }

  const now = Date.now();
  const timeSinceLastWrite = now - lastWriteTime;

  if (timeSinceLastWrite < MIN_WRITE_INTERVAL) {
    if (!writeTimeout) {
      writeTimeout = setTimeout(() => {
        writeTimeout = null;
        triggerBackgroundWrite();
      }, MIN_WRITE_INTERVAL - timeSinceLastWrite);
    }
    return;
  }

  isWriting = true;
  needsWrite = false;
  lastWriteTime = Date.now();

  // Create a deep copy to prevent concurrent modification issues during disk I/O serialization
  const dataToSave = JSON.parse(JSON.stringify(cachedDB));

  fsPromises.writeFile(LOCAL_DB_PATH + '.tmp', JSON.stringify(dataToSave, null, 2))
    .then(() => fsPromises.rename(LOCAL_DB_PATH + '.tmp', LOCAL_DB_PATH))
    .then(() => {
      isWriting = false;
      console.log('💾 [Local DB] Successfully persisted in-memory cache to abugoura_db.json.');
      if (needsWrite) {
        triggerBackgroundWrite();
      }
    })
    .catch((err) => {
      isWriting = false;
      console.error('⚠️ [Local DB] Failed to save local JSON DB to disk:', err.message);
      if (needsWrite) {
        triggerBackgroundWrite();
      }
    });
}
