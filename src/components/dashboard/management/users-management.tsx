"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserTable } from "@/components/dashboard/users/user-table";
import { PlusCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/dashboard/users/user-form";
import type { User, UserDocument, DocumentType, Role } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { v4 as uuidv4 } from 'uuid';
import { RoleManager } from "@/components/dashboard/users/role-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


// Helper to upload files to the Next.js server
async function uploadFiles(files: Record<DocumentType, File | null>): Promise<UserDocument[]> {
    const uploadedDocuments: UserDocument[] = [];
    for (const docType in files) {
        const file = files[docType as DocumentType];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                if (result.success) {
                    uploadedDocuments.push({
                        id: uuidv4(),
                        type: docType as DocumentType,
                        fileName: result.fileName,
                        url: result.url,
                    });
                } else {
                   throw new Error(result.message || 'File upload failed');
                }
            } catch (error) {
                console.error(`Error uploading ${docType}:`, error);
                throw error; 
            }
        }
    }
    return uploadedDocuments;
}

const roleOrder: { [key: string]: number } = {
  'Supervisor': 1,
  'Admin': 2,
  'Team Leader': 3,
  'Teknisi': 4,
  'Assisten Teknisi': 5,
};

export default function UsersManagement() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersCollection = collection(db, "users");
                const userSnapshot = await getDocs(usersCollection);
                let userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

                // Sort users by custom role order
                userList.sort((a, b) => {
                    const orderA = roleOrder[a.role] || 99; // Roles not in the order list go to the bottom
                    const orderB = roleOrder[b.role] || 99;
                    return orderA - orderB;
                });

                setUsers(userList);

                const rolesCollection = collection(db, "roles");
                const roleSnapshot = await getDocs(rolesCollection);
                const roleList = roleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
                setRoles(roleList);

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
        };
        fetchData();
    }, [toast]);

    const handleAddUser = async (newUser: Omit<User, 'id' | 'documents'>, files: Record<DocumentType, File | null>) => {
        try {
            const newDocuments = await uploadFiles(files);
            const userWithDocs: Omit<User, 'id'> = { ...newUser, documents: newDocuments };
            
            const docRef = await addDoc(collection(db, "users"), userWithDocs);
            const finalUser = { ...userWithDocs, id: docRef.id };

            setUsers(prevUsers => [...prevUsers, finalUser].sort((a, b) => {
                const orderA = roleOrder[a.role] || 99;
                const orderB = roleOrder[b.role] || 99;
                return orderA - orderB;
            }));
            toast({ title: "Success", description: "User added successfully." });
            return true;
        } catch (error) {
            console.error("Error adding user: ", error);
            toast({ title: "Error", description: "Could not add user. File upload might have failed.", variant: "destructive"});
            return false;
        }
    };

    const handleUpdateUser = async (updatedUser: User, files: Record<DocumentType, File | null>) => {
        try {
            const newDocuments = await uploadFiles(files);
            const finalDocs = [...(updatedUser.documents || []), ...newDocuments];
            
            const userRef = doc(db, "users", updatedUser.id);
            const { id, ...userData } = { ...updatedUser, documents: finalDocs };

            await updateDoc(userRef, userData);
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === updatedUser.id 
                    ? { ...updatedUser, documents: finalDocs } 
                    : user
                ).sort((a, b) => {
                    const orderA = roleOrder[a.role] || 99;
                    const orderB = roleOrder[b.role] || 99;
                    return orderA - orderB;
                })
            );
            toast({ title: "Success", description: "User updated successfully." });
            return true;
        } catch (error) {
            console.error("Error updating user: ", error);
            toast({ title: "Error", description: "Could not update user. File upload might have failed.", variant: "destructive"});
            return false;
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const userToDelete = users.find(u => u.id === userId);
            if (userToDelete?.documents) {
                for (const doc of userToDelete.documents) {
                   await fetch('/api/upload', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileUrl: doc.url }),
                    });
                }
            }
            await deleteDoc(doc(db, "users", userId));
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            toast({ title: "Success", description: "User deleted successfully." });
        } catch (error) {
            console.error("Error deleting user: ", error);
            toast({ title: "Error", description: "Could not delete user.", variant: "destructive"});
        }
    };
    
    const handleUpdateUserDocuments = (userId: string, documents: UserDocument[]) => {
        setUsers(prevUsers => 
            prevUsers.map(user => user.id === userId ? { ...user, documents } : user)
        );
    }

    const onRolesUpdate = (updatedRoles: Role[]) => {
        setRoles(updatedRoles);
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
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                        </div>
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
                        <CardTitle>Users Management</CardTitle>
                        <CardDescription>
                            Add, edit, and manage user details and documents.
                        </CardDescription>
                    </div>
                     <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsRoleManagerOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Roles
                        </Button>
                        <Button onClick={() => setIsFormOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <UserTable 
                    users={users}
                    roles={roles}
                    onDeleteUser={handleDeleteUser}
                    onUpdateUser={handleUpdateUser}
                    onUpdateDocuments={handleUpdateUserDocuments}
                />
                <UserForm 
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    onSave={handleAddUser}
                    roles={roles}
                />
                <RoleManager
                    isOpen={isRoleManagerOpen}
                    onClose={() => setIsRoleManagerOpen(false)}
                    initialRoles={roles}
                    onRolesUpdate={onRolesUpdate}
                />
            </CardContent>
        </Card>
    );
}
