
"use client";

import type { SparePart } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Share2 } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SparePartsListProps {
    spareParts: SparePart[];
    onEdit: (part: SparePart) => void;
    onDelete: (id: string) => void;
}

// Helper function to convert a data URI to a Blob
const dataUriToBlob = (dataUri: string) => {
    const byteString = atob(dataUri.split(',')[1]);
    const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
};


export function SparePartsList({ spareParts, onEdit, onDelete }: SparePartsListProps) {
    const [partToDelete, setPartToDelete] = useState<SparePart | null>(null);
    const { toast } = useToast();

    const handleShare = async (part: SparePart) => {
        const text = `*Spare Part Info*\n\n*Name:* ${part.name}\n*Quantity:* ${part.quantity}\n*Location:* ${part.locationName}\n*Description:* ${part.description}`;

        // Check if Web Share API is supported and can share files
        if (navigator.share && navigator.canShare) {
            try {
                const blob = dataUriToBlob(part.image);
                const file = new File([blob], `${part.name}.jpg`, { type: blob.type });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: `Spare Part: ${part.name}`,
                        text: text,
                        files: [file],
                    });
                    return;
                }
            } catch (error) {
                console.error("Web Share API error:", error);
                // Fallback to text-only if sharing file fails
            }
        }
        
        // Fallback for browsers that don't support Web Share API or file sharing
        toast({
            title: "Sharing via WhatsApp",
            description: "Your browser does not support sharing images directly. Opening WhatsApp with text details.",
        });
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (spareParts.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No Spare Parts Found</h3>
                <p className="text-muted-foreground mt-2">
                    Click "Add Spare Part" to get started.
                </p>
            </div>
        );
    }
    
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {spareParts.map(part => (
                    <Card key={part.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="truncate">{part.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{part.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                <Image
                                    src={part.image}
                                    alt={part.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                             <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Location</h4>
                                <div className="flex items-center gap-2 border p-2 rounded-md">
                                    <Image
                                        src={part.locationImage}
                                        alt={part.locationName}
                                        width={40}
                                        height={40}
                                        className="object-cover rounded-sm aspect-square"
                                    />
                                    <p className="text-sm text-muted-foreground">{part.locationName}</p>
                                </div>
                            </div>
                            <div>
                                <Badge variant="secondary">Quantity: {part.quantity}</Badge>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleShare(part)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => onEdit(part)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setPartToDelete(part)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <AlertDialog open={!!partToDelete} onOpenChange={(isOpen) => !isOpen && setPartToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the spare part <strong>{partToDelete?.name}</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setPartToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        if(partToDelete) {
                            onDelete(partToDelete.id)
                            setPartToDelete(null)
                        }
                    }} className="bg-destructive hover:bg-destructive/90">
                    Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
