const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.get('/', CategoryController.getAllCategories);
router.post('/', CategoryController.createCategory);
router.delete('/:id', CategoryController.deleteCategory);
router.post('/:categoryId/subcategories', CategoryController.createSubcategory);
router.delete('/:categoryId/subcategories/:subcategoryId', CategoryController.deleteSubcategory);

module.exports = router;
