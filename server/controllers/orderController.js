import Order from '../models/order.js';
import MenuItem from '../models/menuItem.js';
import { getIsMongoConnected, getLocalDB, saveLocalDB, ordersMutex, ensureMongoConnection } from '../config/db.js';
import crypto from 'crypto';

// Server-side source of truth for additions and their correct prices
const VALID_ADDITIONS = {
  'باكت بطاطس مقرمشة': 15,
  'صوص طحينة إضافي': 10,
  'صوص ثومية إضافي': 10,
  'صوص دقوس مندي': 10,
  'مخلل مشكل بلدي': 10,
  'عيش بلدي ساخن': 5
};

// Unified helper function to convert Eastern Arabic and Persian numerals to Western/English digits
function convertArabicToEnglishNumerals(str) {
  if (!str) return '';
  return str.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
            .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
}

// Unified helper to normalize phone numbers to digits-only for robust database matching
function cleanPhoneDigits(phone) {
  if (!phone) return '';
  const converted = convertArabicToEnglishNumerals(String(phone));
  return converted.trim().replace(/[^\d]/g, '');
}

/**
 * Submit a new customer order.
 * Extremely robust validation & fallback to Cairo GPS coordinates.
 * Saves in BOTH MongoDB (if connected) and Local JSON DB simultaneously.
 */
