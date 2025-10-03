
"use client";

import { useEffect, useState } from "react";
import type { Trouble, UnitName } from "@/lib/types";
import { UNIT_NAMES } from "@/lib/types";
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
import { format } from "date-fns";

const FormSchema = z.object({
  unitName: z.string({ required_error: "Silakan pilih nama unit." }),
  timeOff: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Silakan masukkan waktu yang valid.",
  }),
  timeOn: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Silakan masukkan waktu yang valid.",
  }),
  description: z.string().min(5, "Keterangan minimal 5 karakter."),
}).refine(data => new Date(data.timeOn) > new Date(data.timeOff), {
    message: "Waktu ON harus setelah Waktu OFF.",
    path: ["timeOn"],
});

type FormValues = z.infer<typeof FormSchema>;

interface TroubleFormProps {
  isOpen: boolean;
  trouble?: Trouble | null;
  onClose: () => void;
  onSave: (data: FormValues) => Promise<boolean>;
}

export function TroubleForm({ isOpen, trouble, onClose, onSave }: TroubleFormProps) {
  const isEditMode = !!trouble;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const toInputDateTimeFormat = (isoString: string) => {
    if (!isoString) return "";
    return format(new Date(isoString), "yyyy-MM-dd'T'HH:mm");
  };

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      if (isEditMode && trouble) {
        form.reset({
          unitName: trouble.unitName,
          description: trouble.description,
          timeOff: toInputDateTimeFormat(trouble.timeOff),
          timeOn: toInputDateTimeFormat(trouble.timeOn),
        });
      } else {
        form.reset({
          unitName: undefined,
          description: "",
          timeOff: toInputDateTimeFormat(new Date().toISOString()),
          timeOn: toInputDateTimeFormat(new Date().toISOString()),
        });
      }
    }
  }, [isOpen, trouble, isEditMode, form]);

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Laporan Trouble" : "Tambah Laporan Trouble"}</DialogTitle>
          <DialogDescription>
            Isi detail laporan di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="unitName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih nama unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UNIT_NAMES.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="timeOff" render={({ field }) => (
                    <FormItem><FormLabel>Waktu Off</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="timeOn" render={({ field }) => (
                    <FormItem><FormLabel>Waktu On</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Keterangan</FormLabel><FormControl><Textarea placeholder="Jelaskan masalah dan penanganannya..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
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
