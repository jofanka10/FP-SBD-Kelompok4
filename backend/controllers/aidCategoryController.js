const AidCategory = require('../models/AidCategory');
const Trash = require('../models/Trash');

exports.getAllAidCategories = async (req, res) => {
  try {
    const categories = await AidCategory.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAllAidCategories: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getAidCategoryById = async (req, res) => {
  try {
    const category = await AidCategory.findById(req.params.id);
    if (!category || category.isDeleted) {
      return res.status(404).json({ message: 'Aid category not found or has been deleted.' });
    }
    res.json(category);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAidCategoryById: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.createAidCategory = async (req, res) => {
  try {
    const newCategory = new AidCategory(req.body);
    const savedCategory = await newCategory.save();
    console.log("[BACKEND] Aid category created:", savedCategory);
    res.status(201).json(savedCategory);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in createAidCategory: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.updateAidCategory = async (req, res) => {
  try {
    const category = await AidCategory.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Aid category not found' });
    }
    console.log("[BACKEND] Aid category updated:", category);
    res.json(category);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in updateAidCategory: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.softDeleteAidCategory = async (req, res) => {
  try {
    const category = await AidCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Aid category not found' });
    }

    await Trash.create({
      collection: 'AidCategory',
      documentId: category._id,
      originalData: category.toObject(),
    });

    category.isDeleted = true;
    category.deletedAt = new Date();
    await category.save();

    console.log(`[BACKEND] Aid category ID ${req.params.id} soft-deleted and moved to trash.`);
    res.json({ message: 'Aid category moved to trash successfully' });
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in softDeleteAidCategory: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};