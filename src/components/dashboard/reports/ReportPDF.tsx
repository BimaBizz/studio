import React from 'react';
import type { BeritaAcara } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import Image from 'next/image';

interface ReportPDFProps {
  report: BeritaAcara;
}

// === Helper Functions ===
const renderTimeBoxes = (timeString?: string) => {
  const time = timeString ? timeString.replace(':', '') : '    ';
  const boxStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid black', margin: 0 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', columnGap: '0.5rem', marginTop: '0.25rem' }}>
      <div style={{ display: 'flex' }}>
        <p style={boxStyle}>{time[0] || ' '}</p>
        <p style={boxStyle}>{time[1] || ' '}</p>
      </div>
      <div style={{ display: 'flex' }}>
        <p style={boxStyle}>{time[2] || ' '}</p>
        <p style={boxStyle}>{time[3] || ' '}</p>
      </div>
      <p style={{ margin: 0 }}>WITA</p>
    </div>
  );
};

const renderDateBoxes = (dateString?: string) => {
  const boxStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid black', margin: 0 };
  const dayNameStyle: React.CSSProperties = { ...boxStyle, textTransform: 'uppercase', paddingLeft: '1rem', paddingRight: '1rem', textAlign: 'center' };

  if (!dateString) {
    return (
      <div style={{ display: 'flex', columnGap: '0.5rem', marginTop: '0.5rem' }}>
        <p style={{ ...dayNameStyle, width: '60px' }}>&nbsp;</p>
        <div style={{ display: 'flex' }}><p style={boxStyle}>&nbsp;</p><p style={boxStyle}>&nbsp;</p></div>
        <div style={{ display: 'flex' }}><p style={boxStyle}>&nbsp;</p><p style={boxStyle}>&nbsp;</p></div>
        <div style={{ display: 'flex' }}><p style={boxStyle}>&nbsp;</p><p style={boxStyle}>&nbsp;</p><p style={boxStyle}>&nbsp;</p><p style={boxStyle}>&nbsp;</p></div>
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
      <div style={{ display: 'flex', alignItems: 'center', columnGap: '0.5rem', marginTop: '0.5rem' }}>
        <p style={dayNameStyle}>{dayName}</p>
        <div style={{ display: 'flex' }}><p style={boxStyle}>{day[0]}</p><p style={boxStyle}>{day[1]}</p></div>
        <div style={{ display: 'flex' }}><p style={boxStyle}>{month[0]}</p><p style={boxStyle}>{month[1]}</p></div>
        <div style={{ display: 'flex' }}><p style={boxStyle}>{year[0]}</p><p style={boxStyle}>{year[1]}</p><p style={boxStyle}>{year[2]}</p><p style={boxStyle}>{year[3]}</p></div>
      </div>
    );
  } catch (e) {
    console.error("Invalid date for date boxes:", dateString);
    return null;
  }
};

const renderWaktuTerputus = (waktu?: { jam?: number; menit?: number }) => {
  const jam = waktu?.jam?.toString().padStart(2, '0') || '  ';
  const menit = waktu?.menit?.toString().padStart(2, '0') || '  ';
  const boxStyle: React.CSSProperties = { padding: '0.25rem', width: '5rem', border: '1px solid black', textAlign: 'center', margin: 0 };

  return (
    <div style={{ display: 'flex', alignItems: 'center', columnGap: '0.25rem', marginTop: '0.25rem' }}>
      <p style={boxStyle}>{jam}</p>
      <p style={{ margin: 0 }}>JAM</p>
      <p style={boxStyle}>{menit}</p>
      <p style={{ margin: 0 }}>MENIT</p>
    </div>
  );
};

