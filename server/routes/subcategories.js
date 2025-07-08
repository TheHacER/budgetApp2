const express = require('express');
const router = express.Router();
const SubcategoryController = require('../controllers/subcategoryController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.get('/all', SubcategoryController.getAllSubcategoriesWithParent);

module.exports = router;
