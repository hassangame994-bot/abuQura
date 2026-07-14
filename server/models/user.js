import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // Securely hashed password
  address: { type: String, required: true },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number }
  },
  sessionToken: { type: String }, // Secure token for persistent login session
  createdAt: { type: Date, default: Date.now }
});

// Safeguard against model re-compilation errors
export default mongoose.models.User || mongoose.model('User', UserSchema);
