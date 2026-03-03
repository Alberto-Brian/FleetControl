// ========================================
// FILE: src/helpers/ipc/db/company/company-listeners.ts
// ========================================
import { ipcMain } from 'electron';
import {
  COMPANY_GET,
  COMPANY_UPDATE,
  COMPANY_IS_CONFIGURED,
  COMPANY_UPLOAD_LOGO,
  COMPANY_REMOVE_LOGO,
  COMPANY_GET_LOGO_B64,
} from './company-channels';
import {
  getCompanySettings,
  updateCompanySettings,
  updateCompanyLogo,
  removeCompanyLogo,
  isCompanyConfigured,
} from '@/lib/db/queries/company.queries';
import {
  saveLogo,
  readLogoAsBase64,
  removeLogoFile,
  readLogoFromDisk,
} from '@/lib/utils/company';
import { IUpdateCompanySettings } from '@/lib/types/company';

// ─────────────────────────────────────────────
// Helper interno: enriquece settings com logo_base64
// ─────────────────────────────────────────────
async function withLogo(settings: any) {
  if (!settings) return null;
  const logo_base64 = settings.logo
    ? await readLogoAsBase64(settings.logo)
    : await readLogoFromDisk(); // fallback: disco sem path no DB
  return { ...settings, logo_base64 };
}

// ─────────────────────────────────────────────
// Registo dos listeners
// ─────────────────────────────────────────────
export function addCompanyEventListeners() {

  // ── GET ──────────────────────────────────────────────────────────────────
  ipcMain.handle(COMPANY_GET, async () => {
    const settings = await getCompanySettings();
    return withLogo(settings);
  });

  // ── IS CONFIGURED ─────────────────────────────────────────────────────────
  ipcMain.handle(COMPANY_IS_CONFIGURED, async () => {
    return isCompanyConfigured();
  });

  // ── UPDATE ────────────────────────────────────────────────────────────────
  ipcMain.handle(COMPANY_UPDATE, async (_, data: IUpdateCompanySettings) => {
    if (data.company_name !== undefined && !String(data.company_name).trim()) {
      throw new Error('O nome da empresa é obrigatório.');
    }
    const updated = await updateCompanySettings(data);
    return withLogo(updated);
  });

  // ── UPLOAD LOGO ───────────────────────────────────────────────────────────
  // Recebe string base64 (data URI) do renderer
  // Guarda no disco → actualiza path no DB → retorna settings + info do logo
  ipcMain.handle(COMPANY_UPLOAD_LOGO, async (_, base64Data: string) => {
    if (!base64Data) throw new Error('Nenhum logo recebido.');

    // 1. Guardar no disco (userData/company/logo.xxx)
    const result = await saveLogo(base64Data);

    // 2. Persistir o caminho no DB
    const updated = await updateCompanyLogo(result.path);

    return {
      settings: { ...updated, logo_base64: result.base64 },
      logo: {
        path:      result.path,
        base64:    result.base64,
        mimeType:  result.mimeType,
        sizeBytes: result.sizeBytes,
      },
    };
  });

  // ── REMOVE LOGO ───────────────────────────────────────────────────────────
  ipcMain.handle(COMPANY_REMOVE_LOGO, async () => {
    // 1. Apagar ficheiro do disco
    await removeLogoFile();
    // 2. Limpar path no DB
    const updated = await removeCompanyLogo();
    return { ...updated, logo_base64: null };
  });

  // ── GET LOGO BASE64 ───────────────────────────────────────────────────────
  // Chamado pelo PDF generator (processo renderer) antes de gerar o PDF
  ipcMain.handle(COMPANY_GET_LOGO_B64, async () => {
    const settings = await getCompanySettings();
    if (settings?.logo) return readLogoAsBase64(settings.logo);
    return readLogoFromDisk(); // fallback
  });
}