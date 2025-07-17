const express = require('express');
const router = express.Router();
const multer = require('multer');
const BackupController = require('../controllers/backupController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Configure multer for temporary file storage
const upload = multer({ dest: 'data/uploads/' });

// Backup must be authenticated
router.get('/create', isAuthenticated, BackupController.createBackup);

// Restore is public to be accessible from the setup page
router.post('/restore', upload.single('backupFile'), BackupController.restoreBackup);

module.exports = router;