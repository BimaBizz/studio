
"use client";

import type { User, UserDocument } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Paperclip, User as UserIcon, Calendar, Home, MapPin, Shield, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

interface UserDetailsProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onUpdateDocuments: (userId: string, documents: UserDocument[]) => void;
}

export function UserDetails({ isOpen, user, onClose, onUpdateDocuments }: UserDetailsProps) {
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<UserDocument | null>(null);
  const { toast } = useToast();

  if (!user) return null;

  const handleDeleteDocument = async () => {
    if (!docToDelete || !user) return;
    setDeletingDocId(docToDelete.id);

    try {
      // Delete file from Storage via our API
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath: docToDelete.storagePath }),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete file from storage.');
      }

      // Remove document from user's document array in Firestore
      const updatedDocuments = user.documents.filter(d => d.id !== docToDelete.id);
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { documents: updatedDocuments });

      // Update local state
      onUpdateDocuments(user.id, updatedDocuments);
      
      toast({ title: "Success", description: "Document deleted successfully." });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({ title: "Error", description: "Could not delete document.", variant: "destructive" });
    } finally {
      setDeletingDocId(null);
      setDocToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">User Details</DialogTitle>
            <DialogDescription>
              Full information for {user.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                  <div className="flex items-center gap-3">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                      <span>{user.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{user.placeOfBirth}</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>{user.dateOfBirth ? format(new Date(user.dateOfBirth), 'dd MMMM yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-muted-foreground mt-1" />
                      <span className="flex-1">{user.address}</span>
                  </div>
              </div>
              <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Documents</h3>
                  {user.documents && user.documents.length > 0 ? (
                      <ul className="space-y-3">
                          {user.documents.map((doc) => (
                              <li key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                      <Paperclip className="h-5 w-5 text-primary flex-shrink-0" />
                                      <div className="flex-grow overflow-hidden">
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium truncate hover:underline" title={doc.fileName}>
                                          {doc.fileName}
                                        </a>
                                          <Badge variant="secondary">{doc.type}</Badge>
                                      </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Button variant="outline" size="icon" asChild>
                                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="h-4 w-4" />
                                      </a>
                                  </Button>
                                  <Button variant="destructive" size="icon" onClick={() => setDocToDelete(doc)} disabled={deletingDocId === doc.id}>
                                    {deletingDocId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </li>
                          ))}
                      </ul>
                  ): (
                      <p className="text-sm text-muted-foreground italic">No documents uploaded.</p>
                  )}
              </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!docToDelete} onOpenChange={(isOpen) => !isOpen && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document <strong>{docToDelete?.fileName}</strong> from storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
