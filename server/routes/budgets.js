const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const isAuthenticated = require('../middleware/isAuthenticated');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(isAuthenticated);

router.post('/bulk', BudgetController.setBudgetsBulk);
router.get('/:year/:month', BudgetController.getBudgetsByMonth);
router.get('/template', BudgetController.getBudgetTemplate);
router.post('/upload', upload.single('budgetFile'), BudgetController.uploadBudget);

module.exports = router;
