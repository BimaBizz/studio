"use client";

import { useState } from "react";
import type { User } from "@/lib/types";
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
import { MoreHorizontal, Trash2, Edit, Eye } from "lucide-react";
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
import { UserDetails } from "./user-details";
import { UserForm } from "./user-form";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

interface UserTableProps {
    users: User[];
    onDeleteUser: (userId: string) => void;
    onUpdateUser: (user: User) => Promise<boolean>;
}


export function UserTable({ users, onDeleteUser, onUpdateUser }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<"view" | "edit" | "delete" | null>(null);

  const handleAction = (user: User, actionType: "view" | "edit" | "delete") => {
    setSelectedUser(user);
    setAction(actionType);
  };

  const handleClose = () => {
    setSelectedUser(null);
    setAction(null);
  };

  const handleDelete = () => {
    if (selectedUser) {
      onDeleteUser(selectedUser.id);
      handleClose();
    }
  };
  
  const handleSaveEdit = (updatedData: Omit<User, 'id' | 'documents'>) => {
    if (selectedUser) {
        const updatedUser = { ...selectedUser, ...updatedData };
        return onUpdateUser(updatedUser);
    }
    return Promise.resolve(false);
  };
  
  if (users.length === 0) {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardTitle className="text-xl font-semibold">No Users Found</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
                Click "Add User" to create the first user entry.
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
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                 <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                        {user.role}
                    </Badge>
                </TableCell>
                <TableCell>{format(new Date(user.dateOfBirth), 'dd MMMM yyyy')}</TableCell>
                <TableCell className="max-w-xs truncate">{user.address}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleAction(user, "view")}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(user, "edit")}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleAction(user, "delete")}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserDetails isOpen={action === 'view'} user={selectedUser} onClose={handleClose} />

      <UserForm 
        isOpen={action === 'edit'} 
        user={selectedUser} 
        onClose={handleClose}
        onSave={handleSaveEdit}
       />


      <AlertDialog open={action === 'delete'} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user{" "}
              <strong>{selectedUser?.name}</strong> and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
