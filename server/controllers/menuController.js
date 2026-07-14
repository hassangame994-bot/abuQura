import Category from '../models/category.js';
import MenuItem from '../models/menuItem.js';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '../config/seedMenu.js';
import { getIsMongoConnected, getLocalDB, saveLocalDB, dbMutex, ensureMongoConnection } from '../config/db.js';

let lastMenuSyncTime = 0;
const SYNC_INTERVAL_MS = 15000; // 15 seconds cache throttle to reduce heavy file system IO and DB hits

// Clean unique slug generator for categories or items
function generateSlug(text) {
  let slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]/g, '_') // Support Arabic letters & english alphanumeric
    .replace(/_+/g, '_');
  // Trim leading/trailing underscores
  slug = slug.replace(/^_+|_+$/g, '');
  return slug || 'item';
}

/**
 * Two-way Self-Healing synchronization between MongoDB Cloud and local JSON database backup.
 * Guarantees that any offline additions, edits, or custom uploads (like Base64 images)
 * are never wiped out and are safely migrated to MongoDB once connectivity resumes.
 * Incorporates robust Tombstone logs to synchronize deletions securely.
 */
export async function syncMenuWithMongo(force = false) {
  if (!getIsMongoConnected()) return;

  const now = Date.now();
  try {
    const localDb = await getLocalDB();

    const hasPendingChanges = 
      (localDb.deletedCategoryIds && localDb.deletedCategoryIds.length > 0) ||
      (localDb.deletedMenuItemIds && localDb.deletedMenuItemIds.length > 0) ||
      (localDb.categories && localDb.categories.some(c => c.isCreatedLocallyOffline || c.isModifiedLocally)) ||
      (localDb.menuItems && localDb.menuItems.some(m => m.isCreatedLocallyOffline || m.isModifiedLocally));

    // Throttled bypass: Skip full database scan and file rewrite if no pending offline changes exist and synced recently
    if (!force && !hasPendingChanges && (now - lastMenuSyncTime < SYNC_INTERVAL_MS)) {
      return;
    }

    let localUpdated = false;

    // 1. Process pending category deletions (Tombstone synchronization)
    const processedDeletedCategoryIds = localDb.deletedCategoryIds ? [...localDb.deletedCategoryIds] : [];
    let successfullyDeletedCategoryIds = [];
    if (processedDeletedCategoryIds.length > 0) {
      try {
        await Category.deleteMany({ id: { $in: processedDeletedCategoryIds } });
        console.log('📡 [Self-Healing] Deleted categories from MongoDB:', processedDeletedCategoryIds);
        successfullyDeletedCategoryIds = processedDeletedCategoryIds;
        localUpdated = true;
      } catch (err) {
        console.warn('⚠️ [Self-Healing] Failed to sync deleted categories to MongoDB:', err.message);
      }
    }

    // 2. Process pending menu item deletions (Tombstone synchronization)
    const processedDeletedMenuItemIds = localDb.deletedMenuItemIds ? [...localDb.deletedMenuItemIds] : [];
    let successfullyDeletedMenuItemIds = [];
    if (processedDeletedMenuItemIds.length > 0) {
      try {
        await MenuItem.deleteMany({ id: { $in: processedDeletedMenuItemIds } });
        console.log('📡 [Self-Healing] Deleted menu items from MongoDB:', processedDeletedMenuItemIds);
        successfullyDeletedMenuItemIds = processedDeletedMenuItemIds;
        localUpdated = true;
      } catch (err) {
        console.warn('⚠️ [Self-Healing] Failed to sync deleted menu items to MongoDB:', err.message);
      }
    }

    // 3. Sync Categories
    const cloudCategories = await Category.find({}).lean();
    // Filter out any cloud categories that are in the deleted tombstones list to prevent any race conditions or zombie resurrections
    const activeCloudCategories = cloudCategories.filter(c => c && c.id && !successfullyDeletedCategoryIds.includes(c.id));
    const cloudCatMap = new Map(activeCloudCategories.map(c => [c.id, c]));

    const localCategories = localDb.categories || [];
    const activeLocalCategories = localCategories.filter(c => c && c.id && !processedDeletedCategoryIds.includes(c.id));
    const updatedLocalCategories = [];

    // Push local categories to cloud if missing AND marked as created offline
    for (const localCat of activeLocalCategories) {
      if (!cloudCatMap.has(localCat.id)) {
        if (localCat.isCreatedLocallyOffline) {
          try {
            const newCloudCat = new Category({ id: localCat.id, name: localCat.name });
            await newCloudCat.save();
            console.log(`📡 [Self-Healing] Uploaded offline category to MongoDB: ${localCat.id}`);
            delete localCat.isCreatedLocallyOffline;
            localUpdated = true;
          } catch (err) {
            console.error(`❌ [Self-Healing] Failed to upload category ${localCat.id}:`, err.message);
          }
          updatedLocalCategories.push(localCat);
        } else {
          // If NOT marked as created offline, but missing from cloud, it was deleted on the cloud by another container/client
          console.log(`📡 [Self-Healing] Category ${localCat.id} was deleted from cloud, removing locally.`);
          localUpdated = true;
        }
      } else {
        const cloudCat = cloudCatMap.get(localCat.id);
        if (localCat.isCreatedLocallyOffline) {
          delete localCat.isCreatedLocallyOffline;
          localUpdated = true;
        }

        if (localCat.isModifiedLocally) {
          try {
            await Category.findOneAndUpdate({ id: localCat.id }, { name: localCat.name });
            delete localCat.isModifiedLocally;
            localUpdated = true;
            console.log(`📡 [Self-Healing] Pushed local category edit to MongoDB: ${localCat.id}`);
          } catch (err) {
            console.error(`❌ [Self-Healing] Failed to push local category edit for ${localCat.id}:`, err.message);
          }
          updatedLocalCategories.push(localCat);
        } else {
          // Sync changes from cloud to local (Cloud is primary truth for unmodified items)
          const cloudName = cloudCat.name || '';
          const localName = localCat.name || '';
          if (cloudName !== localName) {
            localCat.name = cloudName;
            localUpdated = true;
            console.log(`📡 [Self-Healing] Synced category name from cloud: ${localCat.id}`);
          }
          updatedLocalCategories.push(localCat);
        }
      }
    }

    // Pull missing cloud categories down to local
    const localCatSet = new Set(updatedLocalCategories.map(c => c.id));
    for (const cloudCat of activeCloudCategories) {
      if (!localCatSet.has(cloudCat.id)) {
        if (successfullyDeletedCategoryIds.includes(cloudCat.id)) {
          continue;
        }
        updatedLocalCategories.push({ id: cloudCat.id, name: cloudCat.name });
        localUpdated = true;
        console.log(`📡 [Self-Healing] Synced missing cloud category down: ${cloudCat.id}`);
      }
    }

    // 4. Sync Menu Items
    const cloudMenuItems = await MenuItem.find({}).lean();
    // Filter out any cloud menu items that are in the deleted tombstones list to prevent any race conditions or zombie resurrections
    const activeCloudMenuItems = cloudMenuItems.filter(m => m && m.id && !successfullyDeletedMenuItemIds.includes(m.id));
    const cloudItemMap = new Map(activeCloudMenuItems.map(m => [m.id, m]));

    const localMenuItems = localDb.menuItems || [];
    const activeLocalMenuItems = localMenuItems.filter(m => m && m.id && !processedDeletedMenuItemIds.includes(m.id));
    const updatedLocalMenuItems = [];

    for (const localItem of activeLocalMenuItems) {
      if (!cloudItemMap.has(localItem.id)) {
        if (localItem.isCreatedLocallyOffline) {
          // Created locally offline! Upload to cloud
          try {
            const newCloudItem = new MenuItem({
              id: localItem.id,
              name: localItem.name,
              category: localItem.category,
              price: localItem.price,
              sizes: localItem.sizes,
              description: localItem.description,
              image: localItem.image,
              isAvailable: localItem.isAvailable !== false
            });
            await newCloudItem.save();
            console.log(`📡 [Self-Healing] Uploaded offline menu item to MongoDB: ${localItem.id}`);
            delete localItem.isCreatedLocallyOffline;
            localUpdated = true;
          } catch (err) {
            console.error(`❌ [Self-Healing] Failed to upload menu item ${localItem.id}:`, err.message);
          }
          updatedLocalMenuItems.push(localItem);
        } else {
          // If NOT marked as created offline, but missing from cloud, it was deleted on cloud by another container/client
          console.log(`📡 [Self-Healing] Menu item ${localItem.id} was deleted from cloud, removing locally.`);
          localUpdated = true;
        }
      } else {
        const cloudItem = cloudItemMap.get(localItem.id);
        if (localItem.isCreatedLocallyOffline) {
          delete localItem.isCreatedLocallyOffline;
          localUpdated = true;
        }

        if (localItem.isModifiedLocally) {
          // Locally modified! Push update to cloud
          try {
            await MenuItem.findOneAndUpdate(
              { id: localItem.id },
              {
                $set: {
                  name: localItem.name,
                  category: localItem.category,
                  price: localItem.price,
                  sizes: localItem.sizes,
                  description: localItem.description,
                  image: localItem.image,
                  isAvailable: localItem.isAvailable !== false
                }
              }
            );
            delete localItem.isModifiedLocally;
            localUpdated = true;
            console.log(`📡 [Self-Healing] Pushed local menu item edit to MongoDB: ${localItem.id}`);
          } catch (err) {
            console.error(`❌ [Self-Healing] Failed to push local edit for ${localItem.id}:`, err.message);
          }
          updatedLocalMenuItems.push(localItem);
        } else {
          // Sync changes from cloud to local (Cloud is primary truth for unmodified items)
          // Normalize both cloud and local fields to prevent MongoDB undefined values from corrupting localDb backup
          const cloudName = cloudItem.name || '';
          const cloudCategory = cloudItem.category || '';
          const cloudPrice = cloudItem.price;
          const cloudSizes = cloudItem.sizes || [];
          const cloudDescription = cloudItem.description || '';
          const cloudImage = cloudItem.image || '';
          const cloudIsAvailable = cloudItem.isAvailable !== false;

          const localName = localItem.name || '';
          const localCategory = localItem.category || '';
          const localPrice = localItem.price;
          const localSizes = localItem.sizes || [];
          const localDescription = localItem.description || '';
          const localImage = localItem.image || '';
          const localIsAvailable = localItem.isAvailable !== false;

          let itemNeedsUpdate = false;
          const mergedItem = { ...localItem };

          if (cloudName !== localName) { mergedItem.name = cloudName; itemNeedsUpdate = true; }
          if (cloudCategory !== localCategory) { mergedItem.category = cloudCategory; itemNeedsUpdate = true; }
          if (JSON.stringify(cloudPrice) !== JSON.stringify(localPrice)) { mergedItem.price = cloudPrice; itemNeedsUpdate = true; }
          if (JSON.stringify(cloudSizes) !== JSON.stringify(localSizes)) { mergedItem.sizes = cloudSizes; itemNeedsUpdate = true; }
          if (cloudDescription !== localDescription) { mergedItem.description = cloudDescription; itemNeedsUpdate = true; }
          if (cloudImage !== localImage) { mergedItem.image = cloudImage; itemNeedsUpdate = true; }
          if (cloudIsAvailable !== localIsAvailable) { mergedItem.isAvailable = cloudIsAvailable; itemNeedsUpdate = true; }

          if (itemNeedsUpdate) {
            localUpdated = true;
            updatedLocalMenuItems.push({
              ...mergedItem,
              name: cloudName,
              category: cloudCategory,
              price: cloudPrice,
              sizes: cloudSizes,
              description: cloudDescription,
              image: cloudImage,
              isAvailable: cloudIsAvailable
            });
            console.log(`📡 [Self-Healing] Updated local menu item from cloud: ${localItem.id}`);
          } else {
            // Push sanitized local item to avoid any potential undefined fields in JSON backup
            updatedLocalMenuItems.push({
              ...localItem,
              name: localName,
              category: localCategory,
              price: localPrice,
              sizes: localSizes,
              description: localDescription,
              image: localImage,
              isAvailable: localIsAvailable
            });
          }
        }
      }
    }

    // Pull missing cloud menu items down to local
    const localItemSet = new Set(updatedLocalMenuItems.map(m => m.id));
    for (const cloudItem of activeCloudMenuItems) {
      if (!localItemSet.has(cloudItem.id)) {
        if (successfullyDeletedMenuItemIds.includes(cloudItem.id)) {
          continue;
        }
        updatedLocalMenuItems.push({
          id: cloudItem.id,
          name: cloudItem.name,
          category: cloudItem.category,
          price: cloudItem.price,
          sizes: cloudItem.sizes || [],
          description: cloudItem.description || '',
          image: cloudItem.image || '',
          isAvailable: cloudItem.isAvailable !== false
        });
        localUpdated = true;
        console.log(`📡 [Self-Healing] Synced missing cloud menu item down: ${cloudItem.id}`);
      }
    }

    // Purge successfully deleted IDs from local tombstone logs
    localDb.deletedCategoryIds = (localDb.deletedCategoryIds || []).filter(id => !successfullyDeletedCategoryIds.includes(id));
    localDb.deletedMenuItemIds = (localDb.deletedMenuItemIds || []).filter(id => !successfullyDeletedMenuItemIds.includes(id));

    const catDiff = JSON.stringify(localDb.categories) !== JSON.stringify(updatedLocalCategories);
    const itemDiff = JSON.stringify(localDb.menuItems) !== JSON.stringify(updatedLocalMenuItems);

    if (localUpdated || catDiff || itemDiff || successfullyDeletedCategoryIds.length > 0 || successfullyDeletedMenuItemIds.length > 0) {
      localDb.categories = updatedLocalCategories;
      localDb.menuItems = updatedLocalMenuItems;
      await saveLocalDB(localDb);
      console.log('✅ [Self-Healing] Menu databases are now in 100% sync (tombstones processed).');
    }
    lastMenuSyncTime = now;
  } catch (err) {
    console.error('❌ [Self-Healing] General error during menu synchronization:', err.message);
  }
}