export async function createOrder(req, res) {
  await ensureMongoConnection();
  const { customerName, phoneNumber, address, location, items, totalPrice, customNotes } = req.body;

  // Validate required fields and ensure items is strictly a non-empty array
  if (!customerName || !phoneNumber || !address || !items || !Array.isArray(items) || !items.length || !totalPrice) {
    return res.status(400).json({ error: 'الرجاء ملء جميع البيانات الأساسية ومحتويات السلة لإرسال الطلب بشكل صحيح.' });
  }

  // Defensive sanitization of string fields
  const cleanCustomerName = typeof customerName === 'string' ? customerName.trim() : String(customerName).trim();
  const cleanPhoneNumber = cleanPhoneDigits(phoneNumber);
  const cleanAddress = typeof address === 'string' ? address.trim() : String(address).trim();
  const cleanCustomNotes = typeof customNotes === 'string' ? customNotes.trim() : (customNotes ? String(customNotes).trim() : '');

  // Strict check after cleaning to prevent empty values or bypassing via whitespace/objects
  if (!cleanCustomerName || !cleanPhoneNumber || !cleanAddress) {
    return res.status(400).json({ error: 'الرجاء إدخال بيانات صحيحة للاسم، ورقم الهاتف، والعنوان.' });
  }

  // Validate Egyptian or international phone number length
  if (cleanPhoneNumber.length < 7 || cleanPhoneNumber.length > 15) {
    return res.status(400).json({ error: 'يرجى إدخال رقم هاتف صالح يتكون من 7 إلى 15 رقماً.' });
  }

  // Validate and sanitize totalPrice to prevent negative pricing or pricing bypass attacks
  const numericPrice = Number(totalPrice);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ error: 'إجمالي سعر الطلب غير صالح.' });
  }

  // Sanitize and secure basket items to prevent negative quantities or malformed elements
  const sanitizedItems = items.map(item => {
    return {
      menuItemId: typeof item.menuItemId === 'string' ? item.menuItemId.trim() : String(item.menuItemId || ''),
      name: typeof item.name === 'string' ? item.name.trim() : String(item.name || ''),
      selectedSize: typeof item.selectedSize === 'string' ? item.selectedSize.trim() : (item.selectedSize ? String(item.selectedSize) : undefined),
      unitPrice: Number(item.unitPrice || 0),
      quantity: Number(item.quantity || 0),
      additions: Array.isArray(item.additions) ? item.additions.map(add => ({
        name: typeof add.name === 'string' ? add.name.trim() : String(add.name || ''),
        price: Number(add.price || 0)
      })) : []
    };
  });

  // Verify elements are fully valid
  const hasInvalidItems = sanitizedItems.some(item => 
    !item.menuItemId || 
    !item.name || 
    isNaN(item.unitPrice) || 
    item.unitPrice < 0 || 
    isNaN(item.quantity) || 
    item.quantity <= 0
  );

  if (hasInvalidItems) {
    return res.status(400).json({ error: 'بعض العناصر في السلة تحتوي على قيم غير صالحة.' });
  }

  // Server-side robust validation of item availability and price calculation
  let dbMenuItems = [];
  try {
    const requestedIds = sanitizedItems.map(i => i.menuItemId);
    if (getIsMongoConnected()) {
      dbMenuItems = await MenuItem.find({ id: { $in: requestedIds } }).lean();
    }
    
    // Fallback/Merge: If MongoDB did not return all requested items, or is empty, fallback to the Local JSON DB
    if (dbMenuItems.length < requestedIds.length) {
      const localDb = await getLocalDB();
      const localItems = localDb.menuItems || [];
      const localItemsMap = new Map(localItems.map(item => [item.id, item]));
      
      const existingIds = new Set(dbMenuItems.map(item => item.id));
      for (const reqId of requestedIds) {
        if (!existingIds.has(reqId) && localItemsMap.has(reqId)) {
          dbMenuItems.push(localItemsMap.get(reqId));
        }
      }
    }
  } catch (err) {
    console.error('⚠️ Could not fetch menu items for availability verification:', err.message);
  }

  const menuItemMap = new Map(dbMenuItems.map(item => [item.id, item]));

  const unavailableItems = [];

  for (const item of sanitizedItems) {
    const dbItem = menuItemMap.get(item.menuItemId);
    if (!dbItem || dbItem.isAvailable === false) {
      unavailableItems.push(item.name || item.menuItemId);
    }
  }

  if (unavailableItems.length > 0) {
    return res.status(400).json({ 
      error: `عذراً، الأصناف التالية غير متوفرة أو غير صالحة حالياً: (${unavailableItems.join('، ')}). يرجى إزالتها من السلة لإتمام الطلب.` 
    });
  }

  // Server-Side Pricing Verification and Self-Correction (Source of Truth Protection)
  let expectedTotalSum = 0;
  for (const item of sanitizedItems) {
    const dbItem = menuItemMap.get(item.menuItemId);
    let basePrice = 0;
    
    if (dbItem) {
      if (typeof dbItem.price === 'number') {
        basePrice = dbItem.price;
      } else if (dbItem.price && typeof dbItem.price === 'object') {
        if (item.selectedSize && dbItem.price[item.selectedSize] !== undefined) {
          basePrice = Number(dbItem.price[item.selectedSize]);
        } else {
          // If a multi-size item lacks a size or has an invalid one, pick the first size's price
          const sizeKeys = Object.keys(dbItem.price);
          if (sizeKeys.length > 0) {
            basePrice = Number(dbItem.price[sizeKeys[0]]);
            item.selectedSize = sizeKeys[0]; // Auto-correct size selection
          }
        }
      }
    } else {
      // Fallback if DB menu is completely empty during initial startup
      basePrice = item.unitPrice;
    }

    // Securely calculate correct additions price
    let additionsSum = 0;
    item.additions.forEach(add => {
      const officialAddPrice = VALID_ADDITIONS[add.name] !== undefined ? VALID_ADDITIONS[add.name] : 0;
      add.price = officialAddPrice; // Hard override with server price
      additionsSum += officialAddPrice;
    });

    const expectedUnitPrice = basePrice + additionsSum;
    item.unitPrice = expectedUnitPrice; // Hard override with correct server calculation
    expectedTotalSum += expectedUnitPrice * item.quantity;
  }

  // Defensive sanitization of GPS Location coordinates with bounds checking
  let orderLocation = { latitude: 29.9328, longitude: 31.0261, accuracy: 100 };
  if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    const lat = location.latitude;
    const lng = location.longitude;
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      orderLocation = {
        latitude: lat,
        longitude: lng,
        accuracy: typeof location.accuracy === 'number' ? location.accuracy : 100
      };
    }
  }

  let finalOrderId = '';
  let savedToCloud = false;

  try {
    // 1. Save to MongoDB if connected
    if (getIsMongoConnected()) {
      try {
        const newOrder = new Order({
          customerName: cleanCustomerName,
          phoneNumber: cleanPhoneNumber,
          address: cleanAddress,
          location: orderLocation,
          items: sanitizedItems,
          totalPrice: expectedTotalSum, // Save secure recalculated price
          customNotes: cleanCustomNotes,
          status: 'pending'
        });

        await newOrder.save();
        finalOrderId = newOrder._id.toString();
        savedToCloud = true;
        console.log(`✅ Order ${finalOrderId} saved to Cloud MongoDB!`);
      } catch (err) {
        console.error('❌ Failed to save order to MongoDB in createOrder:', err.message);
      }
    }

    // 2. Generate a secure, randomized local ID if not saved to MongoDB
    if (!finalOrderId) {
      finalOrderId = 'ord-' + crypto.randomBytes(5).toString('hex').toUpperCase();
    }

    // 3. Save to Local JSON DB simultaneously (ensures 100% sync and redundancy)
    const db = await getLocalDB();
    const newOrderLocal = {
      _id: finalOrderId,
      customerName: cleanCustomerName,
      phoneNumber: cleanPhoneNumber,
      address: cleanAddress,
      location: orderLocation,
      items: sanitizedItems,
      totalPrice: expectedTotalSum, // Save secure recalculated price
      customNotes: cleanCustomNotes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.orders.unshift(newOrderLocal); // Add to top of local array
    await saveLocalDB(db);
    console.log(`✅ Order ${finalOrderId} synchronized and saved to Local JSON Database!`);

    // Emit real-time socket notification of new order
    const io = req.app.get('io');
    if (io) {
      io.emit('order-created', newOrderLocal);
    }

    return res.status(201).json({ 
      success: true, 
      orderId: finalOrderId, 
      message: savedToCloud 
        ? 'تم إرسال طلبك بنجاح وحفظه في خادم السحابة والنسخة الاحتياطية!' 
        : 'تم إرسال طلبك للمطبخ بنجاح وحفظه محلياً بنجاح.' 
    });

  } catch (error) {
    console.error('❌ createOrder general error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء معالجة وإرسال طلبك.' });
  }
}

