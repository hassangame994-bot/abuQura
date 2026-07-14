import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    latitude: { type: Number, default: 30.0444 },
    longitude: { type: Number, default: 31.2357 },
    accuracy: { type: Number, default: 100 }
  },
  items: [{
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    selectedSize: { type: String },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    additions: [{
      name: { type: String },
      price: { type: Number }
    }]
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'preparing', 'delivered', 'cancelled'], default: 'pending' },
  customNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Production Indexes for high-traffic scalability
OrderSchema.index({ phoneNumber: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
