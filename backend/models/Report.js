const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    report_id: {
        type: String,
        unique: true,
        required: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    report_date: {
        type: Date,
        default: Date.now,
        required: true
    },
    report_type: {
        type: String,
        enum: [
            'Laporan Pengguna',
            'Laporan donasi',
            'Laporan distribusi',
            'Laporan Keuangan (Donasi)',
            'Laporan Keuangan (Transaksi)',
            'Laporan Keuangan (Semua)',
            'Laporan lainnya'
        ],
        required: true
    },
    report_content: {
        type: Object,
        required: true
    },
    report_status: {
        type: String,
        enum: ['Terbuka', 'Tertutup'],
        default: 'Terbuka',
        required: true
    }
});

module.exports = mongoose.model('Report', ReportSchema);
