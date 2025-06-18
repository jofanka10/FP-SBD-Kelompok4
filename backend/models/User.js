const mongoose = require('mongoose');
// Pastikan bcrypt juga di-require jika Anda menggunakannya untuk hashing password
// const bcrypt = require('bcryptjs'); // Jika Anda memiliki pre-save hook untuk hashing

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { 
    type: String, 
    required: true,
    select: false // <--- TAMBAHKAN BARIS INI
  },
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

// Jika Anda memiliki pre-save hook untuk hashing password, pastikan juga di sini
// userSchema.pre('save', async function(next) {
//   if (this.isModified('password')) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });

module.exports = mongoose.model('User', userSchema);