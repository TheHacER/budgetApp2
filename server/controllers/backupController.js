const path = require('path');
const fs = require('fs');
const db = require('../config/database');

const DB_PATH = path.join(__dirname, '..', 'data', 'sqlite', 'budget.db');

class BackupController {
  static createBackup(req, res) {
    if (fs.existsSync(DB_PATH)) {
      res.setHeader('Content-Disposition', 'attachment; filename=budget_backup.db');
      res.setHeader('Content-Type', 'application/x-sqlite3');
      res.download(DB_PATH, 'budget_backup.db', (err) => {
        if (err) {
          console.error('Error downloading database:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: "Could not download the database." });
          }
        }
      });
    } else {
      res.status(404).json({ message: "Database file not found." });
    }
  }

  static async restoreBackup(req, res) {
    if (!req.file) {
      return res.status(400).json({ message: 'No backup file uploaded.' });
    }

    const tempPath = req.file.path;
    const dbDir = path.dirname(DB_PATH);

    try {
      // Close the existing database connection to release the file lock.
      await db.closeDb();
      console.log('Database connection closed for restore.');

      // Ensure the target directory exists.
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Copy the file, then delete the temporary one. This avoids the EXDEV error.
      fs.copyFileSync(tempPath, DB_PATH);
      fs.unlinkSync(tempPath); 
      console.log('Database file replaced successfully.');

      res.status(200).json({ message: 'Restore successful. The application is restarting...' });
      
      // Exit the process after a short delay. Docker will restart it automatically.
      setTimeout(() => {
        console.log('Exiting process for restart...');
        process.exit(1);
      }, 500);

    } catch (error) {
        console.error('Error during database restore:', error);
        // Clean up the temporary file if it still exists
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        res.status(500).json({ message: `Failed to restore backup: ${error.message}` });
    }
  }
}

module.exports = BackupController;