
"use client";

import { useEffect, useState, useMemo } from "react";
import type { Team, User } from "@/lib/types";
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
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

const FormSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters."),
  leaderId: z.string({ required_error: "Please select a team leader." }),
  memberIds: z.array(z.string()).min(1, "Please select at least one member."),
});

type FormValues = z.infer<typeof FormSchema>;

interface TeamFormProps {
  isOpen: boolean;
  team?: Team | null;
  onClose: () => void;
  onSave: (data: FormValues) => Promise<boolean>;
  users: User[];
  teams: Team[];
}

export function TeamForm({ isOpen, team, onClose, onSave, users, teams }: TeamFormProps) {
  const isEditMode = !!team;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", leaderId: undefined, memberIds: [] },
  });

  // Get all user IDs that are already in a team (either as a leader or member)
  const assignedUserIds = useMemo(() => {
    const ids = new Set<string>();
    teams.forEach(t => {
      // If we are editing a team, its own members should not be considered "assigned" yet
      // so they can still appear in the list.
      if (isEditMode && t.id === team?.id) return;
      
      ids.add(t.leaderId);
      t.memberIds.forEach(memberId => ids.add(memberId));
    });
    return ids;
  }, [teams, isEditMode, team]);


  useEffect(() => {
    if (isOpen) {
        setIsSubmitting(false);
        form.reset(
            isEditMode && team ? {
                name: team.name,
                leaderId: team.leaderId,
                memberIds: team.memberIds || [],
            } : {
                name: "", leaderId: undefined, memberIds: [],
            }
        );
    }
  }, [isOpen, team, isEditMode, form]);

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const success = await onSave(data);
    if (success) {
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  const potentialLeaders = users.filter(user => 
    user.role === 'Team Leader' && 
    (!assignedUserIds.has(user.id) || (isEditMode && user.id === team?.leaderId))
  );
  
  const potentialMembers = users.filter(user => 
    (user.role === 'Teknisi' || user.role === 'Assisten Teknisi') &&
    (!assignedUserIds.has(user.id) || (isEditMode && team?.memberIds.includes(user.id)))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Team" : "Create New Team"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the details for the "${team?.name}" team.`
              : "Fill in the form to create a new team."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl><Input placeholder="Alpha Technicians" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="leaderId" render={({ field }) => (
                <FormItem>
                    <FormLabel>Team Leader</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a leader" /></SelectTrigger></FormControl>
                        <SelectContent>{potentialLeaders.map((user) => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField
              control={form.control}
              name="memberIds"
              render={() => (
                <FormItem>
                  <FormLabel>Team Members</FormLabel>
                  <ScrollArea className="h-40 w-full rounded-md border p-4">
                    {potentialMembers.length === 0 && <p className="text-sm text-muted-foreground text-center">No available members.</p>}
                    {potentialMembers.map((user) => (
                      <FormField
                        key={user.id}
                        control={form.control}
                        name="memberIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={user.id}
                              className="flex flex-row items-start space-x-3 space-y-0 py-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(user.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), user.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== user.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {user.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save Team'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
