
"use client";

import type { BeritaAcara } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, FileText } from "lucide-react";
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
import { useState } from "react";
import { format } from "date-fns";
import { id as IndonesianLocale } from "date-fns/locale";

interface BeritaAcaraListProps {
    reports: BeritaAcara[];
    onEdit: (report: BeritaAcara) => void;
    onDelete: (id: string) => void;
}

export function BeritaAcaraList({ reports, onEdit, onDelete }: BeritaAcaraListProps) {
    const [reportToDelete, setReportToDelete] = useState<BeritaAcara | null>(null);

    if (reports.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold mt-4">Belum Ada Laporan</h3>
                <p className="text-muted-foreground mt-2">
                    Klik "Buat Laporan Baru" untuk memulai.
                </p>
            </div>
        );
    }
    
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map(report => (
                    <Card key={report.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="line-clamp-2">{report.title}</CardTitle>
                             <CardDescription>
                                Dibuat pada {report.createdAt ? format(report.createdAt.toDate(), "d MMMM yyyy, HH:mm", { locale: IndonesianLocale }) : 'N/A'}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => onEdit(report)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => setReportToDelete(report)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <AlertDialog open={!!reportToDelete} onOpenChange={(isOpen) => !isOpen && setReportToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus laporan secara permanen <strong>{reportToDelete?.title}</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setReportToDelete(null)}>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        if(reportToDelete) {
                            onDelete(reportToDelete.id)
                            setReportToDelete(null)
                        }
                    }} className="bg-destructive hover:bg-destructive/90">
                    Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
