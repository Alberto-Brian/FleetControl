export interface LicenseData {
  clientName: string;
  clientEmail: string;
  clientNIF: string;
  machineId: string;
  expiryDate: string; // YYYY-MM-DD
  maxUsers: number;
  features: string[];
  licenseType: 'trial' | 'basic' | 'professional' | 'enterprise';
}

// Modo "standalone" removido (2026-09-05) — só existe licença connected.
// `mode` mantido como metadado (sempre 'connected') por compatibilidade
// com consumidores existentes; deixou de ser uma escolha real.
export type LicenseMode = 'connected';
export interface ValidatedLicense {
  isValid: boolean;
  clientName?: string;
  clientEmail?: string;
  clientNIF?: string;
  expiryDate?: Date;
  daysRemaining?: number;
  maxUsers?: number;
  features?: string[];
  licenseType?: string;
  mode?: LicenseMode;
  error?: string;
}
