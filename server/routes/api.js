import { Router } from 'express';
import { 
  checkAdmin, 
  registerAdmin, 
  loginAdmin, 
  updateAdmin, 
  resetAdmin,
  authenticateAdmin
} from '../controllers/adminController.js';
import { 
  createOrder, 
  getOrders, 
  updateOrderStatus,
  deleteOrder,
  trackOrders
} from '../controllers/orderController.js';
import { 
  getSettings, 
  updateSettings 
} from '../controllers/settingsController.js';
import { 
  getRatings, 
  addRating 
} from '../controllers/ratingController.js';
import {
  getMenu,
  addCategory,
  updateCategory,
  deleteCategory,
  addMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem
} from '../controllers/menuController.js';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  authenticateUser
} from '../controllers/userController.js';

// Simple memory-based rate limiter creator to prevent brute-force attacks and spamming
function rateLimiter(limit, windowMs) {
  // Creating map inside the generator guarantees closure isolation (each route is rate-limited independently)
  const rateLimits = new Map();

  // Background interval to prune stale keys once every 5 minutes to prevent memory leaks without blocking requests
  const interval = setInterval(() => {
    const currentTime = Date.now();
    for (const [key, timestamps] of rateLimits.entries()) {
      const active = timestamps.filter(t => currentTime - t < windowMs);
      if (active.length === 0) {
        rateLimits.delete(key);
      } else {
        rateLimits.set(key, active);
      }
    }
  }, 5 * 60 * 1000);
  if (interval && typeof interval.unref === 'function') {
    interval.unref();
  }

  return (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || 'unknown';
    if (typeof ip === 'string' && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    const userAgent = req.headers['user-agent'] || '';
    // Combine IP and User-Agent to avoid blocking different physical devices sharing a CGNAT / proxy IP
    const key = `${ip}:${userAgent}`;
    const now = Date.now();
    
    let requests = rateLimits.get(key);
    if (requests) {
      requests = requests.filter(t => now - t < windowMs);
    } else {
      requests = [];
    }

    if (requests.length >= limit) {
      rateLimits.set(key, requests);
      return res.status(429).json({ error: 'لقد تجاوزت حد الطلبات المسموح به لهذه الأجهزة. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.' });
    }
    requests.push(now);
    rateLimits.set(key, requests);
    next();
  };
}

const adminAuthLimiter = rateLimiter(20, 60000); // 20 requests/min to avoid blocking administrators during high usage
const userAuthLimiter = rateLimiter(30, 60000);  // 30 requests/min for user logins/registers
const orderLimiter = rateLimiter(40, 60000);     // 40 requests/min per client device to support quick re-orders
const trackingLimiter = rateLimiter(150, 60000); // 150 requests/min for order tracking state polling/updates
const ratingsLimiter = rateLimiter(25, 60000);    // 25 requests/min for rating submissions

const router = Router();

// --- Admin Auth routes ---
router.get('/admin/check', checkAdmin);
router.post('/admin/register', adminAuthLimiter, registerAdmin);
router.post('/admin/login', adminAuthLimiter, loginAdmin);
router.put('/admin/update', adminAuthLimiter, authenticateAdmin, updateAdmin);
router.post('/admin/reset', adminAuthLimiter, resetAdmin);

// --- User Auth & Profile routes ---
router.post('/users/register', userAuthLimiter, registerUser);
router.post('/users/login', userAuthLimiter, loginUser);
router.get('/users/profile', authenticateUser, getProfile);
router.put('/users/profile', authenticateUser, updateProfile);

// --- Orders routes ---
router.post('/orders', orderLimiter, createOrder);
router.get('/orders/track', trackingLimiter, trackOrders); // Public tracking
router.get('/orders', authenticateAdmin, getOrders); // Protected admin-only
router.put('/orders/:id/status', authenticateAdmin, updateOrderStatus); // Protected admin-only
router.delete('/orders/:id', authenticateAdmin, deleteOrder); // Protected admin-only

// --- Settings routes ---
router.get('/settings', getSettings);
router.post('/settings', authenticateAdmin, updateSettings); // Protected admin-only

// --- Ratings routes ---
router.get('/ratings', getRatings);
router.post('/ratings', ratingsLimiter, addRating);

// --- Menu & Category routes ---
router.get('/menu', getMenu);
router.post('/menu/categories', authenticateAdmin, addCategory);
router.put('/menu/categories/:id', authenticateAdmin, updateCategory);
router.delete('/menu/categories/:id', authenticateAdmin, deleteCategory);
router.post('/menu/items', authenticateAdmin, addMenuItem);
router.put('/menu/items/:id', authenticateAdmin, updateMenuItem);
router.put('/menu/items/:id/availability', authenticateAdmin, toggleMenuItemAvailability);
router.delete('/menu/items/:id', authenticateAdmin, deleteMenuItem);

// --- Catch-all API fallback ---
router.all('*', (req, res) => {
  res.status(404).json({ error: 'عذراً، الرابط البرمجي المطلق غير موجود.' });
});

export default router;
