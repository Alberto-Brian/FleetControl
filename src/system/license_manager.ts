// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/system/license_manager.ts
// ========================================
// ========================================
// FILE: src/system/license_manager.ts
// ========================================
import { app } from 'electron';
import * as crypto from 'crypto';
import * as fs     from 'fs';
import * as path   from 'path';

export type LicenseMode = 'standalone' | 'connected';

export interface ValidatedLicense {
  isValid:        boolean;
  mode?:          LicenseMode;
  clientName?:    string;
  clientEmail?:   string;
  clientNIF?:     string;
  expiryDate?:    Date;
  daysRemaining?: number;
  maxUsers?:      number;
  features?:      string[];
  licenseType?:   string;
  error?:         string;
}

export interface UserData {
  clientName:     string;
  clientEmail:    string;
  clientNIF:      string;
  maxUsers:       number;
  features:       string[];
  licenseType:    string;
  mode:           LicenseMode;
  activatedAt:    string;
  lastValidation: string;
}

export class LicenseManager {
  private readonly LICENSE_FILE = path.join(app.getPath('userData'), 'license.dat');
  private readonly USER_FILE    = path.join(app.getPath('userData'), 'user.json');

  private getPublicKeyPath(): string {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      return path.join('src/renderer/public/keys/publickey_v1.pem');
    }
    return path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/keys/publickey_v1.pem`);
  }

  private fromBase64URL(s: string): string {
    let b = s.replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    return b;
  }

  async validateLicense(licenseKey: string): Promise<ValidatedLicense> {
    try {
      const clean = licenseKey.trim().replace(/\s/g, '');

      // Rejeita imediatamente chaves no formato display (LK-/ST-)
      // O renderer trata este caso antes de chamar IPC,
      // mas defendemos aqui também por segurança
      if (/^(LK|ST)-[A-F0-9]{5}(-[A-F0-9]{5}){4}$/i.test(clean)) {
        return {
          isValid: false,
          error:   'Chave de referência — usa o conteúdo da linha FULL: do ficheiro de licença',
        };
      }

      const [payloadB64, sigB64] = clean.split('.');
      if (!payloadB64 || !sigB64) {
        return { isValid: false, error: 'Formato inválido' };
      }

      const publicKey = fs.readFileSync(this.getPublicKeyPath(), 'utf8');
      const verify    = crypto.createVerify('SHA256');
      verify.update(payloadB64);
      if (!verify.verify(publicKey, this.fromBase64URL(sigB64), 'base64')) {
        return { isValid: false, error: 'Licença inválida ou adulterada' };
      }

      const raw = JSON.parse(
        Buffer.from(this.fromBase64URL(payloadB64), 'base64').toString('utf8'),
      );

      const expiryDate    = new Date(raw.exp);
      if (expiryDate < new Date()) {
        return {
          isValid:    false,
          error:      'Licença expirada em ' + expiryDate.toLocaleDateString('pt-AO'),
          expiryDate,
        };
      }

      const features      = (raw.ft as string).split(',').filter(Boolean);
      const mode: LicenseMode = raw.md === 'standalone' ? 'standalone' : 'connected';
      const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / 86_400_000);

      this.saveLicense(licenseKey);
      this.saveUserData({
        clientName:     raw.cn,
        clientEmail:    raw.ce,
        clientNIF:      raw.nif,
        maxUsers:       raw.mu,
        features,
        licenseType:    raw.lt,
        mode,
        activatedAt:    new Date().toISOString(),
        lastValidation: new Date().toISOString(),
      });

      return {
        isValid:      true,
        mode,
        clientName:   raw.cn,
        clientEmail:  raw.ce,
        clientNIF:    raw.nif,
        expiryDate,
        daysRemaining,
        maxUsers:     raw.mu,
        features,
        licenseType:  raw.lt,
      };

    } catch (e) {
      return { isValid: false, error: 'Erro: ' + (e as Error).message };
    }
  }

  async checkExistingLicense(): Promise<ValidatedLicense> {
    const stored = this.getStoredLicense();
    if (!stored) return { isValid: false, error: 'Nenhuma licença encontrada' };

    const userData = this.getUserData();
    if (userData) {
      userData.lastValidation = new Date().toISOString();
      this.saveUserData(userData);
    }
    return this.validateLicense(stored.key);
  }

  getSavedMode(): LicenseMode | null {
    return this.getUserData()?.mode ?? null;
  }

  getUserData(): UserData | null {
    if (!fs.existsSync(this.USER_FILE)) return null;
    try { return JSON.parse(fs.readFileSync(this.USER_FILE, 'utf8')); }
    catch { return null; }
  }

  private saveUserData(data: UserData): void {
    fs.mkdirSync(path.dirname(this.USER_FILE), { recursive: true });
    fs.writeFileSync(this.USER_FILE, JSON.stringify(data, null, 2));
  }

  private saveLicense(key: string): void {
    fs.mkdirSync(path.dirname(this.LICENSE_FILE), { recursive: true });
    fs.writeFileSync(this.LICENSE_FILE, JSON.stringify({
      key,
      activatedAt: new Date().toISOString(),
    }));
  }

  private getStoredLicense(): { key: string } | null {
    if (!fs.existsSync(this.LICENSE_FILE)) return null;
    try { return JSON.parse(fs.readFileSync(this.LICENSE_FILE, 'utf8')); }
    catch { return null; }
  }

  removeLicense(): void {
    [this.LICENSE_FILE, this.USER_FILE].forEach(f => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });
  }
}