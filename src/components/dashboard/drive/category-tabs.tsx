
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { DriveCategory } from '@/lib/types';
import { addCategory, deleteCategory } from '@/services/drive';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface CategoryTabsProps {
  categories: DriveCategory[];
  setCategories: React.Dispatch<React.SetStateAction<DriveCategory[]>>;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export function CategoryTabs({ categories, setCategories, selectedCategory, setSelectedCategory }: CategoryTabsProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') {
      toast({ title: 'Error', description: 'Category name cannot be empty.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const newCategory = await addCategory(newCategoryName);
      setCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: 'Success', description: `Category "${newCategory.name}" created.` });
      setNewCategoryName('');
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not create category.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Note: Deleting a category does not re-assign files.
  const handleDeleteCategory = async (categoryId: string) => {
    // Basic protection for 'all' or default categories if any.
    if (categoryId === 'all') return;
    try {
      await deleteCategory(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      // If the deleted category was selected, switch to 'all'
      if (selectedCategory === categories.find(c => c.id === categoryId)?.name) {
          setSelectedCategory('all');
      }
      toast({ title: 'Success', description: 'Category deleted.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not delete category.', variant: 'destructive' });
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(category => (
              <div key={category.id} className="relative group pr-2">
                <TabsTrigger value={category.name} className="pr-6">
                  {category.name}
                </TabsTrigger>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-0 -translate-y-1/2 h-5 w-5 opacity-50 group-hover:opacity-100"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                    <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </TabsList>
        </Tabs>

        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Enter a name for the new file category.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="e.g., 'Project Documents'"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
