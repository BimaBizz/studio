
"use client";

import { useEffect, useState, useMemo } from "react";
import type { Task, User, Role } from "@/lib/types";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter."),
  description: z.string().min(5, "Deskripsi minimal 5 karakter."),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  assigneeId: z.string({ required_error: "Pilih penanggung jawab." }),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Silakan masukkan tanggal yang valid.",
  }),
});

type FormValues = z.infer<typeof FormSchema>;

interface TaskFormProps {
  isOpen: boolean;
  task?: Task | null;
  onClose: () => void;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'createdBy'>, createdBy: string) => Promise<boolean>;
  users: User[];
  currentUserId: string | null;
  currentUserRole: Role | null;
}

export function TaskForm({ isOpen, task, onClose, onSave, users, currentUserId, currentUserRole }: TaskFormProps) {
  const isEditMode = !!task;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      form.reset(
        isEditMode && task ? {
            ...task,
            dueDate: task.dueDate.split('T')[0] // Format for date input
        } : {
            title: "",
            description: "",
            status: "Todo",
            priority: "Medium",
            assigneeId: undefined,
            dueDate: "",
        }
      );
    }
  }, [isOpen, task, isEditMode, form]);

  const handleSubmit = async (data: FormValues) => {
    if(!currentUserId) return;
    setIsSubmitting(true);
    const success = await onSave(data, currentUserId);
    if (success) {
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };
  
  const availableUsers = useMemo(() => {
    if (!currentUserRole) return [];
    
    switch (currentUserRole) {
        case 'Supervisor':
            return users; // Can assign to all
        case 'Admin':
            return users.filter(u => ['Admin', 'Team Leader', 'Teknisi', 'Assisten Teknisi'].includes(u.role));
        case 'Team Leader':
            return users.filter(u => ['Team Leader', 'Teknisi', 'Assisten Teknisi'].includes(u.role));
        default:
            return [];
    }
  }, [users, currentUserRole]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Tugas" : "Tambah Tugas Baru"}</DialogTitle>
          <DialogDescription>
            Isi detail tugas di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Judul</FormLabel><FormControl><Input placeholder="Contoh: Perbaiki eskalator" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea placeholder="Deskripsikan tugas secara detail..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                        <SelectContent>{TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem><FormLabel>Prioritas</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih prioritas" /></SelectTrigger></FormControl>
                        <SelectContent>{TASK_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="assigneeId" render={({ field }) => (
                    <FormItem><FormLabel>Ditugaskan Untuk</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih pengguna" /></SelectTrigger></FormControl>
                        <SelectContent>{availableUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem><FormLabel>Batas Waktu</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan Tugas'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
