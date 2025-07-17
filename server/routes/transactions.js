const express = require('express');
const router = express.Router();
const multer = require('multer');
const TransactionController = require('../controllers/transactionController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Use memory storage for multer to handle the file buffer directly
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(isAuthenticated);

// The upload middleware now uses memory storage
router.post('/upload', upload.single('transactionsFile'), TransactionController.uploadTransactions);
router.post('/apply-rules', TransactionController.applyRules);

router.get('/', TransactionController.getAllTransactions);
router.get('/uncategorized', TransactionController.getUncategorizedTransactions);
router.put('/:id/categorize', TransactionController.categorizeTransaction);
router.put('/:id/vendor', TransactionController.updateTransactionVendor);
router.post('/:id/split', TransactionController.splitTransaction);

router.get('/ignored', TransactionController.getIgnoredTransactions);
router.post('/ignored/:id/reinstate', TransactionController.reinstateTransaction);
router.delete('/ignored/purge', TransactionController.purgeIgnoredTransactions);

module.exports = router;