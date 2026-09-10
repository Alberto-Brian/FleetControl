// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/lib/relative-time.ts
// ========================================
//
// Pedido do utilizador (2026-09-0X): a lista de "Actividades recentes" do
// Dashboard só mostrava a data (ex. "05 set") — sem noção de "há quanto
// tempo". Para algo que acabou de acontecer (ex. veículo sincronizado há
// segundos), isso é pouco informativo. formatRelativeTime cobre o
// intervalo recente ("agora mesmo", "há Xm", "há Xh") e cai de volta ao
// formato de data absoluta para tudo o resto (>24h) — não faz sentido
// dizer "há 3 dias" quando a pessoa já espera ver uma data de calendário.

export function formatRelativeTime(dateStr: string, locale: 'pt' | 'en' = 'pt'): string {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return locale === 'pt' ? 'agora mesmo' : 'just now';
  if (diffSec < 60) return locale === 'pt' ? `há ${diffSec}s` : `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return locale === 'pt' ? `há ${diffMin}m` : `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return locale === 'pt' ? `há ${diffHours}h` : `${diffHours}h ago`;

  // Além das 24h, uma data de calendário diz mais do que "há X dias".
  return new Date(dateStr).toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-US', {
    day: '2-digit', month: 'short',
  });
}

// Hook para o texto se manter fresco sem precisar de recarregar a página
// ("há 30s" tem de virar "há 1m" sozinho). Re-renderiza o componente que o
// usa a cada `intervalMs` — 15s chega para este caso (a granularidade mais
// fina, segundos, só importa no primeiro minuto).
import { useEffect, useState } from 'react';

export function useRelativeTimeTick(intervalMs = 15_000): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}
