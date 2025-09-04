"use client";

import { useEffect } from "react";
import type { User, Role } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ROLES } from "@/lib/types";
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

const FormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.enum(ROLES, { required_error: "Please select a role." }),
  placeOfBirth: z.string().min(2, "Place of birth is required."),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  address: z.string().min(10, "Address must be at least 10 characters."),
});

type FormValues = z.infer<typeof FormSchema>;

interface UserFormProps {
  isOpen: boolean;
  user?: User | null;
  onClose: () => void;
  onSave: (data: FormValues) => void;
}

export function UserForm({ isOpen, user, onClose, onSave }: UserFormProps) {
  const isEditMode = !!user;

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

  const handleSubmit = (data: FormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the details for ${user.name}.`
              : "Fill in the form to add a new user to the system."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
