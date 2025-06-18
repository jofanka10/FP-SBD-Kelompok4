const express = require('express');
const router = express.Router();
const aidCategoryController = require('../controllers/aidCategoryController');

router.get('/', aidCategoryController.getAllAidCategories);
router.get('/:id', aidCategoryController.getAidCategoryById);
router.post('/', aidCategoryController.createAidCategory);
router.put('/:id', aidCategoryController.updateAidCategory);
router.delete('/:id', aidCategoryController.softDeleteAidCategory);

module.exports = router;