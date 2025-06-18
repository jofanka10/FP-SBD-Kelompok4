const express = require('express');
const router = express.Router();
const aidRecipientController = require('../controllers/aidRecipientController');

router.get('/', aidRecipientController.getAllAidRecipients);
router.get('/:id', aidRecipientController.getAidRecipientById);
router.post('/', aidRecipientController.createAidRecipient);
router.put('/:id', aidRecipientController.updateAidRecipient);
router.delete('/:id', aidRecipientController.softDeleteAidRecipient);

module.exports = router;