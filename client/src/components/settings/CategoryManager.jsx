import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button, buttonVariants } from '../ui/button';
import { Input } from '../ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Trash2 } from 'lucide-react';

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
    try {
      await api.deleteCategory(categoryId);
      fetchCategories();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
    try {
      await api.deleteSubcategory(categoryId, subcategoryId);
      fetchCategories();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleSubcategoryNameChange = (categoryId, value) => {
    setNewSubcategoryNames(prev => ({...prev, [categoryId]: value}));
  };

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateCategory} className="flex items-center gap-2 p-4 border rounded-lg">
        <Input
          placeholder="New Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit">Add Category</Button>
      </form>

      <Accordion type="single" collapsible className="w-full">
        {categories.map(category => (
          <AccordionItem value={`category-${category.id}`} key={category.id}>
            <div className="flex items-center justify-between">
              <AccordionTrigger className="flex-grow">
                <span className="font-semibold">{category.name}</span>
              </AccordionTrigger>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete "{category.name}"?</AlertDialogTitle><AlertDialogDescription>This will delete the main category and ALL its subcategories. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <AccordionContent>
              <div className="pl-4 space-y-4">
                <ul className="pl-6 space-y-2">
                  {category.subcategories && category.subcategories.length > 0 ? (
                    category.subcategories.map(sub => (
                      <li key={sub.id} className="flex items-center justify-between text-muted-foreground">
                        <span>- {sub.name}</span>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Delete "{sub.name}"?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSubcategory(category.id, sub.id)} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </li>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No subcategories yet.</p>
                  )}
                </ul>
                <form onSubmit={(e) => handleCreateSubcategory(e, category.id)} className="flex items-center gap-2 pt-2 border-t">
                   <Input placeholder="New Subcategory Name" value={newSubcategoryNames[category.id] || ''} onChange={(e) => handleSubcategoryNameChange(category.id, e.target.value)} className="flex-grow"/>
                   <Button type="submit" variant="secondary">Add Subcategory</Button>
                </form>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default CategoryManager;
