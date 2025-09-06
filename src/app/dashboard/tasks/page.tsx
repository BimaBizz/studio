
"use client";

import { useState, useEffect } from 'react';
import TaskBoard from "@/components/dashboard/tasks/task-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Role } from '@/lib/types';

const ALL_ROLES = ["Admin", "Supervisor", "Team Leader", "Teknisi", "Assisten Teknisi"];

export default function TasksPage() {
    const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);
    const [visibleRoles, setVisibleRoles] = useState<string[]>([]);
    const [selectedTab, setSelectedTab] = useState<string>("Semua");

    useEffect(() => {
        const role = localStorage.getItem('userRole') as Role | null;
        setCurrentUserRole(role);

        let roles: string[] = [];
        if (role === 'Supervisor') {
            roles = ["Semua", ...ALL_ROLES];
            setSelectedTab("Semua");
        } else if (role === 'Admin') {
            roles = ["Semua", "Admin", "Team Leader", "Teknisi", "Assisten Teknisi"];
            setSelectedTab("Semua");
        } else if (role === 'Team Leader') {
            roles = ["Semua", "Team Leader", "Teknisi", "Assisten Teknisi"];
            setSelectedTab("Semua");
        }
        setVisibleRoles(roles);
    }, []);

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div>
                <h1 className="text-3xl font-bold">Papan Tugas</h1>
                <p className="text-muted-foreground">
                    Kelola, lacak, dan delegasikan tugas tim Anda di sini.
                </p>
            </div>

            {visibleRoles.length > 0 && (
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        {visibleRoles.map(role => (
                            <TabsTrigger key={role} value={role}>{role}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}

            <TaskBoard selectedRole={selectedTab} />
        </div>
    );
}
