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
    ref: 'AidCategory', 
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
  timestamps: true 
});

module.exports = mongoose.model('Aid', aidSchema);