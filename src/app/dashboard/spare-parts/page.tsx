
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SparePart } from "@/lib/types";
import { getSpareParts, addSparePart, updateSparePart, deleteSparePart } from "@/services/spareParts";
import { SparePartForm } from "@/components/dashboard/spare-parts/spare-part-form";
import { SparePartsList } from "@/components/dashboard/spare-parts/spare-parts-list";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addNotification } from "@/services/notifications";

export default function SparePartsPage() {
    const [spareParts, setSpareParts] = useState<SparePart[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPart, setEditingPart] = useState<SparePart | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchSpareParts = useCallback(async () => {
        setIsLoading(true);
        try {
            const parts = await getSpareParts();
            setSpareParts(parts);
        } catch (error) {
            console.error("Error fetching spare parts: ", error);
            toast({
                title: "Error",
                description: "Gagal mengambil data spare part.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSpareParts();
    }, [fetchSpareParts]);
    
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        spareParts.forEach(part => {
            part.tags?.forEach(tag => tags.add(tag.trim()));
        });
        return Array.from(tags).sort();
    }, [spareParts]);

    const filteredSpareParts = useMemo(() => {
        return spareParts.filter(part => {
            const matchesSearch = searchTerm === "" ||
                part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                part.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                part.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesTag = selectedTag === null || part.tags?.includes(selectedTag);

            return matchesSearch && matchesTag;
        });
    }, [spareParts, searchTerm, selectedTag]);

    const handleOpenForm = (part: SparePart | null = null) => {
        setEditingPart(part);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingPart(null);
        setIsFormOpen(false);
    };

    const handleSavePart = async (data: Omit<SparePart, 'id'>) => {
        try {
            if (editingPart) {
                await updateSparePart(editingPart.id, data);
                toast({ title: "Sukses", description: "Spare part berhasil diperbarui." });
                await addNotification({ message: `Spare part "${data.name}" telah diperbarui.` });
                
                // Check for low stock on update
                if (data.lowStockLimit && data.quantity <= data.lowStockLimit) {
                    await addNotification({ message: `Stok Hampir Habis: "${data.name}" hanya tersisa ${data.quantity}.` });
                }
            } else {
                await addSparePart(data);
                toast({ title: "Sukses", description: "Spare part berhasil ditambahkan." });
                await addNotification({ message: `Spare part baru "${data.name}" telah ditambahkan.` });

                // Check for low stock on creation
                if (data.lowStockLimit && data.quantity <= data.lowStockLimit) {
                    await addNotification({ message: `Stok Hampir Habis: "${data.name}" hanya tersisa ${data.quantity}.` });
                }
            }
            await fetchSpareParts();
            return true;
        } catch (error) {
            console.error("Error saving spare part:", error);
            toast({ title: "Error", description: "Tidak dapat menyimpan spare part.", variant: "destructive" });
            return false;
        }
    };

    const handleDeletePart = async (id: string) => {
        const partToDelete = spareParts.find(p => p.id === id);
        if (!partToDelete) return;

        try {
            await deleteSparePart(id);
            setSpareParts(prev => prev.filter(p => p.id !== id));
            toast({ title: "Sukses", description: "Spare part berhasil dihapus." });
            await addNotification({ message: `Spare part "${partToDelete.name}" telah dihapus.` });
        } catch (error) {
            console.error("Error deleting spare part:", error);
            toast({ title: "Error", description: "Tidak dapat menghapus spare part.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Manajemen Spare Parts</h1>
                        <p className="text-muted-foreground">
                            Lacak dan kelola semua suku cadang peralatan.
                        </p>
                    </div>
                    <Button onClick={() => handleOpenForm()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Spare Part
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-full max-w-sm">
                        <Input
                            placeholder="Cari berdasarkan nama, deskripsi, atau tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                {selectedTag ? `Filter: ${selectedTag}` : 'Filter per Tag'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Pilih tag untuk memfilter</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={selectedTag === null}
                                onCheckedChange={() => setSelectedTag(null)}
                            >
                                Semua Tag
                            </DropdownMenuCheckboxItem>
                            {allTags.map(tag => (
                                <DropdownMenuCheckboxItem
                                    key={tag}
                                    checked={selectedTag === tag}
                                    onCheckedChange={() => setSelectedTag(tag)}
                                >
                                    {tag}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
                </div>
            ) : (
                <SparePartsList
                    spareParts={filteredSpareParts}
                    onEdit={handleOpenForm}
                    onDelete={handleDeletePart}
                    onTagClick={setSelectedTag}
                />
            )}

            <SparePartForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSavePart}
                sparePart={editingPart}
            />
        </div>
    );
}