/**
 * Fetch all categories and menu items.
 * Self-healing synchronization seeds database on startup/empty.
 */
export async function getMenu(req, res) {
  await ensureMongoConnection();
  
  let categories = [];
  let menuItems = [];
  let isMongoSuccess = false;
  
  try {
    if (getIsMongoConnected()) {
      // Execute self-healing synchronization in the background to prevent blocking customer requests under heavy load
      // Throttled to run at most once every 5 minutes (300,000 ms)
      if (Date.now() - lastMenuSyncTime > 300000) {
        if (!dbMutex.isLocked()) {
          lastMenuSyncTime = Date.now();
          dbMutex.lock().then(async () => {
            try {
              await syncMenuWithMongo();
            } catch (err) {
              console.error('Error in background syncMenuWithMongo:', err);
            } finally {
              dbMutex.unlock();
            }
          }).catch(err => {
            console.error('Failed to acquire menu lock for background sync:', err);
          });
        }
      }

      // Load Categories from MongoDB
      categories = await Category.find({}).lean();
      if (categories.length === 0) {
        // Seed MongoDB categories
        await dbMutex.lock();
        try {
          const count = await Category.countDocuments();
          if (count === 0) {
            await Category.insertMany(INITIAL_CATEGORIES);
            categories = await Category.find({}).lean();
            console.log('📡 [Self-Healing] Seeded initial categories into MongoDB.');
          }
        } finally {
          dbMutex.unlock();
        }
      }
      
      // Load Menu Items from MongoDB
      menuItems = await MenuItem.find({}).lean();
      if (menuItems.length === 0) {
        // Seed MongoDB menu items
        await dbMutex.lock();
        try {
          const count = await MenuItem.countDocuments();
          if (count === 0) {
            await MenuItem.insertMany(INITIAL_MENU_ITEMS);
            menuItems = await MenuItem.find({}).lean();
            console.log('📡 [Self-Healing] Seeded initial menu items into MongoDB.');
          }
        } finally {
          dbMutex.unlock();
        }
      }

      // Syncing local DB backup to match what is now in MongoDB is already handled safely inside syncMenuWithMongo().
      // Blindly overwriting localDb here would overwrite and wipe out any unsynced offline creations/modifications that failed to sync during syncMenuWithMongo().
      isMongoSuccess = true;
    }
  } catch (err) {
    console.warn('⚠️ MongoDB getMenu failed, falling back to local JSON:', err.message);
  }
  
  // Offline/Local Fallback DB mode or if Mongo queries failed
  if (!isMongoSuccess) {
    try {
      const localDb = await getLocalDB();
      let defaulted = false;
      if (!localDb.categories || localDb.categories.length === 0) {
        localDb.categories = INITIAL_CATEGORIES;
        defaulted = true;
      }
      if (!localDb.menuItems || localDb.menuItems.length === 0) {
        localDb.menuItems = INITIAL_MENU_ITEMS;
        defaulted = true;
      }
      
      if (defaulted) {
        // Always ensure they are saved if we defaulted them
        await dbMutex.lock();
        try {
          await saveLocalDB(localDb);
        } finally {
          dbMutex.unlock();
        }
      }
      
      categories = localDb.categories;
      menuItems = localDb.menuItems;
    } catch (fallbackErr) {
      console.error('❌ Failed to load offline menu fallback:', fallbackErr.message);
      categories = INITIAL_CATEGORIES;
      menuItems = INITIAL_MENU_ITEMS;
    }
  }
  
  try {
    // Normalize outputs to guarantee proper client consumption
    const cleanCategories = categories.map(c => ({ id: c.id, name: c.name }));
    const cleanMenuItems = menuItems.map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
      price: m.price,
      sizes: m.sizes || [],
      description: m.description || '',
      image: m.image || '',
      isAvailable: m.isAvailable !== false
    }));

    return res.json({ categories: cleanCategories, menuItems: cleanMenuItems });
  } catch (err) {
    console.error('❌ Error normalizing menu items:', err);
    return res.status(500).json({ error: 'عذراً، حدث خطأ أثناء جلب قائمة الطعام.' });
  }
}

