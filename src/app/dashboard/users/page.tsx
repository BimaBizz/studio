"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserTable } from "@/components/dashboard/users/user-table";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/dashboard/users/user-form";
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";


export default function UsersPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, "users");
                const userSnapshot = await getDocs(usersCollection);
                const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                setUsers(userList);
            } catch (error) {
                console.error("Error fetching users: ", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch users from the database.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [toast]);

    const handleAddUser = async (newUser: Omit<User, 'id' | 'documents'>) => {
        try {
            // In a real scenario, file uploads would be handled here.
            // For now, we assume documents are empty or handled separately.
            const userWithEmptyDocs: Omit<User, 'id'> = { ...newUser, documents: [] };
            
            const docRef = await addDoc(collection(db, "users"), userWithEmptyDocs);
            setUsers(prevUsers => [...prevUsers, { ...userWithEmptyDocs, id: docRef.id }]);
            toast({ title: "Success", description: "User added successfully." });
            return true;
        } catch (error) {
            console.error("Error adding user: ", error);
            toast({ title: "Error", description: "Could not add user.", variant: "destructive"});
            return false;
        }
    };

    const handleUpdateUser = async (updatedUser: User) => {
        try {
            const userRef = doc(db, "users", updatedUser.id);
            // We separate the id from the rest of the data
            const { id, ...userData } = updatedUser;
            await updateDoc(userRef, userData);

            setUsers(prevUsers => 
                prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
            );
            toast({ title: "Success", description: "User updated successfully." });
            return true;
        } catch (error) {
            console.error("Error updating user: ", error);
            toast({ title: "Error", description: "Could not update user.", variant: "destructive"});
            return false;
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            toast({ title: "Success", description: "User deleted successfully." });
        } catch (error) {
            console.error("Error deleting user: ", error);
            toast({ title: "Error", description: "Could not delete user.", variant: "destructive"});
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-5 w-80" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="rounded-lg border">
                    <div className="p-4 space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
            </div>
        );
    }


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
