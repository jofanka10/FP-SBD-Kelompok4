const express = require('express');
const router = express.Router();
const trashController = require('../controllers/trashController');

router.get('/', trashController.getAllTrash);
router.post('/restore', trashController.restore);
router.delete('/permanent', trashController.permanentDelete);

module.exports = router;