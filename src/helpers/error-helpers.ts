export function getIpcErrorKey(error: unknown, fallbackKey: string): string {
  try {
    const msg = typeof (error as any)?.message === 'string' ? (error as any).message : String(error);
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

function sanitizeKey(raw: string): string {
  let key = raw.replace(/^['"`]|['"`]$/g, '').trim();
  key = key.replace(/[.\s]+$/, '');
  return key;
}
