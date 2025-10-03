

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

export interface Trouble {
    id: string;
    unitName: string;
    timeOff: string; // ISO String
    timeOn: string; // ISO String
    description: string;
    durationMinutes: number;
    date: string; // ISO String date only
    createdAt: any; // Firestore Timestamp
    createdBy: string; // User ID
}

export const UNIT_NAMES = [
  "LPPK 01", "LPPK 02", "LP 01", "LP 02", "LP 03", "LP 04", "LP 05", "LP 06", "LP 07", "LP 08", "LP 09", "LP 10", "LP 11", "LP 12", "LP 13", "LP 14", "LP 15",
  "LS 01", "LS 02", "LS 03", "LS 04", "LS 05", "LS 06", "OSL 5",
  "LL 01", "LL 03", "LL 04", "LL 06",
  "LT 01", "LT 02",
  "LM 01",
  "LK 01", "LK 02", "LK 03", "LK 04", "LK 05", "LK 06", "LK 07", "LK 09",
  "ESC 1.1", "ESC 1.2", "ESC 1.3", "ESC 1.6", "ESC 1.7", "ESC 1.8", "ESC 1.9", "ESC 1.10", "ESC 1.11", "ESC 1.12",
  "ESC 2.1", "ESC 2.2", "ESC 2.3", "ESC 2.4", "ESC 2.5", "ESC 2.6", "ESC 2.7", "ESC 2.8", "ESC 2.9", "ESC 2.10", "ESC 2.11", "ESC 2.12", "ESC 2.13", "ESC 2.14", "ESC 2.15", "ESC 2.16", "ESC 2.17",
  "ECD 01", "ECD 02", "ECD 03", "ECD 04", "ECD 05",
  "MW 1.1", "MW 1.2", "MW 1.3",
  "MW 2.1", "MW 2.2", "MW 2.3", "MW 2.4",
  "MW 3.1", "MW 3.2", "MW 3.3", "MW 3.4",
  "MW JPO",
  "IW 01", "IW 02", "IW 03", "IW 04", "IW 05", "IW 06",
  "1.7 D", "1.6 D", "1.5 D", "1.4 D", "1.3 D", "1.2 D", "1.1 D",
  "KORIDOR",
  "3.1 I", "3.2 I", "3.3 I", "3.4 I", "3.5 I",
  "1.8 I", "1.7 I", "1.5 I", "1.4 I", "1.4 IA", "1.4 IB", "1.3 I", "1.2 I", "1.1 I",
  "GEDUNG WIP", "GEDUNG GAT",
  "2.1 I", "2.2 I", "2.3 I", "2.4 I",
  "PINTU SLIDING 1", "PINTU SWING KECIL 1", "PINTU SWING BESAR 2", "PINTU SWING BESAR 3",
  "PINTU SLIDING PK SELATAN", "PINTU SWING POS GLAN M1"
] as const;
export type UnitName = typeof UNIT_NAMES[number];