/**
 * Create a new category (Admin-only).
 */
export async function addCategory(req, res) {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'اسم القسم مطلوب ويجب أن يكون نصاً صالحاً.' });
  }
  
  const trimmedName = name.trim();
  
  await ensureMongoConnection();
  await dbMutex.lock();
  
  try {
    const localDb = await getLocalDB();
    if (!localDb.categories) localDb.categories = [];
    
    // Check for duplicate category names (trimmed and case-insensitive)
    const duplicateExists = localDb.categories.some(
      cat => cat.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicateExists) {
      return res.status(400).json({ error: 'عذراً، هذا القسم موجود بالفعل في القائمة.' });
    }

    const id = 'cat_' + generateSlug(trimmedName) + '_' + Date.now().toString().slice(-4);
    const newCatData = { id, name: trimmedName };
    
    let uploaded = false;
    if (getIsMongoConnected()) {
      try {
        const category = new Category(newCatData);
        await category.save();
        uploaded = true;
      } catch (err) {
        console.warn('⚠️ MongoDB addCategory failed, will save offline:', err.message);
      }
    }
    
    if (!uploaded) {
      newCatData.isCreatedLocallyOffline = true;
    }
    
    localDb.categories.push(newCatData);
    await saveLocalDB(localDb);
    
    // Force refresh last sync time so next getMenu syncs properly
    lastMenuSyncTime = 0;

    return res.status(201).json({ success: true, category: newCatData });
  } catch (err) {
    console.error('❌ Error adding category:', err);
    return res.status(500).json({ error: 'عذراً، فشل إضافة القسم الجديد.' });
  } finally {
    dbMutex.unlock();
  }
}

