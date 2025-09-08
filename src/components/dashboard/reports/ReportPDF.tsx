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
  const boxStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid black' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', columnGap: '0.5rem', marginTop: '0.25rem' }}>
      <div style={{ display: 'flex' }}>
        <div style={boxStyle}>{time[0] || ' '}</div>
        <div style={boxStyle}>{time[1] || ' '}</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={boxStyle}>{time[2] || ' '}</div>
        <div style={boxStyle}>{time[3] || ' '}</div>
      </div>
      <div>WITA</div>
    </div>
  );
};

const renderDateBoxes = (dateString?: string) => {
  const boxStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid black' };
  const dayNameStyle: React.CSSProperties = { ...boxStyle, textTransform: 'uppercase', paddingLeft: '1rem', paddingRight: '1rem', textAlign: 'center' };

  if (!dateString) {
    return (
      <div style={{ display: 'flex', columnGap: '0.5rem', marginTop: '0.5rem' }}>
        <div style={{ ...dayNameStyle, width: '60px' }}>&nbsp;</div>
        <div style={{ display: 'flex' }}><div style={boxStyle}>&nbsp;</div><div style={boxStyle}>&nbsp;</div></div>
        <div style={{ display: 'flex' }}><div style={boxStyle}>&nbsp;</div><div style={boxStyle}>&nbsp;</div></div>
        <div style={{ display: 'flex' }}><div style={boxStyle}>&nbsp;</div><div style={boxStyle}>&nbsp;</div><div style={boxStyle}>&nbsp;</div><div style={boxStyle}>&nbsp;</div></div>
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
        <div style={dayNameStyle}>{dayName}</div>
        <div style={{ display: 'flex' }}><div style={boxStyle}>{day[0]}</div><div style={boxStyle}>{day[1]}</div></div>
        <div style={{ display: 'flex' }}><div style={boxStyle}>{month[0]}</div><div style={boxStyle}>{month[1]}</div></div>
        <div style={{ display: 'flex' }}><div style={boxStyle}>{year[0]}</div><div style={boxStyle}>{year[1]}</div><div style={boxStyle}>{year[2]}</div><div style={boxStyle}>{year[3]}</div></div>
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
  const boxStyle: React.CSSProperties = { padding: '0.25rem', width: '5rem', border: '1px solid black', textAlign: 'center' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', columnGap: '0.25rem', marginTop: '0.25rem' }}>
      <div style={boxStyle}>{jam}</div>
      <div>JAM</div>
      <div style={boxStyle}>{menit}</div>
      <div>MENIT</div>
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
              <div style={{ textTransform: 'uppercase' }}>Laporan Kerusakan</div>
              <div>(Damage Report / DR)</div>
            </div>
            <Image src="/logo_dovin.png" alt="PT Dovin Pratama" width={160} height={53} style={{ height: 'auto', width: '160px' }} />
          </div>

          {/* Info Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem', padding: '1rem' }}>
            <div style={{ gridColumn: 'span 2 / span 2', display: 'flex' }}>
              <div style={{ marginRight: '0.5rem' }}>
                <div>Pekerjaan</div><div>Lokasi</div><div>Fasilitas</div><div>Pelaksana Pekerjaan</div><div>Hari/Tanggal Laporan</div>
              </div>
              <div>
                <div>: {report.pekerjaan}</div><div>: {report.lokasi}</div><div>: {report.fasilitas}</div><div>: {report.pelaksana}</div><div>: {formatDate(report.hariTanggalLaporan)}</div>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: '0.75rem', border: '1px solid black' }}>DOC.BLP/MS<br/>DR.LBY.00</div>
            </div>
          </div>
          
          {/* Tabel DR */}
          <table style={{ width: '100%', borderTop: '1px solid black', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#e5e7eb' }}>
              <tr>
                <th style={{ border: '1px solid black', padding: '0.25rem', width: '2rem', textAlign: 'center' }}>No.</th>
                <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center' }}>Lokasi</th>
                <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center' }}>Uraian Kerusakan</th>
                <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center' }}>Tindak Lanjut / Perbaikan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', textAlign: 'center', height: '7rem', padding: '0.25rem', verticalAlign: 'top' }}>1</td>
                <td style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', verticalAlign: 'top' }}>{report.lokasi}</td>
                <td style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', verticalAlign: 'top' }}>{report.drUraianKerusakan}</td>
                <td style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', verticalAlign: 'top' }}>{report.drTindakLanjut}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <div style={{ gridColumn: 'span 1' }}></div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', padding: '0.5rem' }}>
              <div style={{textTransform: 'uppercase', marginRight: '1rem', textAlign: 'right'}}>
                  <div>Hari/Tanggal Rusak</div>
                  <div style={{marginTop: '0.25rem' }}>Jam Rusak</div>
              </div>
              <div>
                  {renderDateBoxes(report.hariTanggalRusak)}
                  {renderTimeBoxes(report.jamRusak)}
              </div>
          </div>
        </div>

        <div style={{ border: '1px solid black', marginBottom: '0.5rem' }}>
            <div style={{ borderBottom: '1px solid black', textAlign: 'center', backgroundColor: '#f3f4f6', padding: '0.25rem' }}>Catatan Pengawas :</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div style={{ borderRight: '1px solid black', height: '7rem', padding: '0.25rem', verticalAlign: 'top' }}>
                    <div>Baggage Handling & PMS Section Head :</div>
                    <div style={{ fontWeight: 'normal', marginTop: '0.25rem' }}>{report.catatanPengawasBaggage}</div>
                </div>
                <div style={{ height: '7rem', padding: '0.25rem', verticalAlign: 'top' }}>
                    <div>Team Leader / Engineer / Technician :</div>
                    <div style={{ fontWeight: 'normal', marginTop: '0.25rem' }}>{report.catatanPengawasTeknisi}</div>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', textAlign: 'center', borderTop: '1px solid black' }}>
                <div style={{ borderRight: '1px solid black', padding: '0.25rem' }}>
                    <div>Disetujui oleh:</div><div>MECHANICAL SERVICES</div><div>DEPARTMENT HEAD</div>
                    <div style={{ marginTop: '3.5rem' }}>( {report.diketahuiOleh || '................'} )</div>
                </div>
                <div style={{ borderRight: '1px solid black', padding: '0.25rem' }}>
                    <div>Diperiksa & disetujui oleh:</div><div>AIRPORT MECHANICAL</div><div>SUPERVISOR/ENGINEER/TECHNICIAN</div>
                    <div style={{ marginTop: '3.5rem' }}>( {report.diperiksaOleh || '................'} )</div>
                </div>
                <div style={{ padding: '0.25rem' }}>
                    <div>Disiapkan oleh:</div><div>SUPERVISOR/KEPALA TEKNISI</div><div>PT. DOVIN PRATAMA</div>
                    <div style={{ marginTop: '3.5rem' }}>( {report.dibuatOleh || '................'} )</div>
                </div>
            </div>
        </div>
      </div>


      {/* ================= PAGE 2: BAP ================= */}
      <div style={pageStyle}>
        <div>
          <div style={{ textAlign: 'center', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '16px', textDecoration: 'underline', paddingTop: '1rem' }}>Berita Acara Pemasangan (BAP)</h1>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem', padding: '1rem' }}>
            <div style={{ gridColumn: 'span 2 / span 2', display: 'flex' }}>
              <div style={{ marginRight: '0.5rem' }}>
                <div>Pekerjaan</div><div>Lokasi</div><div>Fasilitas</div><div>Pelaksana Pekerjaan</div><div>Hari/Tanggal Laporan</div>
              </div>
              <div>
                <div>: {report.pekerjaan}</div><div>: {report.lokasi}</div><div>: {report.fasilitas}</div><div>: {report.pelaksana}</div><div>: {formatDate(report.hariTanggalLaporan)}</div>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: '0.75rem', border: '1px solid black' }}>DOC.BLP/MS<br/>DR.LBY.00</div>
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
                <div>Hari/Tanggal</div><div>Jam selesai</div><div>Kode Hambatan</div><div>Jumlah waktu Terputus</div>
              </div>
              <div>
                {renderDateBoxes(report.hariTanggalSelesai)}
                {renderTimeBoxes(report.jamSelesai)}
                <div style={{ display: 'flex', marginTop: '0.25rem' }}>
                  <div style={{ padding: '0.25rem 0.5rem', border: '1px solid black' }}>{report.kodeHambatan?.[0] || ' '}</div>
                  <div style={{ padding: '0.25rem 0.5rem', border: '1px solid black' }}>{report.kodeHambatan?.[1] || ' '}</div>
                </div>
                {renderWaktuTerputus(report.waktuTerputus)}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>Kode Hambatan :</div>
              <div style={{ display: 'flex', columnGap: '1rem' }}>
                <div>
                  {Object.entries(kodeHambatanDesc).slice(0, 4).map(([key, value]) => <div key={key}>{key} : {value}</div>)}
                </div>
                 <div>
                  {Object.entries(kodeHambatanDesc).slice(4).map(([key, value]) => <div key={key}>{key} : {value}</div>)}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid black', borderLeft: '1px solid black', borderRight: '1px solid black' , padding: '0.5rem' }}>
            <div style={{ fontWeight: '600' }}>Catatan Pengawas Lapangan</div>
            <div style={{ height: '7rem' }}>
                <div>(Team Leader / Engineer / Technician)</div>
                <div style={{ fontWeight: 'normal', marginTop: '0.25rem' }}>{report.catatanPengawasTeknisi}</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', textAlign: 'center', border: '1px solid black', borderTop: '1 solid black', borderLeft: '1px solid black', borderRight: '1px solid black' }}>
            <div style={{ borderRight: '1px solid black', padding: '0.25rem' }}>
              <div>Disetujui oleh:</div><div>MECHANICAL SERVICES</div><div>DEPARTMENT HEAD</div>
              <div style={{ marginTop: '3.5rem' }}>( {report.diketahuiOleh || '................'} )</div>
            </div>
            <div style={{ borderRight: '1px solid black', padding: '0.25rem' }}>
              <div>Diperiksa & disetujui oleh:</div><div>AIRPORT MECHANICAL</div><div>SUPERVISOR/ENGINEER/TECHNICIAN</div>
              <div style={{ marginTop: '3.5rem' }}>( {report.diperiksaOleh || '................'} )</div>
            </div>
            <div style={{ padding: '0.25rem' }}>
              <div>Disiapkan oleh:</div><div>SUPERVISOR/KEPALA TEKNISI</div><div>PT. DOVIN PRATAMA</div>
              <div style={{ marginTop: '3.5rem' }}>( {report.dibuatOleh || '................'} )</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
