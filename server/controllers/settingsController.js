import Settings from '../models/settings.js';
import { getIsMongoConnected, getLocalDB, saveLocalDB, settingsMutex, ensureMongoConnection } from '../config/db.js';

/**
 * Fetch system settings (such as the default WhatsApp contact number).
 * Runs a self-healing synchronization algorithm to keep Local JSON and Cloud MongoDB aligned.
 */
export async function getSettings(req, res) {
  await ensureMongoConnection();
  let localSettings = { whatsappNumber: '201120751464' };
  let db = null;
  try {
    db = await getLocalDB();
    if (db.settings && db.settings.whatsappNumber) {
      localSettings = db.settings;
    }
  } catch (err) {
    console.error('⚠️ Failed to load local settings for sync:', err.message);
  }

  try {
    if (getIsMongoConnected()) {
      // 1. Fetch settings from MongoDB without holding a lock (extremely fast and concurrent-friendly)
      let dbSettings = await Settings.findOne({ key: 'general' });
      
      if (!dbSettings) {
        // Only lock when we must write/initialize a missing settings document
        await settingsMutex.lock();
        try {
          // Double-checked locking pattern to guarantee single initialization under race conditions
          dbSettings = await Settings.findOne({ key: 'general' });
          if (!dbSettings) {
            dbSettings = new Settings({ key: 'general', whatsappNumber: localSettings.whatsappNumber });
            await dbSettings.save();
            console.log('📡 [Self-Healing] Initialized MongoDB settings from Local JSON DB.');
          }
        } finally {
          settingsMutex.unlock();
        }
      } else if (dbSettings.whatsappNumber !== localSettings.whatsappNumber) {
        // Discrepancy detected! Synchronize only when needed, protected by a mutex
        await settingsMutex.lock();
        try {
          const freshDb = await getLocalDB();
          if (freshDb.settings && freshDb.settings.whatsappNumber !== dbSettings.whatsappNumber) {
            freshDb.settings = { whatsappNumber: dbSettings.whatsappNumber };
            await saveLocalDB(freshDb);
            console.log(`📡 [Self-Healing] Synced MongoDB settings (${dbSettings.whatsappNumber}) to Local JSON DB.`);
          }
        } catch (syncErr) {
          console.error('❌ Failed to sync settings locally:', syncErr.message);
        } finally {
          settingsMutex.unlock();
        }
      }

      return res.json(dbSettings);
    }
  } catch (err) {
    console.warn('⚠️ MongoDB getSettings failed, using local fallback:', err.message);
  }

  // Local JSON DB Fallback
  return res.json(localSettings);
}

/**
 * Update system settings (specifically the WhatsApp number).
 * Saves in BOTH MongoDB (if connected) and Local JSON DB simultaneously.
 */
export async function updateSettings(req, res) {
  await ensureMongoConnection();
  const { whatsappNumber } = req.body;
  if (!whatsappNumber) {
    return res.status(400).json({ error: 'رقم الواتساب مطلوب لتحديث الإعدادات.' });
  }
  if (typeof whatsappNumber !== 'string') {
    return res.status(400).json({ error: 'رقم الواتساب يجب أن يكون نصاً صالحاً.' });
  }

  const cleanWhatsapp = whatsappNumber.trim();
  let updatedInCloud = false;

  await settingsMutex.lock();
  try {
    // 1. Update in MongoDB if connected
    if (getIsMongoConnected()) {
      try {
        let dbSettings = await Settings.findOne({ key: 'general' });
        if (!dbSettings) {
          dbSettings = new Settings({ key: 'general', whatsappNumber: cleanWhatsapp });
        } else {
          dbSettings.whatsappNumber = cleanWhatsapp;
        }
        await dbSettings.save();
        updatedInCloud = true;
        console.log('✅ Settings updated in MongoDB Cloud.');
      } catch (err) {
        console.error('❌ Failed to update settings in MongoDB:', err.message);
      }
    }

    // 2. Always update in Local JSON DB to keep synced
    const db = await getLocalDB();
    db.settings = { whatsappNumber: cleanWhatsapp };
    await saveLocalDB(db);
    console.log('✅ Settings updated in Local JSON Database.');

    return res.json({ 
      success: true, 
      settings: db.settings, 
      message: updatedInCloud
        ? 'تم تحديث رقم واتساب المطعم بنجاح في قاعدة البيانات السحابية والمحلية.' 
        : 'تم تحديث رقم واتساب المطعم بنجاح محلياً.' 
    });

  } catch (error) {
    console.error('❌ updateSettings error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تحديث الإعدادات.' });
  } finally {
    settingsMutex.unlock();
  }
}
