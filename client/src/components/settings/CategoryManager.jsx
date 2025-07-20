import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Box
} from '@mui/material';
import { ExpandMore, Delete } from '@mui/icons-material';

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryNames, setNewSubcategoryNames] = useState({});

  const fetchCategories = () => {
    api.getCategoriesWithSubcategories()
      .then(data => setCategories(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.createCategory(newCategoryName);
      setNewCategoryName('');
      fetchCategories();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleCreateSubcategory = async (e, categoryId) => {
    e.preventDefault();
    const subcategoryName = newSubcategoryNames[categoryId];
    if (!subcategoryName || !subcategoryName.trim()) return;
    try {
      await api.createSubcategory(categoryId, subcategoryName);
      setNewSubcategoryNames(prev => ({ ...prev, [categoryId]: '' }));
      fetchCategories();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category and all its subcategories?')) {
        try {
            await api.deleteCategory(categoryId);
            fetchCategories();
          } catch (err) { alert(`Error: ${err.message}`); }
    }
  };

  const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
    if(window.confirm('Are you sure you want to delete this subcategory?')) {
        try {
            await api.deleteSubcategory(categoryId, subcategoryId);
            fetchCategories();
          } catch (err) { alert(`Error: ${err.message}`); }
    }
  };

  const handleSubcategoryNameChange = (categoryId, value) => {
    setNewSubcategoryNames(prev => ({ ...prev, [categoryId]: value }));
  };

  if (loading) return <p>Loading categories...</p>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box>
      <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <TextField
          label="New Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          fullWidth
          size="small"
        />
        <Button type="submit" variant="contained">Add Category</Button>
      </form>
      <Box>
        {categories.map(category => (
          <Accordion key={category.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography>{category.name}</Typography>
                <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id);}}>
                  <Delete />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <List dense>
                  {category.subcategories && category.subcategories.length > 0 ? (
                    category.subcategories.map(sub => (
                      <ListItem key={sub.id}>
                        <ListItemText primary={sub.name} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleDeleteSubcategory(category.id, sub.id)}>
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  ) : (
                    <Typography color="textSecondary" sx={{ml: 2}}>No subcategories yet.</Typography>
                  )}
                </List>
                <form onSubmit={(e) => handleCreateSubcategory(e, category.id)} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <TextField
                    label="New Subcategory Name"
                    value={newSubcategoryNames[category.id] || ''}
                    onChange={(e) => handleSubcategoryNameChange(category.id, e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <Button type="submit" variant="outlined">Add Subcategory</Button>
                </form>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}

export default CategoryManager;