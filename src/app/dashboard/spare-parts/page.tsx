
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SparePart } from "@/lib/types";
import { getSpareParts, addSparePart, updateSparePart, deleteSparePart } from "@/services/spareParts";
import { SparePartForm } from "@/components/dashboard/spare-parts/spare-part-form";
import { SparePartsList } from "@/components/dashboard/spare-parts/spare-parts-list";

export default function SparePartsPage() {
    const [spareParts, setSpareParts] = useState<SparePart[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPart, setEditingPart] = useState<SparePart | null>(null);
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
                description: "Failed to fetch spare parts.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSpareParts();
    }, [fetchSpareParts]);

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
                toast({ title: "Success", description: "Spare part updated successfully." });
            } else {
                await addSparePart(data);
                toast({ title: "Success", description: "Spare part added successfully." });
            }
            await fetchSpareParts();
            return true;
        } catch (error) {
            console.error("Error saving spare part:", error);
            toast({ title: "Error", description: "Could not save spare part.", variant: "destructive" });
            return false;
        }
    };

    const handleDeletePart = async (id: string) => {
        try {
            await deleteSparePart(id);
            setSpareParts(prev => prev.filter(p => p.id !== id));
            toast({ title: "Success", description: "Spare part deleted successfully." });
        } catch (error) {
            console.error("Error deleting spare part:", error);
            toast({ title: "Error", description: "Could not delete spare part.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Spare Parts Management</h1>
                    <p className="text-muted-foreground">
                        Track and manage all equipment spare parts.
                    </p>
                </div>
                <Button onClick={() => handleOpenForm()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Spare Part
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
                </div>
            ) : (
                <SparePartsList
                    spareParts={spareParts}
                    onEdit={handleOpenForm}
                    onDelete={handleDeletePart}
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