/**
 * Dual Database Self-Healing Sync Algorithm.
 * Synchronizes records between MongoDB and the Local JSON file to maintain 100% parity.
 * Handles offline-created local orders, migrates them to MongoDB, and updates IDs.
 */
export async function syncOrdersWithMongo(io) {
  if (!getIsMongoConnected()) return;

  try {
    const localDB = await getLocalDB();
    let localUpdated = false;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Process any pending local deletions first (Tombstone synchronization)
    const processedDeletedIds = localDB.deletedOrderIds ? [...localDB.deletedOrderIds] : [];
    let successfullyDeletedIds = [];
    if (processedDeletedIds.length > 0) {
      try {
        const idsToDelete = processedDeletedIds.filter(id => id && !id.startsWith('ord-'));
        if (idsToDelete.length > 0) {
          await Order.deleteMany({ _id: { $in: idsToDelete } });
          console.log(`📡 [Self-Healing] Successfully executed remote deletion of cached IDs on MongoDB:`, idsToDelete);
        }
        successfullyDeletedIds = processedDeletedIds;
        localUpdated = true;
      } catch (delErr) {
        console.warn('⚠️ [Self-Healing] Could not push some local deletions to MongoDB (will retry next time):', delErr.message);
      }
    }

    const cloudOrders = await Order.find().lean();
    // Filter out any cloud orders that are in the deleted tombstones list to prevent any race conditions or zombie resurrections
    const activeCloudOrders = cloudOrders.filter(o => o && o._id && !processedDeletedIds.includes(o._id.toString()));
    
    const cloudMap = new Map();
    activeCloudOrders.forEach(o => {
      if (o && o._id) {
        cloudMap.set(o._id.toString(), o);
      }
    });

    const localOrders = localDB.orders || [];
    
    // Filter out any local orders that are present in deletedOrderIds (defensive fallback)
    const activeLocalOrders = localOrders.filter(o => {
      const idStr = o._id ? o._id.toString() : '';
      if (processedDeletedIds.includes(idStr)) {
        localUpdated = true;
        return false;
      }
      return true;
    });

    const updatedLocalList = [];

    for (const localOrd of activeLocalOrders) {
      const isTempId = typeof localOrd._id === 'string' && localOrd._id.startsWith('ord-');
      
      if (isTempId) {
        // This order was created offline! Let's upload it to MongoDB now.
        try {
          const newCloudOrder = new Order({
            customerName: localOrd.customerName,
            phoneNumber: localOrd.phoneNumber,
            address: localOrd.address,
            location: localOrd.location,
            items: localOrd.items,
            totalPrice: localOrd.totalPrice,
            customNotes: localOrd.customNotes,
            status: localOrd.status || 'pending',
            createdAt: localOrd.createdAt ? new Date(localOrd.createdAt) : new Date()
          });

          await newCloudOrder.save();
          console.log(`📡 [Self-Healing] Successfully migrated offline order to MongoDB: ${newCloudOrder._id}`);
          
          const oldId = localOrd._id;
          // Update local copy with the new Mongo ID to link them forever
          localOrd._id = newCloudOrder._id.toString();
          updatedLocalList.push(localOrd);
          localUpdated = true;

          // Notify clients in real-time about the permanent ID mapping change
          if (io) {
            io.emit('order-migrated', { oldId, newOrder: localOrd });
          }

          // Securely persist intermediate mapped ID in Local DB immediately to insure against subsequent failures/crashes
          try {
            const currentDb = await getLocalDB();
            if (currentDb.orders && Array.isArray(currentDb.orders)) {
              const orderIndex = currentDb.orders.findIndex(o => o._id === oldId);
              if (orderIndex !== -1) {
                currentDb.orders[orderIndex]._id = localOrd._id;
                await saveLocalDB(currentDb);
                console.log(`📡 [Self-Healing] Intermediate ID mapping persisted immediately: ${oldId} -> ${localOrd._id}`);
              }
            }
          } catch (saveLocErr) {
            console.error('❌ [Self-Healing] Failed to persist intermediate ID mapping:', saveLocErr.message);
          }
        } catch (saveErr) {
          console.error('❌ [Self-Healing] Failed to migrate offline order:', saveErr.message);
          updatedLocalList.push(localOrd);
        }
      } else {
        // Standard ID. Check if it exists in MongoDB.
        const idStr = localOrd._id ? localOrd._id.toString() : '';
        if (idStr && cloudMap.has(idStr)) {
          const cloudOrd = cloudMap.get(idStr);
          if (localOrd.statusModifiedLocally) {
            // Local status is newer/modified. Push it to MongoDB!
            try {
              await Order.findByIdAndUpdate(idStr, { status: localOrd.status });
              delete localOrd.statusModifiedLocally;
              localUpdated = true;
              console.log(`📡 [Self-Healing] Pushed locally modified status (${localOrd.status}) for order ${idStr} to Cloud.`);
              if (io) {
                io.emit('order-status-updated', { orderId: idStr, status: localOrd.status });
              }
            } catch (upErr) {
              console.error(`❌ [Self-Healing] Failed to push local status update for ${idStr}:`, upErr.message);
            }
          } else {
            // Sync status from cloud to local (Cloud is primary truth for status)
            if (localOrd.status !== cloudOrd.status) {
              localOrd.status = cloudOrd.status;
              localUpdated = true;
              if (io) {
                io.emit('order-status-updated', { orderId: idStr, status: cloudOrd.status });
              }
            }
          }
          updatedLocalList.push(localOrd);
        } else {
          // If it has a standard Mongo ID but is not in cloud, it means it was deleted from cloud
          // We should remove it from our local database to match the cloud's source of truth.
          // Do NOT re-upload it, which would cause deleted orders to zombie-resurrect on other devices/deployments.
          localUpdated = true;
          console.log(`📡 [Self-Healing] Standard order ${idStr} is missing from cloud. Removing locally to maintain sync.`);
        }
      }
    }

    // Now check if there are cloud orders missing from Local JSON DB
    const localIdSet = new Set(updatedLocalList.map(o => o._id ? o._id.toString() : ''));
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    for (const cloudOrd of activeCloudOrders) {
      const cloudIdStr = cloudOrd._id.toString();
      if (!localIdSet.has(cloudIdStr)) {
        // Keep backup in complete parity for active or completed/cancelled/rejected orders under 48 hours old
        if (['delivered', 'cancelled', 'rejected'].includes(cloudOrd.status)) {
          const cDate = cloudOrd.createdAt ? new Date(cloudOrd.createdAt) : new Date();
          if (cDate < fortyEightHoursAgo) {
            continue;
          }
        }
        if (cloudOrd.createdAt && new Date(cloudOrd.createdAt) < sevenDaysAgo) {
          continue;
        }

        // If this order is in the local tombstone deleted list, do NOT sync it back down!
        if (processedDeletedIds.includes(cloudIdStr)) {
          console.log(`📡 [Self-Healing] Skipping sync-down for deleted order: ${cloudIdStr}`);
          continue;
        }
        // Missing locally! Let's sync it down
        updatedLocalList.push({
          _id: cloudIdStr,
          customerName: cloudOrd.customerName,
          phoneNumber: cloudOrd.phoneNumber,
          address: cloudOrd.address,
          location: cloudOrd.location,
          items: cloudOrd.items,
          totalPrice: cloudOrd.totalPrice,
          customNotes: cloudOrd.customNotes,
          status: cloudOrd.status,
          createdAt: cloudOrd.createdAt 
            ? (cloudOrd.createdAt instanceof Date ? cloudOrd.createdAt.toISOString() : new Date(cloudOrd.createdAt).toISOString()) 
            : new Date().toISOString()
        });
        localUpdated = true;
        console.log(`📡 [Self-Healing] Syncing missing cloud order down to Local JSON: ${cloudIdStr}`);
      }
    }

    // Always strictly de-duplicate the resulting orders array to ensure 100% stability and prevent zombies/duplicates
    const seenIds = new Set();
    const deduplicatedList = [];
    for (const ord of updatedLocalList) {
      const oid = ord._id ? ord._id.toString() : '';
      if (oid) {
        if (!seenIds.has(oid)) {
          seenIds.add(oid);
          deduplicatedList.push(ord);
        } else {
          localUpdated = true; // Mark as updated to trigger database save
        }
      } else {
        deduplicatedList.push(ord);
      }
    }

    // Purge successfully deleted IDs from deletedOrderIds tombstone log
    localDB.deletedOrderIds = (localDB.deletedOrderIds || []).filter(id => !successfullyDeletedIds.includes(id));

    if (localUpdated || successfullyDeletedIds.length > 0) {
      localDB.orders = deduplicatedList;
      await saveLocalDB(localDB);
      console.log('✅ [Self-Healing] Databases are now in 100% sync (strictly de-duplicated and tombstones processed).');
    }
  } catch (err) {
    console.error('❌ [Self-Healing] General error during synchronization:', err.message);
  }
}

