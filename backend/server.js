require('dotenv').config();
console.log('[DEBUG 1] dotenv loaded');

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

console.log('[DEBUG 2] Express, CORS, connectDB, Mongoose imported');

const app = express();

app.use(cors());
app.use(express.json());

console.log('[DEBUG 3] Middleware configured');

// Panggil connectDB. Pastikan connectDB() tidak langsung exit jika gagal.
// Idealnya, connectDB() harus menangani error koneksi dan tidak menyebabkan proses keluar.
connectDB();

mongoose.connection.on('connected', () => {
    console.log(`[DEBUG DB] Mongoose connected to database: ${mongoose.connection.name}`);
});
mongoose.connection.on('error', (err) => {
    console.error(`[DEBUG DB ERROR] Mongoose connection error: ${err.message}`);
});
mongoose.connection.on('disconnected', () => {
    console.log('[DEBUG DB] Mongoose disconnected');
});

console.log('[DEBUG 4] Database connection function called and listeners set');

const userRoutes = require('./routes/userRoutes');
const donationRoutes = require('./routes/donationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const aidRecipientRoutes = require('./routes/aidRecipientRoutes');
const aidRoutes = require('./routes/aidRoutes');
const aidCategoryRoutes = require('./routes/aidCategoryRoutes');
const trashRoutes = require('./routes/TrashRoutes');
const reportRoutes = require('./routes/reportRoutes');

console.log('[DEBUG 5] All routes required');

app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/aid-recipients', aidRecipientRoutes);
app.use('/api/aids', aidRoutes);
app.use('/api/aid-categories', aidCategoryRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/reports', reportRoutes);

console.log('[DEBUG 6] Routes applied to app');

app.get('/', (req, res) => {
  res.send('🚀 Backend server is running');
});

app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Route not found' });
});

console.log('[DEBUG 7] Root and 404 routes defined');

const PORT = process.env.PORT || 5001;

// Pastikan app.listen dipanggil dan port tersedia
app.listen(PORT, () => {
  console.log(`[DEBUG 8] Server trying to listen on port ${PORT}`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error(`[DEBUG SERVER ERROR] Failed to start server on port ${PORT}: ${err.message}`);
    process.exit(1); // Keluar jika ada error pada listen
});
