
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { MaintenanceApproval } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const FormSchema = z.object({
  hariTanggal: z.string().min(1, "Tanggal diperlukan"),
  lokasi: z.string().min(1, "Lokasi diperlukan (pisahkan dengan koma jika lebih dari satu)"),
  mechOnDuty: z.string().min(1, "Nama Mech on Duty diperlukan"),
  kepalaTeknisi: z.string().min(1, "Nama Kepala Teknisi diperlukan"),
});

type FormValues = z.infer<typeof FormSchema>;

interface MaintenanceApprovalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<MaintenanceApproval, 'id' | 'createdAt' | 'createdBy'>) => Promise<boolean>;
  report?: MaintenanceApproval | null;
}

export function MaintenanceApprovalForm({ isOpen, onClose, onSave, report }: MaintenanceApprovalFormProps) {
  const isEditMode = !!report;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      const defaultValues = {
        hariTanggal: report?.hariTanggal ? format(parseISO(report.hariTanggal), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        lokasi: report?.lokasi?.join(', ') || "",
        mechOnDuty: report?.mechOnDuty || "",
        kepalaTeknisi: report?.kepalaTeknisi || "",
      };
      form.reset(defaultValues);
    }
  }, [isOpen, report, form]);

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    const dataToSave = {
      ...data,
      hariTanggal: new Date(data.hariTanggal).toISOString(),
      lokasi: data.lokasi.split(',').map(item => item.trim()),
    };
    
    const success = await onSave(dataToSave);
    if (success) {
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Izin" : "Buat Izin Maintenance Baru"}</DialogTitle>
          <DialogDescription>Isi detail yang diperlukan di bawah ini.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="hariTanggal" render={({ field }) => <FormItem><FormLabel>Hari/Tanggal</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="lokasi" render={({ field }) => <FormItem><FormLabel>Lokasi (Contoh: ESC 2.1, ESC 2.2)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="mechOnDuty" render={({ field }) => <FormItem><FormLabel>Nama Mech on Duty</FormLabel><FormControl><Input placeholder="Contoh: DIAN ARDIANSYAH" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="kepalaTeknisi" render={({ field }) => <FormItem><FormLabel>Nama Supervisor / Kepala Teknisi</FormLabel><FormControl><Input placeholder="Contoh: BIMA MAHENDRA" {...field} /></FormControl><FormMessage /></FormItem>} />
            
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
