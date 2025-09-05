
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, FileText, Loader2, Trash2 } from 'lucide-react';
import { type DrivePage } from '@/lib/types';
import { createPage, getPages, deletePage } from '@/services/drive';
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

export default function DrivePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pages, setPages] = useState<DrivePage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<DrivePage | null>(null);

  useEffect(() => {
    async function fetchPages() {
      try {
        const fetchedPages = await getPages();
        setPages(fetchedPages);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch drive pages.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPages();
  }, [toast]);

  const handleCreatePage = async () => {
    setIsCreating(true);
    try {
      const pageId = await createPage({ title: 'Untitled Page', content: '' });
      toast({
        title: "Success",
        description: "New page created. Redirecting...",
      });
      router.push(`/dashboard/drive/${pageId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create a new page.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;
    try {
      await deletePage(pageToDelete.id);
      setPages(pages.filter(p => p.id !== pageToDelete.id));
      toast({ title: "Success", description: `Page "${pageToDelete.title}" deleted.` });
    } catch (error) {
        toast({ title: "Error", description: "Could not delete page.", variant: "destructive" });
    } finally {
        setPageToDelete(null);
    }
  };


  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Drive</h1>
                <p className="text-muted-foreground">
                    Create and manage your documents and pages.
                </p>
            </div>
            <Button onClick={handleCreatePage} disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus className="mr-2 h-4 w-4" />}
                {isCreating ? 'Creating...' : 'Create New Page'}
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>All Pages</CardTitle>
                <CardDescription>Click on a page to view or edit it.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28" />)}
                    </div>
                ) : pages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {pages.map(page => (
                            <div key={page.id} className="group relative">
                                <Card 
                                    className="h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                                    onClick={() => router.push(`/dashboard/drive/${page.id}`)}
                                >
                                    <FileText className="h-8 w-8 mb-2" />
                                    <p className="font-semibold break-words w-full">{page.title}</p>
                                </Card>
                                <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPageToDelete(page);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold">No Pages Yet</h3>
                        <p className="text-muted-foreground mt-2">Click "Create New Page" to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <AlertDialog open={!!pageToDelete} onOpenChange={(isOpen) => !isOpen && setPageToDelete(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the page titled <strong>{pageToDelete?.title}</strong>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPageToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
