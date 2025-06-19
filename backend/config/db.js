// Contoh isi db.js (Pastikan mirip dengan milik Anda)
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,

        });
        console.log(`[DEBUG DB] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[DEBUG DB ERROR] MongoDB connection failed: ${error.message}`);

    }
};

module.exports = connectDB;
