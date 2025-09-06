
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Task, TaskStatus, User, Role } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/types";
import { getTasks, addTask, updateTask, deleteTask, updateTaskStatus } from "@/services/tasks";
import { getDocs, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskColumn } from "./task-column";
import { TaskForm } from "./task-form";

interface TaskBoardProps {
    selectedRole: string;
}

const ADMIN_CRUD_ROLES = ["Admin", "Team Leader", "Teknisi", "Assisten Teknisi"];
const TEAM_LEADER_CRUD_ROLES = ["Team Leader", "Teknisi", "Assisten Teknisi"];


export default function TaskBoard({ selectedRole }: TaskBoardProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tasksData, usersSnapshot] = await Promise.all([
                getTasks(),
                getDocs(collection(db, "users"))
            ]);
            setTasks(tasksData);
            setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        } catch (error) {
            toast({
                title: "Error",
                description: "Gagal memuat data tugas.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        const role = localStorage.getItem('userRole') as Role | null;
        setCurrentUserRole(role);
        const user = auth.currentUser;
        setCurrentUserId(user ? user.uid : null);
        fetchData();
    }, [fetchData]);

    const filteredTasks = useMemo(() => {
        if (selectedRole === "Semua") {
            return tasks;
        }
        const usersInRole = users.filter(user => user.role === selectedRole).map(user => user.id);
        return tasks.filter(task => usersInRole.includes(task.assigneeId));
    }, [tasks, users, selectedRole]);


    const handleOpenForm = (task: Task | null = null) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingTask(null);
        setIsFormOpen(false);
    };

    const handleSaveTask = async (data: Omit<Task, 'id' | 'createdAt' | 'createdBy'>, createdBy: string) => {
        try {
            if (editingTask) {
                await updateTask(editingTask.id, data);
                toast({ title: "Sukses", description: "Tugas berhasil diperbarui." });
            } else {
                await addTask({ ...data, createdBy });
                toast({ title: "Sukses", description: "Tugas berhasil ditambahkan." });
            }
            await fetchData();
            return true;
        } catch (error) {
            toast({ title: "Error", description: "Tidak dapat menyimpan tugas.", variant: "destructive" });
            return false;
        }
    };

    const handleDeleteTask = async (id: string) => {
        try {
            await deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
            toast({ title: "Sukses", description: "Tugas berhasil dihapus." });
        } catch (error) {
            toast({ title: "Error", description: "Tidak dapat menghapus tugas.", variant: "destructive" });
        }
    };

    const handleDragEnd = async (taskId: string, newStatus: TaskStatus) => {
        const originalTasks = [...tasks];
        
        // Optimistic update
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        );

        try {
            await updateTaskStatus(taskId, newStatus);
        } catch (error) {
            // Revert on failure
            setTasks(originalTasks);
            toast({
                title: "Error",
                description: "Gagal memperbarui status tugas.",
                variant: "destructive",
            });
        }
    };
    
    const canPerformCRUD = (task?: Task): boolean => {
        if (!currentUserRole) return false;

        switch (currentUserRole) {
            case 'Supervisor':
                return true; // Supervisor can CRUD all
            case 'Admin':
                if (!task) return true; // Can create
                const assigneeRoleAdmin = users.find(u => u.id === task.assigneeId)?.role;
                return assigneeRoleAdmin ? ADMIN_CRUD_ROLES.includes(assigneeRoleAdmin) : false;
            case 'Team Leader':
                if (!task) return true; // Can create
                const assigneeRoleTL = users.find(u => u.id === task.assigneeId)?.role;
                return assigneeRoleTL ? TEAM_LEADER_CRUD_ROLES.includes(assigneeRoleTL) : false;
            default:
                return false;
        }
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                 {canPerformCRUD() && (
                    <Button onClick={() => handleOpenForm()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Tugas
                    </Button>
                )}
            </div>
            <div className="flex-1 overflow-x-auto">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                        {TASK_STATUSES.map(status => (
                            <div key={status} className="p-4 bg-muted/50 rounded-lg">
                                <Skeleton className="h-6 w-1/3 mb-4" />
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                        {TASK_STATUSES.map(status => (
                            <TaskColumn
                                key={status}
                                status={status}
                                tasks={filteredTasks.filter(t => t.status === status)}
                                users={users}
                                onDrop={handleDragEnd}
                                onEdit={handleOpenForm}
                                onDelete={handleDeleteTask}
                                canPerformCRUD={canPerformCRUD}
                            />
                        ))}
                    </div>
                )}
            </div>
            {isFormOpen && (
                <TaskForm
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    onSave={handleSaveTask}
                    task={editingTask}
                    users={users}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                />
            )}
        </>
    );
}
