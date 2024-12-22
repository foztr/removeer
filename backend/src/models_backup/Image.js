const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  originalName: String,
  mimeType: String,
  size: Number,
  userId: mongoose.Schema.Types.ObjectId,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  processedUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Image', imageSchema); 