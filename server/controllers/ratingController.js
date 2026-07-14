import Rating from '../models/rating.js';
import { getIsMongoConnected, getLocalDB, saveLocalDB, ratingsMutex, ensureMongoConnection } from '../config/db.js';

/**
 * Self-Healing Ratings Sync Algorithm.
 * Synchronizes ratings between MongoDB Cloud and the Local JSON fallback file.
 * Handles offline ratings, uploading them when MongoDB becomes active, and downloading missing ones.
 */
async function syncRatingsWithMongo() {
  if (!getIsMongoConnected()) return;

  try {
    const localDB = await getLocalDB();
    const cloudRatings = await Rating.find({});
    
    const cloudMap = new Map();
    cloudRatings.forEach(r => {
      if (r && r._id) {
        cloudMap.set(r._id.toString(), r);
      }
    });

    const localRatings = localDB.ratings || [];
    let localUpdated = false;
    const updatedLocalList = [];

    for (const localRat of localRatings) {
      const isTempId = typeof localRat._id === 'string' && localRat._id.startsWith('rat-');
      
      if (isTempId) {
        // Upload offline rating to MongoDB
        try {
          const newCloudRating = new Rating({
            menuItemId: localRat.menuItemId,
            rating: localRat.rating,
            createdAt: localRat.createdAt ? new Date(localRat.createdAt) : new Date()
          });

          await newCloudRating.save();
          console.log(`📡 [Self-Healing] Successfully migrated offline rating to MongoDB: ${newCloudRating._id}`);
          
          localRat._id = newCloudRating._id.toString();
          updatedLocalList.push(localRat);
          localUpdated = true;
        } catch (saveErr) {
          console.error('❌ [Self-Healing] Failed to migrate offline rating:', saveErr.message);
          updatedLocalList.push(localRat);
        }
      } else {
        const idStr = localRat._id ? localRat._id.toString() : '';
        if (idStr && cloudMap.has(idStr)) {
          updatedLocalList.push(localRat);
        } else {
          // If it has a standard Mongo ID but is not in cloud, it means it was deleted from cloud
          // We should remove it from our local database to match the cloud's source of truth.
          // Do NOT re-upload it.
          localUpdated = true;
          console.log(`📡 [Self-Healing] Standard rating ${idStr} is missing from cloud. Removing locally to maintain sync.`);
        }
      }
    }

    // Sync cloud-only ratings down to Local JSON DB
    const localIdSet = new Set(updatedLocalList.map(r => r._id ? r._id.toString() : ''));
    for (const cloudRat of cloudRatings) {
      const cloudIdStr = cloudRat._id.toString();
      if (!localIdSet.has(cloudIdStr)) {
        updatedLocalList.push({
          _id: cloudIdStr,
          menuItemId: cloudRat.menuItemId,
          rating: cloudRat.rating,
          createdAt: cloudRat.createdAt ? cloudRat.createdAt.toISOString() : new Date().toISOString()
        });
        localUpdated = true;
        console.log(`📡 [Self-Healing] Syncing missing cloud rating down to Local JSON: ${cloudIdStr}`);
      }
    }

    if (localUpdated) {
      localDB.ratings = updatedLocalList;
      await saveLocalDB(localDB);
      console.log('✅ [Self-Healing] Ratings database is now in 100% sync.');
    }
  } catch (err) {
    console.error('❌ [Self-Healing] Ratings sync failed:', err.message);
  }
}

let lastRatingsSyncTime = 0;

/**
 * Fetch all ratings.
 */
export async function getRatings(req, res) {
  try {
    await ensureMongoConnection();
    // Sync in background if MongoDB is connected
    // Throttled to run at most once every 5 minutes (300,000 ms) under high traffic
    if (getIsMongoConnected() && (Date.now() - lastRatingsSyncTime > 300000)) {
      if (!ratingsMutex.isLocked()) {
        lastRatingsSyncTime = Date.now();
        ratingsMutex.lock().then(async () => {
          try {
            await syncRatingsWithMongo();
          } catch (err) {
            console.error('Error in background syncRatingsWithMongo:', err);
          } finally {
            ratingsMutex.unlock();
          }
        }).catch(err => {
          console.error('Failed to acquire ratings lock for background sync:', err);
        });
      }
    }

    let allRatings = [];
    let isMongoSuccess = false;

    try {
      if (getIsMongoConnected()) {
        const ratings = await Rating.find({});
        allRatings = ratings.map(r => r.toObject ? r.toObject() : r);
        isMongoSuccess = true;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB getRatings failed, falling back to local JSON:', err.message);
    }

    // If MongoDB is not connected, or fetching from MongoDB failed, fall back to Local JSON DB
    if (!isMongoSuccess) {
      try {
        const db = await getLocalDB();
        if (db.ratings && db.ratings.length > 0) {
          allRatings = db.ratings;
        }
      } catch (err) {
        console.error('⚠️ Local DB read failed:', err.message);
      }
    }

    // De-duplicate ratings with the same _id to ensure absolute consistency
    const seenIds = new Set();
    allRatings = allRatings.filter(r => {
      const id = r._id ? r._id.toString() : '';
      if (!id) return true;
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    return res.json(allRatings);
  } catch (error) {
    console.error('❌ getRatings general error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تحميل التقييمات.' });
  }
}

/**
 * Add a new meal rating.
 * Saves in BOTH MongoDB (if connected) and Local JSON DB simultaneously.
 */
export async function addRating(req, res) {
  await ensureMongoConnection();
  const { menuItemId, rating } = req.body;
  if (!menuItemId || rating === undefined || rating === null) {
    return res.status(400).json({ error: 'مطلوب تحديد معرف الأكلة والتقييم.' });
  }
  if (typeof menuItemId !== 'string') {
    return res.status(400).json({ error: 'معرف الأكلة يجب أن يكون نصاً صالحاً.' });
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5 || !Number.isInteger(numericRating)) {
    return res.status(400).json({ error: 'التقييم يجب أن يكون رقماً صحيحاً بين 1 و 5 نجوم.' });
  }

  let finalRatingId = '';
  let savedToCloud = false;

  try {
    // 1. Save to MongoDB if connected
    if (getIsMongoConnected()) {
      try {
        const newRating = new Rating({ 
          menuItemId, 
          rating: numericRating 
        });
        await newRating.save();
        finalRatingId = newRating._id.toString();
        savedToCloud = true;
        console.log(`✅ Rating ${finalRatingId} saved to MongoDB Cloud.`);
      } catch (err) {
        console.error('❌ Failed to save rating to MongoDB:', err.message);
      }
    }

    // 2. Generate custom ID if not saved to MongoDB
    if (!finalRatingId) {
      finalRatingId = 'rat-' + Math.random().toString(36).substring(2, 11);
    }

    // 3. Always save to Local JSON DB to keep synced
    const db = await getLocalDB();
    if (!db.ratings) db.ratings = [];
    
    const newRatingLocal = {
      _id: finalRatingId,
      menuItemId,
      rating: numericRating,
      createdAt: new Date().toISOString()
    };

    db.ratings.push(newRatingLocal);
    await saveLocalDB(db);
    console.log(`✅ Rating ${finalRatingId} saved to Local JSON Database.`);

    return res.status(201).json({ 
      success: true, 
      rating: newRatingLocal,
      message: savedToCloud ? 'تم تسجيل تقييمك بنجاح في قاعدة البيانات السحابية والمحلية.' : 'تم تسجيل تقييمك محلياً.' 
    });

  } catch (error) {
    console.error('❌ addRating error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء إضافة التقييم.' });
  }
}