let lastOrdersSyncTime = 0;

/**
 * Fetch all orders (sorted by date descending, latest first).
 */
export async function getOrders(req, res) {
  try {
    await ensureMongoConnection();
    // Run background self-healing synchronization first
    // Throttled to run at most once every 5 minutes (300,000 ms) under high production traffic
    if (getIsMongoConnected() && (Date.now() - lastOrdersSyncTime > 300000)) {
      if (!ordersMutex.isLocked()) {
        lastOrdersSyncTime = Date.now();
        ordersMutex.lock().then(async () => {
          try {
            await syncOrdersWithMongo(req.app.get('io'));
          } catch (err) {
            console.error('Error in background syncOrdersWithMongo:', err);
          } finally {
            ordersMutex.unlock();
          }
        }).catch(err => {
          console.error('Failed to acquire orders lock for background sync:', err);
        });
      }
    }

    let allOrders = [];
    let isMongoSuccess = false;
    let localOrders = [];
    let deletedOrderIds = [];

    // Always fetch from Local JSON Database first as the instant offline-first view
    try {
      const db = await getLocalDB();
      localOrders = db.orders || [];
      deletedOrderIds = db.deletedOrderIds || [];
    } catch (e) {
      console.error('⚠️ Local DB read failed in getOrders:', e.message);
    }

    try {
      if (getIsMongoConnected()) {
        const cloudOrders = await Order.find().sort({ createdAt: -1 }).lean();
        const cloudMap = new Map(cloudOrders.map(o => [o._id.toString(), o]));
        
        // Merge strategy: Include all cloud orders.
        // Also merge any local orders that:
        // - Are offline-created (starts with 'ord-') and haven't synced yet
        // - Or have local-only status modifications that haven't synced to cloud yet
        const merged = [...cloudOrders];
        for (const localOrd of localOrders) {
          const localId = localOrd._id ? localOrd._id.toString() : '';
          if (!localId) continue;
          
          if (localId.startsWith('ord-')) {
            if (!cloudMap.has(localId)) {
              merged.push(localOrd);
            }
          } else if (localOrd.statusModifiedLocally) {
            const cloudOrd = cloudMap.get(localId);
            if (cloudOrd) {
              cloudOrd.status = localOrd.status;
            } else {
              merged.push(localOrd);
            }
          }
        }
        
        allOrders = merged;
        isMongoSuccess = true;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB getOrders failed, falling back to local JSON:', err.message);
    }

    // Fallback strictly to local orders if MongoDB query failed/timed out
    if (!isMongoSuccess) {
      allOrders = localOrders;
    }

    // De-duplicate orders with the same _id to ensure absolute consistency and exclude any deleted tombstones
    const seenIds = new Set();
    allOrders = allOrders.filter(o => {
      const id = o._id ? o._id.toString() : '';
      if (!id) return true;
      if (deletedOrderIds.includes(id)) return false; // Filter out deleted orders instantly
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    // Sort combined list by date descending (latest first) with robust NaN protection
    allOrders.sort((a, b) => {
      const valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const timeA = isNaN(valA) ? 0 : valA;
      const timeB = isNaN(valB) ? 0 : valB;
      return timeB - timeA;
    });

    return res.json(allOrders);
  } catch (error) {
    console.error('❌ getOrders general error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تحميل الطلبات.' });
  }
}

/**
 * Update an order's status (pending, preparing, delivered, cancelled).
 * Updates in BOTH databases simultaneously.
 */
export async function updateOrderStatus(req, res) {
  await ensureMongoConnection();
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'معرّف الطلب مطلوب.' });
  }

  const validStatuses = ['pending', 'preparing', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'حالة الطلب غير صالحة.' });
  }

  let updatedInCloud = false;

  try {
    // 1. Update in MongoDB if connected and ID is not a purely local ID
    if (!id.startsWith('ord-') && getIsMongoConnected()) {
      try {
        const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (updatedOrder) {
          updatedInCloud = true;
          console.log(`✅ Order ${id} status updated in MongoDB Cloud.`);
        }
      } catch (err) {
        console.warn('⚠️ MongoDB updateOrderStatus failed:', err.message);
      }
    }

    // 2. Always update in Local JSON DB to keep synced
    const db = await getLocalDB();
    const orderIdx = db.orders.findIndex((o) => o._id && id && o._id.toString() === id.toString());
    if (orderIdx !== -1) {
      db.orders[orderIdx].status = status;
      if (!updatedInCloud && !id.startsWith('ord-')) {
        db.orders[orderIdx].statusModifiedLocally = true;
      } else {
        delete db.orders[orderIdx].statusModifiedLocally;
      }
      await saveLocalDB(db);
      console.log(`✅ Order ${id} status updated in Local JSON DB (statusModifiedLocally: ${!updatedInCloud && !id.startsWith('ord-')}).`);
      
      const io = req.app.get('io');
      if (io) {
        io.emit('order-status-updated', { orderId: id, status });
      }
      
      return res.json({ 
        success: true, 
        order: db.orders[orderIdx], 
        message: 'تم تحديث حالة الطلب بنجاح في قاعدة البيانات المحلية والسحابية.' 
      });
    }

    if (updatedInCloud) {
      const io = req.app.get('io');
      if (io) {
        io.emit('order-status-updated', { orderId: id, status });
      }
      return res.json({ 
        success: true, 
        message: 'تم تحديث حالة الطلب بنجاح في قاعدة البيانات السحابية.' 
      });
    }

    return res.status(404).json({ error: 'لم يتم العثور على هذا الطلب لتحديثه.' });
  } catch (error) {
    console.error('❌ updateOrderStatus error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تحديث حالة الطلب.' });
  }
}

