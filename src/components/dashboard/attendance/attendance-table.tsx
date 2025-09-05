
"use client";

import type { Team, User, Attendance, Schedule } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { eachDayOfInterval, format, isSameDay, startOfToday } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AttendanceTableProps {
    team: Team;
    users: User[];
    attendanceRecords: Attendance[];
    scheduleRecords: Schedule[];
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

const roleOrder: { [key: string]: number } = {
  'Team Leader': 1,
  'Teknisi': 2,
  'Assisten Teknisi': 3,
};


export function AttendanceTable({ team, users, attendanceRecords, scheduleRecords, dateRange, isLoading, onEditAttendance }: AttendanceTableProps) {
    if (!dateRange || !dateRange.from) {
        return <p>Please select a date range.</p>;
    }
    const safeDateRange = { from: dateRange.from, to: dateRange.to || dateRange.from };

    const days = eachDayOfInterval({ start: safeDateRange.from, end: safeDateRange.to });

    const getUserById = (id: string) => users.find(user => user.id === id);

    const getAttendanceStatus = (userId: string, date: Date): Attendance | undefined => {
        return attendanceRecords.find(rec => rec.userId === userId && isSameDay(new Date(rec.date), date));
    };

    let teamMembers = team.memberIds.map(getUserById).filter(Boolean) as User[];
    const teamLeader = getUserById(team.leaderId);

    // Ensure leader is not duplicated if they are also in memberIds
    if (teamLeader && !teamMembers.some(member => member.id === teamLeader.id)) {
        teamMembers.unshift(teamLeader);
    }

    // Sort members by custom role order
    teamMembers.sort((a, b) => {
        const orderA = roleOrder[a.role] || 99;
        const orderB = roleOrder[b.role] || 99;
        return orderA - orderB;
    });
    
    // Determine shift based on team leader's schedule for the first day in range
    const displayDate = dateRange.from || startOfToday();
    const leaderSchedule = teamLeader ? scheduleRecords.find(s => s.userId === teamLeader.id && isSameDay(new Date(s.date), displayDate)) : null;
    let shiftInfo = "Libur";
    if (leaderSchedule) {
        if (leaderSchedule.shift === 'P/S') {
            shiftInfo = "Dinas Pagi: 08:00 - 20:00";
        } else if (leaderSchedule.shift === 'M') {
            shiftInfo = "Dinas Malam: 20:00 - 08:00";
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>Leader: {teamLeader?.name || 'N/A'}</CardDescription>
                <CardDescription className="text-xs text-muted-foreground">
                    {shiftInfo}
                </CardDescription>
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
                                            <TableCell key={day.toISOString()} className="text-center p-2"><Skeleton className="h-10 w-24 mx-auto" /></TableCell>
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
                                            const displayStatus = record?.status || 'N/A';
                                            return (
                                                <TableCell key={day.toISOString()} className="text-center p-2">
                                                    <Button 
                                                        variant="outline"
                                                        className={cn("w-auto min-w-[6rem] h-auto flex flex-col px-2 py-1 text-xs", statusColors[displayStatus])}
                                                        onClick={() => onEditAttendance(member, team, day, record)}
                                                    >
                                                        <span className="font-semibold">{displayStatus}</span>
                                                        {record?.status === 'Hadir' && record.location && (
                                                            <Badge variant="secondary" className="mt-1 w-full justify-center text-[10px] whitespace-normal text-center h-auto py-0.5 px-1 font-normal leading-tight">
                                                                {record.location}
                                                            </Badge>
                                                        )}
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
}
