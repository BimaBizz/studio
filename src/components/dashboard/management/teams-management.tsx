
"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Team, User } from "@/lib/types";
import { TeamTable } from "@/components/dashboard/teams/team-table";
import { TeamForm } from "@/components/dashboard/teams/team-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MANAGEMENT_TEAM_NAME = "Management";

export default function TeamsManagement() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const { toast } = useToast();

    const fetchTeamsAndUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const teamsCollection = collection(db, "teams");
            const teamSnapshot = await getDocs(teamsCollection);
            const teamList = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
            
            const usersCollection = collection(db, "users");
            const userSnapshot = await getDocs(usersCollection);
            const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(userList);

            // Auto-create or update Management team
            const managementTeamExists = teamList.some(t => t.name === MANAGEMENT_TEAM_NAME);
            const managementUsers = userList.filter(u => u.role === 'Admin' || u.role === 'Supervisor');

            if (!managementTeamExists && managementUsers.length > 0) {
                const leader = managementUsers.find(u => u.role === 'Supervisor') || managementUsers[0];
                const newManagementTeam = {
                    name: MANAGEMENT_TEAM_NAME,
                    leaderId: leader.id,
                    memberIds: managementUsers.map(u => u.id),
                };
                const docRef = await addDoc(collection(db, "teams"), newManagementTeam);
                teamList.push({ id: docRef.id, ...newManagementTeam });
                toast({ title: "System", description: "Management team created automatically." });
            }

            setTeams(teamList);

        } catch (error) {
            console.error("Error fetching data: ", error);
            toast({
                title: "Error",
                description: "Failed to fetch data from the database.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTeamsAndUsers();
    }, [fetchTeamsAndUsers]);

    const handleOpenForm = (team: Team | null = null) => {
        if (team?.name === MANAGEMENT_TEAM_NAME) {
            toast({ title: "Info", description: "The Management team cannot be edited.", variant: "default" });
            return;
        }
        setEditingTeam(team);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingTeam(null);
        setIsFormOpen(false);
    };

    const handleSaveTeam = async (teamData: Omit<Team, 'id'>) => {
        try {
            if (editingTeam) {
                // Update existing team
                const teamRef = doc(db, "teams", editingTeam.id);
                await updateDoc(teamRef, teamData);
                toast({ title: "Success", description: "Team updated successfully." });
            } else {
                // Add new team
                await addDoc(collection(db, "teams"), teamData);
                toast({ title: "Success", description: "Team added successfully." });
            }
            await fetchTeamsAndUsers(); // Refetch to show changes
            return true;
        } catch (error) {
            console.error("Error saving team: ", error);
            toast({ title: "Error", description: "Could not save team.", variant: "destructive" });
            return false;
        }
    };

    const handleDeleteTeam = async (teamId: string) => {
        const teamToDelete = teams.find(t => t.id === teamId);
        if (teamToDelete?.name === MANAGEMENT_TEAM_NAME) {
            toast({ title: "Info", description: "The Management team cannot be deleted.", variant: "default" });
            return;
        }
        try {
            await deleteDoc(doc(db, "teams", teamId));
            toast({ title: "Success", description: "Team deleted successfully." });
            setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
        } catch (error) {
            console.error("Error deleting team: ", error);
            toast({ title: "Error", description: "Could not delete team.", variant: "destructive" });
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-5 w-64" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                        <div className="p-4 space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Team Management</CardTitle>
                        <CardDescription>
                            Create and manage your teams and their members.
                        </CardDescription>
                    </div>
                    <Button onClick={() => handleOpenForm()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Team
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <TeamTable 
                    teams={teams}
                    users={users}
                    onEditTeam={handleOpenForm}
                    onDeleteTeam={handleDeleteTeam}
                />
                <TeamForm
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    onSave={handleSaveTeam}
                    team={editingTeam}
                    users={users}
                    teams={teams}
                />
            </CardContent>
        </Card>
    );
}
