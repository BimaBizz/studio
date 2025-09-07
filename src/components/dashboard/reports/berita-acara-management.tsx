
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { BeritaAcara } from "@/lib/types";
import { getReports, addReport, updateReport, deleteReport } from "@/services/reports";
import { BeritaAcaraForm } from "./berita-acara-form";
import { BeritaAcaraList } from "./berita-acara-list";
import { addNotification } from "@/services/notifications";
import { auth } from "@/lib/firebase";

export default function BeritaAcaraManagement() {
    const [reports, setReports] = useState<BeritaAcara[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<BeritaAcara | null>(null);
    const { toast } = useToast();

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedReports = await getReports();
            setReports(fetchedReports);
        } catch (error) {
            console.error("Error fetching reports: ", error);
            toast({
                title: "Error",
                description: "Gagal mengambil data laporan.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleOpenForm = (report: BeritaAcara | null = null) => {
        setEditingReport(report);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingReport(null);
        setIsFormOpen(false);
    };

    const handleSaveReport = async (data: Omit<BeritaAcara, 'id' | 'createdAt' | 'createdBy'>) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            toast({ title: "Error", description: "Anda harus login untuk melakukan aksi ini.", variant: "destructive" });
            return false;
        }
        
        try {
            if (editingReport) {
                await updateReport(editingReport.id, data);
                toast({ title: "Sukses", description: "Laporan berhasil diperbarui." });
                await addNotification({ message: `Laporan "${data.title}" telah diperbarui.` });
            } else {
                await addReport({ ...data, createdBy: currentUser.uid });
                toast({ title: "Sukses", description: "Laporan berhasil ditambahkan." });
                await addNotification({ message: `Laporan baru "${data.title}" telah dibuat.` });
            }
            await fetchReports();
            return true;
        } catch (error) {
            console.error("Error saving report:", error);
            toast({ title: "Error", description: "Tidak dapat menyimpan laporan.", variant: "destructive" });
            return false;
        }
    };

    const handleDeleteReport = async (id: string) => {
        const reportToDelete = reports.find(r => r.id === id);
        if (!reportToDelete) return;

        try {
            await deleteReport(id);
            setReports(prev => prev.filter(r => r.id !== id));
            toast({ title: "Sukses", description: "Laporan berhasil dihapus." });
            await addNotification({ message: `Laporan "${reportToDelete.title}" telah dihapus.` });
        } catch (error) {
            console.error("Error deleting report:", error);
            toast({ title: "Error", description: "Tidak dapat menghapus laporan.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Manajemen Berita Acara</h2>
                        <p className="text-muted-foreground">
                            Buat, lihat, dan kelola semua berita acara tim Anda.
                        </p>
                    </div>
                    <Button onClick={() => handleOpenForm()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Buat Laporan Baru
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
                </div>
            ) : (
                <BeritaAcaraList
                    reports={reports}
                    onEdit={handleOpenForm}
                    onDelete={handleDeleteReport}
                />
            )}

            <BeritaAcaraForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSaveReport}
                report={editingReport}
            />
        </div>
    );
}
