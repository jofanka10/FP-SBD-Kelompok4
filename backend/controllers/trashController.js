const Trash = require('../models/Trash'); 
const User = require('../models/User'); 
const Donation = require('../models/Donation');
const Transaction = require('../models/Transaction');
const AidRecipient = require('../models/AidRecipient');
const Aid = require('../models/Aid');
const AidCategory = require('../models/AidCategory');

exports.getAllTrash = async (req, res) => {
  try {
    const trashItems = await Trash.find({});
    res.status(200).json(trashItems);
  } catch (error) {
    console.error('Error fetching trash items:', error);
    res.status(500).json({ message: 'Error fetching trash items', error: error.message });
  }
};

exports.restoreItem = async (req, res) => {
  const { collection, documentId } = req.params; 
  try {
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

    if (!trashRecord.originalData) {
       return res.status(400).json({ message: 'Original data missing for restore.' });
    }

    const dataToRestore = { ...trashRecord.originalData._doc || trashRecord.originalData };
    delete dataToRestore._id;
    delete dataToRestore.__v;
    delete dataToRestore.isDeleted; 
    delete dataToRestore.deletedAt; 

    let restoredDoc;

    const existingOriginalDoc = await OriginalModel.findById(documentId);

    if (existingOriginalDoc) {

      if (dataToRestore._id) delete dataToRestore._id;

      await OriginalModel.findByIdAndUpdate(documentId, { ...dataToRestore, isDeleted: false, deletedAt: null }, { new: true });
      restoredDoc = existingOriginalDoc; 
    } else {

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


exports.permanentDeleteItem = async (req, res) => {
  const { collection, documentId } = req.params; // Ambil collection dan documentId dari URL params
  try {
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