import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './routes/api.js';

/**
 * Creates and configures the Express application.
 * Mounts APIs first, then applies Vite dev middlewares or static production handlers.
 */
export async function createApp() {
  const app = express();

  // Apply JSON body parser middleware with production-safe size limits supporting Base64 images (prevent DoS)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // Handle malformed JSON body errors gracefully
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ error: 'صيغة البيانات المرسلة غير صالحة.' });
    }
    next(err);
  });

  // Health check endpoint (mounted before apiRouter to bypass catch-all 404 fallback)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Mount API routing layer
  app.use('/api', apiRouter);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('🛠️ Mounting Vite Dev Server middlewares...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('📦 Serving production static bundle from /dist...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}
