
import React from 'react';
import type { BeritaAcara } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import Image from 'next/image';

interface ReportPDFProps {
  report: BeritaAcara;
}

const renderTimeBoxes = (timeString?: string) => {
    const time = timeString ? timeString.replace(':', '') : '    ';
    return (
        <div className="flex space-x-2 mt-1">
            <div className="flex">
                <p className="px-2 border border-black">{time[0] || ' '}</p>
                <p className="px-2 border border-black">{time[1] || ' '}</p>
            </div>
            <div className="flex">
                <p className="px-2 border border-black">{time[2] || ' '}</p>
                <p className="px-2 border border-black">{time[3] || ' '}</p>
            </div>
            <p>WITA</p>
        </div>
    );
};

const renderDateBoxes = (dateString?: string) => {
    if (!dateString) {
        return (
             <div className="flex space-x-2 mt-2">
                <p className="border border-black uppercase px-4 w-[60px]">&nbsp;</p>
                <div className="flex">
                    <p className="px-2 border border-black">&nbsp;</p>
                    <p className="px-2 border border-black">&nbsp;</p>
                </div>
                <div className="flex">
                    <p className="px-2 border border-black">&nbsp;</p>
                    <p className="px-2 border border-black">&nbsp;</p>
                </div>
                <div className="flex">
                    <p className="px-2 border border-black">&nbsp;</p>
                    <p className="px-2 border border-black">&nbsp;</p>
                    <p className="px-2 border border-black">&nbsp;</p>
                    <p className="px-2 border border-black">&nbsp;</p>
                </div>
            </div>
        );
    }

    try {
        const date = parseISO(dateString);
        const dayName = format(date, "eeee", { locale: IndonesianLocale });
        const day = format(date, "dd");
        const month = format(date, "MM");
        const year = format(date, "yyyy");

        return (
            <div className="flex space-x-2 mt-2">
                <p className="border border-black uppercase px-4 text-center">{dayName}</p>
                <div className="flex">
                    <p className="px-2 border border-black">{day[0]}</p>
                    <p className="px-2 border border-black">{day[1]}</p>
                </div>
                <div className="flex">
                    <p className="px-2 border border-black">{month[0]}</p>
                    <p className="px-2 border border-black">{month[1]}</p>
                </div>
                <div className="flex">
                    <p className="px-2 border border-black">{year[0]}</p>
                    <p className="px-2 border border-black">{year[1]}</p>
                    <p className="px-2 border border-black">{year[2]}</p>
                    <p className="px-2 border border-black">{year[3]}</p>
                </div>
            </div>
        );
    } catch (e) {
        console.error("Invalid date for date boxes:", dateString);
        return null;
    }
};


