// ========================================
// FILE: src/components/analytics/VehicleAnalyticsPanel.tsx
// ========================================
import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, MapPin, Gauge, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Vehicle } from '@/contexts/VehiclesContext';
import { MetricTile } from './MetricTile';

interface StatusCounts {
  available: number;
  in_use: number;
  maintenance: number;
  inactive: number;
}

interface Props {
  vehicles: Vehicle[];
  statusCounts: StatusCounts;
  totalCount: number;
  layout?: 'horizontal' | 'vertical';
}

const STATUS_COLORS = {
  available:   '#10b981',
  in_use:      '#3b82f6',
  maintenance: '#f59e0b',
  inactive:    '#94a3b8',
};

function fmt(n: number, suffix = '') {
  const abs = Math.abs(n);
  const sfx = suffix ? ' ' + suffix : '';
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M${sfx}`;
  if (abs >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K${sfx}`;
  return `${n.toLocaleString('pt-PT')}${sfx}`;
}


const tooltipStyle = {
  fontSize: 11,
  borderRadius: 8,
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
};

export function VehicleAnalyticsPanel({ vehicles, statusCounts, totalCount, layout = 'horizontal' }: Props) {
  const { t } = useTranslation();
  const isVertical = layout === 'vertical';

  const derived = useMemo(() => {
    const total = totalCount;
    const utilizationRate  = total > 0 ? Math.round((statusCounts.in_use    / total) * 100) : 0;
    const availabilityRate = total > 0 ? Math.round((statusCounts.available / total) * 100) : 0;
    const withGps     = vehicles.filter(v => v.traccar_unique_id).length;
    const totalMileage = vehicles.reduce((s, v) => s + (v.current_mileage || 0), 0);
    const avgMileage  = vehicles.length > 0 ? Math.round(totalMileage / vehicles.length) : 0;

    const statusData = [
      { name: t('vehicles:stats.available'),   value: statusCounts.available,   color: STATUS_COLORS.available },
      { name: t('vehicles:stats.inUse'),        value: statusCounts.in_use,      color: STATUS_COLORS.in_use },
      { name: t('vehicles:stats.maintenance'),  value: statusCounts.maintenance, color: STATUS_COLORS.maintenance },
      { name: t('vehicles:stats.inactive'),     value: statusCounts.inactive,    color: STATUS_COLORS.inactive },
    ].filter(d => d.value > 0);

    const topMileage = [...vehicles]
      .sort((a, b) => (b.current_mileage || 0) - (a.current_mileage || 0))
      .slice(0, 7)
      .map(v => ({ name: v.license_plate, value: v.current_mileage || 0 }));

    const catMap: Record<string, number> = {};
    for (const v of vehicles) {
      const cat = v.category_name || '—';
      catMap[cat] = (catMap[cat] || 0) + 1;
    }
    const categoryData = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    return { utilizationRate, availabilityRate, withGps, avgMileage, statusData, topMileage, categoryData };
  }, [vehicles, statusCounts, totalCount, t]);

  return (
    <div className="rounded-2xl border border-muted/60 bg-card/80 backdrop-blur-sm p-4 space-y-4">

      {/* KPI Row */}
      <div className={isVertical ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 sm:grid-cols-4 gap-3'}>
        <MetricTile
          label={t('vehicles:analytics.utilizationRate')}
          value={`${derived.utilizationRate}%`}
          icon={TrendingUp}
          colorClass="text-blue-500"
        />
        <MetricTile
          label={t('vehicles:analytics.availability')}
          value={`${derived.availabilityRate}%`}
          icon={Activity}
          colorClass="text-green-500"
        />
        <MetricTile
          label={t('vehicles:analytics.avgMileage')}
          value={fmt(derived.avgMileage, 'km')}
          rawValue={derived.avgMileage}
          suffix="km"
          icon={Gauge}
          colorClass="text-amber-500"
        />
        <MetricTile
          label={t('vehicles:analytics.withGps')}
          value={`${derived.withGps} / ${totalCount}`}
          icon={MapPin}
          colorClass="text-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className={isVertical ? 'space-y-4 pt-1' : 'grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1'}>

        {/* Status Donut */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {t('vehicles:analytics.fleetStatus')}
          </p>
          {derived.statusData.length > 0 ? (
            <>
              <div className={isVertical ? 'h-[150px]' : 'h-[150px]'}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={derived.statusData}
                      cx="50%" cy="50%"
                      innerRadius={42} outerRadius={65}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {derived.statusData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
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
            <div className="h-[150px] flex items-center justify-center text-xs text-muted-foreground italic">
              {t('common:noData')}
            </div>
          )}
        </div>

        {/* Top Mileage Horizontal Bar */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {t('vehicles:analytics.topMileage')}
          </p>
          {derived.topMileage.length > 0 ? (
            <div className={isVertical ? 'h-[135px]' : 'h-[175px]'}>
              <ResponsiveContainer>
                <BarChart
                  data={derived.topMileage}
                  layout="vertical"
                  margin={{ left: 0, right: 8, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category" dataKey="name"
                    tick={{ fontSize: 10 }} width={isVertical ? 52 : 68}
                    tickLine={false} axisLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [`${Number(v).toLocaleString('pt-PT')} km`, t('vehicles:analytics.mileage')]}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[175px] flex items-center justify-center text-xs text-muted-foreground italic">
              {t('common:noData')}
            </div>
          )}
        </div>

        {/* Category distribution */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {t('vehicles:analytics.byCategory')}
          </p>
          {derived.categoryData.length > 0 ? (
            <div className={isVertical ? 'h-[135px]' : 'h-[175px]'}>
              <ResponsiveContainer>
                <BarChart
                  data={derived.categoryData}
                  layout="vertical"
                  margin={{ left: 0, right: 8, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category" dataKey="name"
                    tick={{ fontSize: 9 }} width={isVertical ? 65 : 85}
                    tickLine={false} axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[175px] flex items-center justify-center text-xs text-muted-foreground italic">
              {t('common:noData')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
