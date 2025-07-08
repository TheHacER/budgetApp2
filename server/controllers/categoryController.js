const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

class CategoryController {
  static async createCategory(req, res) {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    try {
      const newCategory = await Category.create(name);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ message: `Category '${name}' already exists.` });
      }
      res.status(500).json({ message: 'Server error creating category.' });
    }
  }

  static async createSubcategory(req, res) {
    const { categoryId } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Subcategory name is required.' });
    }
    try {
        const newSubcategory = await Subcategory.create(name, categoryId);
        res.status(201).json(newSubcategory);
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ message: `Subcategory '${name}' already exists in this category.` });
        }
        res.status(500).json({ message: 'Server error creating subcategory.' });
    }
  }

  static async getAllCategories(req, res) {
    try {
      if (req.query.with_subcategories === 'true') {
        const categories = await Category.findAllWithSubcategories();
        return res.status(200).json(categories);
      } else {
        const categories = await Category.findAll();
        return res.status(200).json(categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: 'Server error fetching categories.' });
    }
  }

  static async deleteCategory(req, res) {
    const { id } = req.params;
    try {
      await Category.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting category.' });
    }
  }

  static async deleteSubcategory(req, res) {
    const { subcategoryId } = req.params;
    try {
      await Subcategory.delete(subcategoryId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting subcategory.' });
    }
  }
}

module.exports = CategoryController;
