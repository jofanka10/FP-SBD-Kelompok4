// File: backend/models/Aid.js

const mongoose = require('mongoose');

const aidSchema = new mongoose.Schema({
  aid_name: {
    type: String,
    required: [true, 'Nama bantuan wajib diisi']
  },
  aid_type: {
    type: String,
    enum: ['Uang tunai', 'Barang', 'Makanan'],
    required: [true, 'Jenis bantuan wajib diisi']
  },
  aid_description: String,
  available_amount: {
    type: Number,
    required: [true, 'Jumlah bantuan wajib diisi'],
    min: [0, 'Jumlah bantuan tidak boleh kurang dari 0']
  },
  aid_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AidCategory', // Pastikan Anda punya model AidCategory.js
    required: [true, 'Kategori bantuan wajib diisi']
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Ini akan menambahkan createdAt dan updatedAt secara otomatis
});

module.exports = mongoose.model('Aid', aidSchema);