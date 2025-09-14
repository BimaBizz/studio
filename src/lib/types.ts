

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: any; // Firestore Timestamp
}

// This is a dynamic list now, fetched from Firestore.
// export const ROLES = ['Admin', 'Supervisor', 'Leader Teknisi'] as const;
// export type Role = typeof ROLES[number];

export interface Role {
  id: string;
  name: string;
}

export const DOCUMENT_TYPES = ['KTP', 'KK', 'Ijazah', 'SKCK'] as const;
export type DocumentType = typeof DOCUMENT_TYPES[number];

export interface UserDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  url: string; // This will be a relative public URL, e.g., /uploads/xyz.pdf
  storagePath: string; // The full local path on the server for deletion
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Storing role name as string
  placeOfBirth: string;
  dateOfBirth: string; // ISO string format
  address: string;
  documents: UserDocument[];
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
}

export const ATTENDANCE_STATUSES = ['Hadir', 'Izin', 'Sakit', 'Alpa'] as const;
export type AttendanceStatus = typeof ATTENDANCE_STATUSES[number];

export const ATTENDANCE_LOCATIONS = [
    'Sesuai Jadwal', 
    'Troubleshooting', 
    'Standby lobby', 
    'Standby Gate', 
    'Standby Esc Toshiba & Dom', 
    'Stanby JPO'
] as const;
export type AttendanceLocation = typeof ATTENDANCE_LOCATIONS[number];

export interface Attendance {
    id: string;
    userId: string;
    teamId: string;
    date: string; // ISO string date
    status: AttendanceStatus;
    location?: AttendanceLocation;
}

export const SHIFT_TYPES = ['P/S', 'M', 'L', 'N', 'Staff'] as const;
export type Shift = typeof SHIFT_TYPES[number];

export interface Schedule {
  id: string;
  userId: string;
  teamId: string;
  date: string; // ISO string date
  shift: Shift;
}

export interface DriveCategory {
  id: string;
  name: string;
}

export interface DriveFile {
  id: string;
  fileName: string;
  fileType: string;
  url: string; // This will now be a relative public URL, e.g., /uploads/drive/abc.jpg
  storagePath: string; // The full local path on the server for deletion
  createdAt: any; // Firestore Timestamp
  category: string; // Category name
}

export type DriveFileCreate = Omit<DriveFile, 'id' | 'createdAt'>;

export interface SparePart {
  id: string;
  name: string;
  image: string; // base64 data URI
  locationName: string;
  locationImage: string; // base64 data URI
  quantity: number;
  description: string;
  tags?: string[];
  lowStockLimit?: number;
}

export const TASK_STATUSES = ['Todo', 'In Progress', 'Done'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string; // ISO string format
  createdAt: any; // Firestore Timestamp
  createdBy: string; // User ID
}

export interface DamageReportItem {
  id: string;
  lokasi: string;
  uraianKerusakan: string;
  tindakLanjut: string;
}

export interface InstallationReportItem {
  id: string;
  penyebabKerusakan: string;
  sparePart: string;
  rekomendasi: string;
  keterangan: string;
}

export const KODE_HAMBATAN_TYPES = ["AU", "PK", "TT", "SC", "AL", "TH"] as const;
export type KodeHambatan = typeof KODE_HAMBATAN_TYPES[number];

export interface BeritaAcara {
  id: string;
  // Common fields
  pekerjaan: string;
  lokasi: string;
  fasilitas: string;
  pelaksana: string;
  hariTanggalLaporan: string; // Should be stored as ISO string
  
  // Damage Report specific
  drUraianKerusakan: string;
  drTindakLanjut: string;
  hariTanggalRusak?: string;
  jamRusak?: string;
  
  // Installation Report specific
  bapPenyebabKerusakan: string;
  bapSparePart: string;
  bapRekomendasi: string;
  bapKeterangan: string;
  hariTanggalSelesai?: string;
  jamSelesai?: string;
  kodeHambatan?: KodeHambatan;
  waktuTerputus?: {
    jam: number;
    menit: number;
  };

  // Common footer fields
  catatanPengawasBaggage?: string;
  catatanPengawasTeknisi?: string;
  dibuatOleh: string; // nama team leader
  diperiksaOleh: string; // nama
  diketahuiOleh: string; // nama
  
  createdAt: any; // Firestore Timestamp
  createdBy: string; // User ID
}

export interface MaintenanceApproval {
  id: string;
  hariTanggal: string; // ISO string
  lokasi: string[];
  mechOnDuty: string;
  kepalaTeknisi: string;
  createdAt: any; // Firestore Timestamp
  createdBy: string; // User ID
}
