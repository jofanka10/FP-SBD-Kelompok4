// File: backend/controllers/aidController.js

const mongoose = require('mongoose'); // Diperlukan untuk mongoose.Types.ObjectId.isValid
const Aid = require('../models/Aid');
const Trash = require('../models/Trash'); // Pastikan file backend/models/Trash.js ada dan benar

// --- Fungsi CRUD untuk Aid ---

exports.getAllAid = async (req, res) => {
  try {
    console.log("[BACKEND INFO] Fetching all non-deleted Aids...");
    const aids = await Aid.find({ isDeleted: { $ne: true } })
      .populate('aid_category', 'category_name')
      .sort({ updatedAt: -1 }); // Menggunakan 'updatedAt' dari timestamps Mongoose
    console.log(`[BACKEND INFO] Found ${aids.length} Aids.`);
    res.json(aids);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAllAid: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getAidById = async (req, res) => {
  try {
    console.log(`[BACKEND INFO] Fetching Aid with ID: ${req.params.id}`);
    const aid = await Aid.findById(req.params.id)
      .populate('aid_category', 'category_name');
    if (!aid || aid.isDeleted) {
      console.log(`[BACKEND INFO] Aid with ID ${req.params.id} not found or has been deleted.`);
      return res.status(404).json({ message: 'Aid not found or has been deleted.' });
    }
    console.log(`[BACKEND INFO] Found Aid: ${aid._id}`);
    res.json(aid);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAidById: ${err.message}`);
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Aid ID format.', error: err.message });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.createAid = async (req, res) => {
  try {
    console.log("[BACKEND INFO] Attempting to create new Aid.");
    console.log("[BACKEND DEBUG] Received data for Aid creation:", req.body);

    // Validasi aid_category ID harus ada dan formatnya ObjectId
    if (!req.body.aid_category || !mongoose.Types.ObjectId.isValid(req.body.aid_category)) {
      console.error("[BACKEND ERROR] Invalid or missing aid_category ID provided.");
      return res.status(400).json({ message: 'ID Kategori Bantuan tidak valid atau tidak ada.' });
    }

    const newAid = new Aid(req.body);
    const savedAid = await newAid.save(); // Ini akan membuat dokumen di collection 'aids'

    // Populate aid_category setelah disimpan untuk respons yang lebih informatif
    const populatedAid = await Aid.findById(savedAid._id)
      .populate('aid_category', 'category_name');

    console.log("[BACKEND SUCCESS] Aid created and saved to 'aids' collection:", populatedAid);
    res.status(201).json(populatedAid);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in createAid: ${err.message}`);
    if (err.name === 'ValidationError') { // Tangani error validasi dari Mongoose
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ message: 'Validasi gagal', errors: errors });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.updateAid = async (req, res) => {
  try {
    console.log(`[BACKEND INFO] Attempting to update Aid with ID: ${req.params.id}`);
    console.log("[BACKEND DEBUG] Received data for Aid update:", req.body);

    // Validasi aid_category ID jika ada di body request saat update
    if (req.body.aid_category && !mongoose.Types.ObjectId.isValid(req.body.aid_category)) {
        console.error("[BACKEND ERROR] Invalid aid_category ID provided for update.");
        return res.status(400).json({ message: 'ID Kategori Bantuan tidak valid.' });
    }

    const aid = await Aid.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() }, // Gunakan 'updatedAt' dari timestamps
      { new: true, runValidators: true } // new: true untuk mengembalikan dokumen yang diperbarui
    ).populate('aid_category', 'category_name');

    if (!aid) {
      console.log(`[BACKEND INFO] Aid with ID ${req.params.id} not found for update.`);
      return res.status(404).json({ message: 'Aid not found' });
    }
    console.log("[BACKEND SUCCESS] Aid updated and saved to 'aids' collection:", aid);
    res.json(aid);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in updateAid: ${err.message}`);
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Aid ID format.', error: err.message });
    }
    if (err.name === 'ValidationError') { // Tangani error validasi
        const errors = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({ message: 'Validasi gagal', errors: errors });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// --- OPSI 1: FUNGSI SOFT DELETE (DIREKOMENDASIKAN, ini adalah versi yang sudah Anda miliki) ---
// Dokumen Aid asli tetap ada di collection 'aids' tetapi ditandai isDeleted: true
// Salinan data juga disimpan di collection 'trashes'
exports.softDeleteAid = async (req, res) => {
  try {
    console.log(`[BACKEND INFO] Attempting to soft-delete Aid with ID: ${req.params.id}`);
    const aid = await Aid.findById(req.params.id);
    if (!aid) {
      console.log(`[BACKEND INFO] Aid with ID ${req.params.id} not found for soft-delete.`);
      return res.status(404).json({ message: 'Aid not found' });
    }

    // 1. Buat entri di collection 'trashes'
    await Trash.create({
      collection: 'Aid', // Nama model yang di-soft delete
      documentId: aid._id, // ID dokumen asli
      originalData: aid.toObject(), // Salinan data Aid
      deletedAt: new Date() // Timestamp penghapusan
    });
    console.log(`[BACKEND INFO] Copy of Aid ID ${aid._id} saved to 'trashes' collection.`);

    // 2. Tandai dokumen Aid asli sebagai dihapus di collection 'aids'
    aid.isDeleted = true;
    aid.deletedAt = new Date();
    await aid.save();

    console.log(`[BACKEND SUCCESS] Aid ID ${req.params.id} soft-deleted and a copy moved to 'trashes' collection.`);
    res.json({ message: 'Aid moved to trash successfully' });
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in softDeleteAid: ${err.message}`);
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Aid ID format.', error: err.message });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
