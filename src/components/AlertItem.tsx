import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'document' | 'maintenance' | 'license';
  title: string;
  vehicle?: string;
  driver?: string;
  severity: 'high' | 'medium' | 'low';
}

interface AlertItemProps {
  alert: Alert;
}

export default function AlertItem({ alert }: AlertItemProps) {
  const severityColors = {
    high: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
    medium: 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20',
    low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
  };

  const iconColors = {
    high: 'text-red-600',
    medium: 'text-orange-600',
    low: 'text-blue-600',
  };

  return (
    <div className={`p-3 border-l-4 rounded-r-lg ${severityColors[alert.severity]}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 ${iconColors[alert.severity]}`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{alert.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {alert.vehicle || alert.driver}
          </p>
        </div>
      </div>
    </div>
  );
}