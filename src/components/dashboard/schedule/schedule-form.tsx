"use client";

import { useEffect, useState } from "react";
import type { User, Team, Schedule, Shift } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SHIFT_TYPES } from "@/lib/types";
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
  shift: z.enum(SHIFT_TYPES, { required_error: "Please select a shift." }),
});

type FormValues = z.infer<typeof FormSchema>;

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {userId: string, teamId: string, date: Date, shift: Shift}) => Promise<boolean>;
  editingInfo: { user: User; team: Team; date: Date; record?: Schedule } | null;
}

export function ScheduleForm({ isOpen, onClose, onSave, editingInfo }: ScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, team, date, record } = editingInfo || {};

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      form.reset({
        shift: record?.shift,
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
        shift: data.shift,
    });
    if (success) {
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  const availableShifts = team?.name === 'Management'
    ? ['Staff', 'L']
    : SHIFT_TYPES.filter(s => s !== 'Staff');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
          <DialogDescription>
            Update schedule for <strong>{user?.name}</strong> on <strong>{date ? format(date, "PPP") : ""}</strong>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="shift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a shift" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableShifts.map((shift) => (
                        <SelectItem key={shift} value={shift}>
                          {shift}
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
