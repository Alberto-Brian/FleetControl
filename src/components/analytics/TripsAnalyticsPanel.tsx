import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Clock, XCircle, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatusCounts {
  in_progress: number;
  completed: number;
  cancelled: number;
  totalDistance: number;
}

interface Props {
  statusCounts: StatusCounts;
  totalCount: number;
  layout?: 'horizontal' | 'vertical';
}

const STATUS_COLORS = {
  in_progress: '#3b82f6',
  completed:   '#10b981',
  cancelled:   '#94a3b8',
};

const tooltipStyle = {
  fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
};

function fmt(n: number, suffix = '') {
  const abs = Math.abs(n);
  const sfx = suffix ? ' ' + suffix : '';
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M${sfx}`;
  if (abs >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K${sfx}`;
  return `${n.toLocaleString('pt-PT')}${sfx}`;
}

function MetricTile({ label, value, icon: Icon, colorClass, rawValue, suffix = '' }: {
  label: string; value: string; icon: React.ElementType; colorClass: string; rawValue?: number; suffix?: string;
}) {
  const textSize = rawValue !== undefined && rawValue >= 10_000 ? 'text-sm' : 'text-base';
  const showTooltip = rawValue !== undefined && rawValue >= 1_000;
  const fullValue = showTooltip
    ? `${rawValue!.toLocaleString('pt-PT')}${suffix ? ' ' + suffix : ''}`
    : undefined;

  const tile = (
    <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 cursor-default">
      <div className={`p-2 rounded-lg bg-background ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight truncate">{label}</p>
        <p className={`${textSize} font-black leading-tight truncate`}>{value}</p>
      </div>
    </div>
  );

  if (!showTooltip) return tile;

  return (
    <UITooltip>
      <TooltipTrigger asChild>{tile}</TooltipTrigger>
      <TooltipContent side="top" className="px-3 py-2.5 min-w-[120px]">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 leading-tight">{label}</p>
        <p className="text-sm font-black tabular-nums leading-tight">{fullValue}</p>
      </TooltipContent>
    </UITooltip>
  );
}

export function TripsAnalyticsPanel({ statusCounts, totalCount, layout = 'horizontal' }: Props) {
  const { t } = useTranslation();
  const isVertical = layout === 'vertical';

  const derived = useMemo(() => {
    const completionRate = totalCount > 0 ? Math.round((statusCounts.completed / totalCount) * 100) : 0;
    const statusData = [
      { name: t('trips:analytics.statusInProgress'), value: statusCounts.in_progress, color: STATUS_COLORS.in_progress },
      { name: t('trips:analytics.statusCompleted'),  value: statusCounts.completed,   color: STATUS_COLORS.completed },
      { name: t('trips:analytics.statusCancelled'),  value: statusCounts.cancelled,   color: STATUS_COLORS.cancelled },
    ].filter(d => d.value > 0);
    return { completionRate, statusData };
  }, [statusCounts, totalCount, t]);

  return (
    <div className="rounded-2xl border border-muted/60 bg-card/80 backdrop-blur-sm p-4 space-y-4">
      <TooltipProvider delayDuration={300}>
      <div className={isVertical ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 sm:grid-cols-4 gap-3'}>
        <MetricTile label={t('trips:analytics.completionRate')} value={`${derived.completionRate}%`} icon={CheckCircle2} colorClass="text-green-500" />
        <MetricTile label={t('trips:analytics.inProgress')} value={String(statusCounts.in_progress)} icon={Clock} colorClass="text-blue-500" />
        <MetricTile label={t('trips:analytics.cancelled')} value={String(statusCounts.cancelled)} icon={XCircle} colorClass="text-slate-400" />
        <MetricTile label={t('trips:analytics.totalDistance')} value={fmt(Number(statusCounts.totalDistance), 'km')} rawValue={Number(statusCounts.totalDistance)} suffix="km" icon={Navigation} colorClass="text-purple-500" />
      </div>
      </TooltipProvider>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('trips:analytics.tripsStatus')}</p>
        {derived.statusData.length > 0 ? (
          <>
            <div className={isVertical ? 'h-[135px]' : 'h-[145px]'}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={derived.statusData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={2}>
                    {derived.statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {derived.statusData.map(d => (
                <span key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  {d.name} · <strong>{d.value}</strong>
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[135px] flex items-center justify-center text-xs text-muted-foreground italic">{t('common:noData')}</div>
        )}
      </div>
    </div>
  );
}
