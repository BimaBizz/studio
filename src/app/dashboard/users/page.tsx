"use client";

import { useState } from "react";
import { UserTable } from "@/components/dashboard/users/user-table";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/dashboard/users/user-form";
import type { User } from "@/lib/types";


export default function UsersPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // This state will be lifted up to a shared context or fetched from an API in a real app
    const [users, setUsers] = useState<User[]>([
      {
        id: "1",
        name: "Budi Santoso",
        role: "Leader Teknisi",
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
        role: "Supervisor",
        placeOfBirth: "Bandung",
        dateOfBirth: "1992-08-22",
        address: "Jl. Asia Afrika No. 25, Bandung",
        documents: [
          { id: "doc5", type: "KTP", fileName: "ktp_citra.pdf", url: "#" },
        ],
      },
       {
        id: "3",
        name: "Admin Utama",
        role: "Admin",
        placeOfBirth: "Surabaya",
        dateOfBirth: "1988-01-01",
        address: "Jl. Pahlawan No. 1, Surabaya",
        documents: [],
      },
    ]);

    const handleAddUser = (newUser: Omit<User, 'id' | 'documents'>) => {
        const userWithId: User = { 
            ...newUser, 
            id: (users.length + 1).toString(), 
            documents: [] // Start with no documents
        };
        setUsers(prevUsers => [...prevUsers, userWithId]);
    };

    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prevUsers => 
            prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
        );
    };

    const handleDeleteUser = (userId: string) => {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    };


    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Users Management</h1>
                    <p className="text-muted-foreground">
                        Add, edit, and manage user details and documents.
                    </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>
            <UserTable 
                users={users}
                onDeleteUser={handleDeleteUser}
                onUpdateUser={handleUpdateUser}
            />
            {/* The UserForm for adding a new user */}
            <UserForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSave={handleAddUser}
            />
        </div>
    );
}
