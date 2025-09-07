
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BeritaAcara, DamageReportItem, InstallationReportItem } from "@/lib/types";
import { KODE_HAMBATAN_TYPES } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";

const DamageReportItemSchema = z.object({
  id: z.string(),
  lokasi: z.string().min(1, "Lokasi diperlukan"),
  uraianKerusakan: z.string().min(1, "Uraian diperlukan"),
  tindakLanjut: z.string().min(1, "Tindak lanjut diperlukan"),
});

const InstallationReportItemSchema = z.object({
  id: z.string(),
  penyebabKerusakan: z.string().min(1, "Penyebab diperlukan"),
  sparePart: z.string().min(1, "Spare part diperlukan"),
  rekomendasi: z.string().min(1, "Rekomendasi diperlukan"),
  keterangan: z.string().min(1, "Keterangan diperlukan"),
});


const FormSchema = z.object({
  reportType: z.enum(['damage', 'installation']),
  pekerjaan: z.string().min(1, "Pekerjaan diperlukan"),
  lokasi: z.string().min(1, "Lokasi diperlukan"),
  fasilitas: z.string().min(1, "Fasilitas diperlukan"),
  pelaksana: z.string().min(1, "Pelaksana diperlukan"),
  hariTanggalLaporan: z.string().min(1, "Tanggal laporan diperlukan"),
  catatanPengawas: z.string().optional(),
  dibuatOleh: z.string().min(1, "Nama pembuat diperlukan"),
  diperiksaOleh: z.string().min(1, "Nama pemeriksa diperlukan"),
  diketahuiOleh: z.string().min(1, "Nama yang mengetahui diperlukan"),
  
  // DR
  drItems: z.array(DamageReportItemSchema).optional(),
  hariTanggalRusak: z.string().optional(),
  jamRusak: z.string().optional(),

  // BAP
  bapItems: z.array(InstallationReportItemSchema).optional(),
  hariTanggalSelesai: z.string().optional(),
  jamSelesai: z.string().optional(),
  kodeHambatan: z.enum(KODE_HAMBATAN_TYPES).optional(),
  waktuTerputus: z.object({
    jam: z.coerce.number().optional(),
    menit: z.coerce.number().optional(),
  }).optional(),
  
  // Legacy fields (can be auto-populated)
  title: z.string().optional(),
  content: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState<'damage' | 'installation'>('damage');

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      reportType: 'damage',
      drItems: [{ id: uuidv4(), lokasi: '', uraianKerusakan: '', tindakLanjut: '' }],
      bapItems: [{ id: uuidv4(), penyebabKerusakan: '', sparePart: '', rekomendasi: '', keterangan: '' }],
    }
  });

  const { fields: drFields, append: appendDr, remove: removeDr } = useFieldArray({
    control: form.control,
    name: "drItems",
  });
   const { fields: bapFields, append: appendBap, remove: removeBap } = useFieldArray({
    control: form.control,
    name: "bapItems",
  });

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      const defaultValues: FormValues = {
        reportType: report?.reportType || 'damage',
        pekerjaan: report?.pekerjaan || "PEMELIHARAAN UNIT",
        lokasi: report?.lokasi || "BANDARA INTERNASIONAL I GUSTI NGURAH RAI BALI",
        fasilitas: report?.fasilitas || "FASILITAS AIRPORT MECHANICAL MANAGER",
        pelaksana: report?.pelaksana || "PT. DOVIN PRATAMA",
        hariTanggalLaporan: report?.hariTanggalLaporan ? format(new Date(report.hariTanggalLaporan), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        catatanPengawas: report?.catatanPengawas || "",
        dibuatOleh: report?.dibuatOleh || "",
        diperiksaOleh: report?.diperiksaOleh || "",
        diketahuiOleh: report?.diketahuiOleh || "",
        // DR
        drItems: report?.drItems || [{ id: uuidv4(), lokasi: '', uraianKerusakan: '', tindakLanjut: '' }],
        hariTanggalRusak: report?.hariTanggalRusak ? format(new Date(report.hariTanggalRusak), 'yyyy-MM-dd') : "",
        jamRusak: report?.jamRusak || "",
        // BAP
        bapItems: report?.bapItems || [{ id: uuidv4(), penyebabKerusakan: '', sparePart: '', rekomendasi: '', keterangan: '' }],
        hariTanggalSelesai: report?.hariTanggalSelesai ? format(new Date(report.hariTanggalSelesai), 'yyyy-MM-dd') : "",
        jamSelesai: report?.jamSelesai || "",
        kodeHambatan: report?.kodeHambatan || undefined,
        waktuTerputus: report?.waktuTerputus || { jam: 0, menit: 0 },
      };
      form.reset(defaultValues);
      setActiveTab(report?.reportType || 'damage');
    }
  }, [isOpen, report, isEditMode, form]);

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    // Auto-populate legacy fields for compatibility
    const legacyTitle = data.reportType === 'damage' ? `DR: ${data.drItems?.[0]?.uraianKerusakan}` : `BAP: ${data.bapItems?.[0]?.penyebabKerusakan}`;
    const legacyContent = data.catatanPengawas || "No additional notes.";

    const dataToSave = {
      ...data,
      title: legacyTitle,
      content: legacyContent,
      hariTanggalLaporan: new Date(data.hariTanggalLaporan).toISOString(),
      hariTanggalRusak: data.hariTanggalRusak ? new Date(data.hariTanggalRusak).toISOString() : undefined,
      hariTanggalSelesai: data.hariTanggalSelesai ? new Date(data.hariTanggalSelesai).toISOString() : undefined,
    };
    
    const success = await onSave(dataToSave);
    if (success) {
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Laporan" : "Buat Laporan Baru"}</DialogTitle>
          <DialogDescription>Isi detail laporan di bawah ini.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
            <Tabs value={activeTab} onValueChange={(v) => {
              const value = v as 'damage' | 'installation';
              setActiveTab(value);
              form.setValue('reportType', value);
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="damage">Laporan Kerusakan (DR)</TabsTrigger>
                <TabsTrigger value="installation">Berita Acara Pemasangan (BAP)</TabsTrigger>
              </TabsList>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                <FormField control={form.control} name="pekerjaan" render={({ field }) => <FormItem><FormLabel>Pekerjaan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="lokasi" render={({ field }) => <FormItem><FormLabel>Lokasi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="fasilitas" render={({ field }) => <FormItem><FormLabel>Fasilitas</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="pelaksana" render={({ field }) => <FormItem><FormLabel>Pelaksana Pekerjaan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="hariTanggalLaporan" render={({ field }) => <FormItem><FormLabel>Hari/Tanggal Laporan</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>

              {/* Damage Report Content */}
              <TabsContent value="damage" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold pt-4">Detail Kerusakan</h3>
                   {drFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 p-2 border rounded-md">
                      <FormField control={form.control} name={`drItems.${index}.lokasi`} render={({ field }) => <FormItem className="col-span-4"><FormLabel>Lokasi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name={`drItems.${index}.uraianKerusakan`} render={({ field }) => <FormItem className="col-span-4"><FormLabel>Uraian Kerusakan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name={`drItems.${index}.tindakLanjut`} render={({ field }) => <FormItem className="col-span-3"><FormLabel>Tindak Lanjut</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                       <div className="col-span-1 flex items-end">
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeDr(index)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendDr({ id: uuidv4(), lokasi: '', uraianKerusakan: '', tindakLanjut: '' })}><PlusCircle className="mr-2 h-4 w-4"/>Tambah Baris</Button>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="hariTanggalRusak" render={({ field }) => <FormItem><FormLabel>Hari/Tanggal Rusak</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="jamRusak" render={({ field }) => <FormItem><FormLabel>Jam Rusak (WITA)</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
              </TabsContent>

              {/* Installation Report Content */}
              <TabsContent value="installation" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold pt-4">Detail Pemasangan</h3>
                   {bapFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 p-2 border rounded-md">
                      <FormField control={form.control} name={`bapItems.${index}.penyebabKerusakan`} render={({ field }) => <FormItem className="col-span-3"><FormLabel>Penyebab Kerusakan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name={`bapItems.${index}.sparePart`} render={({ field }) => <FormItem className="col-span-3"><FormLabel>Spare Part/Tindak Lanjut</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name={`bapItems.${index}.rekomendasi`} render={({ field }) => <FormItem className="col-span-2"><FormLabel>Rekomendasi/Peralatan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name={`bapItems.${index}.keterangan`} render={({ field }) => <FormItem className="col-span-3"><FormLabel>Keterangan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                       <div className="col-span-1 flex items-end">
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeBap(index)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                   <Button type="button" variant="outline" size="sm" onClick={() => appendBap({ id: uuidv4(), penyebabKerusakan: '', sparePart: '', rekomendasi: '', keterangan: '' })}><PlusCircle className="mr-2 h-4 w-4"/>Tambah Baris</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField control={form.control} name="hariTanggalSelesai" render={({ field }) => <FormItem><FormLabel>Hari/Tanggal Selesai</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="jamSelesai" render={({ field }) => <FormItem><FormLabel>Jam Selesai (WITA)</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="kodeHambatan" render={({ field }) => <FormItem><FormLabel>Kode Hambatan</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Kode" /></SelectTrigger></FormControl><SelectContent>{KODE_HAMBATAN_TYPES.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} />
                    <div className="grid grid-cols-2 gap-2">
                        <FormField control={form.control} name="waktuTerputus.jam" render={({ field }) => <FormItem><FormLabel>Jam Putus</FormLabel><FormControl><Input type="number" placeholder="Jam" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="waktuTerputus.menit" render={({ field }) => <FormItem><FormLabel>Menit</FormLabel><FormControl><Input type="number" placeholder="Menit" {...field} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4 pt-4 border-t">
              <FormField control={form.control} name="catatanPengawas" render={({ field }) => <FormItem><FormLabel>Catatan Pengawas Lapangan</FormLabel><FormControl><Textarea placeholder="Catatan..." {...field} /></FormControl><FormMessage /></FormItem>} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField control={form.control} name="dibuatOleh" render={({ field }) => <FormItem><FormLabel>Dibuat Oleh (Team Leader)</FormLabel><FormControl><Input placeholder="Nama..." {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="diperiksaOleh" render={({ field }) => <FormItem><FormLabel>Diperiksa & Disetujui (PGS)</FormLabel><FormControl><Input placeholder="Nama..." {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="diketahuiOleh" render={({ field }) => <FormItem><FormLabel>Diketahui Oleh (Dept. Head)</FormLabel><FormControl><Input placeholder="Nama..." {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
            </div>

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
