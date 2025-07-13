const ImportProfile = require('../models/ImportProfile');

class ImportProfileController {
  static async getAllProfiles(req, res) {
    try {
      const profiles = await ImportProfile.findAll();
      res.status(200).json(profiles);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching import profiles.', error: error.message });
    }
  }

  static async createProfile(req, res) {
    try {
      const profile = await ImportProfile.create(req.body);
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Error creating import profile.', error: error.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const profile = await ImportProfile.update(req.params.id, req.body);
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Error updating import profile.', error: error.message });
    }
  }

  static async deleteProfile(req, res) {
    try {
      await ImportProfile.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting import profile.', error: error.message });
    }
  }
}

module.exports = ImportProfileController;