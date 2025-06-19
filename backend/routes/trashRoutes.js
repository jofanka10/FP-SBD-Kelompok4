const express = require('express');
const router = express.Router();
const trashController = require('../controllers/trashController');

router.get('/', trashController.getAllTrash);

router.put('/restore/:collection/:documentId', trashController.restoreItem); 
router.delete('/permanent-delete/:collection/:documentId', trashController.permanentDeleteItem); 

module.exports = router;