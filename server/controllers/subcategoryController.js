const Subcategory = require('../models/Subcategory');

const SubcategoryController = {
  getAllSubcategoriesWithParent: async (req, res) => {
    try {
      const subcategories = await Subcategory.findAllWithParent();
      res.status(200).json(subcategories);
    } catch (error) {
      console.error('Error fetching all subcategories:', error);
      res.status(500).json({ message: 'Server error fetching subcategories.' });
    }
  }
};

module.exports = SubcategoryController;