/**
 * Edit a category (Admin-only).
 */
export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'معرّف القسم مطلوب.' });
  }

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'اسم القسم مطلوب ويجب أن يكون نصاً صالحاً.' });
  }

  await ensureMongoConnection();
  await dbMutex.lock();

  try {
    const localDb = await getLocalDB();
    const existingCat = (localDb.categories || []).find(c => c.id === id);

    if (!existingCat) {
      return res.status(404).json({ error: 'لم يتم العثور على هذا القسم لتعديله.' });
    }

    const updatedName = name.trim();

    let updatedInMongo = false;
    if (getIsMongoConnected()) {
      try {
        const result = await Category.findOneAndUpdate({ id }, { name: updatedName }, { new: true });
        if (result) {
          updatedInMongo = true;
        } else {
          console.log(`📡 [Self-Healing] Category ${id} not found in MongoDB. Saving locally and syncing later.`);
        }
      } catch (err) {
        console.warn('⚠️ MongoDB updateCategory failed, will defer sync:', err.message);
      }
    }

    // Update in Local Backup DB
    localDb.categories = localDb.categories.map(c => {
      if (c.id === id) {
        const merged = { ...c, name: updatedName };
        if (!updatedInMongo) {
          if (!merged.isCreatedLocallyOffline) {
            merged.isModifiedLocally = true;
          }
        } else {
          delete merged.isModifiedLocally;
        }
        return merged;
      }
      return c;
    });

    await saveLocalDB(localDb);
    lastMenuSyncTime = 0;

    return res.json({ success: true, category: { ...existingCat, name: updatedName } });
  } catch (err) {
    console.error('❌ Error updating category:', err);
    return res.status(500).json({ error: 'عذراً، فشل تعديل القسم.' });
  } finally {
    dbMutex.unlock();
  }
}

