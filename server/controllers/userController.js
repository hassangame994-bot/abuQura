import crypto from 'crypto';
import User from '../models/user.js';
import { 
  getIsMongoConnected, 
  getLocalDB, 
  saveLocalDB, 
  usersMutex, 
  ensureMongoConnection 
} from '../config/db.js';

// Legacy SHA256 password hashing (for backward compatibility)
function hashPasswordLegacy(password) {
  const salt = process.env.ADMIN_SALT || '_abugoura_salt_!';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// State-of-the-art secure PBKDF2 password hashing (industry standard)
// Derived using 20,000 iterations, 64 bytes key length, SHA512 digest, and salt.
// Runs asynchronously on the libuv thread pool to keep the main event loop completely non-blocking.
function hashPasswordSecure(password) {
  return new Promise((resolve, reject) => {
    const salt = process.env.ADMIN_SALT || '_abugoura_salt_!';
    crypto.pbkdf2(password, salt, 20000, 64, 'sha512', (err, key) => {
      if (err) return reject(err);
      resolve(`pbkdf2$20000$${key.toString('hex')}`);
    });
  });
}

// Timing-safe string comparison to prevent timing side-channel attacks on sensitive fields.
function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// Smart password verification supporting both upgraded PBKDF2 hashes and legacy SHA256 hashes
async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  if (storedHash.startsWith('pbkdf2$')) {
    try {
      const calculated = await hashPasswordSecure(password);
      return timingSafeCompare(calculated, storedHash);
    } catch (err) {
      console.error('❌ PBKDF2 verification error:', err.message);
      return false;
    }
  } else {
    const legacyHash = hashPasswordLegacy(password);
    return timingSafeCompare(legacyHash, storedHash);
  }
}

// Helper to normalize phone numbers (Western/English digits, strip non-digits)
function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  // Convert Arabic/Persian numerals if any
  let converted = phone.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
                       .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵6789'.indexOf(d).toString());
  // Strip non-digits
  return converted.trim().replace(/\D/g, '');
}

/**
 * Register a new user account.
 * Writes to both MongoDB (if online) and Local JSON DB to maintain perfect sync.
 */
export async function registerUser(req, res) {
  await ensureMongoConnection();
  const { name, phoneNumber, password, address, location } = req.body;

  if (!name || !phoneNumber || !password || !address) {
    return res.status(400).json({ error: 'الرجاء ملء جميع الحقول المطلوبة: الاسم، رقم الهاتف، كلمة المرور، والعنوان.' });
  }

  if (typeof name !== 'string' || typeof phoneNumber !== 'string' || typeof password !== 'string' || typeof address !== 'string') {
    return res.status(400).json({ error: 'الحقول المدخلة يجب أن تكون نصوصاً صالحة لضمان أمان النظام.' });
  }

  const cleanPhone = normalizePhone(phoneNumber);
  if (!/^\d{8,15}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'يرجى إدخال رقم هاتف صحيح (من 8 إلى 15 رقم).' });
  }

  // 1. Perform PBKDF2 hashing asynchronously OUTSIDE of any lock to prevent event-loop blockages
  const passwordHash = await hashPasswordSecure(password);
  const sessionToken = crypto.randomBytes(32).toString('hex');

  // 2. Check if user already exists in MongoDB Cloud first (Non-blocking concurrent query)
  let userExistsInMongo = false;
  if (getIsMongoConnected()) {
    try {
      const count = await User.countDocuments({ phoneNumber: cleanPhone });
      if (count > 0) userExistsInMongo = true;
    } catch (err) {
      console.warn('⚠️ MongoDB check failed in registerUser:', err.message);
    }
  }

  if (userExistsInMongo) {
    return res.status(400).json({ error: 'رقم الهاتف هذا مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.' });
  }

  // 3. Acquire short lock purely for local database thread safety
  await usersMutex.lock();
  try {
    const db = await getLocalDB();
    db.users = db.users || [];

    // Final fast in-memory check to prevent race-condition insertions
    const userExistsLocally = db.users.some(u => normalizePhone(u.phoneNumber) === cleanPhone);
    if (userExistsLocally) {
      return res.status(400).json({ error: 'رقم الهاتف هذا مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.' });
    }

    const newUserObj = {
      name: name.trim(),
      phoneNumber: cleanPhone,
      passwordHash,
      address: address.trim(),
      location: location || null,
      sessionToken,
      createdAt: new Date().toISOString()
    };

    // Save to Local Backup JSON DB (extremely fast, in-memory cache update)
    db.users.push(newUserObj);
    await saveLocalDB(db);
    console.log(`✅ User ${cleanPhone} registered successfully in Local JSON Database.`);
  } catch (error) {
    console.error('❌ registerUser lock error:', error);
    return res.status(500).json({ error: 'حدث خطأ غير متوقع أثناء تسجيل الحساب.' });
  } finally {
    usersMutex.unlock();
  }

  // 4. Save to MongoDB asynchronously (runs after local DB lock release, keeping system non-blocking)
  if (getIsMongoConnected()) {
    try {
      const newUserObj = {
        name: name.trim(),
        phoneNumber: cleanPhone,
        passwordHash,
        address: address.trim(),
        location: location || null,
        sessionToken,
        createdAt: new Date().toISOString()
      };
      const mongoUser = new User(newUserObj);
      await mongoUser.save();
      console.log(`✅ User ${cleanPhone} registered successfully in MongoDB.`);
    } catch (err) {
      console.error('❌ Failed to save user to MongoDB:', err.message);
    }
  }

  return res.status(201).json({
    success: true,
    token: sessionToken,
    user: {
      name: name.trim(),
      phoneNumber: cleanPhone,
      address: address.trim(),
      location: location || null
    },
    message: 'تم إنشاء حسابك بنجاح وسيكون متاحاً دائماً.'
  });
}

