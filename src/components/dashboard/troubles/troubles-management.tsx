
"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Trouble, User } from "@/lib/types";
import { getTroubles, addTrouble, updateTrouble, deleteTrouble } from "@/services/troubles";
import { getDocs, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, differenceInMinutes, format, eachDayOfInterval, getDay, getDaysInMonth, isSameDay } from "date-fns";
import { id as IndonesianLocale } from "date-fns/locale";
import { AttendanceControls } from "../attendance/attendance-controls";
import { TroublesTable } from "./troubles-table";
import { TroubleForm } from "./trouble-form";
import { addNotification } from "@/services/notifications";
import * as XLSX from "xlsx";


export default function TroublesManagement() {
    const [troubles, setTroubles] = useState<Trouble[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTrouble, setEditingTrouble] = useState<Trouble | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const { toast } = useToast();

    const fetchData = useCallback(async (range: DateRange | undefined) => {
        setIsLoading(true);
        try {
            const [troublesData, usersSnapshot] = await Promise.all([
                getTroubles(range),
                getDocs(collection(db, "users"))
            ]);
            setTroubles(troublesData);
            setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({
                title: "Error",
                description: "Gagal memuat data trouble.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        const user = auth.currentUser;
        setCurrentUserId(user ? user.uid : null);
        fetchData(dateRange);
    }, [dateRange, fetchData]);

    const handleOpenForm = (trouble: Trouble | null = null) => {
        setEditingTrouble(trouble);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingTrouble(null);
        setIsFormOpen(false);
    };

    const handleSaveTrouble = async (data: Omit<Trouble, 'id' | 'createdAt' | 'createdBy' | 'durationMinutes' | 'date'> & { timeOff: string, timeOn: string }) => {
        if (!currentUserId) {
            toast({ title: "Error", description: "Tidak dapat menyimpan, pengguna tidak terautentikasi.", variant: "destructive" });
            return false;
        }

        const timeOffDate = new Date(data.timeOff);
        const timeOnDate = new Date(data.timeOn);
        
        const durationMinutes = differenceInMinutes(timeOnDate, timeOffDate);

        const troubleData = {
            ...data,
            durationMinutes,
            date: timeOffDate.toISOString().split('T')[0] + 'T00:00:00.000Z', // Store date part only for querying
            createdBy: currentUserId,
        };

        try {
            if (editingTrouble) {
                await updateTrouble(editingTrouble.id, troubleData);
                toast({ title: "Sukses", description: "Laporan trouble berhasil diperbarui." });
                await addNotification({ message: `Laporan trouble untuk unit "${data.unitName}" telah diperbarui.` });
            } else {
                await addTrouble(troubleData);
                toast({ title: "Sukses", description: "Laporan trouble berhasil ditambahkan." });
                await addNotification({ message: `Laporan trouble baru untuk unit "${data.unitName}" telah dibuat.` });
            }
            await fetchData(dateRange);
            return true;
        } catch (error) {
            console.error("Error saving trouble:", error);
            toast({ title: "Error", description: "Tidak dapat menyimpan laporan trouble.", variant: "destructive" });
            return false;
        }
    };

    const handleDeleteTrouble = async (id: string) => {
        const troubleToDelete = troubles.find(t => t.id === id);
        if (!troubleToDelete) return;

        try {
            await deleteTrouble(id);
            setTroubles(prev => prev.filter(t => t.id !== id));
            toast({ title: "Sukses", description: "Laporan trouble berhasil dihapus." });
            await addNotification({ message: `Laporan trouble untuk unit "${troubleToDelete.unitName}" telah dihapus.` });
        } catch (error) {
            console.error("Error deleting trouble:", error);
            toast({ title: "Error", description: "Tidak dapat menghapus laporan trouble.", variant: "destructive" });
        }
    };

    const handleDailyExport = () => {
        if (!dateRange?.from) {
            toast({ title: "Peringatan", description: "Silakan pilih tanggal untuk mengekspor.", variant: "destructive" });
            return;
        }

        const reportDate = format(dateRange.from, "dd-MM-yyyy");
        const title = "UNIT TROBLE PMS BANDARA IGUSTI NGURAHRAI INTERNASIONAL DAN DOMSESTIK";
        const dateTitle = `TANGGAL : ${format(dateRange.from, "dd MMMM yyyy", { locale: IndonesianLocale })}`;

        const dataToExport = troubles.map((t, index) => ({
            "No": index + 1,
            "Nama Unit": t.unitName,
            "Waktu Off": format(new Date(t.timeOff), "HH:mm"),
            "Waktu On": format(new Date(t.timeOn), "HH:mm"),
            "Durasi Off": `${t.durationMinutes} menit`,
            "Keterangan": t.description,
        }));

        const ws = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: "A1" });
        XLSX.utils.sheet_add_aoa(ws, [[dateTitle]], { origin: "A2" });
        XLSX.utils.sheet_add_json(ws, dataToExport, { origin: "A4", skipHeader: false });

        ws['!cols'] = [
            { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 50 },
        ];
        
        ws['!merges'] = [ XLSX.utils.decode_range("A1:F1"), XLSX.utils.decode_range("A2:F2") ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Trouble Harian");
        XLSX.writeFile(wb, `Laporan Trouble Harian ${reportDate}.xlsx`);
    };

    const handleMonthlyExport = () => {
        if (!dateRange?.from) {
            toast({ title: "Peringatan", description: "Silakan pilih rentang tanggal (satu bulan).", variant: "destructive" });
            return;
        }
    
        const month = dateRange.from;
        const daysInSelectedMonth = getDaysInMonth(month);
    
        // Group troubles by unit and day
        const unitData: { [unitName: string]: { [day: number]: number } } = {};
        troubles.forEach(trouble => {
            const troubleDate = new Date(trouble.date);
            const dayOfMonth = getDay(troubleDate) + 1; // getDay is 0-indexed, we need 1-31
            const unitName = trouble.unitName;
    
            if (!unitData[unitName]) {
                unitData[unitName] = {};
            }
            if (!unitData[unitName][dayOfMonth]) {
                unitData[unitName][dayOfMonth] = 0;
            }
            unitData[unitName][dayOfMonth] += trouble.durationMinutes;
        });
    
        const ws_data: (string | number)[][] = [];
    
        // Headers
        ws_data.push(["UNIT TROBLE PMS BANDARA IGUSTI NGURAHRAI INTERNASIONAL DAN DOMSESTIK"]);
        ws_data.push(["LAPORAN BULANAN"]);
        ws_data.push([]); // Spacer
        
        const dateHeaders = ["No", "Nama Unit"];
        for (let i = 1; i <= daysInSelectedMonth; i++) {
            dateHeaders.push(i);
        }
        dateHeaders.push("TOTAL DURASI OFF");
        ws_data.push(dateHeaders);
    
        // Data Rows
        let rowIndex = 1;
        for (const unitName in unitData) {
            const row: (string | number)[] = [rowIndex++, unitName];
            let totalDuration = 0;
            for (let day = 1; day <= daysInSelectedMonth; day++) {
                const duration = unitData[unitName][day] || ""; // Leave blank if no trouble
                row.push(duration);
                if (typeof duration === 'number') {
                    totalDuration += duration;
                }
            }
            row.push(totalDuration);
            ws_data.push(row);
        }
    
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
        // Merging headers
        const merge = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: daysInSelectedMonth + 2 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: daysInSelectedMonth + 2 } },
        ];
        ws["!merges"] = merge;
    
        // Column widths
        const cols = [{ wch: 5 }, { wch: 30 }];
        for (let i = 0; i < daysInSelectedMonth; i++) {
            cols.push({ wch: 5 });
        }
        cols.push({ wch: 20 });
        ws['!cols'] = cols;
    
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Bulanan");
        XLSX.writeFile(wb, `Laporan Trouble Bulanan ${format(month, "MMMM-yyyy")}.xlsx`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AttendanceControls dateRange={dateRange} setDateRange={setDateRange} />
                    <Button onClick={handleDailyExport} variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Ekspor Harian
                    </Button>
                    <Button onClick={handleMonthlyExport} variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Ekspor Bulanan
                    </Button>
                </div>
                <Button onClick={() => handleOpenForm()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Laporan
                </Button>
            </div>

            {isLoading ? (
                <div className="rounded-lg border p-4 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ) : (
                <TroublesTable
                    troubles={troubles}
                    users={users}
                    onEdit={handleOpenForm}
                    onDelete={handleDeleteTrouble}
                />
            )}

            <TroubleForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSaveTrouble}
                trouble={editingTrouble}
            />
        </div>
    );
}
