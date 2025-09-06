
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
import { addNotification } from '@/services/notifications';

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
      toast({ title: 'Error', description: 'Nama kategori tidak boleh kosong.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await addCategory(newCategoryName);
      toast({ title: 'Sukses', description: `Kategori "${newCategoryName}" berhasil dibuat.` });
      await addNotification({ message: `Kategori Drive baru "${newCategoryName}" telah dibuat.` });
      setNewCategoryName('');
      setIsDialogOpen(false);
      onCategoriesUpdate(); // Refresh categories in the parent component
    } catch (error) {
      toast({ title: 'Error', description: 'Tidak dapat membuat kategori.', variant: 'destructive' });
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
      toast({ title: 'Sukses', description: 'Kategori berhasil dihapus.' });
      await addNotification({ message: `Kategori Drive "${categoryName}" telah dihapus.` });
      onCategoriesUpdate(); // Refresh categories in the parent component
    } catch (error) {
      toast({ title: 'Error', description: 'Tidak dapat menghapus kategori.', variant: 'destructive' });
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="h-auto">
            <TabsTrigger value="all">Semua</TabsTrigger>
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
          Kategori Baru
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Kategori Baru</DialogTitle>
            <DialogDescription>
              Masukkan nama untuk kategori file baru.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="Contoh: 'Dokumen Proyek'"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleAddCategory} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Membuat...' : 'Buat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
