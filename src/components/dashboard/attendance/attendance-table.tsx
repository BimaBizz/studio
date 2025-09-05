"use client";

import type { Team, User, Attendance } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { eachDayOfInterval, format, isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AttendanceTableProps {
    teams: Team[];
    users: User[];
    attendanceRecords: Attendance[];
    dateRange: DateRange | undefined;
    isLoading: boolean;
    onEditAttendance: (user: User, team: Team, date: Date, record?: Attendance) => void;
}

const statusColors: { [key: string]: string } = {
    'Hadir': 'bg-green-100 text-green-800 border-green-200',
    'Sakit': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Izin': 'bg-blue-100 text-blue-800 border-blue-200',
    'Alpa': 'bg-red-100 text-red-800 border-red-200',
    'N/A': 'bg-gray-100 text-gray-800 border-gray-200',
};

export function AttendanceTable({ teams, users, attendanceRecords, dateRange, isLoading, onEditAttendance }: AttendanceTableProps) {
    if (!dateRange || !dateRange.from || !dateRange.to) {
        return <p>Please select a date range.</p>;
    }

    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

    const getUserById = (id: string) => users.find(user => user.id === id);

    const getAttendanceStatus = (userId: string, date: Date): Attendance | undefined => {
        return attendanceRecords.find(rec => rec.userId === userId && isSameDay(new Date(rec.date), date));
    };

    return (
        <div className="space-y-6">
            {teams.map(team => {
                let teamMembers = team.memberIds.map(getUserById).filter(Boolean) as User[];
                const teamLeader = getUserById(team.leaderId);

                // Ensure leader is not duplicated if they are also in memberIds
                if (teamLeader && !teamMembers.some(member => member.id === teamLeader.id)) {
                    teamMembers.unshift(teamLeader);
                } else if (teamLeader) {
                    // Move leader to the front if they exist in the list
                    teamMembers = teamMembers.filter(member => member.id !== teamLeader.id);
                    teamMembers.unshift(teamLeader);
                }

                return (
                    <Card key={team.id}>
                        <CardHeader>
                            <CardTitle>{team.name}</CardTitle>
                            <CardDescription>Leader: {teamLeader?.name || 'N/A'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="w-full whitespace-nowrap">
                                <Table className="min-w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky left-0 bg-card w-[200px]">Member</TableHead>
                                            {days.map(day => (
                                                <TableHead key={day.toISOString()} className="text-center">
                                                    <div>{format(day, 'E')}</div>
                                                    <div>{format(day, 'dd')}</div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="sticky left-0 bg-card font-medium"><Skeleton className="h-6 w-32" /></TableCell>
                                                    {days.map((day) => (
                                                        <TableCell key={day.toISOString()} className="text-center p-2"><Skeleton className="h-8 w-16 mx-auto" /></TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : teamMembers.length > 0 ? (
                                            teamMembers.map(member => (
                                                <TableRow key={member.id}>
                                                    <TableCell className="sticky left-0 bg-card font-medium">
                                                        {member.name}
                                                        <div className="text-xs text-muted-foreground">{member.role}</div>
                                                    </TableCell>
                                                    {days.map(day => {
                                                        const record = getAttendanceStatus(member.id, day);
                                                        return (
                                                            <TableCell key={day.toISOString()} className="text-center p-2">
                                                                <Button 
                                                                    variant="outline"
                                                                    className={cn("w-16 h-10 text-xs", statusColors[record?.status || 'N/A'])}
                                                                    onClick={() => onEditAttendance(member, team, day, record)}
                                                                >
                                                                    {record?.status || 'N/A'}
                                                                </Button>
                                                            </TableCell>
                                                        )
                                                    })}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={days.length + 1} className="text-center h-24">No members in this team.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
