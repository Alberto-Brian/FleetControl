// ========================================
// FILE: src/helpers/error-helpers.ts
// ========================================
import { AppError } from '@/lib/errors/AppError';

/**
 * Extrai a chave i18n de um erro IPC
 * Suporta tanto o formato antigo (JSON.stringify) quanto o novo (AppError)
 */
export function getIpcErrorKey(error: unknown, fallbackKey: string): string {
  try {
    const msg = typeof (error as any)?.message === 'string' 
      ? (error as any).message 
      : String(error);

    // Tenta deserializar como AppError primeiro
    const appError = AppError.fromIpcString(msg);
    if (appError) {
      return appError.i18nKey;
    }

    // Fallback: tenta extrair do formato antigo
    const idx = msg.lastIndexOf('Error:');
    if (idx !== -1) {
      const raw = msg.slice(idx + 'Error:'.length).trim();
      return sanitizeKey(raw) || fallbackKey;
    }

    // Regex fallback
    const match = msg.match(/Error:\s*([a-zA-Z0-9._:-]+)/);
    if (match?.[1]) {
      return sanitizeKey(match[1]) || fallbackKey;
    }

    return fallbackKey;
  } catch {
    return fallbackKey;
  }
}

/**
 * Extrai um AppError completo de um erro IPC
 * Retorna null se não for um AppError
 */
export function extractAppError(error: unknown): AppError | null {
  try {
    const msg = typeof (error as any)?.message === 'string' 
      ? (error as any).message 
      : String(error);

    return AppError.fromIpcString(msg);
  } catch {
    return null;
  }
}

/**
 * Remove aspas e espaços de uma chave
 */
function sanitizeKey(raw: string): string {
  let key = raw.replace(/^['"`]|['"`]$/g, '').trim();
  key = key.replace(/[.\s]+$/, '');
  return key;
}