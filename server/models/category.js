import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
