"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { UserTable } from "@/components/dashboard/users/user-table";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/dashboard/users/user-form";
import type { User, UserDocument, DocumentType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { v4 as uuidv4 } from 'uuid';


// Helper function to upload files and get their metadata
async function uploadFiles(userId: string, files: Record<DocumentType, File | null>): Promise<UserDocument[]> {
    const uploadedDocuments: UserDocument[] = [];
    for (const docType in files) {
        const file = files[docType as DocumentType];
        if (file) {
            const docId = uuidv4();
            const storageRef = ref(storage, `users/${userId}/documents/${docId}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            uploadedDocuments.push({
                id: docId,
                type: docType as DocumentType,
                fileName: file.name,
                url: downloadURL,
            });
        }
    }
    return uploadedDocuments;
}

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

    const handleAddUser = async (newUser: Omit<User, 'id' | 'documents'>, files: Record<DocumentType, File | null>) => {
        try {
            const tempId = uuidv4(); // Temporary ID for upload path
            const newDocuments = await uploadFiles(tempId, files);
            const userWithDocs: Omit<User, 'id'> = { ...newUser, documents: newDocuments };
            
            const docRef = await addDoc(collection(db, "users"), userWithDocs);
            const finalUser = { ...userWithDocs, id: docRef.id };

            // In a real app, you might want to rename the storage folder from tempId to docRef.id
            // For simplicity, we'll leave it as is.

            setUsers(prevUsers => [...prevUsers, finalUser]);
            toast({ title: "Success", description: "User added successfully." });
            return true;
        } catch (error) {
            console.error("Error adding user: ", error);
            toast({ title: "Error", description: "Could not add user.", variant: "destructive"});
            return false;
        }
    };

    const handleUpdateUser = async (updatedUser: User, files: Record<DocumentType, File | null>) => {
        try {
            const newDocuments = await uploadFiles(updatedUser.id, files);
            const finalDocs = [...updatedUser.documents, ...newDocuments];
            
            const userRef = doc(db, "users", updatedUser.id);
            const { id, ...userData } = { ...updatedUser, documents: finalDocs };

            await updateDoc(userRef, userData);

            setUsers(prevUsers => 
                prevUsers.map(user => user.id === updatedUser.id ? { ...updatedUser, documents: finalDocs } : user)
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
            const userToDelete = users.find(u => u.id === userId);
            if (userToDelete?.documents) {
                for (const doc of userToDelete.documents) {
                    const fileRef = ref(storage, doc.url);
                    await deleteObject(fileRef).catch(error => {
                        // It's okay if the file doesn't exist, log other errors
                        if (error.code !== 'storage/object-not-found') {
                            console.error("Error deleting file from storage:", error);
                        }
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
                onUpdateDocuments={handleUpdateUserDocuments}
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
