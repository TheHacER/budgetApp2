const express = require('express');
const router = express.Router();
const RecurringBillController = require('../controllers/recurringBillController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.post('/', RecurringBillController.createBill);
router.get('/', RecurringBillController.getActiveBills);
router.put('/:id', RecurringBillController.updateBill);
router.delete('/:id', RecurringBillController.deactivateBill);

module.exports = router;
