const AidRecipient = require('../models/AidRecipient');
const Trash = require('../models/Trash');

exports.getAllAidRecipients = async (req, res) => {
  try {
    const aidRecipients = await AidRecipient.find({ isDeleted: { $ne: true } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(aidRecipients);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAllAidRecipients: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getAidRecipientById = async (req, res) => {
  try {
    const aidRecipient = await AidRecipient.findById(req.params.id)
      .populate('user', 'name email');
    if (!aidRecipient || aidRecipient.isDeleted) {
      return res.status(404).json({ message: 'Aid recipient not found or has been deleted.' });
    }
    res.json(aidRecipient);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAidRecipientById: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.createAidRecipient = async (req, res) => {
  try {
    const newAidRecipient = new AidRecipient(req.body);
    const savedAidRecipient = await newAidRecipient.save();
    const populatedAidRecipient = await AidRecipient.findById(savedAidRecipient._id)
      .populate('user', 'name email');
    console.log("[BACKEND] Aid recipient created:", populatedAidRecipient);
    res.status(201).json(populatedAidRecipient);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in createAidRecipient: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.updateAidRecipient = async (req, res) => {
  try {
    const aidRecipient = await AidRecipient.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!aidRecipient) {
      return res.status(404).json({ message: 'Aid recipient not found' });
    }
    console.log("[BACKEND] Aid recipient updated:", aidRecipient);
    res.json(aidRecipient);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in updateAidRecipient: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.softDeleteAidRecipient = async (req, res) => {
  try {
    const aidRecipient = await AidRecipient.findById(req.params.id);
    if (!aidRecipient) {
      return res.status(404).json({ message: 'Aid recipient not found' });
    }

    await Trash.create({
      collection: 'AidRecipient',
      documentId: aidRecipient._id,
      originalData: aidRecipient.toObject(),
    });

    aidRecipient.isDeleted = true;
    aidRecipient.deletedAt = new Date();
    await aidRecipient.save();

    console.log(`[BACKEND] Aid recipient ID ${req.params.id} soft-deleted and moved to trash.`);
    res.json({ message: 'Aid recipient moved to trash successfully' });
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in softDeleteAidRecipient: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};