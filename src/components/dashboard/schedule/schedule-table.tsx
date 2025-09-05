"use client";

import type { Team, User, Schedule } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { eachDayOfInterval, format, isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ScheduleTableProps {
    team: Team;
    users: User[];
    scheduleRecords: Schedule[];
    dateRange: DateRange | undefined;
    isLoading: boolean;
    onEditSchedule: (user: User, team: Team, date: Date, record?: Schedule) => void;
}

const shiftColors: { [key: string]: string } = {
    'P/S': 'bg-blue-100 text-blue-800 border-blue-200',
    'M': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'L': 'bg-red-100 text-red-800 border-red-200',
    'N': 'bg-gray-100 text-gray-800 border-gray-200',
    'Staff': 'bg-green-100 text-green-800 border-green-200',
};

const roleOrder: { [key: string]: number } = {
  'Team Leader': 1,
  'Teknisi': 2,
  'Assisten Teknisi': 3,
};

export function ScheduleTable({ team, users, scheduleRecords, dateRange, isLoading, onEditSchedule }: ScheduleTableProps) {
    if (!dateRange || !dateRange.from || !dateRange.to) {
        return <p>Please select a date range.</p>;
    }

    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

    const getUserById = (id: string) => users.find(user => user.id === id);

    const getScheduleShift = (userId: string, date: Date): Schedule | undefined => {
        return scheduleRecords.find(rec => rec.userId === userId && isSameDay(new Date(rec.date), date));
    };

    const teamMembers = (team.memberIds.map(getUserById).filter(Boolean) as User[]);
    const teamLeader = getUserById(team.leaderId);

    if (teamLeader && !teamMembers.some(member => member.id === teamLeader.id)) {
        teamMembers.unshift(teamLeader);
    }
    
    teamMembers.sort((a, b) => {
        const orderA = roleOrder[a.role] || 99;
        const orderB = roleOrder[b.role] || 99;
        return orderA - orderB;
    });


    return (
        <Card>
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
                                            const record = getScheduleShift(member.id, day);
                                            return (
                                                <TableCell key={day.toISOString()} className="text-center p-2">
                                                    <Button 
                                                        variant="outline"
                                                        className={cn("w-16 h-10 text-xs", shiftColors[record?.shift || 'N'])}
                                                        onClick={() => onEditSchedule(member, team, day, record)}
                                                    >
                                                        {record?.shift || 'N/A'}
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
