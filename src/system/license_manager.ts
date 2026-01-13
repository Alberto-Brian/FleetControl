import { app } from 'electron';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

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
  error?: string;
}

export interface UserData {
  clientName: string;
  clientEmail: string;
  clientNIF: string;
  maxUsers: number;
  features: string[];
  licenseType: string;
  activatedAt: string;
  lastValidation: string;
}

export class LicenseManager {
  private readonly LICENSE_FILE = path.join(app.getPath('userData'), 'license.dat');
  private readonly MACHINE_ID_FILE = path.join(app.getPath('userData'), 'machine.id');
  private readonly USER_FILE = path.join(app.getPath('userData'), 'user.json');

  /**
   * Obtém o caminho correto da chave pública
   */
  private getPublicKeyPath(): string {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      return path.join('src/renderer/public/keys/publickey_v1.pem');
    } else {
      return path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/keys/publickey_v1.pem`);
    }
  }

  /**
   * Valida uma chave de licença
   */
  async validateLicense(licenseKey: string): Promise<ValidatedLicense> {
    try {
      // 1. Limpar espaços e quebras de linha
      const cleanLicense = licenseKey.trim().replace(/\s/g, '');
      
      // 2. Separar payload e assinatura
      const parts = cleanLicense.split('.');
      if (parts.length !== 2) {
        return { isValid: false, error: 'Formato de licença inválido' };
      }

      const [payloadBase64URL, signatureBase64URL] = parts;

      // 3. Converter Base64URL para Base64 padrão
      const payload = this.fromBase64URL(payloadBase64URL);
      const signature = this.fromBase64URL(signatureBase64URL);

      // 4. Verificar assinatura com chave PÚBLICA (RSA)
      const publicKey = this.getPublicKey();
      const verify = crypto.createVerify('SHA256');
      verify.update(payloadBase64URL);
      verify.end();

      const isSignatureValid = verify.verify(publicKey, signature, 'base64');

      if (!isSignatureValid) {
        return { isValid: false, error: 'Licença inválida ou adulterada' };
      }

      // 5. Decodificar payload
      const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
      const licenseData = JSON.parse(decodedPayload);

      // 6. Verificar Machine ID
      const machineId = await this.getMachineId();
      if (licenseData.mid !== machineId) {
        return {
          isValid: false,
          error: 'Licença vinculada a outro computador. Entre em contacto para reactivação.'
        };
      }

      // 7. Verificar expiração
      const expiryDate = new Date(licenseData.exp);
      const now = new Date();
      
      if (expiryDate < now) {
        return { 
          isValid: false, 
          error: 'Licença expirada em ' + expiryDate.toLocaleDateString('pt-AO'),
          expiryDate 
        };
      }

      const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // 8. Salvar licença e dados do usuário
      this.saveLicense(licenseKey, machineId);
      this.saveUserData({
        clientName: licenseData.cn,
        clientEmail: licenseData.ce,
        clientNIF: licenseData.nif,
        maxUsers: licenseData.mu,
        features: licenseData.ft.split(','),
        licenseType: licenseData.lt,
        activatedAt: new Date().toISOString(),
        lastValidation: new Date().toISOString(),
      });

      // 9. Retornar dados validados
      return {
        isValid: true,
        clientName: licenseData.cn,
        clientEmail: licenseData.ce,
        clientNIF: licenseData.nif,
        expiryDate,
        daysRemaining,
        maxUsers: licenseData.mu,
        features: licenseData.ft.split(','),
        licenseType: licenseData.lt,
      };

    } catch (error) {
      console.error('❌ Erro de validação:', error);
      return { 
        isValid: false, 
        error: 'Erro ao validar licença: ' + (error as Error).message 
      };
    }
  }

  /**
   * Converte Base64URL de volta para Base64 padrão
   */
  private fromBase64URL(base64url: string): string {
    let base64 = base64url
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    while (base64.length % 4) {
      base64 += '=';
    }
    
    return base64;
  }

  /**
   * Verifica se existe licença salva e valida
   */
  async checkExistingLicense(): Promise<ValidatedLicense> {
    const storedLicense = this.getStoredLicense();
    if (!storedLicense) {
      return { isValid: false, error: 'Nenhuma licença encontrada' };
    }
    
    // Actualiza lastValidation no user.json
    const userData = this.getUserData();
    if (userData) {
      userData.lastValidation = new Date().toISOString();
      this.saveUserData(userData);
    }
    
    return this.validateLicense(storedLicense.key);
  }

  /**
   * Obtém dados do usuário salvos
   */
  getUserData(): UserData | null {
    if (!fs.existsSync(this.USER_FILE)) {
      return null;
    }
    try {
      return JSON.parse(fs.readFileSync(this.USER_FILE, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Salva dados do usuário
   */
  private saveUserData(userData: UserData): void {
    const dir = path.dirname(this.USER_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.USER_FILE, JSON.stringify(userData, null, 2));
  }

  /**
   * Obtém ou gera Machine ID
   */
  async getMachineId(): Promise<string> {
    if (fs.existsSync(this.MACHINE_ID_FILE)) {
      return fs.readFileSync(this.MACHINE_ID_FILE, 'utf-8');
    }

    const machineId = this.generateMachineId();
    
    const dir = path.dirname(this.MACHINE_ID_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.MACHINE_ID_FILE, machineId);
    
    return machineId;
  }

  /**
   * Remove todos os dados de licença e usuário
   */
  removeLicense(): void {
    if (fs.existsSync(this.LICENSE_FILE)) {
      fs.unlinkSync(this.LICENSE_FILE);
    }
    if (fs.existsSync(this.USER_FILE)) {
      fs.unlinkSync(this.USER_FILE);
    }
  }

  /**
   * Gera Machine ID único baseado em informações do sistema
   */
  generateMachineId(): string {
    const os = require('os');
    const machineInfo = `${os.hostname()}-${os.platform()}-${os.arch()}`;
    return crypto.createHash('sha256').update(machineInfo).digest('hex');
  }

  /**
   * Carrega chave pública
   */
  private getPublicKey(): string {
    const keyPath = this.getPublicKeyPath();
    return fs.readFileSync(keyPath, 'utf8');
  }

  /**
   * Salva licença validada
   */
  private saveLicense(licenseKey: string, machineId: string): void {
    const licenseData = {
      key: licenseKey,
      machineId,
      activatedAt: new Date().toISOString(),
    };
    
    const dir = path.dirname(this.LICENSE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.LICENSE_FILE, JSON.stringify(licenseData));
  }

  /**
   * Obtém licença salva
   */
  private getStoredLicense(): { key: string; machineId: string; activatedAt: string } | null {
    if (!fs.existsSync(this.LICENSE_FILE)) {
      return null;
    }
    try {
      return JSON.parse(fs.readFileSync(this.LICENSE_FILE, 'utf-8'));
    } catch {
      return null;
    }
  }
}