
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MaintenanceApproval } from "@/lib/types";
import { getMaintenanceApprovals, addMaintenanceApproval, updateMaintenanceApproval, deleteMaintenanceApproval } from "@/services/maintenance";
import { MaintenanceApprovalForm } from "./maintenance-approval-form";
import { MaintenanceApprovalList } from "./maintenance-approval-list";
import { addNotification } from "@/services/notifications";
import { auth } from "@/lib/firebase";
import { format } from "date-fns";

export default function MaintenanceApprovalManagement() {
    const [reports, setReports] = useState<MaintenanceApproval[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<MaintenanceApproval | null>(null);
    const { toast } = useToast();

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedReports = await getMaintenanceApprovals();
            setReports(fetchedReports);
        } catch (error) {
            console.error("Error fetching reports: ", error);
            toast({
                title: "Error",
                description: "Gagal mengambil data persetujuan.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleOpenForm = (report: MaintenanceApproval | null = null) => {
        setEditingReport(report);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingReport(null);
        setIsFormOpen(false);
    };

    const handleSaveReport = async (data: Omit<MaintenanceApproval, 'id' | 'createdAt' | 'createdBy'>) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            toast({ title: "Error", description: "Anda harus login untuk melakukan aksi ini.", variant: "destructive" });
            return false;
        }
        
        const formattedDate = format(new Date(data.hariTanggal), "dd MMMM yyyy");

        try {
            if (editingReport) {
                await updateMaintenanceApproval(editingReport.id, data);
                toast({ title: "Sukses", description: "Persetujuan berhasil diperbarui." });
                await addNotification({ message: `Persetujuan Maintenance untuk ${formattedDate} telah diperbarui.` });
            } else {
                await addMaintenanceApproval({ ...data, createdBy: currentUser.uid });
                toast({ title: "Sukses", description: "Persetujuan berhasil ditambahkan." });
                await addNotification({ message: `Persetujuan Maintenance baru untuk ${formattedDate} telah dibuat.` });
            }
            await fetchReports();
            return true;
        } catch (error) {
            console.error("Error saving approval:", error);
            toast({ title: "Error", description: "Tidak dapat menyimpan persetujuan.", variant: "destructive" });
            return false;
        }
    };

    const handleDeleteReport = async (id: string) => {
        const reportToDelete = reports.find(r => r.id === id);
        if (!reportToDelete) return;
        
        const formattedDate = format(new Date(reportToDelete.hariTanggal), "dd MMMM yyyy");

        try {
            await deleteMaintenanceApproval(id);
            setReports(prev => prev.filter(r => r.id !== id));
            toast({ title: "Sukses", description: "Persetujuan berhasil dihapus." });
            await addNotification({ message: `Persetujuan Maintenance untuk ${formattedDate} telah dihapus.` });
        } catch (error) {
            console.error("Error deleting approval:", error);
            toast({ title: "Error", description: "Tidak dapat menghapus persetujuan.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Manajemen Persetujuan Maintenance</h2>
                        <p className="text-muted-foreground">
                            Buat dan kelola perizinan untuk maintenance bulanan.
                        </p>
                    </div>
                    <Button onClick={() => handleOpenForm()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Buat Izin Baru
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
                </div>
            ) : (
                <MaintenanceApprovalList
                    reports={reports}
                    onEdit={handleOpenForm}
                    onDelete={handleDeleteReport}
                />
            )}

            <MaintenanceApprovalForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSaveReport}
                report={editingReport}
            />
        </div>
    );
}
