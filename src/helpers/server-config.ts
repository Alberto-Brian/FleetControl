// Módulo de configuração do servidor — apenas importado no processo main (Electron)
import { app } from 'electron';
import path    from 'path';
import fs      from 'fs';

interface ServerConfig { apiUrl: string }

const DEFAULT_URL = process.env.API_URL || 'http://localhost:3001';

function configPath(): string {
  return path.join(app.getPath('userData'), 'fleetcontrol-server.json');
}

function read(): ServerConfig {
  try {
    return JSON.parse(fs.readFileSync(configPath(), 'utf-8'));
  } catch {
    return { apiUrl: DEFAULT_URL };
  }
}

export function getApiUrl(): string {
  return read().apiUrl || DEFAULT_URL;
}

export function setApiUrl(url: string): void {
  fs.writeFileSync(configPath(), JSON.stringify({ apiUrl: url }, null, 2), 'utf-8');
}
