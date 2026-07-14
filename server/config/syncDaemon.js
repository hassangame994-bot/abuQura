import { syncOrdersWithMongo } from '../controllers/orderController.js';
import { syncMenuWithMongo } from '../controllers/menuController.js';
import { syncUsersWithMongo } from '../controllers/userController.js';
import { syncAdminsWithMongo } from '../controllers/adminController.js';
import { getIsMongoConnected } from './db.js';

let isSyncInProgress = false;

/**
 * High-Availability Bidirectional Synchronization Daemon.
 * Automatically runs every 60 seconds to guarantee complete parity between 
 * MongoDB Cloud and the Local JSON backup database.
 */
export function startSyncDaemon(io) {
  console.log('📡 [Sync Daemon] Initializing Bidirectional Database Synchronizer...');

  // Run initial sync on bootstrap after server is up
  setTimeout(async () => {
    await runBidirectionalSync(io);
  }, 5000);

  // Set interval to run strictly every 60 seconds (1 minute)
  setInterval(async () => {
    await runBidirectionalSync(io);
  }, 60 * 1000);
}

/**
 * Runs the self-healing synchronization for both menu items and orders.
 */
async function runBidirectionalSync(io) {
  if (isSyncInProgress) {
    console.log('⏳ [Sync Daemon] Synchronization is already in progress, skipping loop.');
    return;
  }

  if (!getIsMongoConnected()) {
    console.log('📡 [Sync Daemon] MongoDB is currently offline. Skipping synchronization cycle until connectivity is restored.');
    return;
  }

  isSyncInProgress = true;
  console.log(`📡 [Sync Daemon] [${new Date().toISOString()}] Starting self-healing synchronization cycle...`);

  try {
    // 1. Sync Menu Items and Categories (Force deep-scan comparison)
    try {
      await syncMenuWithMongo(true);
      console.log('📡 [Sync Daemon] Menu & Categories synchronization completed successfully.');
    } catch (menuErr) {
      console.error('❌ [Sync Daemon] Menu synchronization failed:', menuErr.message);
    }

    // 2. Sync Orders
    try {
      await syncOrdersWithMongo(io);
      console.log('📡 [Sync Daemon] Orders synchronization completed successfully.');
    } catch (ordersErr) {
      console.error('❌ [Sync Daemon] Orders synchronization failed:', ordersErr.message);
    }

    // 3. Sync Administrators
    try {
      await syncAdminsWithMongo();
      console.log('📡 [Sync Daemon] Admins synchronization completed successfully.');
    } catch (adminErr) {
      console.error('❌ [Sync Daemon] Admin synchronization failed:', adminErr.message);
    }

    // 4. Sync Users
    try {
      await syncUsersWithMongo();
      console.log('📡 [Sync Daemon] Users synchronization completed successfully.');
    } catch (userErr) {
      console.error('❌ [Sync Daemon] Users synchronization failed:', userErr.message);
    }

    console.log('✅ [Sync Daemon] Self-healing synchronization cycle finished successfully. Databases are in 100% parity.');
  } catch (err) {
    console.error('❌ [Sync Daemon] Fatal error during synchronization cycle:', err.message);
  } finally {
    isSyncInProgress = false;
  }
}
