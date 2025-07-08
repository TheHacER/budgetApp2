const Vendor = require('../models/Vendor');

class VendorController {
  static async createVendor(req, res) {
    const { name, displayName } = req.body;
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Vendor name and displayName are required.' });
    }
    try {
      const newVendor = await Vendor.create(name, displayName);
      res.status(201).json(newVendor);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ message: `Vendor '${name}' already exists.` });
      }
      res.status(500).json({ message: 'Server error creating vendor.' });
    }
  }

  static async getAllVendors(req, res) {
    try {
      const vendors = await Vendor.findAll();
      res.status(200).json(vendors);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching vendors.' });
    }
  }

  static async updateVendor(req, res) {
    const { id } = req.params;
    const { name, displayName } = req.body;
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Vendor name and displayName are required.' });
    }
    try {
      const vendor = await Vendor.findById(id);
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found.' });
      }
      const updatedVendor = await Vendor.update(id, name, displayName);
      res.status(200).json(updatedVendor);
    } catch (error) {
      res.status(500).json({ message: 'Server error updating vendor.' });
    }
  }

  static async deleteVendor(req, res) {
    const { id } = req.params;
    try {
      const vendor = await Vendor.findById(id);
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found.' });
      }
      await Vendor.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting vendor.' });
    }
  }
}

module.exports = VendorController;
