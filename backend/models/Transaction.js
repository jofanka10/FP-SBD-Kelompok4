const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  payment_amount: { type: Number, required: true },
  transaction_date: { type: Date, default: Date.now },
  payment_method: {
    type: String,
    enum: ['Transfer bank', 'E-wallet', 'Tunai'],
    required: true
  },
  transaction_status: {
    type: String,
    enum: ['Sukses', 'Gagal', 'Pending'],
    required: true
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);