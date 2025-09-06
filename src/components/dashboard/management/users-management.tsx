
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
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
import { addNotification } from "@/services/notifications";


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
                        storagePath: result.storagePath,
                    });
                } else {
                   throw new Error(result.message || 'Gagal mengunggah file');
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
                    description: "Gagal mengambil data dari database.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    const handleAddUser = async (newUser: Omit<User, 'id' | 'documents' | 'email'> & { email: string, password?: string }, files: Record<DocumentType, File | null>) => {
        if (!newUser.password) {
            toast({ title: "Error", description: "Password is required for a new user.", variant: "destructive"});
            return false;
        }

        try {
            // Step 1: Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
            const authUser = userCredential.user;

            // Step 2: Upload documents
            const newDocuments = await uploadFiles(files);

            // Step 3: Create user document in Firestore with Auth UID as the document ID
            const { password, ...userData } = newUser;
            const userForFirestore: Omit<User, 'id'> = { ...userData, documents: newDocuments };

            await setDoc(doc(db, "users", authUser.uid), userForFirestore);

            const finalUser = { ...userForFirestore, id: authUser.uid };

            setUsers(prevUsers => [...prevUsers, finalUser].sort((a, b) => {
                const orderA = roleOrder[a.role] || 99;
                const orderB = roleOrder[b.role] || 99;
                return orderA - orderB;
            }));

            toast({ title: "Sukses", description: "Pengguna berhasil ditambahkan." });
            await addNotification({ message: `User baru "${finalUser.name}" telah ditambahkan.` });
            return true;
        } catch (error: any) {
            console.error("Error adding user: ", error);
            let errorMessage = "Tidak dapat menambahkan pengguna.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Email ini sudah digunakan oleh pengguna lain.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Kata sandi terlalu lemah. Harap gunakan minimal 6 karakter.";
            }
            toast({ title: "Error", description: errorMessage, variant: "destructive"});
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
            toast({ title: "Sukses", description: "Pengguna berhasil diperbarui." });
            await addNotification({ message: `Data untuk "${updatedUser.name}" telah diperbarui.` });
            return true;
        } catch (error) {
            console.error("Error updating user: ", error);
            toast({ title: "Error", description: "Tidak dapat memperbarui pengguna. Pengunggahan file mungkin gagal.", variant: "destructive"});
            return false;
        }
    };

    const handleDeleteUser = async (userId: string) => {
        // Note: Deleting a user from Firebase Auth is a sensitive operation and
        // typically requires admin privileges running in a backend environment (like Cloud Functions).
        // The current implementation will only delete the Firestore record and associated files.
        // The Firebase Auth user will remain, but will not be able to log in to the dashboard
        // because their Firestore document is gone.
        try {
            const userToDelete = users.find(u => u.id === userId);
            if (userToDelete?.documents) {
                for (const doc of userToDelete.documents) {
                   await fetch('/api/upload', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ storagePath: doc.storagePath }),
                    });
                }
            }
            await deleteDoc(doc(db, "users", userId));
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            toast({ title: "Sukses", description: "Pengguna berhasil dihapus." });
            if (userToDelete) {
                await addNotification({ message: `User "${userToDelete.name}" telah dihapus.` });
            }
        } catch (error) {
            console.error("Error deleting user: ", error);
            toast({ title: "Error", description: "Tidak dapat menghapus pengguna.", variant: "destructive"});
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
                        <CardTitle>Manajemen Pengguna</CardTitle>
                        <CardDescription>
                            Tambah, edit, dan kelola detail serta dokumen pengguna.
                        </CardDescription>
                    </div>
                     <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsRoleManagerOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Kelola Peran
                        </Button>
                        <Button onClick={() => setIsFormOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Pengguna
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
