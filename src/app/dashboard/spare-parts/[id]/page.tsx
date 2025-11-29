"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SparePart } from "@/lib/types";
import { getSpareParts, updateSparePart } from "@/services/spareParts";
import { SparePartForm } from "@/components/dashboard/spare-parts/spare-part-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addNotification } from "@/services/notifications";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SparePartDetailPage({ params }: { params: any }) {
  const resolvedParams = typeof params?.then === "function" ? React.use(params) : params;
  const id = resolvedParams?.id;
  const router = useRouter();
  const { toast } = useToast();

  const [part, setPart] = useState<SparePart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchPart = async () => {
    setIsLoading(true);
    try {
      const parts = await getSpareParts();
      const found = parts.find(p => p.id === id) || null;
      setPart(found);
      setSelectedImageIndex(0);
    } catch (err) {
      console.error("Error fetching part:", err);
      toast({ title: "Error", description: "Gagal mengambil data spare part.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const images = useMemo(() => {
    if (!part) return [];
    if (!part.image) return [];
    return Array.isArray(part.image) ? part.image : [part.image];
  }, [part]);

  const handleSave = async (data: Omit<SparePart, "id">) => {
    if (!part) return false;
    try {
      await updateSparePart(part.id, data);
      toast({ title: "Sukses", description: "Spare part berhasil diperbarui." });
      await addNotification({ message: `Spare part "${data.name}" telah diperbarui.` });

      // low stock notification
      if (data.lowStockLimit && data.quantity <= data.lowStockLimit) {
        await addNotification({ message: `Stok Hampir Habis: "${data.name}" hanya tersisa ${data.quantity}.` });
      }

      await fetchPart();
      return true;
    } catch (err) {
      console.error("Error updating:", err);
      toast({ title: "Error", description: "Gagal memperbarui spare part.", variant: "destructive" });
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <div className="space-y-4">
            <Skeleton className="h-8" />
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">Spare part tidak ditemukan.</p>
        <Button variant="ghost" onClick={() => router.push("/dashboard/spare-parts")} className="mt-4">
          Kembali ke daftar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/spare-parts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{part.name}</h1>
            <p className="text-sm text-muted-foreground">{part.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={part.lowStockLimit && part.quantity <= part.lowStockLimit ? "destructive" : "secondary"}>
            Qty: {part.quantity}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="relative w-full aspect-video rounded-md overflow-hidden border">
            <Image
              src={images[selectedImageIndex] || './placeholder.svg'}
              alt={`${part.name} - image ${selectedImageIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-20 rounded overflow-hidden border ${selectedImageIndex === idx ? 'ring-2 ring-primary' : ''}`}
                  type="button"
                >
                  <Image src={src} alt={`thumb-${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Location</h4>
            <div className="flex items-center gap-3 mt-2 border p-3 rounded-md">
              <div className="relative w-16 h-16 rounded overflow-hidden border">
                <Image src={part.locationImage || './placeholder.svg'} alt={part.locationName} fill className="object-cover" />
              </div>
              <div>
                <div className="font-medium">{part.locationName}</div>
                <div className="text-sm text-muted-foreground">Low stock limit: {part.lowStockLimit ?? "-"}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium">Tags</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {(part.tags || []).map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{part.description}</p>
          </div>
        </div>
      </div>

      <SparePartForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
        sparePart={part}
      />
    </div>
  );
}