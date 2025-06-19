const Report = require('../models/Report');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Transaction = require('../models/Transaction');
const AidRecipient = require('../models/AidRecipient');
const moment = require('moment');

const parseCurrencyString = (currencyString) => {
    if (typeof currencyString !== 'string') {
        const val = parseFloat(currencyString);
        return isNaN(val) ? 0 : val;
    }

    let cleanedString = currencyString
        .replace(/Rp/g, '')
        .trim()
        .replace(/\./g, '');

    if (cleanedString.includes(',')) {
        cleanedString = cleanedString.replace(/,/g, '.');
    }
    
    const parsedValue = parseFloat(cleanedString);
    return isNaN(parsedValue) ? 0 : parsedValue;
};

exports.generateReport = async (req, res) => {
    const { report_type, admin_id, startDate, endDate } = req.body;

    try {
        if (!admin_id || !report_type) {
            return res.status(400).json({ message: 'admin_id dan report_type wajib diisi.' });
        }

        let reportContent = {};
        let finalStartDate = startDate ? new Date(startDate) : new Date('1970-01-01');
        let finalEndDate = endDate ? new Date(endDate) : new Date();

        if (finalEndDate) {
            finalEndDate.setHours(23, 59, 59, 999);
        }

        switch (report_type) {
            case 'Laporan Pengguna':
                const users = await User.find({
                    registration_date: {
                        $gte: finalStartDate,
                        $lte: finalEndDate
                    },
                    isDeleted: { $ne: true }
                }).select('-password -isDeleted -deletedAt');
                reportContent = {
                    title: `Laporan Pengguna dari ${moment(finalStartDate).format('YYYY-MM-DD')} hingga ${moment(finalEndDate).format('YYYY-MM-DD')}`,
                    totalUsers: users.length,
                    usersData: users
                };
                break;
            case 'Laporan donasi':
                const donations = await Donation.find({
                    createdAt: {
                        $gte: finalStartDate,
                        $lte: finalEndDate
                    }
                });
                const totalDonationDetailAmount = donations.reduce((sum, d) => sum + (parseCurrencyString(d.amount) || 0), 0);
                reportContent = {
                    title: `Laporan Donasi Detail dari ${moment(finalStartDate).format('YYYY-MM-DD')} hingga ${moment(finalEndDate).format('YYYY-MM-DD')}`,
                    totalDonations: donations.length,
                    totalAmount: totalDonationDetailAmount,
                    donationsData: donations
                };
                break;
            case 'Laporan distribusi':
                const aidRecipients = await AidRecipient.find({
                    createdAt: {
                        $gte: finalStartDate,
                        $lte: finalEndDate
                    }
                });
                reportContent = {
                    title: `Laporan Distribusi Detail dari ${moment(finalStartDate).format('YYYY-MM-DD')} hingga ${moment(finalEndDate).format('YYYY-MM-DD')}`,
                    totalRecipients: aidRecipients.length,
                    aidRecipientsData: aidRecipients
                };
                break;
            case 'Laporan Keuangan (Donasi)':
                const financialDonations = await Donation.find({
                    createdAt: { $gte: finalStartDate, $lte: finalEndDate }
                });
                const totalDonationIncome = financialDonations.reduce((sum, d) => sum + (parseCurrencyString(d.amount) || 0), 0);

                reportContent = {
                    title: `Laporan Keuangan (Donasi) dari ${moment(finalStartDate).format('YYYY-MM-DD')} hingga ${moment(finalEndDate).format('YYYY-MM-DD')}`,
                    period: `${moment(finalStartDate).format('YYYY-MM-DD')} - ${moment(finalEndDate).format('YYYY-MM-DD')}`,
                    totalIncome: totalDonationIncome,
                    totalExpenses: 0,
                    netBalance: totalDonationIncome
                };
                break;
            case 'Laporan Keuangan (Transaksi)':
                const financialTransactions = await Transaction.find({
                    createdAt: { $gte: finalStartDate, $lte: finalEndDate }
                });
                const totalTransactionExpenses = financialTransactions.reduce((sum, t) => sum + (parseCurrencyString(t.payment_amount) || 0), 0);

                reportContent = {
                    title: `Laporan Keuangan (Transaksi) dari ${moment(finalStartDate).format('YYYY-MM-DD')} hingga ${moment(finalEndDate).format('YYYY-MM-DD')}`,
                    period: `${moment(finalStartDate).format('YYYY-MM-DD')} - ${moment(finalEndDate).format('YYYY-MM-DD')}`,
                    totalIncome: 0,
                    totalExpenses: totalTransactionExpenses,
                    netBalance: -totalTransactionExpenses
                };
                break;
            case 'Laporan Keuangan (Semua)':
                const allDonations = await Donation.find({
                    createdAt: { $gte: finalStartDate, $lte: finalEndDate }
                });
                const allTransactions = await Transaction.find({
                    createdAt: { $gte: finalStartDate, $lte: finalEndDate }
                });

                const totalAllIncome = allDonations.reduce((sum, d) => sum + (parseCurrencyString(d.amount) || 0), 0);
                const totalAllExpenses = allTransactions.reduce((sum, t) => sum + (parseCurrencyString(t.payment_amount) || 0), 0);
                
                const allNetBalance = totalAllIncome - totalAllExpenses;

                reportContent = {
                    title: `Laporan Keuangan (Semua) dari ${moment(finalStartDate).format('YYYY-MM-DD')} hingga ${moment(finalEndDate).format('YYYY-MM-DD')}`,
                    period: `${moment(finalStartDate).format('YYYY-MM-DD')} - ${moment(finalEndDate).format('YYYY-MM-DD')}`,
                    totalIncome: totalAllIncome,
                    totalExpenses: totalAllExpenses,
                    netBalance: allNetBalance
                };
                break;
            default:
                reportContent = { message: `Tipe laporan '${report_type}' tidak dikenal atau belum diimplementasikan.` };
                break;
        }

        const newReport = new Report({
            admin_id: admin_id,
            report_type: report_type,
            report_content: reportContent,
            report_date: new Date(),
            report_status: 'Terbuka'
        });

        let savedReport = await newReport.save();
        savedReport = await savedReport.populate('admin_id', 'username email');

        res.status(201).json(savedReport);

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Gagal membuat laporan', error: error.message });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().populate('admin_id', 'username email').sort({ report_date: -1 });
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar laporan', error: error.message });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate('admin_id', 'username email');
        if (!report) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }
        res.json(report);
    } catch (error) {
        console.error('Error fetching report by ID:', error);
        res.status(500).json({ message: 'Gagal mengambil laporan', error: error.message });
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { report_status } = req.body;

        if (!report_status || !['Terbuka', 'Tertutup'].includes(report_status)) {
            return res.status(400).json({ message: 'Status laporan tidak valid.' });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            id,
            { report_status },
            { new: true, runValidators: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }
        res.json(updatedReport);
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({ message: 'Gagal memperbarui status laporan', error: error.message });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const deletedReport = await Report.findByIdAndDelete(req.params.id);
        if (!deletedReport) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }
        res.json({ message: 'Laporan berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: 'Gagal menghapus laporan', error: error.message });
    }
};