/**
 * Delete a category (Admin-only).
 */
export async function deleteCategory(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'معرّف القسم مطلوب.' });
  }

  await ensureMongoConnection();
  await dbMutex.lock();

  try {
    const localDb = await getLocalDB();
    const isOfflineCreated = (localDb.categories || []).some(c => c.id === id && c.isCreatedLocallyOffline);

    if (!isOfflineCreated) {
      if (!localDb.deletedCategoryIds) localDb.deletedCategoryIds = [];
      if (!localDb.deletedCategoryIds.includes(id)) {
        localDb.deletedCategoryIds.push(id);
      }

      if (getIsMongoConnected()) {
        try {
          await Category.deleteOne({ id });
          localDb.deletedCategoryIds = localDb.deletedCategoryIds.filter(cid => cid !== id);
        } catch (err) {
          console.warn('⚠️ MongoDB deleteCategory failed, will defer sync:', err.message);
        }
      }
    }

    localDb.categories = (localDb.categories || []).filter(c => c.id !== id);
    await saveLocalDB(localDb);
    
    lastMenuSyncTime = 0;

    return res.json({ success: true, message: 'تم حذف القسم بنجاح.' });
  } catch (err) {
    console.error('❌ Error deleting category:', err);
    return res.status(500).json({ error: 'عذراً، فشل حذف القسم.' });
  } finally {
    dbMutex.unlock();
  }
}

