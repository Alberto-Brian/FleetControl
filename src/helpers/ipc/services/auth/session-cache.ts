// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/ipc/services/auth/session-cache.ts
// ========================================
//
// Fase 11B.9 — cache local da última sessão API autenticada com sucesso,
// para reutilização enquanto o Desktop está offline. Cifrada com o
// Electron safeStorage (DPAPI no Windows / Keychain no macOS / libsecret no
// Linux) — nunca em texto simples. Só o processo principal tem acesso a
// safeStorage; o renderer (license-helpers.ts) só fala com este módulo via
// IPC (ver auth-service-channels.ts/-listeners.ts/-context.ts).
//
// Validade não é decidida aqui — este módulo só guarda/devolve bytes; quem
// os lê (license-helpers.ts) é que decide se o refresh_token cacheado ainda
// está dentro da política de validade definida pelo backend (o seu próprio
// claim `exp`), nunca uma duração inventada no cliente.
import { app, safeStorage } from 'electron';
import fs from 'fs';
import path from 'path';

export interface CachedSession {
  access_token:  string;
  refresh_token: string;
  user: {
    id:    string;
    email: string;
    name:  string;
  };
  cached_at: number; // epoch ms — só informativo, nunca usado para decidir validade
}

function cacheFilePath(): string {
  return path.join(app.getPath('userData'), 'session.cache');
}

export function saveCachedSession(session: CachedSession): void {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn('[SessionCache] safeStorage indisponível neste sistema — sessão não cacheada.');
    return;
  }
  const encrypted = safeStorage.encryptString(JSON.stringify(session));
  fs.writeFileSync(cacheFilePath(), encrypted);
}

export function loadCachedSession(): CachedSession | null {
  try {
    if (!safeStorage.isEncryptionAvailable()) return null;
    const filePath = cacheFilePath();
    if (!fs.existsSync(filePath)) return null;
    const encrypted = fs.readFileSync(filePath);
    const decrypted = safeStorage.decryptString(encrypted);
    return JSON.parse(decrypted) as CachedSession;
  } catch (err) {
    console.warn('[SessionCache] Falha ao ler a sessão cacheada — a tratar como inexistente:', err);
    return null;
  }
}

export function clearCachedSession(): void {
  try {
    const filePath = cacheFilePath();
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn('[SessionCache] Falha ao remover a sessão cacheada:', err);
  }
}
