import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Droplets, DollarSign, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MetricTile } from './MetricTile';

interface FuelStats {
  totalCost: number;
  totalLiters: number;
  avgPrice: number;
}

interface RefuelingItem {
  vehicle_license?: string;
  total_cost: number;
  liters: number;
}

interface Props {
  stats: FuelStats;
  refuelings: RefuelingItem[];
  totalCount: number;
  layout?: 'horizontal' | 'vertical';
}

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


export function FuelAnalyticsPanel({ stats, refuelings, totalCount, layout = 'horizontal' }: Props) {
  const { t } = useTranslation();
  const isVertical = layout === 'vertical';

  const vehicleCosts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of refuelings) {
      const plate = r.vehicle_license || '—';
      map[plate] = (map[plate] || 0) + r.total_cost;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [refuelings]);

  return (
    <div className="rounded-2xl border border-muted/60 bg-card/80 backdrop-blur-sm p-4 space-y-4">
      <div className={isVertical ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 sm:grid-cols-4 gap-3'}>
        <MetricTile label={t('refuelings:analytics.totalCost')} value={fmt(Number(stats.totalCost), 'Kz')} rawValue={Number(stats.totalCost)} suffix="Kz" icon={TrendingUp} colorClass="text-blue-500" />
        <MetricTile label={t('refuelings:analytics.totalLiters')} value={fmt(Number(stats.totalLiters), 'L')} rawValue={Number(stats.totalLiters)} suffix="L" icon={Droplets} colorClass="text-green-500" />
        <MetricTile label={t('refuelings:analytics.avgPrice')} value={`${Number(stats.avgPrice).toFixed(2)} Kz`} icon={DollarSign} colorClass="text-amber-500" />
        <MetricTile label={t('refuelings:analytics.refuelings')} value={String(totalCount)} icon={Hash} colorClass="text-purple-500" />
      </div>

      {vehicleCosts.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('refuelings:analytics.costByVehicle')}</p>
          <div className={isVertical ? 'h-[140px]' : 'h-[160px]'}>
            <ResponsiveContainer>
              <BarChart data={vehicleCosts} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={65} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [`${Number(v).toLocaleString('pt-PT')} Kz`, t('refuelings:analytics.cost')]}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
