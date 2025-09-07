
"use client";

import type { BeritaAcara } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, FileText, Printer, Loader2 } from "lucide-react";
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
import { format, parseISO } from "date-fns";
import { id as IndonesianLocale } from "date-fns/locale";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportPDF } from "./ReportPDF";

interface BeritaAcaraListProps {
    reports: BeritaAcara[];
    onEdit: (report: BeritaAcara) => void;
    onDelete: (id: string) => void;
}

export function BeritaAcaraList({ reports, onEdit, onDelete }: BeritaAcaraListProps) {
    const [reportToDelete, setReportToDelete] = useState<BeritaAcara | null>(null);
    const [isPrinting, setIsPrinting] = useState<string | null>(null);
    const [pdfReport, setPdfReport] = useState<BeritaAcara | null>(null);

    const handlePrint = async (report: BeritaAcara) => {
        setIsPrinting(report.id);
        setPdfReport(report);

        // Allow time for the PDF component to render with the correct data
        setTimeout(async () => {
            const reportElement = document.getElementById('report-pdf-content');
            if (!reportElement) {
                console.error("PDF content element not found!");
                setIsPrinting(null);
                setPdfReport(null);
                return;
            }

            const canvas = await html2canvas(reportElement, {
                scale: 2, // Increase resolution
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            const reportTitle = `Berita Acara - ${report.drUraianKerusakan}`;
            pdf.save(`${reportTitle} - ${format(new Date(), "yyyy-MM-dd")}.pdf`);
            
            setIsPrinting(null);
            setPdfReport(null);
        }, 500); // 500ms delay
    };
    
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
                {reports.map(report => {
                     const title = `Laporan: ${report.drUraianKerusakan || 'N/A'}`;
                     const createdDate = report.createdAt?.toDate ? format(report.createdAt.toDate(), "d MMMM yyyy, HH:mm", { locale: IndonesianLocale }) : 'N/A';

                    return (
                        <Card key={report.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="line-clamp-2">{title}</CardTitle>
                                <CardDescription>
                                    Dibuat pada {createdDate}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-auto flex justify-end gap-2">
                                <Button variant="outline" size="icon" onClick={() => handlePrint(report)} disabled={isPrinting === report.id}>
                                    {isPrinting === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => onEdit(report)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => setReportToDelete(report)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Hidden component for rendering the PDF content */}
            <div className="absolute -z-10 -left-[9999px] top-0">
                 {pdfReport && <ReportPDF report={pdfReport} />}
            </div>

            <AlertDialog open={!!reportToDelete} onOpenChange={(isOpen) => !isOpen && setReportToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus laporan secara permanen.
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
