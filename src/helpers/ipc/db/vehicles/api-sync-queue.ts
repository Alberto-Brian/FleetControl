// Fila persistente de operações de sync para a API.
// Grava em userData/api-sync-queue.json — sobrevive a reinícios da app.
// O flush é chamado via IPC quando o TrackingContext detecta reconexão
// (reconnectCount), reutilizando a monitorização de conectividade já existente.
import path    from 'path';
import fs      from 'fs';
import { app } from 'electron';
import axios   from 'axios';
import { getApiUrl }         from '@/helpers/server-config';
import { getStoredApiToken } from '@/helpers/ipc/services/auth/token-store';

const MAX_ATTEMPTS = 10;

interface SyncOp {
  id:        string;
  method:    'post' | 'patch';
  path:      string;    // ex: '/api/vehicles/abc/unregister-gps'
  payload:   unknown;
  createdAt: string;
  attempts:  number;
}

function queuePath(): string {
  return path.join(app.getPath('userData'), 'api-sync-queue.json');
}

function load(): SyncOp[] {
  try { return JSON.parse(fs.readFileSync(queuePath(), 'utf-8')); }
  catch { return []; }
}

function save(queue: SyncOp[]): void {
  fs.writeFileSync(queuePath(), JSON.stringify(queue, null, 2), 'utf-8');
}

export function enqueue(method: 'post' | 'patch', opPath: string, payload: unknown): void {
  const queue = load();
  queue.push({
    id: crypto.randomUUID(), method, path: opPath, payload,
    createdAt: new Date().toISOString(), attempts: 0,
  });
  save(queue);
  console.log(`[sync-queue] Enfileirado: ${method.toUpperCase()} ${opPath} (total: ${queue.length})`);
}

// Chamado via IPC quando o renderer detecta reconexão ao servidor.
// Não precisa de scheduler próprio — a reconexão do Socket.io é o trigger.
export async function flushPendingOps(): Promise<void> {
  const queue = load();
  if (queue.length === 0) return;

  const token = getStoredApiToken();
  if (!token) return;

  const baseUrl = getApiUrl();
  const headers = { Authorization: `Bearer ${token}` };
  const remaining: SyncOp[] = [];

  for (const op of queue) {
    try {
      if (op.method === 'post') {
        await axios.post(`${baseUrl}${op.path}`, op.payload, { headers, timeout: 10_000 });
      } else {
        await axios.patch(`${baseUrl}${op.path}`, op.payload, { headers, timeout: 10_000 });
      }
      console.log(`[sync-queue] OK: ${op.method.toUpperCase()} ${op.path}`);
    } catch (err: any) {
      const status = err?.response?.status;
      op.attempts++;

      // 4xx permanentes (não 408/429) nunca vão funcionar — descartar
      const isPermanent = status && status >= 400 && status < 500 && status !== 408 && status !== 429;
      if (isPermanent) {
        console.warn(`[sync-queue] Descartado (${status}): ${op.path}`);
      } else if (op.attempts >= MAX_ATTEMPTS) {
        console.warn(`[sync-queue] Descartado após ${op.attempts} tentativas: ${op.path}`);
      } else {
        remaining.push(op);
      }
    }
  }

  save(remaining);
  const sent = queue.length - remaining.length;
  if (sent > 0) console.log(`[sync-queue] ${sent} operações enviadas, ${remaining.length} pendentes`);
}
