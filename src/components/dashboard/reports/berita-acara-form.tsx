
"use client";

import { useEffect, useState } from "react";
import type { BeritaAcara } from "@/lib/types";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter."),
  content: z.string().min(10, "Isi laporan minimal 10 karakter."),
});

type FormValues = z.infer<typeof FormSchema>;

interface BeritaAcaraFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<BeritaAcara, 'id' | 'createdAt' | 'createdBy'>) => Promise<boolean>;
  report?: BeritaAcara | null;
}

export function BeritaAcaraForm({ isOpen, onClose, onSave, report }: BeritaAcaraFormProps) {
  const isEditMode = !!report;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      form.reset(
        isEditMode && report ? {
          title: report.title,
          content: report.content,
        } : {
          title: "",
          content: "",
        }
      );
    }
  }, [isOpen, report, isEditMode, form]);

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
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
          <DialogTitle>{isEditMode ? "Edit Berita Acara" : "Buat Berita Acara Baru"}</DialogTitle>
          <DialogDescription>
            Isi detail laporan di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Laporan</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Laporan Kerusakan Eskalator Gate 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Isi Laporan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Jelaskan kejadian atau temuan secara detail..." {...field} rows={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
