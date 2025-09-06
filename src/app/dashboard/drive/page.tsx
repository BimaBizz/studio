
"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, File, Loader2, Trash2 } from 'lucide-react';
import { type DriveFile, type DriveCategory } from '@/lib/types';
import { getFiles, deleteFile, getCategories } from '@/services/drive';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryTabs } from '@/components/dashboard/drive/category-tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addNotification } from '@/services/notifications';

export default function DrivePage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [categories, setCategories] = useState<DriveCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadCategory, setUploadCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedFiles = await getFiles();
      setFiles(fetchedFiles);
    } catch (error) {
       toast({
        title: "Error",
        description: "Gagal mengambil data file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      // Logic to set a default upload category
      if (fetchedCategories.length > 0) {
        // If the current uploadCategory is no longer valid or not set, default to the first one.
        if (!uploadCategory || !fetchedCategories.some(c => c.name === uploadCategory)) {
          setUploadCategory(fetchedCategories[0].name);
        }
      } else {
        // If there are no categories, clear the upload category.
        setUploadCategory('');
      }
    } catch (error) {
       toast({
        title: "Error",
        description: "Gagal mengambil data kategori.",
        variant: "destructive",
      });
    }
  }, [toast, uploadCategory]);


  useEffect(() => {
    fetchFiles();
    fetchCategories();
  }, [fetchFiles, fetchCategories]);

  const handleFileSelect = () => {
    if (!uploadCategory) {
      toast({
        title: "Pilih Kategori",
        description: "Silakan pilih kategori sebelum mengunggah file.",
        variant: "default",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadCategory) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', uploadCategory);

    try {
      const response = await fetch('/api/drive', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengunggah file.');
      }
      
      toast({
        title: "Sukses",
        description: `File "${file.name}" berhasil diunggah.`,
      });
      await addNotification({ message: `File baru "${file.name}" telah diunggah ke Drive.` });
      await fetchFiles();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Tidak dapat mengunggah file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      await deleteFile(fileToDelete.id);
      setFiles(files.filter(f => f.id !== fileToDelete.id));
      toast({ title: "Sukses", description: `File "${fileToDelete.fileName}" berhasil dihapus.` });
      await addNotification({ message: `File "${fileToDelete.fileName}" telah dihapus dari Drive.` });
    } catch (error) {
        toast({ title: "Error", description: "Tidak dapat menghapus file.", variant: "destructive" });
    } finally {
        setFileToDelete(null);
    }
  };

  const filteredFiles = useMemo(() => {
    if (selectedCategory === 'all') {
      return files;
    }
    return files.filter(file => file.category === selectedCategory);
  }, [files, selectedCategory]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Drive</h1>
        <p className="text-muted-foreground">
          Unggah dan kelola file bersama Anda berdasarkan kategori.
        </p>
      </div>

      <CategoryTabs 
        categories={categories}
        setCategories={setCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onCategoriesUpdate={fetchCategories}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>File di "{selectedCategory === 'all' ? 'Semua Kategori' : categories.find(c => c.name === selectedCategory)?.name || selectedCategory}"</CardTitle>
              <CardDescription>Klik untuk mengunduh file atau gunakan tindakan untuk mengelola.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleFileSelect} disabled={isUploading || !uploadCategory}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                {isUploading ? 'Mengunggah...' : 'Unggah File'}
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map(file => (
                <div key={file.id} className="group relative">
                  <a href={file.url} download={file.fileName} target="_blank" rel="noopener noreferrer">
                    <Card className="h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                      <File className="h-10 w-10 mb-2" />
                      <p className="font-semibold break-words w-full text-sm leading-tight">{file.fileName}</p>
                    </Card>
                  </a>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setFileToDelete(file);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-semibold">Belum Ada File</h3>
              <p className="text-muted-foreground mt-2">
                {selectedCategory === 'all' ? 'Klik "Unggah File" untuk memulai.' : `Tidak ada file yang ditemukan di kategori "${selectedCategory}".`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!fileToDelete} onOpenChange={(isOpen) => !isOpen && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus file secara permanen <strong>{fileToDelete?.fileName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFileToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
