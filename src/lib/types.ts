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
  url: string; 
}

export interface User {
  id: string;
  name: string;
  role: string; // Storing role name as string
  placeOfBirth: string;
  dateOfBirth: string; // ISO string format
  address: string;
  documents: UserDocument[];
}
