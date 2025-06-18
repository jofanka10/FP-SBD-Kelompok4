const Aid = require('../models/Aid');
const Trash = require('../models/Trash');

exports.getAllAid = async (req, res) => {
  try {
    const aids = await Aid.find({ isDeleted: { $ne: true } })
      .populate('aid_category', 'category_name')
      .sort({ updated_at: -1 });
    res.json(aids);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAllAid: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getAidById = async (req, res) => {
  try {
    const aid = await Aid.findById(req.params.id)
      .populate('aid_category', 'category_name');
    if (!aid || aid.isDeleted) {
      return res.status(404).json({ message: 'Aid not found or has been deleted.' });
    }
    res.json(aid);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAidById: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.createAid = async (req, res) => {
  try {
    const newAid = new Aid(req.body);
    const savedAid = await newAid.save();
    const populatedAid = await Aid.findById(savedAid._id)
      .populate('aid_category', 'category_name');
    console.log("[BACKEND] Aid created:", populatedAid);
    res.status(201).json(populatedAid);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in createAid: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.updateAid = async (req, res) => {
  try {
    const aid = await Aid.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updated_at: new Date() }, 
      { new: true, runValidators: true }
    ).populate('aid_category', 'category_name');

    if (!aid) {
      return res.status(404).json({ message: 'Aid not found' });
    }
    console.log("[BACKEND] Aid updated:", aid);
    res.json(aid);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in updateAid: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.softDeleteAid = async (req, res) => {
  try {
    const aid = await Aid.findById(req.params.id);
    if (!aid) {
      return res.status(404).json({ message: 'Aid not found' });
    }

    await Trash.create({
      collection: 'Aid',
      documentId: aid._id,
      originalData: aid.toObject(),
    });

    aid.isDeleted = true;
    aid.deletedAt = new Date();
    await aid.save();

    console.log(`[BACKEND] Aid ID ${req.params.id} soft-deleted and moved to trash.`);
    res.json({ message: 'Aid moved to trash successfully' });
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in softDeleteAid: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};