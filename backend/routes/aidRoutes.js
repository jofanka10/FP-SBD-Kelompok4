const express = require('express');
const router = express.Router();
const aidController = require('../controllers/aidController');

router.get('/', aidController.getAllAid);
router.get('/:id', aidController.getAidById);
router.post('/', aidController.createAid);
router.put('/:id', aidController.updateAid);
router.delete('/:id', aidController.softDeleteAid);

module.exports = router;