// === Main Component ===
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
    AU: 'Tidak Ada Alat ukur', PK: 'Menunggu Penerbangan', TT: 'Tidak Ada Teknisi',
    SC: 'Menunggu Suku Cadang / Spare Part', AL: 'Alasan Lain', TH: 'Tidak Ada hambatan',
  };
  
  const bodyStyle: React.CSSProperties = {
    backgroundColor: '#ffffff', color: '#000000', fontSize: '11px', fontWeight: '600',
    fontFamily: 'sans-serif', lineHeight: '1.3'
  };
  
  const pageStyle: React.CSSProperties = {
    maxWidth: '1024px', marginLeft: 'auto', marginRight: 'auto',
    backgroundColor: '#ffffff', padding: '1.5rem',
  };

  return (
    <div id="report-pdf-content" style={bodyStyle}>
      {/* ================= PAGE 1: DAMAGE REPORT ================= */}
      <div style={{...pageStyle, breakAfter: 'always'}}>
        <div style={{ border: '1px solid black' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', margin: '0.5rem 0' }}>
            <Image src="/logo_injourney.png" alt="Injourney Airports" width={160} height={53} style={{ height: 'auto', width: '160px' }} />
            <div style={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '16px' }}>
              <p style={{ margin: 0 }}>Laporan Kerusakan</p>
              <p style={{ margin: 0 }}>(Damage Report / DR)</p>
            </div>
            <Image src="/logo_dovin.png" alt="PT Dovin Pratama" width={160} height={53} style={{ height: 'auto', width: '160px' }} />
          </div>

          {/* Info Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem', padding: '1rem' }}>
            <div style={{ gridColumn: 'span 2 / span 2', display: 'flex' }}>
              <div style={{ marginRight: '0.5rem' }}>
                <p style={{ margin: 0 }}>Pekerjaan</p><p style={{ margin: 0 }}>Lokasi</p><p style={{ margin: 0 }}>Fasilitas</p><p style={{ margin: 0 }}>Pelaksana Pekerjaan</p><p style={{ margin: 0 }}>Hari/Tanggal Laporan</p>
              </div>
              <div>
                <p style={{ margin: 0 }}>: {report.pekerjaan}</p><p style={{ margin: 0 }}>: {report.lokasi}</p><p style={{ margin: 0 }}>: {report.fasilitas}</p><p style={{ margin: 0 }}>: {report.pelaksana}</p><p style={{ margin: 0 }}>: {formatDate(report.hariTanggalLaporan)}</p>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ textAlign: 'center', padding: '0.75rem', border: '1px solid black', margin: 0 }}>DOC.BLP/MS<br/>DR.LBY.00</p>
            </div>
          </div>
          
          {/* Tabel DR */}
          <table style={{ width: '100%', borderTop: '1px solid black', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#e5e7eb' }}>
              <tr>
                <th style={{ border: '1px solid black', padding: '0.25rem', width: '2rem' }}>No.</th>
                <th style={{ border: '1px solid black', padding: '0.25rem' }}>Lokasi</th>
                <th style={{ border: '1px solid black', padding: '0.25rem' }}>Uraian Kerusakan</th>
                <th style={{ border: '1px solid black', padding: '0.25rem' }}>Tindak Lanjut / Perbaikan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', textAlign: 'center', height: '7rem', verticalAlign: 'top', padding: '0.25rem' }}>1</td>
                <td style={{ border: '1px solid black', verticalAlign: 'top', padding: '0.25rem' }}>{report.lokasi}</td>
                <td style={{ border: '1px solid black', verticalAlign: 'top', padding: '0.25rem' }}>{report.drUraianKerusakan}</td>
                <td style={{ border: '1px solid black', verticalAlign: 'top', padding: '0.25rem' }}>{report.drTindakLanjut}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <div style={{ gridColumn: 'span 1' }}></div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', padding: '0.5rem' }}>
              <div style={{textTransform: 'uppercase', marginRight: '1rem', textAlign: 'right'}}>
                  <p style={{ margin: 0 }}>Hari/Tanggal Rusak</p>
                  <p style={{marginTop: '0.25rem', margin: 0 }}>Jam Rusak</p>
              </div>
              <div>
                  {renderDateBoxes(report.hariTanggalRusak)}
                  {renderTimeBoxes(report.jamRusak)}
              </div>
          </div>
        </div>

        <div style={{ border: '1px solid black', marginBottom: '0.5rem' }}>
            <p style={{ borderBottom: '1px solid black', textAlign: 'center', backgroundColor: '#f3f4f6', padding: '0.25rem', margin: 0 }}>Catatan Pengawas :</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div style={{ borderRight: '1px solid black', height: '7rem', padding: '0.25rem', verticalAlign: 'top' }}>
                    <p style={{ margin: 0 }}>Baggage Handling & PMS Section Head :</p>
                    <p style={{ fontWeight: 'normal', marginTop: '0.25rem', margin: 0 }}>{report.catatanPengawasBaggage}</p>
                </div>
                <div style={{ height: '7rem', padding: '0.25rem', verticalAlign: 'top' }}>
                    <p style={{ margin: 0 }}>Team Leader / Engineer / Technician :</p>
                    <p style={{ fontWeight: 'normal', marginTop: '0.25rem', margin: 0 }}>{report.catatanPengawasTeknisi}</p>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', textAlign: 'center', borderTop: '1px solid black' }}>
                <div style={{ borderRight: '1px solid black', padding: '0.25rem' }}>
                    <p style={{ margin: 0 }}>Disetujui oleh:</p><p style={{ margin: 0 }}>MECHANICAL SERVICES</p><p style={{ margin: 0 }}>DEPARTMENT HEAD</p>
                    <p style={{ marginTop: '3.5rem', margin: 0 }}>( {report.diketahuiOleh || '................'} )</p>
                </div>
                <div style={{ borderRight: '1px solid black', padding: '0.25rem' }}>
                    <p style={{ margin: 0 }}>Diperiksa & disetujui oleh:</p><p style={{ margin: 0 }}>AIRPORT MECHANICAL</p><p style={{ margin: 0 }}>SUPERVISOR/ENGINEER/TECHNICIAN</p>
                    <p style={{ marginTop: '3.5rem', margin: 0 }}>( {report.diperiksaOleh || '................'} )</p>
                </div>
                <div style={{ padding: '0.25rem' }}>
                    <p style={{ margin: 0 }}>Disiapkan oleh:</p><p style={{ margin: 0 }}>SUPERVISOR/KEPALA TEKNISI</p><p style={{ margin: 0 }}>PT. DOVIN PRATAMA</p>
                    <p style={{ marginTop: '3.5rem', margin: 0 }}>( {report.dibuatOleh || '................'} )</p>
                </div>
            </div>
        </div>
      </div>


      {/* ================= PAGE 2: BAP ================= */}
      <div style={pageStyle}>
        <div style={{ border: '1px solid black' }}>
          <div style={{ textAlign: 'center', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '16px', textDecoration: 'underline', paddingTop: '1rem', margin: 0 }}>Berita Acara Pemasangan (BAP)</h1>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem', padding: '1rem' }}>
            <div style={{ gridColumn: 'span 2 / span 2', display: 'flex' }}>
              <div style={{ marginRight: '0.5rem' }}>
                <p style={{ margin: 0 }}>Pekerjaan</p><p style={{ margin: 0 }}>Lokasi</p><p style={{ margin: 0 }}>Fasilitas</p><p style={{ margin: 0 }}>Pelaksana Pekerjaan</p><p style={{ margin: 0 }}>Hari/Tanggal Laporan</p>
              </div>
              <div>
                <p style={{ margin: 0 }}>: {report.pekerjaan}</p><p style={{ margin: 0 }}>: {report.lokasi}</p><p style={{ margin: 0 }}>: {report.fasilitas}</p><p style={{ margin: 0 }}>: {report.pelaksana}</p><p style={{ margin: 0 }}>: {formatDate(report.hariTanggalLaporan)}</p>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ textAlign: 'center', padding: '0.75rem', border: '1px solid black', margin: 0 }}>DOC.BLP/MS<br/>DR.LBY.00</p>
            </div>
          </div>
          
          <table style={{ width: '100%', borderTop: '1px solid black', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#e5e7eb' }}>
              <tr>
                <th style={{ border: '1px solid black', padding: '0.25rem', width: '2rem' }}>No.</th>
                <th style={{ border: '1px solid black', padding: '0.25rem' }}>Penyebab Kerusakan</th>
                <th style={{ border: '1px solid black', padding: '0.25rem' }}>Spare Part / Tindak Lanjut</th>
                <th style={{ border: '1px solid black', padding: '0.25rem' }}>Rekomendasi / Peralatan</th>
                <th style={{ border: '1px solid black', padding: '0.25rem' }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', textAlign: 'center', height: '7rem', verticalAlign: 'top', padding: '0.25rem' }}>1</td>
                <td style={{ border: '1px solid black', verticalAlign: 'top', padding: '0.25rem' }}>{report.bapPenyebabKerusakan}</td>
                <td style={{ border: '1px solid black', verticalAlign: 'top', padding: '0.25rem' }}>{report.bapSparePart}</td>
                <td style={{ border: '1px solid black', verticalAlign: 'top', padding: '0.25rem' }}>{report.bapRekomendasi}</td>
                <td style={{ border: '1px solid black', verticalAlign: 'top', padding: '0.25rem' }}>{report.bapKeterangan}</td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', borderTop: '1px solid black' }}>
            <div style={{ textTransform: 'uppercase', padding: '0.5rem', display: 'flex', columnGap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', rowGap: '0.5rem' }}>
                <p style={{ margin: 0 }}>Hari/Tanggal</p><p style={{ margin: 0 }}>Jam selesai</p><p style={{ margin: 0 }}>Kode Hambatan</p><p style={{ margin: 0 }}>Jumlah waktu Terputus</p>
              </div>
              <div>
                {renderDateBoxes(report.hariTanggalSelesai)}
                {renderTimeBoxes(report.jamSelesai)}
                <div style={{ display: 'flex', marginTop: '0.25rem' }}>
                  <p style={{ padding: '0.25rem 0.5rem', border: '1px solid black', margin: 0 }}>{report.kodeHambatan?.[0] || ' '}</p>
                  <p style={{ padding: '0.25rem 0.5rem', border: '1px solid black', margin: 0 }}>{report.kodeHambatan?.[1] || ' '}</p>
                </div>
                {renderWaktuTerputus(report.waktuTerputus)}
              </div>
            </div>
            <div>
              <p style={{ fontWeight: '600', margin: 0 }}>Kode Hambatan :</p>
              <div style={{ display: 'flex', columnGap: '1rem' }}>
                <div>
                  {Object.entries(kodeHambatanDesc).slice(0, 4).map(([key, value]) => <p style={{ margin: 0 }} key={key}>{key} : {value}</p>)}
                </div>
                 <div>
                  {Object.entries(kodeHambatanDesc).slice(4).map(([key, value]) => <p style={{ margin: 0 }} key={key}>{key} : {value}</p>)}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem', border: '1px solid black', borderBottom: '0', padding: '0.5rem' }}>
            <p style={{ fontWeight: '600', margin: 0 }}>Catatan Pengawas Lapangan</p>
            <div style={{ height: '7rem' }}>
                <p style={{ margin: 0 }}>(Team Leader / Engineer / Technician)</p>
                <p style={{ fontWeight: 'normal', marginTop: '0.25rem', margin: 0 }}>{report.catatanPengawasTeknisi}</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', textAlign: 'center', border: '1px solid black', borderTop: '0' }}>
            <div style={{ borderRight: '1px solid black', padding: '0.25rem' }}>
              <p style={{ margin: 0 }}>Disetujui oleh:</p><p style={{ margin: 0 }}>MECHANICAL SERVICES</p><p style={{ margin: 0 }}>DEPARTMENT HEAD</p>
              <p style={{ marginTop: '3.5rem', margin: 0 }}>( {report.diketahuiOleh || '................'} )</p>
            </div>
            <div style={{ borderRight: '1px solid black', padding: '0.25rem' }}>
              <p style={{ margin: 0 }}>Diperiksa & disetujui oleh:</p><p style={{ margin: 0 }}>AIRPORT MECHANICAL</p><p style={{ margin: 0 }}>SUPERVISOR/ENGINEER/TECHNICIAN</p>
              <p style={{ marginTop: '3.5rem', margin: 0 }}>( {report.diperiksaOleh || '................'} )</p>
            </div>
            <div style={{ padding: '0.25rem' }}>
              <p style={{ margin: 0 }}>Disiapkan oleh:</p><p style={{ margin: 0 }}>SUPERVISOR/KEPALA TEKNISI</p><p style={{ margin: 0 }}>PT. DOVIN PRATAMA</p>
              <p style={{ marginTop: '3.5rem', margin: 0 }}>( {report.dibuatOleh || '................'} )</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
