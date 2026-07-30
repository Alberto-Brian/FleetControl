import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Wrench, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MetricTile } from './MetricTile';

interface StatusCounts {
  scheduled: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

interface MaintenanceItem {
  vehicle_license?: string;
  total_cost: number;
  status: string;
}

interface Props {
  statusCounts: StatusCounts;
  maintenances: MaintenanceItem[];
  totalCount: number;
  layout?: 'horizontal' | 'vertical';
}

const STATUS_COLORS: Record<string, string> = {
  scheduled:   '#3b82f6',
  in_progress: '#f59e0b',
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


export function MaintenanceAnalyticsPanel({ statusCounts, maintenances, totalCount, layout = 'horizontal' }: Props) {
  const { t } = useTranslation();
  const isVertical = layout === 'vertical';

  const derived = useMemo(() => {
    const statusData = [
      { name: t('maintenances:analytics.statusScheduled'),  value: statusCounts.scheduled,   color: STATUS_COLORS.scheduled },
      { name: t('maintenances:analytics.statusInProgress'), value: statusCounts.in_progress, color: STATUS_COLORS.in_progress },
      { name: t('maintenances:analytics.statusCompleted'),  value: statusCounts.completed,   color: STATUS_COLORS.completed },
      { name: t('maintenances:analytics.statusCancelled'),  value: statusCounts.cancelled,   color: STATUS_COLORS.cancelled },
    ].filter(d => d.value > 0);


    const totalCost = maintenances.reduce((s, m) => s + (m.total_cost || 0), 0);

    const vehicleCosts: Record<string, number> = {};
    for (const m of maintenances) {
      const plate = m.vehicle_license || '—';
      vehicleCosts[plate] = (vehicleCosts[plate] || 0) + (m.total_cost || 0);
    }
    const costByVehicle = Object.entries(vehicleCosts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    return { statusData, totalCost, costByVehicle };
  }, [statusCounts, maintenances, t]);

  return (
    <div className="rounded-2xl border border-muted/60 bg-card/80 backdrop-blur-sm p-4 space-y-4">
      <div className={isVertical ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 sm:grid-cols-4 gap-3'}>
        <MetricTile label={t('maintenances:analytics.total')} value={String(totalCount)} icon={Wrench} colorClass="text-slate-500" />
        <MetricTile label={t('maintenances:analytics.scheduled')} value={String(statusCounts.scheduled)} icon={Clock} colorClass="text-blue-500" />
        <MetricTile label={t('maintenances:analytics.inProgress')} value={String(statusCounts.in_progress)} icon={CheckCircle2} colorClass="text-amber-500" />
        <MetricTile label={t('maintenances:analytics.totalCost')} value={fmt(derived.totalCost, 'Kz')} rawValue={derived.totalCost} suffix="Kz" icon={TrendingUp} colorClass="text-green-500" />
      </div>

      <div className={isVertical ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('maintenances:analytics.maintenanceStatus')}</p>
          {derived.statusData.length > 0 ? (
            <>
              <div className={isVertical ? 'h-[125px]' : 'h-[140px]'}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={derived.statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={53} dataKey="value" paddingAngle={2}>
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
            <div className="h-[115px] flex items-center justify-center text-xs text-muted-foreground italic">{t('common:noData')}</div>
          )}
        </div>

        {derived.costByVehicle.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('maintenances:analytics.costByVehicle')}</p>
            <div className={isVertical ? 'h-[130px]' : 'h-[140px]'}>
              <ResponsiveContainer>
                <BarChart data={derived.costByVehicle} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [`${Number(v).toLocaleString('pt-PT')} Kz`, t('maintenances:analytics.cost')]}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
