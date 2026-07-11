// src/components/tracking/AlertPanel.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, X } from 'lucide-react';
import { Button }     from '@/components/ui/button';
import { useTracking } from '@/contexts/TrackingContext';
import { AlertItem }  from './AlertItem';

interface Props {
  onClose: () => void;
}

export function AlertPanel({ onClose }: Props) {
  const { t }               = useTranslation('tracking');
  const { state, dispatch } = useTracking();
  const [loading, setLoading] = useState(false);

  async function handleAcknowledge(id: string) {
    try {
      await (window as any)._tracking.acknowledgeAlert(id);
      dispatch({ type: 'ALERT_ACKNOWLEDGED', payload: id });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAcknowledgeAll() {
    setLoading(true);
    try {
      await (window as any)._tracking.acknowledgeAllAlerts();
      state.alerts.forEach(a => dispatch({ type: 'ALERT_ACKNOWLEDGED', payload: a.id }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold flex-1">{t('alerts.panelTitle')}</span>
        {state.unreadAlerts > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleAcknowledgeAll} disabled={loading}>
            <CheckCheck className="w-3.5 h-3.5" /> {t('alerts.readAll')}
          </Button>
        )}
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.alerts.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('alerts.empty')}</p>
          </div>
        ) : (
          state.alerts.map(a => (
            <AlertItem key={a.id} alert={a} onAcknowledge={handleAcknowledge} />
          ))
        )}
      </div>
    </div>
  );
}