/**
 * Create a new menu item (Admin-only).
 */
export async function addMenuItem(req, res) {
  const { name, category, price, sizes, description, image } = req.body;
  
  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'الاسم، القسم، والسعر حقول مطلوبة.' });
  }

  if (typeof name !== 'string' || typeof category !== 'string' || 
      (description !== undefined && typeof description !== 'string') || 
      (image !== undefined && typeof image !== 'string')) {
    return res.status(400).json({ error: 'الحقول النصية المرسلة يجب أن تكون نصوصاً صالحة لضمان أمان النظام.' });
  }

  // Strictly normalize price object to ensure numeric size prices
  let parsedPrice = price;
  if (typeof price === 'object' && price !== null) {
    const normalizedPrice = {};
    for (const [key, val] of Object.entries(price)) {
      normalizedPrice[key] = typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : val;
    }
    parsedPrice = normalizedPrice;
  } else {
    parsedPrice = typeof price === 'string' && !isNaN(Number(price)) ? Number(price) : price;
  }

  const itemId = 'item_' + generateSlug(name.trim()) + '_' + Date.now().toString().slice(-4);
  const newItemData = {
    id: itemId,
    name: name.trim(),
    category,
    price: parsedPrice,
    sizes: Array.isArray(sizes) ? sizes : [],
    description: description ? description.trim() : '',
    image: image ? image.trim() : '',
    isAvailable: true
  };

  await ensureMongoConnection();
  await dbMutex.lock();

  try {
    let uploaded = false;
    if (getIsMongoConnected()) {
      try {
        const menuItem = new MenuItem(newItemData);
        await menuItem.save();
        uploaded = true;
      } catch (err) {
        console.warn('⚠️ MongoDB addMenuItem failed, will save offline:', err.message);
      }
    }

    if (!uploaded) {
      newItemData.isCreatedLocallyOffline = true;
    }

    // Update Local fallback
    const localDb = await getLocalDB();
    if (!localDb.menuItems) localDb.menuItems = [];
    localDb.menuItems.push(newItemData);
    await saveLocalDB(localDb);
    
    lastMenuSyncTime = 0;

    return res.status(201).json({ success: true, menuItem: newItemData });
  } catch (err) {
    console.error('❌ Error adding menu item:', err);
    return res.status(500).json({ error: 'عذراً، فشل إضافة الصنف الجديد.' });
  } finally {
    dbMutex.unlock();
  }
}

