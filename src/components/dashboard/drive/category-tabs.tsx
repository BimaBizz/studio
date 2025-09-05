
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
  onCategoriesUpdate: () => void; // Callback to refresh categories in parent
}

export function CategoryTabs({ categories, setCategories, selectedCategory, setSelectedCategory, onCategoriesUpdate }: CategoryTabsProps) {
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
      await addCategory(newCategoryName);
      toast({ title: 'Success', description: `Category "${newCategoryName}" created.` });
      setNewCategoryName('');
      setIsDialogOpen(false);
      onCategoriesUpdate(); // Refresh categories in the parent component
    } catch (error) {
      toast({ title: 'Error', description: 'Could not create category.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (categoryId === 'all') return;
    try {
      await deleteCategory(categoryId);
      if (selectedCategory === categoryName) {
          setSelectedCategory('all');
      }
      toast({ title: 'Success', description: 'Category deleted.' });
      onCategoriesUpdate(); // Refresh categories in the parent component
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
                  onClick={() => handleDeleteCategory(category.id, category.name)}
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
