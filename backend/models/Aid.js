// backend/models/Aid.js

const mongoose = require('mongoose');

const aidSchema = new mongoose.Schema({
  aid_name: { 
    type: String, 
    required: true 
  },
  aid_type: { 
    type: String, 
    enum: ['Uang tunai', 'Barang', 'Makanan'],
    required: true
  },
  aid_description: String,
  available_amount: { 
    type: Number, 
    required: true 
  },
  aid_category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AidCategory',
    required: true // <--- Ini perubahannya: Jadikan wajib
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
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
  timestamps: true // Menambahkan createdAt dan updatedAt secara otomatis
});

module.exports = mongoose.model('Aid', aidSchema);