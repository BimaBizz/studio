
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { collection, getDocs, query, where, Timestamp, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Team, User, Attendance, AttendanceStatus, AttendanceLocation, Schedule } from "@/lib/types";
import { ATTENDANCE_LOCATIONS } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceControls } from "@/components/dashboard/attendance/attendance-controls";
import { AttendanceTable } from "@/components/dashboard/attendance/attendance-table";
import { DateRange } from "react-day-picker";
import { startOfToday, endOfToday, format, isSameDay } from "date-fns";
import { id as IndonesianLocale } from "date-fns/locale";
import { AttendanceForm } from "@/components/dashboard/attendance/attendance-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { addNotification } from "@/services/notifications";


export default function AttendanceGrid() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
    const [scheduleRecords, setScheduleRecords] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfToday(),
        to: endOfToday(),
      });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAttendance, setEditingAttendance] = useState<{ user: User; team: Team; date: Date; record?: Attendance } | null>(null);
    const { toast } = useToast();

    const fetchData = useCallback(async (range: DateRange | undefined) => {
        setIsLoading(true);
        try {
            // Fetch teams and users only once or when necessary
            if (teams.length === 0 || users.length === 0) {
                const teamsSnapshot = await getDocs(collection(db, "teams"));
                const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
                setTeams(teamsList);
                
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                setUsers(usersList);
            }
            
            // Fetch attendance and schedule records for the selected date range
            if (range?.from && range.to) {
                const attendanceQuery = query(
                    collection(db, "attendance"),
                    where("date", ">=", Timestamp.fromDate(range.from)),
                    where("date", "<=", Timestamp.fromDate(range.to))
                );
                const attendanceSnapshot = await getDocs(attendanceQuery);
                const attendanceList = attendanceSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        date: (data.date as Timestamp).toDate().toISOString(),
                    } as Attendance;
                });
                setAttendanceRecords(attendanceList);

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
                setAttendanceRecords([]);
                setScheduleRecords([]);
            }

        } catch (error) {
            console.error("Error fetching data: ", error);
            toast({
                title: "Error",
                description: "Gagal mengambil data absensi.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, teams.length, users.length]);

    useEffect(() => {
        fetchData(dateRange);
    }, [dateRange, fetchData]);

    const handleOpenForm = (user: User, team: Team, date: Date, record?: Attendance) => {
        setEditingAttendance({ user, team, date, record });
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingAttendance(null);
    };
    
    const handleSaveAttendance = async (data: {userId: string, teamId: string, date: Date, status: AttendanceStatus, location?: AttendanceLocation}) => {
        try {
            const batch = writeBatch(db);
            const attendanceDate = Timestamp.fromDate(data.date);
            
            // Unique ID based on user and date to prevent duplicates
            const docId = `${data.userId}_${data.date.toISOString().split('T')[0]}`;
            const attendanceRef = doc(db, "attendance", docId);
            
            const recordToSave: Partial<Attendance> = {
                userId: data.userId,
                teamId: data.teamId,
                date: attendanceDate as any,
                status: data.status,
            };

            if (data.status === 'Hadir' && data.location) {
                recordToSave.location = data.location;
            } else {
                recordToSave.location = undefined;
            }

            batch.set(attendanceRef, recordToSave, { merge: true });

            await batch.commit();
            toast({ title: "Sukses", description: "Catatan absensi berhasil disimpan."});
            await fetchData(dateRange); // Refresh data
            return true;
        } catch (error) {
            console.error("Error saving attendance:", error);
            toast({ title: "Error", description: "Tidak dapat menyimpan absensi.", variant: "destructive" });
            return false;
        }
    };

    const handleShareWhatsApp = async () => {
        const reportDate = dateRange?.from || new Date();
        const formattedDate = format(reportDate, "EEEE, dd MMMM yyyy", { locale: IndonesianLocale });
        
        const getUserById = (id: string) => users.find(u => u.id === id);

        const dailyRecords = attendanceRecords.filter(rec => isSameDay(new Date(rec.date), reportDate));
        
        const teamLeader = teams.length > 0 ? getUserById(teams[0].leaderId) : null;
        const teamSchedule = teamLeader ? scheduleRecords.find(s => s.userId === teamLeader.id && isSameDay(new Date(s.date), reportDate)) : null;

        const presentByLocation: { [key: string]: User[] } = {};
        const absentIzin: User[] = [];
        const absentSakit: User[] = [];
        const absentAlpa: User[] = [];
        let totalHadir = 0;

        dailyRecords.forEach(rec => {
            const user = getUserById(rec.userId);
            if (!user) return;

            if (rec.status === 'Hadir' && rec.location) {
                if (!presentByLocation[rec.location]) {
                    presentByLocation[rec.location] = [];
                }
                presentByLocation[rec.location].push(user);
                totalHadir++;
            } else if (rec.status === 'Izin') {
                absentIzin.push(user);
            } else if (rec.status === 'Sakit') {
                absentSakit.push(user);
            } else if (rec.status === 'Alpa') {
                absentAlpa.push(user);
            }
        });
        
        const locationOrder = [
            'Sesuai Jadwal', 
            'Troubleshooting', 
            'Standby lobby', 
            'Standby Gate', 
            'Standby Esc Toshiba & Dom', 
            'Stanby JPO'
        ];

        let message = `Laporan kehadiran personil pekerjaan Kontrak Payung Pemeliharaan dan Perawatan Peralatan Passenger Movement System ( PT. Dovin Pratama ). ${formattedDate}\n`;
        if (teamSchedule?.shift === 'M') {
            message += `Dinas Malam ( 20.00 -  08.00 )\n\n`;
        } else {
            message += `Dinas Pagi ( 08.00 -  20.00 )\n\n`;
        }

        locationOrder.forEach(location => {
            if (presentByLocation[location] && presentByLocation[location].length > 0) {
                message += `${location}:\n`;
                presentByLocation[location].forEach((user, index) => {
                    const role = user.role === 'Assisten Teknisi' ? 'Pemb. Teknisi' : user.role;
                    message += `${index + 1}. ${user.name} (${role})\n`;
                });
                message += '\n';
            }
        });
        
        message += `Ket:\n`;
        message += `-. Izin : ${absentIzin.length > 0 ? `Ada, ${absentIzin.map((u, i) => `${i + 1}. ${u.name} (${u.role})`).join(', ')}` : 'Tidak Ada'}\n`;
        message += `-. Sakit : ${absentSakit.length > 0 ? `Ada, ${absentSakit.map((u, i) => `${i + 1}. ${u.name} (${u.role})`).join(', ')}` : 'Tidak Ada'}\n`;
        message += `-. Cuti : Tidak Ada\n\n`;
        message += `Terima kasih.`;

        try {
             const notificationMessage = `Laporan absensi dibagikan. Hadir: ${totalHadir}, Izin: ${absentIzin.length}, Sakit: ${absentSakit.length}, Alpa: ${absentAlpa.length}.`;
             await addNotification({ message: notificationMessage });
             toast({
                title: "Laporan Dibagikan",
                description: "Notifikasi telah dikirim ke semua pengguna.",
             });
        } catch (error) {
            console.error("Failed to send notification:", error);
            toast({
                title: "Error",
                description: "Gagal mengirim notifikasi.",
                variant: "destructive",
            });
        }

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const uniqueTeams = useMemo(() => {
        const seen = new Set<string>();
        return teams.filter(team => {
            const duplicate = seen.has(team.name);
            seen.add(team.name);
            return !duplicate;
        });
    }, [teams]);

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
                <Button onClick={handleShareWhatsApp} variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Bagikan Laporan
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
                            <AttendanceTable
                                team={team}
                                users={users}
                                attendanceRecords={attendanceRecords}
                                scheduleRecords={scheduleRecords}
                                dateRange={dateRange}
                                isLoading={isLoading}
                                onEditAttendance={handleOpenForm}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <CardTitle className="text-xl font-semibold">Tidak Ada Tim</CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground">
                        Silakan buat tim terlebih dahulu di halaman Manajemen.
                    </CardDescription>
                </Card>
            )}

            <AttendanceForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSaveAttendance}
                editingInfo={editingAttendance}
            />
        </div>
    )
}
