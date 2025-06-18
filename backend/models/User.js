const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Donatur', 'Penerima Bantuan'], 
    default: 'Donatur' 
  },
  phone_number: String,
  address: String,
  account_status: { 
    type: String, 
    enum: ['Aktif', 'Non-aktif'], 
    default: 'Aktif' 
  },
  registration_date: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);