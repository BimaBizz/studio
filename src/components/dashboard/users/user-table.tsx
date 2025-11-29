"use client";

import { useState, useMemo } from "react";
import type { User, UserDocument, DocumentType, Role } from "@/lib/types";
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
import { MoreHorizontal, Trash2, Edit, Eye, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserTableProps {
    users: User[];
    roles: Role[];
    onDeleteUser: (userId: string) => void;
    onUpdateUser: (user: User, files: Record<DocumentType, File | null>) => Promise<boolean>;
    onUpdateDocuments: (userId: string, documents: UserDocument[]) => void;
}


export function UserTable({ users, roles, onDeleteUser, onUpdateUser, onUpdateDocuments }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<"view" | "edit" | "delete" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    const q = (searchTerm ?? "").toString().trim().toLowerCase();
    return users.filter(user => {
      const name = (user.name ?? "").toString().toLowerCase();
      const email = (user.email ?? "").toString().toLowerCase();
      const matchesSearch = q === "" || name.includes(q) || email.includes(q);
      const matchesRole = roleFilter === 'all' || (user.role ?? "") === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

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
  
  const handleSaveEdit = (updatedData: any, files: Record<DocumentType, File | null>) => {
    if (selectedUser) {
        const updatedUser = { ...selectedUser, ...updatedData };
        return onUpdateUser(updatedUser, files);
    }
    return Promise.resolve(false);
  };
  
  const currentUserForDetails = users.find(u => u.id === selectedUser?.id) || null;

  if (users.length === 0) {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardTitle className="text-xl font-semibold">Tidak Ada Pengguna</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
                Klik "Tambah Pengguna" untuk membuat entri pengguna pertama.
            </CardDescription>
        </Card>
    )
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-full max-w-sm">
          <Input 
            placeholder="Cari berdasarkan nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter berdasarkan peran" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Peran</SelectItem>
            {roles.map(role => (
              <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Tanggal Lahir</TableHead>
              <TableHead className="text-right">Tindakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                 <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                        {user.role}
                    </Badge>
                </TableCell>
                <TableCell>{user.dateOfBirth ? format(new Date(user.dateOfBirth), 'dd MMMM yyyy') : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleAction(user, "view")}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
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
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Tidak ada pengguna yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserDetails 
        isOpen={action === 'view'} 
        user={currentUserForDetails} 
        onClose={handleClose}
        onUpdateDocuments={onUpdateDocuments}
      />

      <UserForm 
        isOpen={action === 'edit'} 
        user={selectedUser} 
        onClose={handleClose}
        onSave={handleSaveEdit}
        roles={roles}
       />

      <AlertDialog open={action === 'delete'} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pengguna secara permanen{" "}
              <strong>{selectedUser?.name}</strong> dan menghapus data mereka dari server kami.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
