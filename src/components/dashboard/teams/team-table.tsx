
"use client";

import { useState } from "react";
import type { Team, User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

interface TeamTableProps {
    teams: Team[];
    users: User[];
    onEditTeam: (team: Team) => void;
    onDeleteTeam: (teamId: string) => void;
}

export function TeamTable({ teams, users, onEditTeam, onDeleteTeam }: TeamTableProps) {
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const getUserById = (id: string) => users.find(user => user.id === id);

  if (teams.length === 0) {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardTitle className="text-xl font-semibold">No Teams Found</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
                Click "Create Team" to get started.
            </CardDescription>
        </Card>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Leader</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => {
              const leader = getUserById(team.leaderId);
              const members = team.memberIds.map(getUserById).filter(Boolean) as User[];
              
              return (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{leader ? leader.name : 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {members.map(member => (
                        <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {members.length > 5 && <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">+{members.length - 5}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEditTeam(team)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Team
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setTeamToDelete(team)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!teamToDelete} onOpenChange={(isOpen) => !isOpen && setTeamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team{" "}
              <strong>{teamToDelete?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTeamToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                if (teamToDelete) {
                    onDeleteTeam(teamToDelete.id);
                    setTeamToDelete(null);
                }
            }} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
