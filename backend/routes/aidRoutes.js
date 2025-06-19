// File: backend/routes/aidRoutes.js

const express = require('express');
const router = express.Router();
const aidController = require('../controllers/aidController');

router.get('/', aidController.getAllAid);
router.get('/:id', aidController.getAidById);
router.post('/', aidController.createAid);
router.put('/:id', aidController.updateAid);
// Pilih salah satu fungsi DELETE di bawah ini sesuai dengan pilihan Anda di controller:

// Jika Anda menggunakan softDeleteAid (yang sudah ada):
router.delete('/:id', aidController.softDeleteAid);

// ATAU, jika Anda memilih deleteAidPermanentlyAndMoveToTrash:
// router.delete('/:id', aidController.deleteAidPermanentlyAndMoveToTrash);

module.exports = router;