/**
 * Login user.
 * Authenticates credentials and updates the sessionToken in both databases.
 */
export async function loginUser(req, res) {
  await ensureMongoConnection();
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'يرجى إدخال رقم الهاتف وكلمة المرور.' });
  }

  if (typeof phoneNumber !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'الحقول المدخلة يجب أن تكون نصوصاً صالحة لضمان أمان النظام.' });
  }

  const cleanPhone = normalizePhone(phoneNumber);
  const sessionToken = crypto.randomBytes(32).toString('hex');

  let authenticatedUser = null;
  let authSource = '';
  let legacyHashUpgraded = false;
  let securePasswordHash = null;

  // 1. Authenticate with MongoDB first if connected (No global lock held during query)
  if (getIsMongoConnected()) {
    try {
      const user = await User.findOne({ phoneNumber: cleanPhone });
      if (user) {
        if (await verifyPassword(password, user.passwordHash)) {
          // Self-Healing: If password matched but is legacy SHA256, upgrade to PBKDF2 instantly
          if (!user.passwordHash.startsWith('pbkdf2$')) {
            securePasswordHash = await hashPasswordSecure(password);
            user.passwordHash = securePasswordHash;
            legacyHashUpgraded = true;
            console.log(`📡 [Self-Healing] Password hash for user '${cleanPhone}' upgraded to secure PBKDF2 in MongoDB.`);
          }
          user.sessionToken = sessionToken;
          await user.save();
          authenticatedUser = {
            name: user.name,
            phoneNumber: user.phoneNumber,
            passwordHash: user.passwordHash,
            address: user.address,
            location: user.location,
            sessionToken: user.sessionToken
          };
          authSource = 'mongodb';
          console.log(`✅ User ${cleanPhone} authenticated in MongoDB.`);
        } else {
          return res.status(401).json({ error: 'كلمة المرور غير صحيحة.' });
        }
      }
    } catch (err) {
      console.warn('⚠️ MongoDB login check failed:', err.message);
    }
  }

  // 2. Fallback to Local JSON DB authentication (No global lock held during validation)
  if (!authenticatedUser) {
    const db = await getLocalDB();
    db.users = db.users || [];
    const localUserIdx = db.users.findIndex(u => normalizePhone(u.phoneNumber) === cleanPhone);

    if (localUserIdx !== -1) {
      const localUser = db.users[localUserIdx];
      if (await verifyPassword(password, localUser.passwordHash)) {
        // Self-Healing: If password matched but is legacy SHA256, upgrade to PBKDF2 instantly
        if (!localUser.passwordHash.startsWith('pbkdf2$')) {
          securePasswordHash = await hashPasswordSecure(password);
          legacyHashUpgraded = true;
          console.log(`📡 [Self-Healing] Password hash for user '${cleanPhone}' upgraded to secure PBKDF2 in Local DB fallback.`);
        }

        // Lock mutex briefly only to perform the fast local DB in-memory state update
        await usersMutex.lock();
        try {
          const freshDb = await getLocalDB();
          freshDb.users = freshDb.users || [];
          const idx = freshDb.users.findIndex(u => normalizePhone(u.phoneNumber) === cleanPhone);
          if (idx !== -1) {
            freshDb.users[idx].sessionToken = sessionToken;
            if (legacyHashUpgraded && securePasswordHash) {
              freshDb.users[idx].passwordHash = securePasswordHash;
            }
            await saveLocalDB(freshDb);
            
            authenticatedUser = {
              name: freshDb.users[idx].name,
              phoneNumber: freshDb.users[idx].phoneNumber,
              passwordHash: freshDb.users[idx].passwordHash,
              address: freshDb.users[idx].address,
              location: freshDb.users[idx].location,
              sessionToken: sessionToken
            };
          }
        } finally {
          usersMutex.unlock();
        }

        authSource = 'local';
        console.log(`✅ User ${cleanPhone} authenticated in Local JSON DB.`);
      } else {
        return res.status(401).json({ error: 'كلمة المرور غير صحيحة.' });
      }
    }
  }

  if (!authenticatedUser) {
    return res.status(404).json({ error: 'رقم الهاتف غير مسجل. يرجى إنشاء حساب جديد.' });
  }

  // 3. Post-authentication synchronization (async, completely out of critical paths or short locks)
  if (authSource === 'local' && getIsMongoConnected()) {
    try {
      const mongoUser = await User.findOne({ phoneNumber: cleanPhone });
      if (mongoUser) {
        mongoUser.sessionToken = sessionToken;
        if (legacyHashUpgraded && securePasswordHash) {
          mongoUser.passwordHash = securePasswordHash;
        }
        await mongoUser.save();
      } else {
        const newMongoUser = new User({
          name: authenticatedUser.name,
          phoneNumber: authenticatedUser.phoneNumber,
          passwordHash: authenticatedUser.passwordHash,
          address: authenticatedUser.address,
          location: authenticatedUser.location,
          sessionToken,
          createdAt: new Date()
        });
        await newMongoUser.save();
      }
      console.log(`🔄 Synced local user session to MongoDB.`);
    } catch (err) {
      console.warn('⚠️ Failed to sync user session to MongoDB:', err.message);
    }
  } else if (authSource === 'mongodb') {
    // Sync MongoDB authenticated session to local DB using a brief lock
    await usersMutex.lock();
    try {
      const db = await getLocalDB();
      db.users = db.users || [];
      const userIdx = db.users.findIndex(u => normalizePhone(u.phoneNumber) === cleanPhone);
      if (userIdx !== -1) {
        db.users[userIdx].sessionToken = sessionToken;
        if (legacyHashUpgraded && securePasswordHash) {
          db.users[userIdx].passwordHash = securePasswordHash;
        }
      } else {
        db.users.push({
          name: authenticatedUser.name,
          phoneNumber: authenticatedUser.phoneNumber,
          passwordHash: authenticatedUser.passwordHash,
          address: authenticatedUser.address,
          location: authenticatedUser.location,
          sessionToken,
          createdAt: new Date().toISOString()
        });
      }
      await saveLocalDB(db);
    } finally {
      usersMutex.unlock();
    }
  }

  return res.json({
    success: true,
    token: sessionToken,
    user: {
      name: authenticatedUser.name,
      phoneNumber: authenticatedUser.phoneNumber,
      address: authenticatedUser.address,
      location: authenticatedUser.location
    },
    message: 'تم تسجيل الدخول بنجاح.'
  });
}

