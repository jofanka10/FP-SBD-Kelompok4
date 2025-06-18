const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { type: Number, required: true },
  donation_date: { type: Date, default: Date.now },
  payment_method: { 
    type: String, 
    enum: ['Transfer bank', 'E-wallet', 'Tunai'], 
    required: true 
  },
  donation_status: { 
    type: String, 
    enum: ['Sukses', 'Pending', 'Gagal'], 
    default: 'Pending' 
  },
  note: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);