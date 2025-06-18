const Transaction = require('../models/Transaction');
const Trash = require('../models/Trash');

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ isDeleted: { $ne: true } })
      .populate({
        path: 'donation',
        populate: {
          path: 'user_id',
          select: 'name email'
        }
      })
      .sort({ transaction_date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAllTransactions: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate({
        path: 'donation',
        populate: {
          path: 'user_id',
          select: 'name email'
        }
      });
    if (!transaction || transaction.isDeleted) {
      return res.status(404).json({ message: 'Transaction not found or has been deleted.' });
    }
    res.json(transaction);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getTransactionById: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    const savedTransaction = await newTransaction.save();
    const populatedTransaction = await Transaction.findById(savedTransaction._id)
      .populate({
        path: 'donation',
        populate: {
          path: 'user_id',
          select: 'name email'
        }
      });
    console.log("[BACKEND] Transaction created:", populatedTransaction);
    res.status(201).json(populatedTransaction);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in createTransaction: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate({
      path: 'donation',
      populate: {
        path: 'user_id',
        select: 'name email'
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    console.log("[BACKEND] Transaction updated:", transaction);
    res.json(transaction);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in updateTransaction: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.softDeleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await Trash.create({
      collection: 'Transaction',
      documentId: transaction._id,
      originalData: transaction.toObject(),
    });

    transaction.isDeleted = true;
    transaction.deletedAt = new Date();
    await transaction.save();

    console.log(`[BACKEND] Transaction ID ${req.params.id} soft-deleted and moved to trash.`);
    res.json({ message: 'Transaction moved to trash successfully' });
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in softDeleteTransaction: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};