
"use client";

import { useState, useEffect } from 'react';
import TaskBoard from "@/components/dashboard/tasks/task-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Role } from '@/lib/types';

const ALL_ROLES = ["Admin", "Supervisor", "Team Leader", "Teknisi", "Assisten Teknisi"];
const ADMIN_VISIBLE_ROLES = ["Admin", "Team Leader", "Teknisi", "Assisten Teknisi"];
const TEAM_LEADER_VISIBLE_ROLES = ["Team Leader", "Teknisi", "Assisten Teknisi"];

export default function TasksPage() {
    const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);
    const [visibleRoles, setVisibleRoles] = useState<string[]>([]);
    const [selectedTab, setSelectedTab] = useState<string>("");

    useEffect(() => {
        const role = localStorage.getItem('userRole') as Role | null;
        setCurrentUserRole(role);

        let roles: string[] = [];
        let defaultTab = "";

        if (role === 'Supervisor') {
            roles = ["Semua", ...ALL_ROLES];
            defaultTab = "Semua";
        } else if (role === 'Admin') {
            roles = [...ADMIN_VISIBLE_ROLES];
            defaultTab = ADMIN_VISIBLE_ROLES[0] || "";
        } else if (role === 'Team Leader') {
            roles = [...TEAM_LEADER_VISIBLE_ROLES];
            defaultTab = TEAM_LEADER_VISIBLE_ROLES[0] || "";
        }
        
        setVisibleRoles(roles);
        if (defaultTab) {
            setSelectedTab(defaultTab);
        }

    }, []);

    if (!selectedTab) {
        return null; // or a loading indicator
    }

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
