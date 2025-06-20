const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

router.get('/', donationController.getAllDonations);
router.get('/:id', donationController.getDonationById);
router.post('/', donationController.createDonation);
router.put('/:id', donationController.updateDonation);
router.delete('/:id', donationController.softDeleteDonation);

module.exports = router;