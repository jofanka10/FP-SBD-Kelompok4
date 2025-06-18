// backend/controllers/trashController.js
const Trash = require('../models/Trash'); // Asumsikan Anda memiliki model Trash
const User = require('../models/User'); // Import model-model lain yang mungkin direstore
const Donation = require('../models/Donation');
const Transaction = require('../models/Transaction');
const AidRecipient = require('../models/AidRecipient');
const Aid = require('../models/Aid');
const AidCategory = require('../models/AidCategory');

// Fungsi untuk mendapatkan semua item di trash
exports.getAllTrash = async (req, res) => {
  try {
    const trashItems = await Trash.find({});
    res.status(200).json(trashItems);
  } catch (error) {
    console.error('Error fetching trash items:', error);
    res.status(500).json({ message: 'Error fetching trash items', error: error.message });
  }
};

// Fungsi untuk merestore item
exports.restoreItem = async (req, res) => {
  const { collection, documentId } = req.params; // Ambil collection dan documentId dari URL params
  try {
    // 1. Temukan item di koleksi Trash berdasarkan collection dan documentId asli
    const trashRecord = await Trash.findOne({ collection, documentId });
    if (!trashRecord) {
      return res.status(404).json({ message: 'Item not found in trash.' });
    }

    // 2. Tentukan model asli berdasarkan nama koleksi
    let OriginalModel;
    switch (collection) {
      case 'User': OriginalModel = User; break;
      case 'Donation': OriginalModel = Donation; break;
      case 'Transaction': OriginalModel = Transaction; break;
      case 'AidRecipient': OriginalModel = AidRecipient; break;
      case 'Aid': OriginalModel = Aid; break;
      case 'AidCategory': OriginalModel = AidCategory; break;
      default: return res.status(400).json({ message: 'Unsupported collection type for restore.' });
    }

    // 3. Masukkan kembali data asli (originalData) ke koleksi aslinya
    // Pastikan originalData ada
    if (!trashRecord.originalData) {
       return res.status(400).json({ message: 'Original data missing for restore.' });
    }

    // Clone originalData untuk menghindari modifikasi langsung pada Mongoose document jika itu kasusnya
    // Dan hapus _id serta __v agar MongoDB bisa membuat _id baru atau menghindari konflik
    const dataToRestore = { ...trashRecord.originalData._doc || trashRecord.originalData };
    delete dataToRestore._id;
    delete dataToRestore.__v;
    delete dataToRestore.isDeleted; // Pastikan isDeleted diset false jika ada
    delete dataToRestore.deletedAt; // Pastikan deletedAt dihilangkan

    // Cek apakah dokumen asli sudah ada (misalnya jika hanya isDeleted yang diubah)
    // Jika dokumen asli ada, kita bisa mengupdatenya daripada membuat yang baru
    let restoredDoc;
    // Asumsi: documentId di trash mengacu pada _id asli dokumen yang dihapus
    const existingOriginalDoc = await OriginalModel.findById(documentId);

    if (existingOriginalDoc) {
      // Jika dokumen asli masih ada (misalnya cuma di-soft delete), update statusnya
      // Hapus properti _id dari dataToRestore jika ada, agar tidak mencoba mengubah _id dokumen yang ada
      if (dataToRestore._id) delete dataToRestore._id;
      // Gunakan updateOne atau findByIdAndUpdate tergantung kebutuhan
      await OriginalModel.findByIdAndUpdate(documentId, { ...dataToRestore, isDeleted: false, deletedAt: null }, { new: true });
      restoredDoc = existingOriginalDoc; // Atau fetch kembali yang sudah diupdate
    } else {
      // Jika dokumen asli tidak ada di koleksi aslinya, buat yang baru
      restoredDoc = await OriginalModel.create(dataToRestore);
    }

    // 4. Hapus item dari koleksi Trash setelah berhasil di-restore
    await Trash.deleteOne({ _id: trashRecord._id });

    res.status(200).json({ message: 'Item restored successfully', restoredDoc });
  } catch (error) {
    console.error('Error restoring item:', error);
    res.status(500).json({ message: 'Error restoring item', error: error.message });
  }
};


// Fungsi untuk menghapus item secara permanen dari trash
exports.permanentDeleteItem = async (req, res) => {
  const { collection, documentId } = req.params; // Ambil collection dan documentId dari URL params
  try {
    // Hapus item dari koleksi Trash
    const result = await Trash.deleteOne({ collection, documentId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found in trash or already deleted.' });
    }

    res.status(200).json({ message: 'Item permanently deleted successfully.' });
  } catch (error) {
    console.error('Error permanently deleting item:', error);
    res.status(500).json({ message: 'Error permanently deleting item', error: error.message });
  }
};