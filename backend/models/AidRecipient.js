const mongoose = require('mongoose');

const aidRecipientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aid_type_received: {
    type: String,
    enum: ['Uang tunai', 'Barang', 'Makanan'],
    default: 'Uang tunai',
    required: true
  },
  recipient_status: {
    type: String,
    enum: ['Terverifikasi', 'Belum Terverifikasi'],
    default: 'Belum Terverifikasi',
    required: true
  },
  delivery_address: {
    type: String,
    required: true,
    trim: true
  },
  number_of_family_members: {
    type: Number,
    default: 1,
    min: 1
  },
  notes: {
    type: String,
    trim: true
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('AidRecipient', aidRecipientSchema);