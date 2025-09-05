
"use client";

import { useEffect, useState } from "react";
import type { SparePart } from "@/lib/types";
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
import Image from "next/image";

const FormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  description: z.string().min(5, "Description must be at least 5 characters."),
  locationName: z.string().min(2, "Location name is required."),
  image: z.string().min(1, "Spare part image is required."),
  locationImage: z.string().min(1, "Location image is required."),
  tags: z.string().optional(), // Tags will be a comma-separated string
});

type FormValues = z.infer<typeof FormSchema>;

interface SparePartFormProps {
  isOpen: boolean;
  sparePart?: SparePart | null;
  onClose: () => void;
  onSave: (data: Omit<SparePart, 'id'>) => Promise<boolean>;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export function SparePartForm({ isOpen, sparePart, onClose, onSave }: SparePartFormProps) {
  const isEditMode = !!sparePart;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        name: "",
        quantity: 0,
        description: "",
        locationName: "",
        image: "",
        locationImage: "",
        tags: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
        setIsSubmitting(false);
        form.reset(
            isEditMode && sparePart ? {
                ...sparePart,
                tags: sparePart.tags?.join(', ') || '',
            } : {
                name: "",
                quantity: 0,
                description: "",
                locationName: "",
                image: "",
                locationImage: "",
                tags: "",
            }
        );
    }
  }, [isOpen, sparePart, isEditMode, form]);
  
  const handleFileChange = async (field: 'image' | 'locationImage', event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const base64 = await fileToBase64(file);
      form.setValue(field, base64, { shouldValidate: true });
    }
  };

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    // Convert comma-separated string to an array of strings, trimming whitespace
    const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    const dataToSave = { ...data, tags: tagsArray };

    const success = await onSave(dataToSave);
    if (success) {
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  const image = form.watch("image");
  const locationImage = form.watch("locationImage");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Spare Part" : "Add New Spare Part"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the details for ${sparePart?.name}.`
              : "Fill in the form to add a new spare part."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Spare Part Name</FormLabel><FormControl><Input placeholder="e.g., Bearing 6203" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                        <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl><Input placeholder="bearing, 6203, penting" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the spare part..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <div className="space-y-4">
                    <FormField control={form.control} name="image" render={() => (
                        <FormItem>
                            <FormLabel>Part Image</FormLabel>
                            {image && <div className="relative w-full aspect-video border rounded-md overflow-hidden"><Image src={image} alt="Part preview" fill className="object-cover" /></div>}
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => handleFileChange("image", e)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
             <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField control={form.control} name="locationName" render={({ field }) => (
                        <FormItem><FormLabel>Location Name</FormLabel><FormControl><Input placeholder="e.g., Gudang Utama Rak A1" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="locationImage" render={() => (
                        <FormItem>
                            <FormLabel>Location Image</FormLabel>
                            {locationImage && <div className="relative w-full aspect-video border rounded-md overflow-hidden"><Image src={locationImage} alt="Location preview" fill className="object-cover" /></div>}
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => handleFileChange("locationImage", e)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
            
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
