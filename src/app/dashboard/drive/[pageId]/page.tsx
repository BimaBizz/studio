
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getPage, updatePage } from '@/services/drive';
import type { DrivePage } from '@/lib/types';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Debounce function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number) {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

export default function DriveDocumentPage() {
    const params = useParams();
    const router = useRouter();
    const pageId = params.pageId as string;
    const { toast } = useToast();

    const [page, setPage] = useState<DrivePage | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Debounced save function
    const debouncedSave = useCallback(
        debounce(async (id: string, newTitle: string, newContent: string) => {
            setIsSaving(true);
            try {
                await updatePage(id, { title: newTitle, content: newContent });
                toast({
                    title: "Saved",
                    description: "Your changes have been saved automatically.",
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to save changes.",
                    variant: "destructive",
                });
            } finally {
                setIsSaving(false);
            }
        }, 1500), // 1.5 second delay
    [toast]);

    useEffect(() => {
        if (!pageId) return;

        async function fetchPage() {
            setIsLoading(true);
            try {
                const fetchedPage = await getPage(pageId);
                if (fetchedPage) {
                    setPage(fetchedPage);
                    setTitle(fetchedPage.title);
                    setContent(fetchedPage.content);
                } else {
                    toast({ title: "Error", description: "Page not found.", variant: "destructive" });
                    router.replace('/dashboard/drive');
                }
            } catch (error) {
                toast({ title: "Error", description: "Failed to load the page.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchPage();
    }, [pageId, router, toast]);

    useEffect(() => {
        // Trigger debounced save when title or content changes
        if (page && (title !== page.title || content !== page.content)) {
            debouncedSave(pageId, title, content);
        }
    }, [title, content, page, pageId, debouncedSave]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!page) {
        return null; // or a not found component
    }

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => router.push('/dashboard/drive')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Drive
            </Button>
            <div className="space-y-4">
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Page Title"
                    className="text-3xl font-bold h-auto border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none"
                />
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your content here..."
                    className="min-h-[60vh] text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none"
                />
            </div>
            <div className="flex items-center justify-end text-sm text-muted-foreground">
                {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    'All changes saved'
                )}
            </div>
        </div>
    );
}
