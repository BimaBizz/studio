
import React from 'react';
import type { MaintenanceApproval } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import Image from 'next/image';

interface MaintenanceApprovalPDFProps {
  report: MaintenanceApproval;
}

export const MaintenanceApprovalPDF: React.FC<MaintenanceApprovalPDFProps> = ({ report }) => {

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), "eeee, dd MMMM yyyy", { locale: IndonesianLocale });
    } catch {
      return dateString;
    }
  };
  
  const bodyStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    backgroundColor: '#ffffff',
    color: '#000000',
  };

  const pageStyle: React.CSSProperties = {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#ffffff',
    padding: '1.5rem',
  };
  
  const pekerjaan = [
    "Maintenance Bulanan Escalator dan Travelator meliputi :",
    "1. Pengecekan getaran dan suara pada lower and upper machine room",
    "2. Pengecekan posisi comb terhadap step (harus sesuai dengan jalurnya/tidak bergeser)",
    "3. Pengecekan kondisi step apakah terjadi getaran atau kerusakan",
    "4. Pengecekan fungsi emergency stop",
    "5. Pengecekan handrail yang berada di bawah step dan handrail (jika ada)",
    "6. Pengecekan kondisi handrail drive chain",
    "7. Pengecekan kondisi handrail apakah aus, sobek, kendor/robek, temperatur permukaan dan jalurnya",
    "8. Pengecekan kondisi skirt pada step saat escalator dioperasikan dan lakukan pelumasan",
    "9. Pengecekan kondisi handrail drive dan jackshaft, lakukan pelumasan rantai dan ketegangannya/tension",
    "10. Pengecekan kondisi rantai drive utama dan pelumasan serta ketegangan/tension. Berikut pelumasan untuk seluruh unit rantai",
    "11. Setel/adjust handrail chain dan jackshaft chain (ketegangannya/tension)",
    "12. Isi ulang pelumas pada pompa reservoir",
  ];

  return (
    <div id="maintenance-approval-pdf-content" style={bodyStyle}>
        <div style={pageStyle}>
            <div style={{ textAlign: 'center' }}>
                <Image src="/logo_injourney.png" alt="Logo InJourney Airports" width={160} height={53} style={{ height: '50px', width: 'auto', verticalAlign: 'middle' }}/>
                <h3 style={{ margin: 0, display: 'inline-block', verticalAlign: 'middle', padding: '0 20px' }}>PERSETUJUAN PEMELIHARAAN<br/>MAINTENANCE APPROVAL (MA)</h3>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <tbody>
                <tr>
                    <td style={{ width: '20%', fontWeight: 'bold' }}>PEKERJAAN</td>
                    <td style={{ width: '45%' }}>: CLEANING BULANAN</td>
                    <td style={{ width: '20%', fontWeight: 'bold' }}>DOC.BH.PMS</td>
                    <td style={{ width: '15%' }}>: MA.REV.00</td>
                </tr>
                <tr>
                    <td style={{ fontWeight: 'bold' }}>LOKASI</td>
                    <td colSpan={3}>: BANDARA INTERNASIONAL I GUSTI NGURAH RAI BALI</td>
                </tr>
                <tr>
                    <td style={{ fontWeight: 'bold' }}>FASILITAS</td>
                    <td colSpan={3}>: AIRPORT MECHANICAL</td>
                </tr>
                <tr>
                    <td style={{ fontWeight: 'bold' }}>PELAKSANA PEKERJAAN</td>
                    <td colSpan={3}>: PT. DOVIN PRATAMA</td>
                </tr>
                <tr>
                    <td style={{ fontWeight: 'bold' }}>HARI/TANGGAL</td>
                    <td colSpan={3}>: {formatDate(report.hariTanggal)}</td>
                </tr>
                </tbody>
            </table>

            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px', border: '1px solid black'}}>
                <thead style={{ backgroundColor: '#e0e0e0', fontWeight: 'bold' }}>
                    <tr>
                        <th style={{border: '1px solid black', padding: '4px', width: '5%'}}>NO.</th>
                        <th style={{border: '1px solid black', padding: '4px', width: '65%', textAlign: 'left'}}>URAIAN PEKERJAAN</th>
                        <th style={{border: '1px solid black', padding: '4px', width: '15%'}}>LOKASI</th>
                        <th style={{border: '1px solid black', padding: '4px', width: '15%'}}>KETERANGAN</th>
                    </tr>
                </thead>
                <tbody>
                    {pekerjaan.map((item, index) => {
                        let lokasiContent = '';
                        if (index === 6) lokasiContent = report.lokasi[0] || '';
                        if (index === 9) lokasiContent = report.lokasi[1] || '';

                        return (
                             <tr key={index}>
                                <td style={{border: '1px solid black', padding: '4px', textAlign: 'center'}}>{index > 0 ? '' : '1'}</td>
                                <td style={{border: '1px solid black', padding: '4px', paddingLeft: index > 0 ? '15px' : '4px' }}>{item}</td>
                                <td style={{border: '1px solid black', padding: '4px', textAlign: 'center'}}>{lokasiContent}</td>
                                <td style={{border: '1px solid black', padding: '4px'}}></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
                CATATAN PENGAWAS / PEMERIKSA HARIAN:
                <br />
                (Team Leader / Engineer / Technician)
            </div>
            <div style={{ height: '50px', border: '1px solid black', marginTop: '4px' }}></div>

            <table style={{ width: '100%', marginTop: '20px' }}>
                <tbody>
                <tr>
                    <td>MULAI JAM: ...................................... WITA</td>
                    <td>SELESAI JAM: ...................................... WITA</td>
                </tr>
                </tbody>
            </table>

            <table style={{ width: '100%', marginTop: '40px', textAlign: 'center' }}>
                <tbody>
                <tr>
                    <td style={{width: '50%'}}>
                        <div>Disetujui:</div>
                        <div style={{fontWeight: 'bold'}}>PGS. Mechanical Services Coordinator / Mech on Duty</div>
                        <div style={{height: '60px'}}></div>
                        <div>(......<strong>{report.mechOnDuty}</strong>......)</div>
                    </td>
                    <td style={{width: '50%'}}>
                        <div>Diajukan:</div>
                        <div style={{fontWeight: 'bold'}}>Supervisor / Kepala Teknisi<br/>PT. DOVIN PRATAMA</div>
                        <div style={{height: '60px'}}></div>
                        <div>(.....<strong>{report.kepalaTeknisi}</strong>.....)</div>
                    </td>
                </tr>
                </tbody>
            </table>

            <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '10px' }}>
                Dokumen Pemeliharaan Airport Mechanical — Bandara Internasional I Gusti Ngurah Rai Bali
            </div>
        </div>
    </div>
  );
};
