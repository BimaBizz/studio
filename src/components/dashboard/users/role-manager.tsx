"use client";

import { useState } from "react";
import type { Role } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
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


interface RoleManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoles: Role[];
  onRolesUpdate: (roles: Role[]) => void;
}

export function RoleManager({ isOpen, onClose, initialRoles, onRolesUpdate }: RoleManagerProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRoleName, setEditingRoleName] = useState("");
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAddRole = async () => {
    if (newRoleName.trim() === "") {
        toast({ title: "Error", description: "Role name cannot be empty.", variant: "destructive"});
        return;
    }
    setIsProcessing(true);
    try {
        const docRef = await addDoc(collection(db, "roles"), { name: newRoleName });
        const newRole = { id: docRef.id, name: newRoleName };
        const updatedRoles = [...roles, newRole];
        setRoles(updatedRoles);
        onRolesUpdate(updatedRoles);
        setNewRoleName("");
        toast({ title: "Success", description: `Role "${newRoleName}" added.` });
    } catch (error) {
        console.error("Error adding role:", error);
        toast({ title: "Error", description: "Could not add role.", variant: "destructive"});
    } finally {
        setIsProcessing(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRoleId || editingRoleName.trim() === "") return;
    setIsProcessing(true);
    try {
        const roleRef = doc(db, "roles", editingRoleId);
        await updateDoc(roleRef, { name: editingRoleName });
        const updatedRoles = roles.map(r => r.id === editingRoleId ? { ...r, name: editingRoleName } : r);
        setRoles(updatedRoles);
        onRolesUpdate(updatedRoles);
        toast({ title: "Success", description: "Role updated successfully." });
        setEditingRoleId(null);
        setEditingRoleName("");
    } catch (error) {
        console.error("Error updating role:", error);
        toast({ title: "Error", description: "Could not update role.", variant: "destructive"});
    } finally {
        setIsProcessing(false);
    }
  };

  const startEditing = (role: Role) => {
    setEditingRoleId(role.id);
    setEditingRoleName(role.name);
  };
  
  const cancelEditing = () => {
    setEditingRoleId(null);
    setEditingRoleName("");
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setIsProcessing(true);
    try {
        await deleteDoc(doc(db, "roles", roleToDelete.id));
        const updatedRoles = roles.filter(r => r.id !== roleToDelete.id);
        setRoles(updatedRoles);
        onRolesUpdate(updatedRoles);
        toast({ title: "Success", description: `Role "${roleToDelete.name}" deleted.` });
    } catch (error) {
        console.error("Error deleting role:", error);
        toast({ title: "Error", description: "Could not delete role.", variant: "destructive"});
    } finally {
        setIsProcessing(false);
        setRoleToDelete(null);
    }
  };

  return (
    <>
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
            <DialogDescription>
                Add, edit, or delete roles available for users.
            </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="flex gap-2">
                    <Input 
                        placeholder="New role name"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        disabled={isProcessing}
                    />
                    <Button onClick={handleAddRole} disabled={isProcessing || !newRoleName}>
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        <span className="ml-2">Add</span>
                    </Button>
                </div>
                <div className="space-y-2">
                    {roles.map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-2 border rounded-md">
                            {editingRoleId === role.id ? (
                                <Input
                                    value={editingRoleName}
                                    onChange={(e) => setEditingRoleName(e.target.value)}
                                    className="h-8"
                                    disabled={isProcessing}
                                />
                            ) : (
                                <span className="font-medium">{role.name}</span>
                            )}
                            <div className="flex gap-1">
                                {editingRoleId === role.id ? (
                                    <>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleUpdateRole} disabled={isProcessing}>
                                            <Save className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEditing} disabled={isProcessing}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEditing(role)} disabled={isProcessing}>
                                            <Save className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setRoleToDelete(role)} disabled={isProcessing}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Close</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
        <AlertDialog open={!!roleToDelete} onOpenChange={(isOpen) => !isOpen && setRoleToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This will permanently delete the role <strong>{roleToDelete?.name}</strong>. This action cannot be undone. Make sure no users are currently assigned this role.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setRoleToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive hover:bg-destructive/90">
                    Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
