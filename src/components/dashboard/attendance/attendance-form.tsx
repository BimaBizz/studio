"use client";

import { useEffect, useState } from "react";
import type { User, Team, Attendance, AttendanceStatus } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ATTENDANCE_STATUSES } from "@/lib/types";
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
  status: z.enum(ATTENDANCE_STATUSES, { required_error: "Please select a status." }),
});

type FormValues = z.infer<typeof FormSchema>;

interface AttendanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {userId: string, teamId: string, date: Date, status: AttendanceStatus}) => Promise<boolean>;
  editingInfo: { user: User; team: Team; date: Date; record?: Attendance } | null;
}

export function AttendanceForm({ isOpen, onClose, onSave, editingInfo }: AttendanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, team, date, record } = editingInfo || {};

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      form.reset({
        status: record?.status,
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
    });
    if (success) {
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogDescription>
            Update attendance for <strong>{user?.name}</strong> on <strong>{date ? format(date, "PPP") : ""}</strong>
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
                        <SelectValue placeholder="Select a status" />
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
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save Record'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
