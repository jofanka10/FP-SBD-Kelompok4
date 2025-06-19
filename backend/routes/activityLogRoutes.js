const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/userController');

router.get('/', activityLogController.getAllActivityLogs);

module.exports = router;
