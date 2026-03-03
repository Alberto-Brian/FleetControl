// ========================================
// FILE: src/lib/utils/company.ts
// ========================================
// Corre APENAS no processo MAIN do Electron.
// Guarda o logo em: userData/company/logo.<ext>
// ========================================
import { app } from 'electron';
import * as fs   from 'fs';
import * as path from 'path';
import { IUploadLogoResult } from '@/lib/types/company';

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const LOGO_DIR      = 'company';
const LOGO_FILENAME = 'logo'; // extensão adicionada dinamicamente
const MAX_BYTES     = 2 * 1024 * 1024; // 2 MB

/** Extensões suportadas e seus mime types */
const MIME_TO_EXT: Record<string, string> = {
  'image/png':     '.png',
  'image/jpeg':    '.jpg',
  'image/jpg':     '.jpg',
  'image/webp':    '.webp',
  'image/svg+xml': '.svg',
};

const EXT_TO_MIME: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
};

// ─────────────────────────────────────────────
// Helpers privados
// ─────────────────────────────────────────────

function getLogoDir(): string {
  const dir = path.join(app.getPath('userData'), LOGO_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Detecta mime pelo header da string base64 (data URI) */
function mimeFromDataUri(data: string): string {
  const match = data.match(/^data:(image\/[^;]+);base64,/);
  return match?.[1] ?? '';
}

/** Detecta mime pelos magic bytes do buffer (fallback) */
function mimeFromBuffer(buf: Buffer): string {
  const hex = buf.subarray(0, 4).toString('hex');
  if (hex.startsWith('89504e47'))  return 'image/png';
  if (hex.startsWith('ffd8ff'))    return 'image/jpeg';
  // SVG — verifica início do texto
  const txt = buf.toString('utf8', 0, 60);
  if (txt.trimStart().startsWith('<svg') || txt.includes('<svg')) return 'image/svg+xml';
  // WEBP — RIFF....WEBP
  if (buf.length > 12 && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return 'image/png'; // fallback seguro
}

// ─────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────

/**
 * Guarda o logo a partir de uma string base64 (data URI ou base64 puro).
 * Remove automaticamente qualquer logo anterior.
 */
export async function saveLogo(base64Data: string): Promise<IUploadLogoResult> {
  // Separar header e dados
  let mimeType  = mimeFromDataUri(base64Data);
  const cleanB64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const buffer   = Buffer.from(cleanB64, 'base64');

  // Validar tamanho
  if (buffer.byteLength > MAX_BYTES) {
    const mb = (buffer.byteLength / 1024 / 1024).toFixed(1);
    throw new Error(`Logo demasiado grande: ${mb} MB. Máximo permitido: 2 MB.`);
  }

  // Detectar mime se não veio no header
  if (!mimeType || !MIME_TO_EXT[mimeType]) {
    mimeType = mimeFromBuffer(buffer);
  }

  const ext = MIME_TO_EXT[mimeType];
  if (!ext) throw new Error(`Formato não suportado: ${mimeType}. Use PNG, JPG, WEBP ou SVG.`);

  const logoDir  = getLogoDir();
  const logoPath = path.join(logoDir, `${LOGO_FILENAME}${ext}`);

  // Remover logo anterior (qualquer extensão)
  await removeLogoFile();

  // Guardar
  fs.writeFileSync(logoPath, buffer);

  return {
    path:      logoPath,
    base64:    `data:${mimeType};base64,${cleanB64}`,
    mimeType,
    sizeBytes: buffer.byteLength,
  };
}

/**
 * Lê o logo do disco e retorna como data URI base64.
 * Retorna null se o ficheiro não existir.
 */
export async function readLogoAsBase64(logoPath: string): Promise<string | null> {
  if (!logoPath || !fs.existsSync(logoPath)) return null;
  try {
    const buffer = fs.readFileSync(logoPath);
    const ext    = path.extname(logoPath).toLowerCase();
    const mime   = EXT_TO_MIME[ext] ?? 'image/png';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

/**
 * Remove o ficheiro do logo do disco (todas as extensões possíveis).
 */
export async function removeLogoFile(): Promise<void> {
  const dir  = getLogoDir();
  const exts = [...new Set(Object.values(MIME_TO_EXT))];
  for (const ext of exts) {
    const f = path.join(dir, `${LOGO_FILENAME}${ext}`);
    if (fs.existsSync(f)) {
      try { fs.unlinkSync(f); } catch (e) {
        console.warn(`[LogoManager] Não foi possível remover: ${f}`, e);
      }
    }
  }
}

/**
 * Procura o logo no disco e retorna o caminho absoluto, ou null se não existir.
 */
export function getLogoPath(): string | null {
  const dir  = getLogoDir();
  const exts = [...new Set(Object.values(MIME_TO_EXT))];
  for (const ext of exts) {
    const f = path.join(dir, `${LOGO_FILENAME}${ext}`);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

/**
 * Lê o logo directamente do disco (sem necessitar do path do DB).
 * Útil como fallback no PDF generator.
 */
export async function readLogoFromDisk(): Promise<string | null> {
  const logoPath = getLogoPath();
  if (!logoPath) return null;
  return readLogoAsBase64(logoPath);
}