/**
 * Delete an order.
 * Deletes from BOTH databases simultaneously with tombstone persistence for self-healing.
 */
export async function deleteOrder(req, res) {
  await ensureMongoConnection();
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'معرّف الطلب مطلوب.' });
  }

  let deletedFromCloud = false;

  try {
    // 1. Fetch Local DB first and register deleted ID in tombstone log
    const db = await getLocalDB();
    if (id && !id.startsWith('ord-')) {
      if (!db.deletedOrderIds) {
        db.deletedOrderIds = [];
      }
      if (!db.deletedOrderIds.includes(id.toString())) {
        db.deletedOrderIds.push(id.toString());
      }
    }

    // 2. Delete from MongoDB if connected and not local-only ID
    if (id && !id.startsWith('ord-') && getIsMongoConnected()) {
      try {
        await Order.findByIdAndDelete(id);
        deletedFromCloud = true;
        
        // Since it's successfully deleted from MongoDB Cloud, we can clear it from local tombstone log
        if (db.deletedOrderIds) {
          db.deletedOrderIds = db.deletedOrderIds.filter((dId) => dId !== id.toString());
        }
        console.log(`✅ Order ${id} deleted from MongoDB Cloud.`);
      } catch (err) {
        console.error('⚠️ Delete order from MongoDB error:', err.message);
      }
    }

    // 3. Always delete from Local JSON DB to keep synced
    const initialCount = db.orders ? db.orders.length : 0;
    db.orders = (db.orders || []).filter((o) => !o._id || !id || o._id.toString() !== id.toString());
    const deletedCount = initialCount - db.orders.length;

    if (deletedCount > 0 || deletedFromCloud || (id && !id.startsWith('ord-'))) {
      await saveLocalDB(db);
      console.log(`✅ Order ${id} deleted/queued for deletion from Local JSON DB and MongoDB.`);
      
      const io = req.app.get('io');
      if (io) {
        io.emit('order-deleted', { orderId: id });
      }
      
      return res.json({ success: true, message: 'تم حذف الطلب بنجاح أو جدولته للحذف عند الاتصال بالإنترنت.' });
    }

    // Even if it was not found in local orders array, write the updated tombstone list to prevent any sync-back
    await saveLocalDB(db);

    return res.status(404).json({ error: 'لم يتم العثور على هذا الطلب لحذفه.' });
  } catch (error) {
    console.error('❌ deleteOrder error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء حذف الطلب.' });
  }
}