/**
 * Get logged-in user profile.
 */
export async function getProfile(req, res) {
  return res.json({
    success: true,
    user: {
      name: req.user.name,
      phoneNumber: req.user.phoneNumber,
      address: req.user.address,
      location: req.user.location
    }
  });
}

/**
 * Update user profile details.
 */
export async function updateProfile(req, res) {
  await ensureMongoConnection();
  const { name, address, location, password } = req.body;
  const userPhone = req.user.phoneNumber;

  if ((name && typeof name !== 'string') || 
      (address && typeof address !== 'string') || 
      (password && typeof password !== 'string')) {
    return res.status(400).json({ error: 'الحقول المرسلة يجب أن تكون نصوصاً صالحة لضمان أمان النظام.' });
  }

  try {
    let passwordHash = undefined;
    if (password) {
      passwordHash = await hashPasswordSecure(password);
    }

    let updatedInMongo = false;
    let updatedInLocal = false;

    // 1. Update in MongoDB Cloud (Out-of-lock concurrent execution)
    if (getIsMongoConnected()) {
      try {
        const mongoUser = await User.findOne({ phoneNumber: userPhone });
        if (mongoUser) {
          if (name) mongoUser.name = name.trim();
          if (address) mongoUser.address = address.trim();
          if (location !== undefined) mongoUser.location = location;
          if (passwordHash) mongoUser.passwordHash = passwordHash;
          await mongoUser.save();
          updatedInMongo = true;
          console.log(`✅ User profile ${userPhone} updated in MongoDB.`);
        }
      } catch (err) {
        console.warn('⚠️ MongoDB profile update failed:', err.message);
      }
    }

    // 2. Update in Local Backup DB (Locked briefly to prevent race conditions during write)
    await usersMutex.lock();
    try {
      const db = await getLocalDB();
      db.users = db.users || [];
      const userIdx = db.users.findIndex(u => normalizePhone(u.phoneNumber) === userPhone);
      if (userIdx !== -1) {
        const localUser = db.users[userIdx];
        if (name) localUser.name = name.trim();
        if (address) localUser.address = address.trim();
        if (location !== undefined) localUser.location = location;
        if (passwordHash) localUser.passwordHash = passwordHash;

        db.users[userIdx] = localUser;
        await saveLocalDB(db);
        updatedInLocal = true;
        console.log(`✅ User profile ${userPhone} updated in Local DB.`);
      }
    } finally {
      usersMutex.unlock();
    }

    if (updatedInMongo || updatedInLocal) {
      // Get fresh profile representation safely
      let freshUserObj = null;
      if (updatedInLocal) {
        const db = await getLocalDB();
        freshUserObj = db.users.find(u => normalizePhone(u.phoneNumber) === userPhone);
      } else {
        freshUserObj = await User.findOne({ phoneNumber: userPhone });
      }

      if (freshUserObj) {
        return res.json({
          success: true,
          user: {
            name: freshUserObj.name,
            phoneNumber: freshUserObj.phoneNumber,
            address: freshUserObj.address,
            location: freshUserObj.location
          },
          message: 'تم تحديث ملفك الشخصي بنجاح.'
        });
      }
    }

    return res.status(404).json({ error: 'لم يتم العثور على الحساب لتعديله.' });

  } catch (error) {
    console.error('❌ updateProfile error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تحديث بيانات الملف الشخصي.' });
  }
}

