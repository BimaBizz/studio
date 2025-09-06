
"use client";

import { useEffect, useState } from "react";
import type { User, DocumentType, Role } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DOCUMENT_TYPES } from "@/lib/types";
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
import { Loader2, UploadCloud, XCircle } from "lucide-react";

const FormSchema = z.object({
  name: z.string().min(2, "Nama harus minimal 2 karakter."),
  email: z.string().email("Silakan masukkan alamat email yang valid."),
  password: z.string().optional(),
  role: z.string({ required_error: "Silakan pilih peran." }),
  placeOfBirth: z.string().min(2, "Tempat lahir harus diisi."),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Silakan masukkan tanggal yang valid.",
  }),
  address: z.string().min(10, "Alamat harus minimal 10 karakter."),
});


type FormValues = z.infer<typeof FormSchema>;
type FilesToUpload = Record<DocumentType, File | null>;

interface UserFormProps {
  isOpen: boolean;
  user?: User | null;
  onClose: () => void;
  onSave: (data: FormValues, files: FilesToUpload) => Promise<boolean>;
  roles: Role[];
}

export function UserForm({ isOpen, user, onClose, onSave, roles }: UserFormProps) {
  const isEditMode = !!user;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<FilesToUpload>({
    KTP: null, KK: null, Ijazah: null, SKCK: null,
  });

  // Dynamically adjust schema based on edit mode
  const formSchema = isEditMode
    ? FormSchema.omit({ password: true }) // Password is not required for editing
    : FormSchema.refine(data => data.password && data.password.length >= 6, {
        message: "Kata sandi harus minimal 6 karakter.",
        path: ["password"],
      });


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", role: undefined, placeOfBirth: "", dateOfBirth: "", address: "" },
  });

  useEffect(() => {
    if (isOpen) {
        setIsSubmitting(false);
        setFilesToUpload({ KTP: null, KK: null, Ijazah: null, SKCK: null });
        if (isEditMode && user) {
            form.reset({
                name: user.name,
                email: user.email,
                role: user.role,
                placeOfBirth: user.placeOfBirth,
                dateOfBirth: user.dateOfBirth,
                address: user.address,
                password: "" // Password is not edited here
            });
        } else {
            form.reset({
                name: "", email: "", password: "", role: undefined, placeOfBirth: "", dateOfBirth: "", address: "",
            });
        }
    }
  }, [isOpen, user, isEditMode, form]);
  
  const handleFileChange = (docType: DocumentType, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFilesToUpload(prev => ({ ...prev, [docType]: file }));
    }
  };

  const removeFile = (docType: DocumentType) => {
    setFilesToUpload(prev => ({ ...prev, [docType]: null }));
    const input = document.getElementById(`file-input-${docType}`) as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  }

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const success = await onSave(data, filesToUpload);
    if (success) {
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Perbarui detail untuk ${user?.name}.`
              : "Isi formulir untuk menambahkan pengguna baru ke sistem."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="user@contoh.com" {...field} disabled={isEditMode} /></FormControl><FormMessage /></FormItem>
                    )} />
                    {!isEditMode && (
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Kata Sandi</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}
                    <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem><FormLabel>Peran</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Pilih peran" /></SelectTrigger></FormControl>
                            <SelectContent>{roles.map((role) => <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>)}</SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="placeOfBirth" render={({ field }) => (
                            <FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input placeholder="Jakarta" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                            <FormItem><FormLabel>Tanggal Lahir</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Alamat</FormLabel><FormControl><Textarea placeholder="Jl. Jenderal Sudirman No. 123..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                    <h3 className="text-lg font-medium">Unggah Dokumen</h3>
                    <p className="text-sm text-muted-foreground">
                      {isEditMode ? "Lampirkan dokumen baru. Dokumen yang ada akan disimpan." : "Lampirkan dokumen yang diperlukan untuk pengguna ini."}
                    </p>
                    <div className="space-y-3">
                        {DOCUMENT_TYPES.map((docType) => (
                             <FormItem key={docType}>
                                <FormLabel>{docType}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            id={`file-input-${docType}`}
                                            type="file"
                                            className="w-full pr-10"
                                            onChange={(e) => handleFileChange(docType, e)}
                                        />
                                        <UploadCloud className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </FormControl>
                                {filesToUpload[docType] && (
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1 bg-background p-2 rounded-md">
                                        <p className="truncate pr-2">Dipilih: {filesToUpload[docType]?.name}</p>
                                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeFile(docType)}>
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                             </FormItem>
                        ))}
                    </div>
                </div>
            </div>
            
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
