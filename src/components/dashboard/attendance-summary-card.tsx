
import { useMemo } from "react";
import type { Attendance } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, LogIn, UserX, AlertCircle } from "lucide-react";

interface AttendanceSummaryCardProps {
    attendanceRecords: Attendance[];
}

export function AttendanceSummaryCard({ attendanceRecords }: AttendanceSummaryCardProps) {
    const summary = useMemo(() => {
        const counts = {
            Hadir: 0,
            Izin: 0,
            Sakit: 0,
            Alpa: 0,
        };
        attendanceRecords.forEach(record => {
            if (record.status in counts) {
                counts[record.status]++;
            }
        });
        return counts;
    }, [attendanceRecords]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <LogIn className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Hadir</span>
                        </div>
                        <span className="font-bold">{summary.Hadir}</span>
                    </div>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <UserX className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Izin / Sakit</span>
                        </div>
                        <span className="font-bold">{summary.Izin + summary.Sakit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Alpa</span>
                        </div>
                        <span className="font-bold">{summary.Alpa}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
