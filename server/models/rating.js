import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

// Production index for high performance lookup of ratings per menu item
RatingSchema.index({ menuItemId: 1 });

export default mongoose.models.Rating || mongoose.model('Rating', RatingSchema);
