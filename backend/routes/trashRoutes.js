// backend/routes/TrashRoutes.js

const express = require('express');
const router = express.Router();
const trashController = require('../controllers/trashController');

router.get('/', trashController.getAllTrash);
// Mengubah restore menjadi PUT dan menambahkan parameter di URL (:collection/:documentId)
router.put('/restore/:collection/:documentId', trashController.restoreItem); // Pastikan nama fungsi di controller cocok: restoreItem
// Mengubah permanent menjadi /permanent-delete dan menambahkan parameter di URL (:collection/:documentId)
router.delete('/permanent-delete/:collection/:documentId', trashController.permanentDeleteItem); // Pastikan nama fungsi di controller cocok: permanentDeleteItem

module.exports = router;