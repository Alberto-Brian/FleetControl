export interface BackupConfig {
  autoBackupEnabled: boolean;
  autoBackupFrequency: 'daily' | 'weekly';
  keepLastN: number;
  lastAutoBackup?: string;
}

export interface BackupMetadata {
  version: string;
  createdAt: string;
  backupType: 'auto' | 'manual';
  databases: {
    filename: string;
    size: number;
    isActive: boolean;
  }[];
  hasUserData: boolean;
  hasLicense: boolean;
  totalSize: number;
  appVersion: string;
}

export interface RestoreValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: BackupMetadata;
}

export interface BackupReturn { 
    success: boolean; 
    path?: string; 
    size?: number;
    error?: string 
}

export interface RestoreBackupReturn { 
    success: boolean; 
    requiresRestart?: boolean;
    needsReactivation?: boolean;
    error?: string 
  }