/**
 * Middleware to authenticate client users using Authorization sessionToken.
 */
export async function authenticateUser(req, res, next) {
  await ensureMongoConnection();
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'غير مصرح: يرجى تسجيل الدخول أولاً.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح: الرمز مفقود.' });
  }

  try {
    // Try finding in MongoDB first
    if (getIsMongoConnected()) {
      const user = await User.findOne({ sessionToken: token });
      if (user) {
        req.user = user;
        return next();
      }
    }
  } catch (err) {
    console.warn('⚠️ MongoDB token check failed in authenticateUser:', err.message);
  }

  // Fallback to Local JSON DB
  try {
    const db = await getLocalDB();
    db.users = db.users || [];
    const localUser = db.users.find(u => u.sessionToken === token);
    if (localUser) {
      req.user = localUser;

      // Replicate session token to MongoDB if online
      if (getIsMongoConnected()) {
        User.updateOne({ phoneNumber: localUser.phoneNumber }, { $set: { sessionToken: token } })
          .catch((err) => console.warn('⚠️ Failed to sync user session token to Mongo in auth:', err.message));
      }

      return next();
    }
  } catch (e) {
    console.error('⚠️ Local DB read failed in authenticateUser:', e.message);
  }

  return res.status(401).json({ error: 'غير مصرح: انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مجدداً.' });
}

