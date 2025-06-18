require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const donationRoutes = require('./routes/donationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const aidRecipientRoutes = require('./routes/aidRecipientRoutes');
const aidRoutes = require('./routes/aidRoutes');
const aidCategoryRoutes = require('./routes/aidCategoryRoutes');
const trashRoutes = require('./routes/trashRoutes');
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/donasiplus';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/aid-recipients', aidRecipientRoutes);
app.use('/api/aid', aidRoutes);
app.use('/api/aid-categories', aidCategoryRoutes);
app.use('/api/trash', trashRoutes);

// Root test route
app.get('/', (req, res) => {
  res.send('🚀 Backend server is running');
});

// 404 fallback
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Route not found' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});