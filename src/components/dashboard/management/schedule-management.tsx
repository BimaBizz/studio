
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { collection, getDocs, query, where, Timestamp, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Team, User, Schedule, Shift } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceControls } from "@/components/dashboard/attendance/attendance-controls"; // Re-using this component for date picking
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, format, eachDayOfInterval, isSameDay } from "date-fns";
import { id as IndonesianLocale } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ScheduleTable } from "@/components/dashboard/schedule/schedule-table";
import { ScheduleForm } from "@/components/dashboard/schedule/schedule-form";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { BatchScheduleForm } from "../schedule/batch-schedule-form";
import { addNotification } from "@/services/notifications";


export default function ScheduleManagement() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [scheduleRecords, setScheduleRecords] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<{ user: User; team: Team; date: Date; record?: Schedule } | null>(null);
    const { toast } = useToast();

    const fetchData = useCallback(async (range: DateRange | undefined) => {
        setIsLoading(true);
        try {
            if (teams.length === 0 || users.length === 0) {
                const teamsSnapshot = await getDocs(collection(db, "teams"));
                const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
                setTeams(teamsList);
                
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                setUsers(usersList);
            }
            
            if (range?.from && range.to) {
                const scheduleQuery = query(
                    collection(db, "schedules"),
                    where("date", ">=", Timestamp.fromDate(range.from)),
                    where("date", "<=", Timestamp.fromDate(range.to))
                );
                const scheduleSnapshot = await getDocs(scheduleQuery);
                const scheduleList = scheduleSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        date: (data.date as Timestamp).toDate().toISOString(),
                    } as Schedule;
                });
                setScheduleRecords(scheduleList);
            } else {
                setScheduleRecords([]);
            }

        } catch (error) {
            console.error("Error fetching data: ", error);
            toast({
                title: "Error",
                description: "Failed to fetch schedule data.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, teams.length, users.length]);

    useEffect(() => {
        fetchData(dateRange);
    }, [dateRange, fetchData]);

    const handleOpenForm = (user: User, team: Team, date: Date, record?: Schedule) => {
        setEditingSchedule({ user, team, date, record });
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingSchedule(null);
    };
    
    const handleSaveSchedule = async (data: {userId: string, teamId: string, date: Date, shift: Shift}) => {
        try {
            const batch = writeBatch(db);
            const scheduleDate = Timestamp.fromDate(data.date);
            
            const docId = `${data.userId}_${data.date.toISOString().split('T')[0]}`;
            const scheduleRef = doc(db, "schedules", docId);
            
            const recordToSave = {
                userId: data.userId,
                teamId: data.teamId,
                date: scheduleDate,
                shift: data.shift,
            };

            batch.set(scheduleRef, recordToSave, { merge: true });

            await batch.commit();
            toast({ title: "Success", description: "Schedule record saved."});
            
            const user = users.find(u => u.id === data.userId);
            const formattedDate = format(data.date, "dd MMMM yyyy");
            if(user) {
                await addNotification({ message: `Jadwal untuk ${user.name} pada ${formattedDate} diperbarui.` });
            }

            await fetchData(dateRange); // Refresh data
            return true;
        } catch (error) {
            console.error("Error saving schedule:", error);
            toast({ title: "Error", description: "Could not save schedule.", variant: "destructive" });
            return false;
        }
    };

    const handleBatchUpdateSchedule = async (teamId: string, pattern: Shift[]) => {
        if (!dateRange?.from || !dateRange.to || pattern.length === 0) {
            toast({ title: "Info", description: "Please select a date range and define a pattern.", variant: "default"});
            return;
        }

        const team = teams.find(t => t.id === teamId);
        if (!team) return;

        const teamMembers = team.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
        const teamLeader = users.find(u => u.id === team.leaderId);
        if (teamLeader) teamMembers.unshift(teamLeader);

        const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

        try {
            const batch = writeBatch(db);
            let writeCount = 0;

            teamMembers.forEach(member => {
                days.forEach((day, dayIndex) => {
                    const shiftForDay = pattern[dayIndex % pattern.length];
                    
                    const docId = `${member.id}_${day.toISOString().split('T')[0]}`;
                    const scheduleRef = doc(db, "schedules", docId);

                    const recordToSave = {
                        userId: member.id,
                        teamId: team.id,
                        date: Timestamp.fromDate(day),
                        shift: shiftForDay,
                    };
                    batch.set(scheduleRef, recordToSave, { merge: true });
                    writeCount++;

                    // Firestore batch writes are limited to 500 operations.
                    // This is a safeguard, although unlikely to be hit in normal use.
                    if (writeCount >= 499) {
                        console.warn("Approaching Firestore batch limit. Consider smaller date ranges.");
                    }
                });
            });

            await batch.commit();
            toast({ title: "Success", description: `Batch schedule applied to ${team.name}.`});
            const period = `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM yyyy")}`;
            await addNotification({ message: `Jadwal massal diterapkan untuk tim ${team.name} (${period}).` });
            await fetchData(dateRange); // Refresh data
        } catch (error) {
            console.error("Error batch updating schedule:", error);
            toast({ title: "Error", description: "Could not apply batch schedule.", variant: "destructive" });
        }
    };
    
    const uniqueTeams = useMemo(() => {
        const seen = new Set<string>();
        return teams.filter(team => {
            const duplicate = seen.has(team.name);
            seen.add(team.name);
            return !duplicate;
        });
    }, [teams]);

    const handleExport = () => {
        if (!dateRange?.from || !dateRange?.to) return;

        const wb = XLSX.utils.book_new();
        const period = format(dateRange.from, "MMMM yyyy", { locale: IndonesianLocale }).toUpperCase();
        
        const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
        
        const ws_data = [
            ["DAFTAR DINAS PT. DOVIN PRATAMA"],
            ["PELAKSANAAN PEKERJAAN KONTRAK PAYUNG PEMELIHARAAN DAN PERAWATAN PASSENGER MOVEMENT SYSTEM"],
            [`DI BANDAR UDARA INTERNASIONAL I GUSTI NGURAH RAI - BALI PERIODE ${period}`],
            [], // Spacer row
        ];

        const dateHeaders = ["NO", "NAMA", "JABATAN", ...days.map(d => format(d, "d"))];
        const dayNameHeaders = ["", "", "", ...days.map(d => format(d, "EEEEEE", { locale: IndonesianLocale }).toUpperCase())];
        
        ws_data.push(dateHeaders);
        ws_data.push(dayNameHeaders);

        let userIndex = 1;
        uniqueTeams.forEach(team => {
            ws_data.push([team.name]); // Team name as a group header
            
            const getUserById = (id: string) => users.find(user => user.id === id);
            
            let teamMembers = (team.memberIds.map(getUserById).filter(Boolean) as User[]);
            const teamLeader = getUserById(team.leaderId);

            if (teamLeader && !teamMembers.some(member => member.id === teamLeader.id)) {
                teamMembers.unshift(teamLeader);
            }

            const roleOrder: { [key: string]: number } = { 'Team Leader': 1, 'Teknisi': 2, 'Assisten Teknisi': 3 };
            teamMembers.sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));

            teamMembers.forEach(member => {
                const row: (string | number)[] = [userIndex++, member.name, member.role];
                days.forEach(day => {
                    const record = scheduleRecords.find(rec => rec.userId === member.id && isSameDay(new Date(rec.date), day));
                    row.push(record?.shift || "N");
                });
                ws_data.push(row);
            });
        });

        ws_data.push([], []); // Spacers

        ws_data.push(["KETERANGAN", "", "Shift schedule :"]);
        ws_data.push(["", "", "P/S", "PAGI", "08.00 WITA - 20.00 WITA"]);
        ws_data.push(["", "", "M", "MALAM", "20.00 WITA - 08.00 WITA"]);
        ws_data.push(["", "", "L", "LIBUR"]);
        ws_data.push(["", "", "N", "NORMAL"]);

        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        // Merging cells for main headers
        const merge = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: dateHeaders.length -1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: dateHeaders.length - 1 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: dateHeaders.length - 1 } },
        ];
        ws["!merges"] = merge;

        XLSX.utils.book_append_sheet(wb, ws, "Jadwal Dinas");
        XLSX.writeFile(wb, `Jadwal Dinas ${period}.xlsx`);
    };

    if (isLoading && (teams.length === 0 || users.length === 0)) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-72" />
                <div className="rounded-lg border p-4 space-y-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <AttendanceControls
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                />
                <Button onClick={handleExport} variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to XLSX
                </Button>
            </div>


            {uniqueTeams.length > 0 ? (
                 <Tabs defaultValue={uniqueTeams[0].id} className="space-y-4">
                    <TabsList>
                        {uniqueTeams.map(team => (
                            <TabsTrigger key={team.id} value={team.id}>{team.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    {uniqueTeams.map(team => (
                        <TabsContent key={team.id} value={team.id} className="space-y-4">
                            <ScheduleTable
                                team={team}
                                users={users}
                                scheduleRecords={scheduleRecords}
                                dateRange={dateRange}
                                isLoading={isLoading}
                                onEditSchedule={handleOpenForm}
                                onBatchUpdate={(pattern) => handleBatchUpdateSchedule(team.id, pattern)}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <CardTitle className="text-xl font-semibold">No Teams Found</CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground">
                        Please create a team in the Management page first.
                    </CardDescription>
                </Card>
            )}

            <ScheduleForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSaveSchedule}
                editingInfo={editingSchedule}
            />
        </div>
    )
}
