
"use client";

import { useState } from "react";
import type { Task, User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import { id as IndonesianLocale } from "date-fns/locale";
import { Calendar, MoreVertical, Edit, Trash2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";

interface TaskCardProps {
    task: Task;
    users: User[];
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    canPerformCRUD: (task: Task) => boolean;
}

const priorityColors = {
    Low: "bg-blue-100 text-blue-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
};

export function TaskCard({ task, users, onEdit, onDelete, canPerformCRUD }: TaskCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const assignee = users.find(u => u.id === task.assigneeId);
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("taskId", task.id);
    };

    return (
        <>
            <Card 
                draggable={canPerformCRUD(task)}
                onDragStart={handleDragStart}
                className="cursor-grab active:cursor-grabbing"
            >
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
                         {canPerformCRUD(task) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(task)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    <CardDescription className="line-clamp-3">{task.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className={cn("font-medium", priorityColors[task.priority])}>{task.priority}</Badge>
                    </div>
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={cn(
                            "text-sm font-medium",
                            isPast(new Date(task.dueDate)) && task.status !== 'Done' && "text-destructive"
                        )}>
                            {format(new Date(task.dueDate), "d MMMM yyyy", { locale: IndonesianLocale })}
                        </span>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{assignee ? assignee.name.charAt(0) : '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">{assignee ? assignee.name : 'Unassigned'}</p>
                            <p className="text-xs text-muted-foreground">{assignee ? assignee.role : ''}</p>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus tugas secara permanen. Ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(task.id)} className="bg-destructive hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
