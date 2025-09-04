export const ROLES = ['Admin', 'Supervisor', 'Leader Teknisi'] as const;
export type Role = typeof ROLES[number];

export const DOCUMENT_TYPES = ['KTP', 'KK', 'Ijazah', 'SKCK'] as const;
export type DocumentType = typeof DOCUMENT_TYPES[number];

export interface UserDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  url: string; // This will be the download URL from Firebase Storage
}

export interface User {
  id: string;
  name: string;
  role: Role;
  placeOfBirth: string;
  dateOfBirth: string; // ISO string format
  address: string;
  documents: UserDocument[];
}