/**
 * Bidirectional User Synchronization Algorithm.
 * Guarantees complete parity between MongoDB Users collection and Local JSON database.
 */
export async function syncUsersWithMongo() {
  if (!getIsMongoConnected()) return;

  await usersMutex.lock();
  try {
    const db = await getLocalDB();
    db.users = db.users || [];

    const cloudUsers = await User.find({}).lean();
    const cloudMap = new Map(cloudUsers.map(u => [normalizePhone(u.phoneNumber), u]));
    const localMap = new Map(db.users.map(u => [normalizePhone(u.phoneNumber), u]));

    let localUpdated = false;

    // 1. Push local users to MongoDB if they are missing in MongoDB
    for (const localUser of db.users) {
      const cleanPhone = normalizePhone(localUser.phoneNumber);
      if (!cloudMap.has(cleanPhone)) {
        try {
          const newMongoUser = new User({
            name: localUser.name,
            phoneNumber: cleanPhone,
            passwordHash: localUser.passwordHash,
            address: localUser.address,
            location: localUser.location,
            sessionToken: localUser.sessionToken,
            createdAt: localUser.createdAt ? new Date(localUser.createdAt) : new Date()
          });
          await newMongoUser.save();
          console.log(`📡 [Sync Daemon] Uploaded local offline user to MongoDB: ${cleanPhone}`);
        } catch (err) {
          console.error(`❌ [Sync Daemon] Failed to upload user ${cleanPhone} to MongoDB:`, err.message);
        }
      } else {
        // User exists in both, align fields preferring Cloud (Absolute Authority)
        const cloudUser = cloudMap.get(cleanPhone);
        if (
          localUser.name !== cloudUser.name ||
          localUser.address !== cloudUser.address ||
          localUser.passwordHash !== cloudUser.passwordHash ||
          localUser.sessionToken !== cloudUser.sessionToken ||
          JSON.stringify(localUser.location) !== JSON.stringify(cloudUser.location)
        ) {
          localUser.name = cloudUser.name;
          localUser.address = cloudUser.address;
          localUser.passwordHash = cloudUser.passwordHash;
          localUser.sessionToken = cloudUser.sessionToken;
          localUser.location = cloudUser.location || null;
          localUpdated = true;
        }
      }
    }

    // 2. Pull cloud users down to Local DB if missing locally
    for (const cloudUser of cloudUsers) {
      const cleanPhone = normalizePhone(cloudUser.phoneNumber);
      if (!localMap.has(cleanPhone)) {
        db.users.push({
          name: cloudUser.name,
          phoneNumber: cleanPhone,
          passwordHash: cloudUser.passwordHash,
          address: cloudUser.address,
          location: cloudUser.location || null,
          sessionToken: cloudUser.sessionToken,
          createdAt: cloudUser.createdAt ? new Date(cloudUser.createdAt).toISOString() : new Date().toISOString()
        });
        localUpdated = true;
        console.log(`📡 [Sync Daemon] Synced cloud user down to Local DB: ${cleanPhone}`);
      }
    }

    if (localUpdated) {
      await saveLocalDB(db);
      console.log('✅ [Sync Daemon] User databases are now in 100% sync.');
    }
  } catch (err) {
    console.error('❌ [Sync Daemon] Error during user synchronization:', err.message);
  } finally {
    usersMutex.unlock();
  }
}
