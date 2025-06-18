const User = require('../models/User');
const Trash = require('../models/Trash');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: { $ne: true } });
    console.log(`[BACKEND] Fetched ${users.length} active users.`);
    res.json(users);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getAllUsers: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found or has been deleted.' });
    }
    res.json(user);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in getUserById: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, phone_number, address, role, account_status } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Donatur',
      phone_number,
      address,
      account_status: account_status || 'Aktif',
      registration_date: new Date(),
    });

    const savedUser = await newUser.save();
    console.log("[BACKEND] User created:", savedUser);
    res.status(201).json(savedUser);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in createUser: ${err.message}`);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email sudah terdaftar.', error: err.message });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone_number, address, account_status, role } = req.body;
  try {
    const updateFields = { name, email, phone_number, address, account_status, role };

    if (password && password.trim() !== '') {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updateFields, { 
      new: true, 
      runValidators: true 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("[BACKEND] User updated:", user);
    res.json(user);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in updateUser: ${err.message}`);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email sudah digunakan oleh user lain.' });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.softDeleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Trash.create({
      collection: 'User',
      documentId: user._id,
      originalData: user.toObject(),
    });

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    console.log(`[BACKEND] User ID ${id} soft-deleted and moved to trash.`);
    res.json({ message: 'User moved to trash successfully' });
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in softDeleteUser: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};