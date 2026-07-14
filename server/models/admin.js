import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  securityCodeHash: { type: String }, // Hashed recovery code for secure reset
  sessionToken: { type: String },    // Cryptographically secure token for admin actions
  createdAt: { type: Date, default: Date.now }
});

// Safeguard against model re-compilation errors
export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
