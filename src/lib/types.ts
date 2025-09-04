export const ROLES = ['Admin', 'Supervisor', 'Leader Teknisi'] as const;
export type Role = typeof ROLES[number];

export type DocumentType = 'KTP' | 'KK' | 'Ijazah' | 'SKCK';

export interface UserDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  url: string; // In a real app, this would be the download URL from cloud storage
}

export interface User {
  id: string;
  name: string;
  placeOfBirth: string;
  dateOfBirth: string; // ISO string format
  address: string;
  documents: UserDocument[];
}