/**
 * Public order tracking endpoint.
 * Accepts `phone` query parameter and returns ONLY the orders for that specific phone number.
 * No password/token required, but strictly scoped to prevent reading other people's orders!
 */
export async function trackOrders(req, res) {
  try {
    await ensureMongoConnection();
    const { phone } = req.query;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'الرجاء إدخال رقم هاتف صحيح للبحث عن الطلبات.' });
    }

    const cleanPhone = cleanPhoneDigits(phone);
    if (!cleanPhone) {
      return res.status(400).json({ error: 'رقم الهاتف غير صالح.' });
    }

    let matchedOrders = [];
    let isMongoSuccess = false;
    let localMatched = [];
    let deletedOrderIds = [];

    // Fetch local matches first to keep tracking instant even if offline
    try {
      const db = await getLocalDB();
      deletedOrderIds = db.deletedOrderIds || [];
      if (db.orders && db.orders.length > 0) {
        localMatched = db.orders.filter(
          (o) => o.phoneNumber && cleanPhoneDigits(o.phoneNumber) === cleanPhone
        );
      }
    } catch (e) {
      console.error('⚠️ Local DB read failed in trackOrders:', e.message);
    }

    try {
      if (getIsMongoConnected()) {
        const cloudOrders = await Order.find({ phoneNumber: cleanPhone }).sort({ createdAt: -1 }).lean();
        const cloudMap = new Map(cloudOrders.map(o => [o._id.toString(), o]));
        
        // Merge cloud matches with pending local offline matches or local status updates
        const merged = [...cloudOrders];
        for (const localOrd of localMatched) {
          const localId = localOrd._id ? localOrd._id.toString() : '';
          if (!localId) continue;
          
          if (localId.startsWith('ord-')) {
            if (!cloudMap.has(localId)) {
              merged.push(localOrd);
            }
          } else if (localOrd.statusModifiedLocally) {
            const cloudOrd = cloudMap.get(localId);
            if (cloudOrd) {
              cloudOrd.status = localOrd.status;
            } else {
              merged.push(localOrd);
            }
          }
        }
        
        matchedOrders = merged;
        isMongoSuccess = true;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB trackOrders failed, falling back to local JSON:', err.message);
    }

    if (!isMongoSuccess) {
      matchedOrders = localMatched;
    }

    // De-duplicate orders and exclude any deleted tombstones
    const seenIds = new Set();
    matchedOrders = matchedOrders.filter(o => {
      const id = o._id ? o._id.toString() : '';
      if (!id) return true;
      if (deletedOrderIds.includes(id)) return false; // Filter out deleted orders instantly
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    // Sort by date descending with robust NaN protection
    matchedOrders.sort((a, b) => {
      const valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const timeA = isNaN(valA) ? 0 : valA;
      const timeB = isNaN(valB) ? 0 : valB;
      return timeB - timeA;
    });

    return res.json(matchedOrders);
  } catch (error) {
    console.error('❌ trackOrders general error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تعقب الطلبات.' });
  }
}

