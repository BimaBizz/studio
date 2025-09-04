"use client";

import { useEffect, useState } from "react";
import type { User, DocumentType } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ROLES, DOCUMENT_TYPES } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.enum(ROLES, { required_error: "Please select a role." }),
  placeOfBirth: z.string().min(2, "Place of birth is required."),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  address: z.string().min(10, "Address must be at least 10 characters."),
  // We'll add a field for files, but it won't be part of the user data schema directly
});

type FormValues = z.infer<typeof FormSchema>;

interface UserFormProps {
  isOpen: boolean;
  user?: User | null;
  onClose: () => void;
  onSave: (data: FormValues) => Promise<boolean>; // Returns promise to indicate success
}

export function UserForm({ isOpen, user, onClose, onSave }: UserFormProps) {
  const isEditMode = !!user;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // State to hold files to be uploaded
  const [filesToUpload, setFilesToUpload] = useState<Record<DocumentType, File | null>>({
    KTP: null,
    KK: null,
    Ijazah: null,
    SKCK: null,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      role: undefined,
      placeOfBirth: "",
      dateOfBirth: "",
      address: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
        setIsSubmitting(false);
        setFilesToUpload({ KTP: null, KK: null, Ijazah: null, SKCK: null });
        form.reset(
            isEditMode && user ? 
            {
                name: user.name,
                role: user.role,
                placeOfBirth: user.placeOfBirth,
                dateOfBirth: user.dateOfBirth,
                address: user.address,
            } : 
            { // Reset to default for add mode
                name: "",
                role: undefined,
                placeOfBirth: "",
                dateOfBirth: "",
                address: "",
            }
        );
    }
  }, [isOpen, user, isEditMode, form]);
  
  const handleFileChange = (docType: DocumentType, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFilesToUpload(prev => ({ ...prev, [docType]: file }));
    }
  };


  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    // Here you would typically handle the file uploads to Firebase Storage
    // and then get the download URLs to add to the user document.
    // For now, we'll just log it and call onSave.
    
    console.log("Files to upload:", filesToUpload);
    // Placeholder for actual upload logic
    
    const success = await onSave(data);
    
    if (success) {
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the details for ${user.name}.`
              : "Fill in the form to add a new user to the system."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="placeOfBirth"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Place of Birth</FormLabel>
                            <FormControl>
                                <Input placeholder="Jakarta" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                            <Textarea placeholder="123 Main St, Anytown..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-lg font-medium">Upload Documents</h3>
                    <p className="text-sm text-muted-foreground">
                        Attach required documents for this user.
                    </p>
                    <div className="space-y-3">
                        {DOCUMENT_TYPES.map((docType) => (
                             <FormItem key={docType}>
                                <FormLabel>{docType}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Input
                                        type="file"
                                        className="w-full pr-10"
                                        onChange={(e) => handleFileChange(docType, e)}
                                    />
                                    <UploadCloud className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </FormControl>
                                {filesToUpload[docType] && <p className="text-xs text-muted-foreground mt-1">Selected: {filesToUpload[docType]?.name}</p>}
                             </FormItem>
                        ))}
                    </div>
                </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