export const ReportPDF: React.FC<ReportPDFProps> = ({ report }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            return format(parseISO(dateString), "eeee, dd MMMM yyyy", { locale: IndonesianLocale });
        } catch {
            return dateString; // fallback
        }
    };
    
    const kodeHambatanDesc: Record<string, string> = {
        AU: "Tidak Ada Alat ukur",
        PK: "Menunggu Penerbangan",
        TT: "Tidak Ada Teknisi",
        SC: "Menunggu Suku Cadang / Spare Part",
        AL: "Alasan Lain",
        TH: "Tidak Ada hambatan",
    };

  return (
    <div id="report-pdf-content" className="bg-white text-black text-[11px] font-semibold">
        {/* PAGE 1: DAMAGE REPORT */}
        <div className="max-w-5xl mx-auto bg-white p-6 page">
            <div className="border-black border">
                {/* Header */}
                <div className="flex justify-between items-center p-4 my-4">
                    <Image src="/logo_injourney.png" alt="Injourney Airports" width={120} height={40}/>
                    <div className="text-center font-bold uppercase text-[16px]">
                        <h1>Laporan Kerusakan</h1>
                        <p>(Damage Report / DR)</p>
                    </div>
                    <Image src="/logo_dovin.png" alt="PT Dovin Pratama" width={120} height={40}/>
                </div>
                
                {/* Info Section */}
                <div className="grid grid-cols-3 gap-2 p-4">
                    <div className="col-span-2 flex">
                    <div className="mr-2">
                        <p className="font-semibold">Pekerjaan</p>
                        <p className="font-semibold">Lokasi</p>
                        <p className="font-semibold">Fasilitas</p>
                        <p className="font-semibold">Pelaksana Pekerjaan</p>
                        <p className="font-semibold">Hari/Tanggal Laporan</p>
                    </div>
                    <div>
                        <p>: {report.pekerjaan}</p>
                        <p>: {report.lokasi}</p>
                        <p>: {report.fasilitas}</p>
                        <p>: {report.pelaksana}</p>
                        <p className='uppercase'>: {formatDate(report.hariTanggalLaporan)}</p>
                    </div>
                    </div>
                    <div className="w-full items-center flex justify-center">
                        <p className="text-center p-3 border border-black">DOC.BLP/MS<br/>DR.LBY.00</p>
                    </div>
                </div>

                {/* DR Table */}
                <table className="w-full border-t border-b border-black">
                    <thead className="bg-gray-200">
                    <tr>
                        <th className="border-b border-r border-black px-1 py-1 w-8">No.</th>
                        <th className="border-b border-r border-black px-1 py-1">Lokasi</th>
                        <th className="border-b border-r border-black px-1 py-1">Uraian Kerusakan</th>
                        <th className="border-b border-black px-1 py-1">Tindak Lanjut / Perbaikan</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="border-r border-black text-center h-28 align-top p-1">1</td>
                        <td className="border-r border-black text-center h-28 align-top p-1">{report.lokasi}</td>
                        <td className="border-r border-black text-center h-28 align-top p-1">{report.drUraianKerusakan}</td>
                        <td className="text-center h-28 align-top p-1">{report.drTindakLanjut}</td>
                    </tr>
                    </tbody>
                </table>
                 
                <div className="grid grid-cols-2">
                    <div className="col-start-2 flex justify-end p-2 items-start">
                        <div className='text-left'>
                            <div className="flex items-start space-x-2">
                                <div className="w-36 mt-2">
                                    <p>Hari/Tanggal Rusak</p>
                                    <p className="mt-2">Jam Rusak</p>
                                </div>
                                <div>
                                    {renderDateBoxes(report.hariTanggalRusak)}
                                    {renderTimeBoxes(report.jamRusak)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Supervisor Notes & Signatures */}
                <div className="grid border-t border-black">
                    <p className="font-semibold border-b border-black text-center bg-gray-100 p-1">Catatan Pengawas :</p>
                    <div className="grid grid-cols-2">
                        <div className="border-r border-black h-28 p-1">
                            <p>Baggage Handling & PMS Section Head :</p>
                             <p className="mt-2 font-normal">{report.catatanPengawasBaggage}</p>
                        </div>
                        <div className="h-28 p-1">
                            <p>Team Leader / Engineer / Technician :</p>
                             <p className="mt-2 font-normal">{report.catatanPengawasTeknisi}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 text-center border-t border-black">
                        <div className="border-r border-black p-1">
                            <p>Disetujui oleh:</p>
                            <p>MECHANICAL SERVICES</p>
                            <p>DEPARTMENT HEAD</p>
                            <p className="mt-14">( {report.diketahuiOleh || '................'} )</p>
                        </div>
                        <div className="border-r border-black p-1">
                            <p>Diperiksa & disetujui oleh:</p>
                            <p>AIRPORT MECHANICAL</p>
                            <p>SUPERVISOR/ENGINEER/TECHNICIAN</p>
                            <p className="mt-14">( {report.diperiksaOleh || '................'} )</p>
                        </div>
                        <div className="p-1">
                            <p>Disiapkan oleh:</p>
                            <p>SUPERVISOR/KEPALA TEKNISI</p>
                            <p>PT. DOVIN PRATAMA</p>
                            <p className="mt-14">( {report.dibuatOleh || '................'} )</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* PAGE 2: BAP */}
        <div className="max-w-5xl mx-auto bg-white p-6 page">
            <div className="border-black border">
                <div className="flex justify-center items-center py-4">
                    <div className="text-center">
                    <h1 className="font-bold uppercase text-[16px] underline">Berita Acara Pemasangan (BAP)</h1>
                    </div>
                </div>
                 {/* Info Section */}
                <div className="grid grid-cols-3 gap-2 p-4">
                    <div className="col-span-2 flex">
                        <div className="mr-2">
                            <p className="font-semibold">Pekerjaan</p>
                            <p className="font-semibold">Lokasi</p>
                            <p className="font-semibold">Fasilitas</p>
                            <p className="font-semibold">Pelaksana Pekerjaan</p>
                            <p className="font-semibold">Hari/Tanggal Laporan</p>
                        </div>
                        <div>
                            <p>: {report.pekerjaan}</p>
                            <p>: {report.lokasi}</p>
                            <p>: {report.fasilitas}</p>
                            <p>: {report.pelaksana}</p>
                            <p className='uppercase'>: {formatDate(report.hariTanggalLaporan)}</p>
                        </div>
                    </div>
                    <div className="w-full items-center flex justify-center">
                        <p className="text-center p-3 border border-black">DOC.BLP/MS<br/>DR.LBY.00</p>
                    </div>
                </div>
                
                <table className="w-full border-t border-b border-black">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-b border-r border-black px-1 py-1 w-8">No.</th>
                            <th className="border-b border-r border-black px-1 py-1">Penyebab Kerusakan</th>
                            <th className="border-b border-r border-black px-1 py-1">Spare Part / Tindak Lanjut</th>
                            <th className="border-b border-r border-black px-1 py-1">Rekomendasi / Peralatan</th>
                            <th className="border-b border-black px-1 py-1">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border-r border-black text-center h-28 align-top p-1">1</td>
                            <td className="border-r border-black text-center h-28 align-top p-1">{report.bapPenyebabKerusakan}</td>
                            <td className="border-r border-black text-center h-28 align-top p-1">{report.bapSparePart}</td>
                            <td className="border-r border-black text-center h-28 align-top p-1">{report.bapRekomendasi}</td>
                            <td className="text-center h-28 align-top p-1">{report.bapKeterangan}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div className="grid grid-cols-2 mt-2">
                     <div className='flex space-x-3 p-2'>
                        <div className="space-y-2">
                            <p>Hari/Tanggal</p>
                            <p>Jam selesai</p>
                            <p>Kode Hambatan</p>
                            <p>Jumlah waktu Terputus</p>
                        </div>
                        <div className='-mt-2'>
                            {renderDateBoxes(report.hariTanggalSelesai)}
                            {renderTimeBoxes(report.jamSelesai)}
                            <div className="flex mt-1">
                                <p className="px-2 border border-black">{report.kodeHambatan?.[0] || ' '}</p>
                                <p className="px-2 border border-black">{report.kodeHambatan?.[1] || ' '}</p>
                            </div>
                             <div className="flex items-center space-x-1 mt-1">
                                <p className="px-2 w-20 h-6 border border-black text-center flex items-center justify-center">{report.waktuTerputus?.jam || ''}</p>
                                <p>JAM</p>
                                <p className="px-2 w-20 h-6 border border-black text-center flex items-center justify-center">{report.waktuTerputus?.menit || ''}</p>
                                <p>MENIT</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold underline">Kode Hambatan :</p>
                        <div className="grid grid-cols-2">
                             {Object.entries(kodeHambatanDesc).map(([key, value]) => (
                                <p key={key}>{key} : {value}</p>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 border border-black p-2">
                    <p className="font-semibold">Catatan Pengawas Lapangan</p>
                    <div className='min-h-[112px]'> {/* h-28 */}
                      <p>(Team Leader / Engineer / Technician)</p>
                      <p className="mt-2 font-normal">{report.catatanPengawasTeknisi}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-3 text-center border-b border-l border-r border-black">
                    <div className="border-r border-black p-1">
                        <p>Disetujui oleh:</p>
                        <p>MECHANICAL SERVICES</p>
                        <p>DEPARTMENT HEAD</p>
                        <p className="mt-14">( {report.diketahuiOleh || '................'} )</p>
                    </div>
                    <div className="border-r border-black p-1">
                        <p>Diperiksa & disetujui oleh:</p>
                        <p>AIRPORT MECHANICAL</p>
                        <p>SUPERVISOR/ENGINEER/TECHNICIAN</p>
                        <p className="mt-14">( {report.diperiksaOleh || '................'} )</p>
                    </div>
                    <div className="p-1">
                        <p>Disiapkan oleh:</p>
                        <p>SUPERVISOR/KEPALA TEKNISI</p>
                        <p>PT. DOVIN PRATAMA</p>
                        <p className="mt-14">( {report.dibuatOleh || '................'} )</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
