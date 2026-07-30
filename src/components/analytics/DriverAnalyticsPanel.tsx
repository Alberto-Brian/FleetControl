import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, CalendarDays, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MetricTile } from './MetricTile';

interface StatusCounts {
  available: number;
  on_trip: number;
  offline: number;
  on_leave: number;
  terminated: number;
}

interface DriverItem {
  license_category: string;
  license_expiry_date: string;
}

interface Props {
  drivers: DriverItem[];
  statusCounts: StatusCounts;
  totalCount: number;
  layout?: 'horizontal' | 'vertical';
}

const STATUS_COLORS: Record<string, string> = {
  available:  '#10b981',
  on_trip:    '#3b82f6',
  on_leave:   '#a855f7',
  offline:    '#94a3b8',
  terminated: '#ef4444',
};


const tooltipStyle = {
  fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
};


export function DriverAnalyticsPanel({ drivers, statusCounts, totalCount, layout = 'horizontal' }: Props) {
  const { t } = useTranslation();
  const isVertical = layout === 'vertical';

  const derived = useMemo(() => {
    const total = totalCount;
    const availabilityRate = total > 0 ? Math.round((statusCounts.available / total) * 100) : 0;

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringCount = drivers.filter(d => {
      const exp = new Date(d.license_expiry_date);
      return exp >= now && exp <= in30Days;
    }).length;

    const statusData = [
      { name: t('drivers:analytics.statusAvailable'), value: statusCounts.available, color: STATUS_COLORS.available },
      { name: t('drivers:analytics.statusOnTrip'),    value: statusCounts.on_trip,   color: STATUS_COLORS.on_trip },
      { name: t('drivers:analytics.statusOnLeave'),   value: statusCounts.on_leave,  color: STATUS_COLORS.on_leave },
      { name: t('drivers:analytics.statusOffline'),   value: statusCounts.offline,   color: STATUS_COLORS.offline },
    ].filter(d => d.value > 0);

    const catMap: Record<string, number> = {};
    for (const d of drivers) {
      const cat = d.license_category || '—';
      catMap[cat] = (catMap[cat] || 0) + 1;
    }
    const categoryData = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    return { availabilityRate, expiringCount, statusData, categoryData };
  }, [drivers, statusCounts, totalCount, t]);

  return (
    <div className="rounded-2xl border border-muted/60 bg-card/80 backdrop-blur-sm p-4 space-y-4">
      <div className={isVertical ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 sm:grid-cols-4 gap-3'}>
        <MetricTile label={t('drivers:analytics.availability')} value={`${derived.availabilityRate}%`} icon={TrendingUp} colorClass="text-green-500" />
        <MetricTile label={t('drivers:analytics.onTrip')} value={String(statusCounts.on_trip)} icon={Users} colorClass="text-blue-500" />
        <MetricTile label={t('drivers:analytics.onLeave')} value={String(statusCounts.on_leave)} icon={CalendarDays} colorClass="text-purple-500" />
        <MetricTile label={t('drivers:analytics.licenseExpiring')} value={String(derived.expiringCount)} icon={AlertTriangle} colorClass="text-amber-500" />
      </div>

      <div className={isVertical ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('drivers:analytics.availabilityChart')}</p>
          {derived.statusData.length > 0 ? (
            <>
              <div className={isVertical ? 'h-[135px]' : 'h-[150px]'}>
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

        {derived.categoryData.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('drivers:analytics.byLicenseCategory')}</p>
            <div className={isVertical ? 'h-[120px]' : 'h-[150px]'}>
              <ResponsiveContainer>
                <BarChart data={derived.categoryData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={28} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
