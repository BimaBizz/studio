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

// Mock data - in a real app, this would come from Firebase
const initialUsers: User[] = [
  {
    id: "1",
    name: "Budi Santoso",
    placeOfBirth: "Jakarta",
    dateOfBirth: "1990-05-15",
    address: "Jl. Merdeka No. 10, Jakarta",
    documents: [
      { id: "doc1", type: "KTP", fileName: "ktp_budi.pdf", url: "#" },
      { id: "doc2", type: "KK", fileName: "kk_budi.pdf", url: "#" },
      { id: "doc3", type: "Ijazah", fileName: "ijazah_budi.pdf", url: "#" },
      { id: "doc4", type: "SKCK", fileName: "skck_budi.pdf", url: "#" },
    ],
  },
  {
    id: "2",
    name: "Citra Lestari",
    placeOfBirth: "Bandung",
    dateOfBirth: "1992-08-22",
    address: "Jl. Asia Afrika No. 25, Bandung",
    documents: [
      { id: "doc5", type: "KTP", fileName: "ktp_citra.pdf", url: "#" },
    ],
  },
];

export function UserTable() {
  const [users, setUsers] = useState<User[]>(initialUsers);
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
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      handleClose();
    }
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{format(new Date(user.dateOfBirth), 'dd MMMM yyyy')}</TableCell>
                <TableCell>{user.address}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleAction(user, "edit")} disabled>
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

      {/* View Details Dialog */}
      <UserDetails isOpen={action === 'view'} user={selectedUser} onClose={handleClose} />

      {/* Edit User Dialog (placeholder) */}
      <UserForm isOpen={action === 'edit'} user={selectedUser} onClose={handleClose} />


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={action === 'delete'} onOpenChange={handleClose}>
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
