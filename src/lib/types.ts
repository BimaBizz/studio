export const ROLES = ['Admin', 'Supervisor', 'Leader Teknisi'] as const;
export type Role = typeof ROLES[number];
