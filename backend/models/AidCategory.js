const mongoose = require('mongoose');

const aidCategorySchema = new mongoose.Schema({
  category_name: { type: String, required: true },
  category_description: String,
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('AidCategory', aidCategorySchema);