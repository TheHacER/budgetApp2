const express = require('express');
const router = express.Router();
const eomController = require('../controllers/eomController');
const { isAuthenticated } = require('../middleware/isAuthenticated');

// All EOM routes are protected
router.use(isAuthenticated);

router.get('/status', eomController.getEomStatus);

// A single, robust route to run the entire EOM process
router.post('/run/:monthId', eomController.runEomProcess);

module.exports = router;