/**
 * Automatically cleans up old, completed, or cancelled orders.
 * Deletes:
 * 1. Rejected ('cancelled', 'rejected'), delivered/received ('delivered'), and pending/waiting ('pending', 'waiting') orders older than 48 hours.
 * 2. Any stale orders older than 7 days (including other unresolved ones).
 * Applies cleanup to both MongoDB and Local JSON Database.
 */
export async function autoCleanupOrders() {
  console.log('🧹 [Cleanup Task] Starting automatic database and local JSON file cleanup (48-hour threshold)...');
  await ensureMongoConnection();
  
  const fortyEightHoursAgo = new Date();
  fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    // ---- 1. CLEANUP MONGODB ----
    let deletedCountCloud = 0;
    if (getIsMongoConnected()) {
      try {
        const query = {
          $or: [
            { 
              status: { $in: ['delivered', 'cancelled', 'rejected', 'pending', 'waiting'] }, 
              createdAt: { $lt: fortyEightHoursAgo } 
            },
            { 
              createdAt: { $lt: sevenDaysAgo } 
            }
          ]
        };
        const result = await Order.deleteMany(query);
        deletedCountCloud = result.deletedCount || 0;
        console.log(`🧹 [Cleanup Task] Successfully deleted ${deletedCountCloud} orders from Cloud MongoDB.`);
      } catch (err) {
        console.error('❌ [Cleanup Task] Error deleting orders from MongoDB:', err.message);
      }
    }

    // ---- 2. CLEANUP LOCAL JSON DB ----
    try {
      const db = await getLocalDB();
      const initialCount = db.orders ? db.orders.length : 0;

      if (initialCount > 0) {
        // Filter local orders to keep ONLY active ones or ones not matching the 48-hour delete conditions
        db.orders = db.orders.filter(o => {
          const date = o.createdAt ? new Date(o.createdAt) : new Date();
          const isInvalidDate = isNaN(date.getTime());
          
          if (isInvalidDate) return false; // Clean up malformed entries

          // Check status: delete if delivered, cancelled, rejected, pending, or waiting and older than 48 hours
          if (['delivered', 'cancelled', 'rejected', 'pending', 'waiting'].includes(o.status)) {
            if (date < fortyEightHoursAgo) {
              return false;
            }
          }
          
          // Check date: delete if older than 7 days (failsafe for any unresolved stale orders)
          if (date < sevenDaysAgo) {
            return false;
          }
          
          return true; // Keep
        });

        const deletedCountLocal = initialCount - db.orders.length;
        if (deletedCountLocal > 0) {
          await saveLocalDB(db);
          console.log(`🧹 [Cleanup Task] Successfully deleted ${deletedCountLocal} orders from Local JSON file.`);
        } else {
          console.log('🧹 [Cleanup Task] No orders needed cleanup in Local JSON file.');
        }
      } else {
        console.log('🧹 [Cleanup Task] Local orders list is empty. No local cleanup needed.');
      }
    } catch (err) {
      console.error('❌ [Cleanup Task] Error cleaning up Local JSON file:', err.message);
    }
  } catch (err) {
    console.error('❌ [Cleanup Task] General error during cleanup execution:', err.message);
  }
}

