/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './server/app.js';
import { connectMongoDB } from './server/config/db.js';
import { autoCleanupOrders } from './server/controllers/orderController.js';
import { startSyncDaemon } from './server/config/syncDaemon.js';

// Setup global error handling to guarantee the server never stops (السيرفر لا يتوقف أبداً)
process.on('uncaughtException', (err) => {
  console.error('🔥 CRITICAL UNCAUGHT EXCEPTION:', err);
  // Keep the process alive, log the event for self-healing monitoring
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 CRITICAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
  // Keep the process alive, log the event for self-healing monitoring
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

async function bootstrap() {
  console.log('🚀 Bootstrapping Abu Qura Restaurant backend...');

  // 1. Establish database connection asynchronously in the background.
  // This lets the server start immediately and bind to Port 3000 to prevent startup hangs.
  connectMongoDB().catch((err) => {
    console.error('⚠️ Critical error in background MongoDB connection:', err);
  });

  // 2. Build the configured Express application
  const app = await createApp();

  // Create HTTP Server
  const server = http.createServer(app);

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  // Expose io instance to express controllers via app.set
  app.set('io', io);

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.io: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected from Socket.io: ${socket.id}`);
    });
  });

  // Start continuous self-healing bidirectional database synchronization daemon
  startSyncDaemon(io);

  // 3. Listen on the required container port 3000
  server.listen(PORT, HOST, () => {
    console.log(`=============================================================`);
    console.log(`🚀 Abu Qura Professional Server is running on http://localhost:${PORT}`);
    console.log(`📡 Hosting Interface bound to ${HOST}:${PORT} (ready for container ingress)`);
    console.log(`=============================================================`);
  });

  // 4. Start periodic cleanup of completed/cancelled/old orders (runs on boot and every 24 hours)
  autoCleanupOrders().catch((err) => {
    console.error('⚠️ Critical error in background database cleanup on startup:', err);
  });

  setInterval(() => {
    autoCleanupOrders().catch((err) => {
      console.error('⚠️ Critical error in background database cleanup schedule:', err);
    });
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
}

bootstrap().catch((err) => {
  console.error('❌ Critical failure during bootstrap:', err);
  process.exit(1);
});
