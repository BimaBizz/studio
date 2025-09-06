
"use client";

import type { Task, TaskStatus, User } from "@/lib/types";
import { TaskCard } from "./task-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
    status: TaskStatus;
    tasks: Task[];
    users: User[];
    onDrop: (taskId: string, newStatus: TaskStatus) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    canPerformCRUD: (task?: Task) => boolean;
}

export function TaskColumn({ status, tasks, users, onDrop, onEdit, onDelete, canPerformCRUD }: TaskColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    
    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        if(taskId) {
            onDrop(taskId, status);
        }
        setIsDragOver(false);
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "flex flex-col h-full bg-muted/50 rounded-lg p-4 transition-colors",
                isDragOver && "bg-primary/10 ring-2 ring-primary"
            )}
        >
            <h2 className="text-xl font-semibold mb-4 capitalize">{status.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <ScrollArea className="flex-1 pr-3 -mr-3">
                <div className="space-y-4">
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                users={users}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                canPerformCRUD={canPerformCRUD}
                            />
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-md">
                            <p className="text-sm text-muted-foreground">Seret tugas ke sini</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
