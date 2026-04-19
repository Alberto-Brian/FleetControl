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

export type LicenseMode = 'standalone' | 'connected';
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
