// backend/controllers/donationController.js

const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Trash = require('../models/Trash'); 

exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ isDeleted: { $ne: true } })
      .populate('user_id', 'name email')
      .sort({ donation_date: -1 });
    res.json(donations);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAllDonations: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('user_id', 'name email');
    if (!donation || donation.isDeleted) {
      return res.status(404).json({ message: 'Donation not found or has been deleted.' });
    }
    res.json(donation);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getDonationById: ${err.message}`);
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Donation ID format.', error: err.message });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.createDonation = async (req, res) => {
  try {
    console.log("[BACKEND INFO] Attempting to create new Donation.");
    console.log("[BACKEND DEBUG] Received data for Donation creation:", req.body);

    if (!req.body.user_id || !mongoose.Types.ObjectId.isValid(req.body.user_id)) {
      console.error("[BACKEND ERROR] Invalid or missing user_id provided.");
      return res.status(400).json({ message: 'ID Pengguna tidak valid atau tidak ada.' });
    }
    const validPaymentMethods = ['Transfer bank', 'E-wallet', 'Tunai'];
    if (!req.body.payment_method || !validPaymentMethods.includes(req.body.payment_method)) {
        console.error("[BACKEND ERROR] Invalid or missing payment_method provided.");
        return res.status(400).json({ message: 'Metode pembayaran tidak valid atau tidak ada. Harus salah satu dari: ' + validPaymentMethods.join(', ') });
    }

    const newDonation = new Donation(req.body);
    const savedDonation = await newDonation.save();

    const populatedDonation = await Donation.findById(savedDonation._id)
      .populate('user_id', 'name email');
    console.log("[BACKEND SUCCESS] Donation created:", populatedDonation);
    res.status(201).json(populatedDonation);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in createDonation: ${err.message}`);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ message: 'Validasi gagal: ' + errors.join(', ') });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    console.log(`[BACKEND INFO] Attempting to update Donation with ID: ${req.params.id}`);
    console.log("[BACKEND DEBUG] Received data for Donation update:", req.body);

    if (req.body.user_id && !mongoose.Types.ObjectId.isValid(req.body.user_id)) {
        console.error("[BACKEND ERROR] Invalid user_id provided for update.");
        return res.status(400).json({ message: 'ID Pengguna tidak valid.' });
    }
    const validPaymentMethods = ['Transfer bank', 'E-wallet', 'Tunai'];
    if (req.body.payment_method && !validPaymentMethods.includes(req.body.payment_method)) {
        console.error("[BACKEND ERROR] Invalid payment_method provided for update.");
        return res.status(400).json({ message: 'Metode pembayaran tidak valid. Harus salah satu dari: ' + validPaymentMethods.join(', ') });
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('user_id', 'name email');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    console.log("[BACKEND SUCCESS] Donation updated:", donation);
    res.json(donation);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in updateDonation: ${err.message}`);
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Donation ID format.', error: err.message });
    }
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({ message: 'Validasi gagal: ' + errors.join(', ') });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.softDeleteDonation = async (req, res) => {
  try {
    console.log(`[BACKEND INFO] Attempting to move Donation ID to trash and delete from main collection: ${req.params.id}`); // Mengubah log pesan
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // 1. Membuat salinan ke Trash collection
    await Trash.create({
      collection: 'Donation',
      documentId: donation._id,
      originalData: donation.toObject(),
      deletedAt: new Date()
    });
    console.log(`[BACKEND INFO] Copy of Donation ID ${donation._id} saved to 'trashes' collection.`);

    // 2. MENGHAPUS dokumen asli dari collection 'donations'
    await Donation.findByIdAndDelete(req.params.id); // <--- PERUBAHAN KRUSIAL DI SINI

    console.log(`[BACKEND SUCCESS] Donation ID ${req.params.id} moved to trash and DELETED from 'donations' collection.`); // Mengubah log pesan
    res.json({ message: 'Donation moved to trash and successfully deleted from main collection' }); // Mengubah pesan respons
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in softDeleteDonation: ${err.message}`);
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Donation ID format.', error: err.message });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};