/**
 * Edit a menu item (Admin-only).
 */
export async function updateMenuItem(req, res) {
  const { id } = req.params;
  const { name, category, price, sizes, description, image, isAvailable } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'معرّف الصنف مطلوب.' });
  }

  if ((name !== undefined && typeof name !== 'string') || 
      (category !== undefined && typeof category !== 'string') || 
      (description !== undefined && typeof description !== 'string') || 
      (image !== undefined && typeof image !== 'string')) {
    return res.status(400).json({ error: 'الحقول النصية المرسلة يجب أن تكون نصوصاً صالحة لضمان أمان النظام.' });
  }

  await ensureMongoConnection();
  await dbMutex.lock();

  try {
    const localDb = await getLocalDB();
    const existingItem = (localDb.menuItems || []).find(item => item.id === id);

    if (!existingItem) {
      return res.status(404).json({ error: 'لم يتم العثور على هذا الصنف لتعديله.' });
    }

    // Build the updated object cleanly, only setting fields that are explicitly provided (not undefined)
    const updatedData = {};
    if (name !== undefined) updatedData.name = name.trim();
    if (category !== undefined) updatedData.category = category;
    if (price !== undefined) {
      if (typeof price === 'object' && price !== null) {
        const normalizedPrice = {};
        for (const [key, val] of Object.entries(price)) {
          normalizedPrice[key] = typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : val;
        }
        updatedData.price = normalizedPrice;
      } else {
        updatedData.price = typeof price === 'string' && !isNaN(Number(price)) ? Number(price) : price;
      }
    }
    if (sizes !== undefined) updatedData.sizes = Array.isArray(sizes) ? sizes : [];
    if (description !== undefined) updatedData.description = description.trim();
    if (image !== undefined) updatedData.image = image.trim();
    if (isAvailable !== undefined) updatedData.isAvailable = !!isAvailable;

    let updatedInMongo = false;
    // 1. Update in MongoDB if connected
    if (getIsMongoConnected()) {
      try {
        const result = await MenuItem.findOneAndUpdate({ id }, { $set: updatedData }, { new: true });
        if (result) {
          updatedInMongo = true;
        } else {
          console.log(`📡 [Self-Healing] Item ${id} not found in MongoDB. Saving locally and syncing later.`);
        }
      } catch (err) {
        console.warn('⚠️ MongoDB updateMenuItem failed, will defer sync:', err.message);
      }
    }

    // 2. Update in Local Backup DB
    localDb.menuItems = localDb.menuItems.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...updatedData };
        if (!updatedInMongo) {
          if (!merged.isCreatedLocallyOffline) {
            merged.isModifiedLocally = true;
          }
        } else {
          delete merged.isModifiedLocally;
        }
        return merged;
      }
      return item;
    });
    await saveLocalDB(localDb);
    
    lastMenuSyncTime = 0;

    return res.json({ success: true, menuItem: { ...existingItem, ...updatedData } });
  } catch (err) {
    console.error('❌ Error updating menu item:', err);
    return res.status(500).json({ error: 'عذراً، فشل تعديل الصنف.' });
  } finally {
    dbMutex.unlock();
  }
}

