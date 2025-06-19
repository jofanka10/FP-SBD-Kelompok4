const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/generate', reportController.generateReport); 
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.put('/:id/status', reportController.updateReportStatus);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
