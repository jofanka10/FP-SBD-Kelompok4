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
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.createDonation = async (req, res) => {
  try {
    const newDonation = new Donation(req.body);
    const savedDonation = await newDonation.save();
    const populatedDonation = await Donation.findById(savedDonation._id)
      .populate('user_id', 'name email');
    console.log("[BACKEND] Donation created:", populatedDonation);
    res.status(201).json(populatedDonation);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in createDonation: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('user_id', 'name email');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    console.log("[BACKEND] Donation updated:", donation);
    res.json(donation);
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in updateDonation: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.softDeleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    await Trash.create({
      collection: 'Donation',
      documentId: donation._id,
      originalData: donation.toObject(),
    });

    donation.isDeleted = true;
    donation.deletedAt = new Date();
    await donation.save();

    console.log(`[BACKEND] Donation ID ${req.params.id} soft-deleted and moved to trash.`);
    res.json({ message: 'Donation moved to trash successfully' });
  } catch (err) {
    console.error(`[BACKEND ERROR] Error in softDeleteDonation: ${err.message}`);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};