/**
 * Toggle menu item availability (Admin-only).
 */
export async function toggleMenuItemAvailability(req, res) {
  const { id } = req.params;
  const { isAvailable } = req.body;

  if (!id || isAvailable === undefined) {
    return res.status(400).json({ error: 'البيانات غير مكتملة لتحديث حالة التوفر.' });
  }

  await ensureMongoConnection();
  await dbMutex.lock();

  try {
    let updatedInMongo = false;
    if (getIsMongoConnected()) {
      try {
        const result = await MenuItem.findOneAndUpdate({ id }, { isAvailable: !!isAvailable }, { new: true });
        if (result) {
          updatedInMongo = true;
        } else {
          console.log(`📡 [Self-Healing] Item ${id} not found in MongoDB for availability toggle.`);
        }
      } catch (err) {
        console.warn('⚠️ MongoDB toggle availability failed, will defer sync:', err.message);
      }
    }

    const localDb = await getLocalDB();
    localDb.menuItems = (localDb.menuItems || []).map(item => {
      if (item.id === id) {
        const merged = { ...item, isAvailable: !!isAvailable };
        if (!updatedInMongo) {
          if (!merged.isCreatedLocallyOffline) {
            merged.isModifiedLocally = true;
          }
        } else {
          delete merged.isModifiedLocally;
        }
        return merged;
      }
      return item;
    });
    await saveLocalDB(localDb);
    
    lastMenuSyncTime = 0;

    return res.json({ success: true, isAvailable: !!isAvailable });
  } catch (err) {
    console.error('❌ Error toggling item availability:', err);
    return res.status(500).json({ error: 'عذراً، فشل تحديث حالة توفر الصنف.' });
  } finally {
    dbMutex.unlock();
  }
}

/**
 * Delete a menu item (Admin-only).
 */
export async function deleteMenuItem(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'معرّف الصنف مطلوب.' });
  }

  await ensureMongoConnection();
  await dbMutex.lock();

  try {
    const localDb = await getLocalDB();
    const isOfflineCreated = (localDb.menuItems || []).some(item => item.id === id && item.isCreatedLocallyOffline);

    if (!isOfflineCreated) {
      if (!localDb.deletedMenuItemIds) localDb.deletedMenuItemIds = [];
      if (!localDb.deletedMenuItemIds.includes(id)) {
        localDb.deletedMenuItemIds.push(id);
      }

      if (getIsMongoConnected()) {
        try {
          await MenuItem.deleteOne({ id });
          localDb.deletedMenuItemIds = localDb.deletedMenuItemIds.filter(mid => mid !== id);
        } catch (err) {
          console.warn('⚠️ MongoDB deleteMenuItem failed, will defer sync:', err.message);
        }
      }
    }

    localDb.menuItems = (localDb.menuItems || []).filter(item => item.id !== id);
    await saveLocalDB(localDb);
    
    lastMenuSyncTime = 0;

    return res.json({ success: true, message: 'تم حذف الصنف بنجاح.' });
  } catch (err) {
    console.error('❌ Error deleting menu item:', err);
    return res.status(500).json({ error: 'عذراً، فشل حذف الصنف من قائمة الطعام.' });
  } finally {
    dbMutex.unlock();
  }
}
