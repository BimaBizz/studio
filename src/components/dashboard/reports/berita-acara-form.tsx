
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BeritaAcara } from "@/lib/types";
import { KODE_HAMBATAN_TYPES } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const FormSchema = z.object({
  pekerjaan: z.string().min(1, "Pekerjaan diperlukan"),
  lokasi: z.string().min(1, "Lokasi diperlukan"),
  fasilitas: z.string().min(1, "Fasilitas diperlukan"),
  pelaksana: z.string().min(1, "Pelaksana diperlukan"),
  hariTanggalLaporan: z.string().min(1, "Tanggal laporan diperlukan"),
  
  dibuatOleh: z.string().min(1, "Nama pembuat diperlukan"),
  diperiksaOleh: z.string().min(1, "Nama pemeriksa diperlukan"),
  diketahuiOleh: z.string().min(1, "Nama yang mengetahui diperlukan"),
  
  // DR
  drUraianKerusakan: z.string().min(1, "Uraian kerusakan diperlukan"),
  drTindakLanjut: z.string().min(1, "Tindak lanjut diperlukan"),
  hariTanggalRusak: z.string().optional(),
  jamRusak: z.string().optional(),

  // BAP
  bapPenyebabKerusakan: z.string().min(1, "Penyebab kerusakan diperlukan"),
  bapSparePart: z.string().min(1, "Spare part/tindak lanjut diperlukan"),
  bapRekomendasi: z.string().min(1, "Rekomendasi diperlukan"),
  bapKeterangan: z.string().min(1, "Keterangan diperlukan"),
  hariTanggalSelesai: z.string().optional(),
  jamSelesai: z.string().optional(),
  kodeHambatan: z.enum(KODE_HAMBATAN_TYPES).optional(),
  waktuTerputus: z.object({
    jam: z.coerce.number().optional(),
    menit: z.coerce.number().optional(),
  }).optional(),

  // Catatan Pengawas
  catatanPengawasBaggage: z.string().optional(),
  catatanPengawasTeknisi: z.string().optional(),

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

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pekerjaan: "PEMELIHARAAN UNIT",
      lokasi: "BANDARA INTERNASIONAL I GUSTI NGURAH RAI BALI",
      fasilitas: "FASILITAS AIRPORT MECHANICAL MANAGER",
      pelaksana: "PT. DOVIN PRATAMA",
    }
  });


  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      const defaultValues: FormValues = {
        pekerjaan: report?.pekerjaan || "PEMELIHARAAN UNIT",
        lokasi: report?.lokasi || "BANDARA INTERNASIONAL I GUSTI NGURAH RAI BALI",
        fasilitas: report?.fasilitas || "FASILITAS AIRPORT MECHANICAL MANAGER",
        pelaksana: report?.pelaksana || "PT. DOVIN PRATAMA",
        hariTanggalLaporan: report?.hariTanggalLaporan ? format(parseISO(report.hariTanggalLaporan), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        
        dibuatOleh: report?.dibuatOleh || "",
        diperiksaOleh: report?.diperiksaOleh || "",
        diketahuiOleh: report?.diketahuiOleh || "",
        
        drUraianKerusakan: report?.drUraianKerusakan || "",
        drTindakLanjut: report?.drTindakLanjut || "",
        hariTanggalRusak: report?.hariTanggalRusak ? format(parseISO(report.hariTanggalRusak), 'yyyy-MM-dd') : "",
        jamRusak: report?.jamRusak || "",

        bapPenyebabKerusakan: report?.bapPenyebabKerusakan || "",
        bapSparePart: report?.bapSparePart || "",
        bapRekomendasi: report?.bapRekomendasi || "",
        bapKeterangan: report?.bapKeterangan || "",
        hariTanggalSelesai: report?.hariTanggalSelesai ? format(parseISO(report.hariTanggalSelesai), 'yyyy-MM-dd') : "",
        jamSelesai: report?.jamSelesai || "",
        kodeHambatan: report?.kodeHambatan || undefined,
        waktuTerputus: report?.waktuTerputus || { jam: 0, menit: 0 },

        catatanPengawasBaggage: report?.catatanPengawasBaggage || "",
        catatanPengawasTeknisi: report?.catatanPengawasTeknisi || "",
      };
      form.reset(defaultValues);
    }
  }, [isOpen, report, isEditMode, form]);

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    const dataToSave = {
      ...data,
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
          <DialogDescription>Isi detail laporan di bawah ini. Satu laporan untuk satu kerusakan.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
            
            <fieldset className="space-y-4 border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Informasi Umum</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField control={form.control} name="pekerjaan" render={({ field }) => <FormItem><FormLabel>Pekerjaan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="lokasi" render={({ field }) => <FormItem><FormLabel>Lokasi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="fasilitas" render={({ field }) => <FormItem><FormLabel>Fasilitas</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="pelaksana" render={({ field }) => <FormItem><FormLabel>Pelaksana Pekerjaan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="hariTanggalLaporan" render={({ field }) => <FormItem><FormLabel>Hari/Tanggal Laporan</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
            </fieldset>

            <fieldset className="space-y-4 border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Laporan Kerusakan (DR)</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="drUraianKerusakan" render={({ field }) => <FormItem><FormLabel>Uraian Kerusakan</FormLabel><FormControl><Input placeholder="Contoh: ROLLER STEP (1PCS)" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="drTindakLanjut" render={({ field }) => <FormItem><FormLabel>Tindak Lanjut / Perbaikan</FormLabel><FormControl><Input placeholder="Contoh: AKAN SEGERA KAMI LAKUKAN PENGGANTIAN" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="hariTanggalRusak" render={({ field }) => <FormItem><FormLabel>Hari/Tanggal Rusak</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="jamRusak" render={({ field }) => <FormItem><FormLabel>Jam Rusak (WITA)</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
            </fieldset>

             <fieldset className="space-y-4 border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Berita Acara Pemasangan (BAP)</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="bapPenyebabKerusakan" render={({ field }) => <FormItem><FormLabel>Penyebab Kerusakan</FormLabel><FormControl><Input placeholder="Contoh: ROLLER STEP RUSAK/PECAH" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="bapSparePart" render={({ field }) => <FormItem><FormLabel>Spare Part/Tindak Lanjut</FormLabel><FormControl><Input placeholder="Contoh: ROLLER STEP (1PCS)" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="bapRekomendasi" render={({ field }) => <FormItem><FormLabel>Rekomendasi/Peralatan</FormLabel><FormControl><Input placeholder="Contoh: DOVIN" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="bapKeterangan" render={({ field }) => <FormItem><FormLabel>Keterangan</FormLabel><FormControl><Input placeholder="Contoh: SUDAH KAMI LAKUKAN PENGGANTIAN..." {...field} /></FormControl><FormMessage /></FormItem>} />
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
             </fieldset>

            <fieldset className="space-y-4 border p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Catatan & Tanda Tangan</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="catatanPengawasBaggage" render={({ field }) => <FormItem><FormLabel>Catatan (Baggage Handling & PMS Section)</FormLabel><FormControl><Textarea placeholder="Catatan..." {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="catatanPengawasTeknisi" render={({ field }) => <FormItem><FormLabel>Catatan (Team Leader/Teknisi)</FormLabel><FormControl><Textarea placeholder="Catatan..." {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField control={form.control} name="dibuatOleh" render={({ field }) => <FormItem><FormLabel>Dilaporkan oleh (Supervisor/Kepala Teknisi)</FormLabel><FormControl><Input placeholder="Nama..." {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="diperiksaOleh" render={({ field }) => <FormItem><FormLabel>Diperiksa & Disetujui (PGS)</FormLabel><FormControl><Input placeholder="Nama..." {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="diketahuiOleh" render={({ field }) => <FormItem><FormLabel>Diketahui Oleh (Dept. Head)</FormLabel><FormControl><Input placeholder="Nama..." {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
            </fieldset>

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
