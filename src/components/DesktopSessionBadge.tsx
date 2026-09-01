// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/components/DesktopSessionBadge.tsx
// ========================================
//
// Fase 11B.11 — banner honesto sobre o estado online/offline x sessão.
// "O Desktop não deve apresentar ao utilizador a ideia de que uma Role ou
// Scope foi validada localmente quando na realidade apenas existe um cache
// de sessão" — este componente é o único sítio da app que comunica
// explicitamente "estás a trabalhar com dados/sessão em cache, não
// verificados ao vivo". Não renderiza nada quando a sessão está mesmo
// ao vivo (online-valid/online-expired — este último é transitório,
// auto-corrigido pelo refresh agendado em segundos).

import React from 'react';
import { useTranslation } from 'react-i18next';
import { CloudOff, WifiOff, LogIn, type LucideIcon } from 'lucide-react';
import { useDesktopSessionState } from '@/hooks/useDesktopSessionState';
import type { DesktopSessionState } from '@/helpers/license-helpers';
import { cn } from '@/lib/utils';

interface BadgeConfig {
  icon: LucideIcon;
  tone: 'warning' | 'danger';
  titleKey: string;
  descriptionKey: string;
}

const CONFIG_BY_STATE: Partial<Record<DesktopSessionState, BadgeConfig>> = {
  'offline-cache-valid': {
    icon: WifiOff,
    tone: 'warning',
    titleKey: 'auth:session.badge.offlineCacheValidTitle',
    descriptionKey: 'auth:session.badge.offlineCacheValidDescription',
  },
  'offline-cache-expired': {
    icon: CloudOff,
    tone: 'danger',
    titleKey: 'auth:session.badge.offlineCacheExpiredTitle',
    descriptionKey: 'auth:session.badge.offlineCacheExpiredDescription',
  },
  'offline-no-cache': {
    icon: CloudOff,
    tone: 'danger',
    titleKey: 'auth:session.badge.noSessionOfflineTitle',
    descriptionKey: 'auth:session.badge.noSessionOfflineDescription',
  },
  'no-session': {
    icon: LogIn,
    tone: 'warning',
    titleKey: 'auth:session.badge.noSessionOnlineTitle',
    descriptionKey: 'auth:session.badge.noSessionOnlineDescription',
  },
};

export function DesktopSessionBadge() {
  const { t } = useTranslation();
  const { state } = useDesktopSessionState();

  const config = CONFIG_BY_STATE[state];
  if (!config) return null;

  const Icon = config.icon;
  const isDanger = config.tone === 'danger';

  return (
    <div
      className={cn(
        'flex items-start gap-2 px-4 py-2 text-sm border-b',
        isDanger
          ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200'
          : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200',
      )}
      role="status"
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="font-medium leading-tight">{t(config.titleKey)}</p>
        <p className="text-xs opacity-90 leading-snug">{t(config.descriptionKey)}</p>
      </div>
    </div>
  );
}
