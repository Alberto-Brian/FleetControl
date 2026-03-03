// ========================================
// FILE: src/helpers/company-helpers.ts
// ========================================
import {
  ICompanySettings,
  IUpdateCompanySettings,
  IUploadLogoResponse,
} from '@/lib/types/company';

// ─────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────

export async function getCompanySettings(): Promise<ICompanySettings | null> {
  return window._company.get();
}

export async function isCompanyConfigured(): Promise<boolean> {
  return window._company.isConfigured();
}

export async function updateCompanySettings(
  data: IUpdateCompanySettings
): Promise<ICompanySettings> {
  return window._company.update(data);
}

// ─────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────

/**
 * Recebe um File do <input type="file">, valida, converte para base64
 * e envia para o processo main guardar em disco.
 */
export async function uploadCompanyLogo(file: File): Promise<IUploadLogoResponse> {
  const MAX_MB   = 2;
  const ALLOWED  = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`O logo não pode exceder ${MAX_MB} MB.`);
  }
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Formato não suportado. Use PNG, JPG, WEBP ou SVG.');
  }

  const base64 = await fileToBase64(file);
  return window._company.uploadLogo(base64);
}

export async function removeCompanyLogo(): Promise<ICompanySettings | null> {
  return window._company.removeLogo();
}

/**
 * Obtém o logo como base64 para injectar nos PDFs.
 * Chama o processo main que lê do disco.
 */
export async function getCompanyLogoBase64(): Promise<string | null> {
  return window._company.getLogoBase64();
}

// ─────────────────────────────────────────────
// Internal
// ─────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader   = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Falha ao ler o ficheiro.'));
    reader.readAsDataURL(file);
  });
}