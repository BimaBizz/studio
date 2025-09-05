"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { collection, getDocs, query, where, Timestamp, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Team, User, Attendance, AttendanceStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceControls } from "@/components/dashboard/attendance/attendance-controls";
import { AttendanceTable } from "@/components/dashboard/attendance/attendance-table";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth } from "date-fns";
import { AttendanceForm } from "@/components/dashboard/attendance/attendance-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function AttendanceGrid() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
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
            
            // Fetch attendance records for the selected date range
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
            } else {
                setAttendanceRecords([]);
            }

        } catch (error) {
            console.error("Error fetching data: ", error);
            toast({
                title: "Error",
                description: "Failed to fetch attendance data.",
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
    
    const handleSaveAttendance = async (data: {userId: string, teamId: string, date: Date, status: AttendanceStatus}) => {
        try {
            const batch = writeBatch(db);
            const attendanceDate = Timestamp.fromDate(data.date);
            
            // Unique ID based on user and date to prevent duplicates
            const docId = `${data.userId}_${data.date.toISOString().split('T')[0]}`;
            const attendanceRef = doc(db, "attendance", docId);
            
            const recordToSave = {
                userId: data.userId,
                teamId: data.teamId,
                date: attendanceDate,
                status: data.status,
            };

            batch.set(attendanceRef, recordToSave, { merge: true });

            await batch.commit();
            toast({ title: "Success", description: "Attendance record saved."});
            await fetchData(dateRange); // Refresh data
            return true;
        } catch (error) {
            console.error("Error saving attendance:", error);
            toast({ title: "Error", description: "Could not save attendance.", variant: "destructive" });
            return false;
        }
    };

    // Memoize and filter unique teams to prevent duplicate tabs
    const uniqueTeams = useMemo(() => {
        const seen = new Set();
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
            <AttendanceControls
                dateRange={dateRange}
                setDateRange={setDateRange}
            />

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
                                dateRange={dateRange}
                                isLoading={isLoading}
                                onEditAttendance={handleOpenForm}
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

            <AttendanceForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSaveAttendance}
                editingInfo={editingAttendance}
            />
        </div>
    )
}
