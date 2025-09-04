"use client";

import type { User } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Paperclip, User as UserIcon, Calendar, Home, MapPin, Shield } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface UserDetailsProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export function UserDetails({ isOpen, user, onClose }: UserDetailsProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">User Details</DialogTitle>
          <DialogDescription>
            Full information for {user.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
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
                    <span>{format(new Date(user.dateOfBirth), 'dd MMMM yyyy')}</span>
                </div>
                 <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-muted-foreground mt-1" />
                    <span className="flex-1">{user.address}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Documents</h3>
                {user.documents.length > 0 ? (
                    <ul className="space-y-3">
                        {user.documents.map((doc) => (
                            <li key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                               <div className="flex items-center gap-3">
                                    <Paperclip className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">{doc.fileName}</p>
                                        <Badge variant="secondary">{doc.type}</Badge>
                                    </div>
                               </div>
                               <Button variant="outline" size="icon" asChild>
                                    <a href={doc.url} download>
                                        <Download className="h-4 w-4" />
                                    </a>
                               </Button>
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
  );
}
