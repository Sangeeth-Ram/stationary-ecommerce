/// <reference types="vite/client" />

declare module '@/lib/utils' {
  export function cn(...inputs: any[]): string;
  export function formatCurrency(amount: number): string;
  // Add other exports from utils as needed
}

declare module '@/contexts/AuthContext' {
  export const AuthContext: React.Context<any>;
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
  export const useAuth: () => any;
}
