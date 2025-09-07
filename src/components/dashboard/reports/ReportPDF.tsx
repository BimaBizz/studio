
import React from 'react';
import type { BeritaAcara } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import Image from 'next/image';

interface ReportPDFProps {
  report: BeritaAcara;
}

const renderTimeBoxes = (timeString?: string) => {
    const boxes = Array(4).fill('');
    if (timeString) {
        const parts = timeString.replace(':', '').split('');
        for (let i = 0; i < parts.length; i++) {
            boxes[i] = parts[i];
        }
    }
    return (
        <>
            {boxes.map((char, index) => (
                <td key={index} className="border border-black text-center w-6 h-6">{char}</td>
            ))}
        </>
    );
};
const renderDateBoxes = (dateString?: string) => {
    const boxes = Array(8).fill('');
    if (dateString) {
        try {
            const date = parseISO(dateString);
            const formatted = format(date, 'ddMMyyyy');
            const parts = formatted.split('');
            for (let i = 0; i < parts.length; i++) {
                boxes[i] = parts[i];
            }
        } catch (e) {
            console.error("Invalid date for date boxes:", dateString);
        }
    }
    return (
        <>
            {boxes.map((char, index) => (
                <td key={index} className="border border-black text-center w-6 h-6">{char}</td>
            ))}
        </>
    );
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
    <div id="report-pdf-content" className="p-4 bg-white text-black font-sans text-[10px]" style={{ width: '800px' }}>
      {/* Damage Report Section */}
      <div className="border-4 border-black p-2">
        <header className="flex justify-between items-start border-b-2 border-black pb-2">
            <div className='w-1/4'>
                 <Image src="/logo_injourney.png" alt="Injourney Airports" width={150} height={40}/>
            </div>
            <div className="text-center w-1/2">
                <h1 className="font-bold text-sm">LAPORAN KERUSAKAN</h1>
                <h2 className="font-bold text-sm">(DAMAGE REPORT / DR)</h2>
            </div>
            <div className="text-right w-1/4 relative h-10">
                 <Image src="/logo_dovin.png" alt="PT Dovin Pratama" layout="fill" objectFit="contain" />
            </div>
        </header>

        <section className="grid grid-cols-2 gap-x-4 mt-2">
          <div>
            <table className="w-full">
                <tbody>
                    <tr><td className="w-1/3">PEKERJAAN</td><td>:</td><td className="font-semibold">{report.pekerjaan}</td></tr>
                    <tr><td>LOKASI</td><td>:</td><td className="font-semibold">{report.lokasi}</td></tr>
                    <tr><td>FASILITAS</td><td>:</td><td className="font-semibold">{report.fasilitas}</td></tr>
                    <tr><td>PELAKSANA PEKERJAAN</td><td>:</td><td className="font-semibold">{report.pelaksana}</td></tr>
                </tbody>
            </table>
          </div>
          <div className="flex justify-between">
             <table className="w-full">
                <tbody>
                    <tr>
                        <td className="w-1/3">HARI/TANGGAL LAPORAN</td>
                        <td>:</td>
                        <td className="font-semibold uppercase">{formatDate(report.hariTanggalLaporan)}</td>
                    </tr>
                </tbody>
             </table>
            <div className="border border-black p-1 text-center self-start">
                <p>DOC.BH.PMS</p>
                <p>DR.REV.00</p>
            </div>
          </div>
        </section>

        <section className="mt-2">
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-1 w-8">NO.</th>
                <th className="border border-black p-1">LOKASI</th>
                <th className="border border-black p-1">URAIAN KERUSAKAN</th>
                <th className="border border-black p-1">TINDAK LANJUT / PERBAIKAN</th>
              </tr>
            </thead>
            <tbody>
                 <tr>
                    <td className="border border-black p-1 text-center h-12">1</td>
                    <td className="border border-black p-1 h-12">{report.lokasi}</td>
                    <td className="border border-black p-1 h-12">{report.drUraianKerusakan}</td>
                    <td className="border border-black p-1 h-12">{report.drTindakLanjut}</td>
                </tr>
            </tbody>
          </table>
        </section>

        <section className="flex justify-end mt-2">
            <table className="border-collapse">
                <tbody>
                    <tr>
                        <td className="pr-2">HARI/TANGGAL RUSAK</td>
                        {renderDateBoxes(report.hariTanggalRusak)}
                    </tr>
                    <tr>
                        <td className="pr-2 pt-1">JAM RUSAK</td>
                        {renderTimeBoxes(report.jamRusak)}
                        <td className="pl-1 pt-1" colSpan={4}>WITA</td>
                    </tr>
                </tbody>
            </table>
        </section>
        
        <section className="mt-1">
            <p className="font-bold text-center bg-gray-200 border-t border-l border-r border-black p-0.5">CATATAN PENGAWAS</p>
            <div className="grid grid-cols-2 border border-black min-h-[50px]">
                <div className="border-r border-black p-1">
                    <p>BAGGAGE HANDLING & PMS SECTION HEAD :</p>
                    <p className="mt-2">{report.catatanPengawasBaggage}</p>
                </div>
                <div className="p-1">
                    <p>TEAM LEADER/ENGINEER/TECHNICIAN :</p>
                    <p className="mt-2">{report.catatanPengawasTeknisi}</p>
                </div>
            </div>
        </section>

        <footer className="grid grid-cols-3 mt-1 text-center">
            <div className="border border-black p-1">
                <p>Diketahui oleh ;</p>
                <p className="font-semibold">MECHANICAL SERVICES</p>
                <p className="font-semibold">DEPARTMENT HEAD</p>
                <p className="mt-12">( {report.diketahuiOleh} )</p>
            </div>
            <div className="border-y border-black p-1">
                 <p>Diperiksa & disetujui oleh ;</p>
                <p className="font-semibold">PGS. Mechanical Services Coordinator / Mech on Duty</p>
                <p className="mt-16">( {report.diperiksaOleh} )</p>
            </div>
            <div className="border border-black p-1">
                 <p>Dilaporkan oleh ;</p>
                <p className="font-semibold">SUPERVISOR/KEPALA TEKNISI</p>
                <p className="font-semibold">PT. DOVIN PRATAMA</p>
                <p className="mt-12">( {report.dibuatOleh} )</p>
            </div>
        </footer>
      </div>

      <div className="h-4"></div>

      {/* Installation Report Section */}
      <div className="border-4 border-black p-2 mt-4">
        <header className="flex justify-between items-start pb-2">
            <div className="w-1/4"></div>
            <div className="text-center w-1/2">
                <h1 className="font-bold text-sm">BERITA ACARA PEMASANGAN (BAP)</h1>
            </div>
            <div className="w-1/4"></div>
        </header>
        
         <section className="grid grid-cols-2 gap-x-4 mt-2">
            <div>
                <table className="w-full">
                    <tbody>
                        <tr><td className="w-1/3">PEKERJAAN</td><td>:</td><td className="font-semibold">PEMASANGAN</td></tr>
                        <tr><td>LOKASI</td><td>:</td><td className="font-semibold">{report.lokasi}</td></tr>
                        <tr><td>FASILITAS</td><td>:</td><td className="font-semibold">{report.fasilitas}</td></tr>
                        <tr><td>PELAKSANA PEKERJAAN</td><td>:</td><td className="font-semibold">{report.pelaksana}</td></tr>
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between">
                <table className="w-full">
                    <tbody>
                        <tr>
                            <td className="w-1/3">HARI/TANGGAL LAPORAN</td>
                            <td>:</td>
                            <td className="font-semibold uppercase">{formatDate(report.hariTanggalLaporan)}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="border border-black p-1 text-center self-start">
                    <p>DOC.BH.PMS</p>
                    <p>DR.REV.00</p>
                </div>
            </div>
        </section>

        <section className="mt-2">
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-1 w-8">NO.</th>
                <th className="border border-black p-1">PENYEBAB KERUSAKAN</th>
                <th className="border border-black p-1">SPARE PART/TINDAK LANJUT</th>
                <th className="border border-black p-1">REKOMENDASI/PERALATAN</th>
                <th className="border border-black p-1">KETERANGAN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                  <td className="border border-black p-1 text-center h-12">1</td>
                  <td className="border border-black p-1 h-12">{report.bapPenyebabKerusakan}</td>
                  <td className="border border-black p-1 h-12">{report.bapSparePart}</td>
                  <td className="border border-black p-1 h-12">{report.bapRekomendasi}</td>
                  <td className="border border-black p-1 h-12">{report.bapKeterangan}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="grid grid-cols-2 mt-2">
            <table className="border-collapse">
                <tbody>
                    <tr>
                        <td className="pr-2">HARI/TANGGAL SELESAI</td>
                        {renderDateBoxes(report.hariTanggalSelesai)}
                    </tr>
                     <tr>
                        <td className="pr-2 pt-1">JAM SELESAI</td>
                        {renderTimeBoxes(report.jamSelesai)}
                        <td className="pl-1 pt-1" colSpan={4}>WITA</td>
                    </tr>
                    <tr>
                        <td className="pr-2 pt-1">KODE HAMBATAN</td>
                        <td className="border border-black text-center w-6 h-6 pt-1">{report.kodeHambatan?.charAt(0) || ''}</td>
                        <td className="border border-black text-center w-6 h-6 pt-1">{report.kodeHambatan?.charAt(1) || ''}</td>
                    </tr>
                     <tr>
                        <td className="pr-2 pt-1">JUMLAH WAKTU TERPUTUS</td>
                        <td className="border border-black text-center w-6 h-6 pt-1">{report.waktuTerputus?.jam || ''}</td>
                        <td className="pl-1 pt-1">JAM</td>
                         <td className="border border-black text-center w-6 h-6 pt-1">{report.waktuTerputus?.menit || ''}</td>
                        <td className="pl-1 pt-1">MENIT</td>
                    </tr>
                </tbody>
            </table>
            <div className="pl-4">
                <p className="font-bold underline">KODE HAMBATAN :</p>
                <div className="grid grid-cols-2">
                    {Object.entries(kodeHambatanDesc).map(([key, value]) => (
                        <p key={key}>{key} : {value}</p>
                    ))}
                </div>
            </div>
        </section>
        
         <section className="mt-1">
            <p className="font-bold text-center bg-gray-200 border-t border-l border-r border-black p-0.5">CATATAN PENGAWAS LAPANGAN</p>
            <div className="border border-black min-h-[50px] p-1">
                <p>(TEAM LEADER/ENGINEER/TECHNICIAN) :</p>
                 <p className="mt-2">{report.catatanPengawasTeknisi}</p>
            </div>
        </section>

        <footer className="grid grid-cols-3 mt-1 text-center">
            <div className="border border-black p-1">
                <p>Diketahui oleh ;</p>
                <p className="font-semibold">MECHANICAL SERVICES</p>
                <p className="font-semibold">DEPARTMENT HEAD</p>
                <p className="mt-12">( {report.diketahuiOleh} )</p>
            </div>
            <div className="border-y border-black p-1">
                 <p>Diperiksa & disetujui oleh ;</p>
                <p className="font-semibold">PGS. Mechanical Services Coordinator / Mech on Duty</p>
                <p className="mt-16">( {report.diperiksaOleh} )</p>
            </div>
            <div className="border border-black p-1">
                 <p>Dilaporkan oleh ;</p>
                <p className="font-semibold">SUPERVISOR/KEPALA TEKNISI</p>
                <p className="font-semibold">PT. DOVIN PRATAMA</p>
                <p className="mt-12">( {report.dibuatOleh} )</p>
            </div>
        </footer>
      </div>
    </div>
  );
};
