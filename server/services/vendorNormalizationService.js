const Vendor = require('../models/Vendor');
const db = require('../config/database');

const NORMALIZATION_RULES = {
  'tesco': ['tesco'],
  'amazon': ['amazon', 'amzn'],
  'costa coffee': ['costa'],
  'netflix': ['netflix.com']
};

class VendorNormalizationService {
  static async normalize(description) {
    const lowerCaseDesc = description.toLowerCase();
    const database = await db.openDb();

    for (const vendorName in NORMALIZATION_RULES) {
      const keywords = NORMALIZATION_RULES[vendorName];
      if (keywords.some(keyword => lowerCaseDesc.includes(keyword))) {
        let vendor = await database.get('SELECT * FROM vendors WHERE name = ?', vendorName);
        if (!vendor) {
          const displayName = vendorName.charAt(0).toUpperCase() + vendorName.slice(1);
          const result = await database.run('INSERT INTO vendors (name, display_name) VALUES (?, ?)', vendorName, displayName);
          return result.lastID;
        }
        return vendor.id;
      }
    }
    return null;
  }
}

module.exports = VendorNormalizationService;
