const Trash = require('../models/Trash');
const mongoose = require('mongoose');

exports.softDelete = async (Model, id, collectionName) => {
  const doc = await Model.findById(id);
  if (!doc) throw new Error('Document not found');

  await Trash.create({
    collection: collectionName,
    documentId: id,
    originalData: doc.toObject(),
  });

  doc.isDeleted = true;
  doc.deletedAt = new Date();
  await doc.save();
};

exports.restore = async (req, res) => {
  try {
    const { collection, id } = req.body;
    
    const trashDoc = await Trash.findOne({ 
      collection: collection, 
      documentId: id 
    });
    
    if (!trashDoc) {
      return res.status(404).json({ message: 'Trash item not found' });
    }

    const Model = mongoose.model(collection);
    await Model.findByIdAndUpdate(id, { 
      isDeleted: false, 
      deletedAt: null 
    });
    
    await Trash.deleteOne({ _id: trashDoc._id });
    
    res.json({ message: 'Item restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.permanentDelete = async (req, res) => {
  try {
    const { collection, id } = req.body;
    
    const trashDoc = await Trash.findOne({ 
      collection: collection, 
      documentId: id 
    });
    
    if (!trashDoc) {
      return res.status(404).json({ message: 'Trash item not found' });
    }

    const Model = mongoose.model(collection);
    await Model.findByIdAndDelete(id);
    await Trash.deleteOne({ _id: trashDoc._id });
    
    res.json({ message: 'Item permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getAllTrash = async (req, res) => {
  try {
    const trashItems = await Trash.find().sort({ deletedAt: -1 });
    res.json(trashItems);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};