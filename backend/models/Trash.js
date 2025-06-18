const mongoose = require('mongoose');

const TrashSchema = new mongoose.Schema({
  collection: { type: String, required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  deletedAt: { type: Date, default: Date.now },
  originalData: { type: Object, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trash', TrashSchema);