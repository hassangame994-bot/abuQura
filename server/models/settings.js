import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  whatsappNumber: { type: String, default: '201012345678' }
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
