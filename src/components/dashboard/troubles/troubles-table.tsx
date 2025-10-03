
"use client";

import { useState } from "react";
import type { Trouble, User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { id as IndonesianLocale } from "date-fns/locale";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
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

interface TroublesTableProps {
    troubles: Trouble[];
    users: User[];
    onEdit: (trouble: Trouble) => void;
    onDelete: (troubleId: string) => void;
}

export function TroublesTable({ troubles, users, onEdit, onDelete }: TroublesTableProps) {
    const [troubleToDelete, setTroubleToDelete] = useState<Trouble | null>(null);
    const getUserById = (id: string) => users.find(user => user.id === id);

    if (troubles.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                <CardTitle className="text-xl font-semibold">Tidak Ada Laporan</CardTitle>
                <CardDescription className="mt-2 text-muted-foreground">
                    Tidak ada laporan trouble yang ditemukan untuk rentang tanggal ini.
                </CardDescription>
            </Card>
        );
    }
  
    return (
    <>
        <div className="rounded-lg border">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nama Unit</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu Off</TableHead>
                    <TableHead>Waktu On</TableHead>
                    <TableHead>Durasi (Menit)</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Dibuat Oleh</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {troubles.map((trouble) => {
                    const createdBy = getUserById(trouble.createdBy);
                    return (
                        <TableRow key={trouble.id}>
                            <TableCell className="font-medium">{trouble.unitName}</TableCell>
                            <TableCell>{format(new Date(trouble.date), "d MMM yyyy", { locale: IndonesianLocale })}</TableCell>
                            <TableCell>{format(new Date(trouble.timeOff), "HH:mm", { locale: IndonesianLocale })}</TableCell>
                            <TableCell>{format(new Date(trouble.timeOn), "HH:mm", { locale: IndonesianLocale })}</TableCell>
                            <TableCell>{trouble.durationMinutes}</TableCell>
                            <TableCell className="max-w-[250px] truncate">{trouble.description}</TableCell>
                            <TableCell>{createdBy?.name || 'Tidak diketahui'}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Buka menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(trouble)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => setTroubleToDelete(trouble)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
            </Table>
        </div>
        <AlertDialog open={!!troubleToDelete} onOpenChange={(isOpen) => !isOpen && setTroubleToDelete(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus laporan trouble untuk unit <strong>{troubleToDelete?.unitName}</strong>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setTroubleToDelete(null)}>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    if (troubleToDelete) {
                        onDelete(troubleToDelete.id);
                        setTroubleToDelete(null);
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
