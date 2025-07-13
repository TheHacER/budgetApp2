const express = require('express');
const router = express.Router();
const multer = require('multer');
const TransactionController = require('../controllers/transactionController');
const isAuthenticated = require('../middleware/isAuthenticated');

const upload = multer({ dest: 'data/uploads/' });

router.use(isAuthenticated);

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
