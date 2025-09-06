
"use client";

import { useEffect, useState, useMemo } from "react";
import type { User, Team, Attendance, AttendanceStatus, AttendanceLocation } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ATTENDANCE_STATUSES, ATTENDANCE_LOCATIONS } from "@/lib/types";
import { format } from "date-fns";
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
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  status: z.enum(ATTENDANCE_STATUSES, { required_error: "Silakan pilih status." }),
  location: z.custom<AttendanceLocation>().optional(),
}).refine(data => {
    // If status is 'Hadir', location is required.
    if (data.status === 'Hadir') {
        return !!data.location;
    }
    return true;
}, {
    message: "Silakan pilih lokasi untuk status 'Hadir'.",
    path: ["location"],
});


type FormValues = z.infer<typeof FormSchema>;

interface AttendanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {userId: string, teamId: string, date: Date, status: AttendanceStatus, location?: AttendanceLocation}) => Promise<boolean>;
  editingInfo: { user: User; team: Team; date: Date; record?: Attendance } | null;
}

export function AttendanceForm({ isOpen, onClose, onSave, editingInfo }: AttendanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, team, date, record } = editingInfo || {};

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const selectedStatus = form.watch("status");

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      form.reset({
        status: record?.status,
        location: record?.location,
      });
    }
  }, [isOpen, record, form]);

  const handleSubmit = async (data: FormValues) => {
    if (!user || !team || !date) return;
    setIsSubmitting(true);
    const success = await onSave({
        userId: user.id,
        teamId: team.id,
        date: date,
        status: data.status,
        location: data.location,
    });
    if (success) {
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  const availableLocations = useMemo(() => {
    if (team?.name !== 'Management') {
      return ATTENDANCE_LOCATIONS.filter(loc => loc !== 'Sesuai Jadwal');
    }
    return ATTENDANCE_LOCATIONS;
  }, [team]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Absensi</DialogTitle>
          <DialogDescription>
            Perbarui absensi untuk <strong>{user?.name}</strong> pada <strong>{date ? format(date, "PPP") : ""}</strong>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ATTENDANCE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedStatus === 'Hadir' && (
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lokasi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih lokasi" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {availableLocations.map((location) => (
                                <SelectItem key={location} value={location}>
                                {location}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
