import React, { useState, useEffect } from 'react';
import {
  Truck, Fuel, Wrench, Users, MapPin, DollarSign,
  AlertTriangle, Activity, Filter,
  Download, ChevronRight, CheckCircle2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { useTranslation } from 'react-i18next';
import StatCard from '@/components/StatCard';
import AllActivitiesDialog from '@/components/dashboard/AllActivitiesDialog';

import { useDashboard } from '@/contexts/DashboardContext';
import { getAllMaintenances } from '@/helpers/maintenance-helpers';
import { IMaintenance } from '@/lib/types/maintenance';

type MaintenanceWithDetails = IMaintenance & {
  vehicle_license?: string | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  category_name?: string | null;
  category_color?: string | null;
};

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

const tooltipStyle = {
  borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

interface DashboardPageContentProps {
  onNavigate?: (section: string) => void;
}

export function DashboardPageContent({ onNavigate }: DashboardPageContentProps) {
  const { t } = useTranslation();
  const { state, refreshData } = useDashboard();
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<MaintenanceWithDetails[]>([]);

  useEffect(() => { refreshData(); }, []);

  useEffect(() => {
    getAllMaintenances({ limit: 30 })
      .then(r => {
        const upcoming = (r.data as MaintenanceWithDetails[])
          .filter(m => m.status === 'scheduled' || m.status === 'in_progress');
        upcoming.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4));
        setUpcomingMaintenances(upcoming.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  if (state.isLoading || !state.stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-bold animate-pulse">{t('common:loading')}...</p>
      </div>
    );
  }

  const { stats, chartData, recentActivities } = state;

  const fleetStatusData = [
    { name: t('vehicles:stats.available'),     value: stats.activeVehicles,      color: '#10b981' },
    { name: t('vehicles:stats.inUse'),         value: stats.inUseVehicles,       color: '#3b82f6' },
    { name: t('vehicles:stats.inMaintenance'), value: stats.maintenanceVehicles, color: '#f59e0b' },
    { name: t('vehicles:stats.inactive'),      value: stats.inactiveVehicles,    color: '#ef4444' },
  ].filter(item => item.value > 0);

  const fuelConsumptionData = chartData?.fuelByMonth.map(f => ({
    name: f.month.split('-')[1],
    value: f.amount,
  })) || [];

  const expenseCategoryData = (chartData?.expensesByCategory ?? [])
    .filter(e => e.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
    .map(e => ({ name: e.category, value: e.amount }));

  return (
    <div className="p-6 space-y-8 bg-transparent min-h-screen">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t('dashboard:title')}</h1>
          <p className="text-muted-foreground">{t('dashboard:welcome')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" /> {t('common:export')}
          </Button>
          <Button size="sm" onClick={refreshData}>
            <Filter className="w-4 h-4 mr-2" /> {t('dashboard:refresh')}
          </Button>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Truck}
          title={t('dashboard:stats.vehicles.total')}
          value={stats.totalVehicles}
          subtitle={`${stats.activeVehicles} ${t('dashboard:stats.vehicles.totalAvailable')}`}
          trend={((stats.activeVehicles / Math.max(stats.totalVehicles, 1)) * 100).toFixed(1)}
          color="bg-blue-600"
          onClick={onNavigate ? () => onNavigate('vehicles') : undefined}
        />
        <StatCard
          icon={Users}
          title={t('dashboard:stats.drivers.total')}
          value={stats.totalDrivers}
          subtitle={`${stats.availableDrivers} ${t('dashboard:stats.drivers.totalAvailable')}`}
          trend={((stats.availableDrivers / Math.max(stats.totalDrivers, 1)) * 100).toFixed(1)}
          color="bg-emerald-600"
          onClick={onNavigate ? () => onNavigate('drivers') : undefined}
        />
        <StatCard
          icon={MapPin}
          title={t('dashboard:stats.trips.total')}
          value={stats.activeTrips}
          subtitle={`${stats.activeTrips} ${t('dashboard:stats.trips.totalInProgrees')}`}
          trend={stats.completedTrips > 0 ? ((stats.activeTrips / stats.completedTrips) * 100).toFixed(1) : 14.3}
          color="bg-violet-600"
          onClick={onNavigate ? () => onNavigate('trips') : undefined}
        />
        <StatCard
          icon={AlertTriangle}
          title={t('dashboard:stats.alerts.pending')}
          value={stats.overdueFines + stats.scheduledMaintenances}
          subtitle={`${stats.scheduledMaintenances} ${t('dashboard:stats.maintenances.inProgress')}`}
          trend={1}
          color="bg-amber-600"
          onClick={onNavigate ? () => onNavigate('maintenance') : undefined}
        />
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Fuel by Month */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('dashboard:charts.fuelByMonth')}</CardTitle>
                <CardDescription>{t('dashboard:charts.fuelDescription')}</CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono">{new Date().getFullYear()}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelConsumptionData}>
                  <defs>
                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => `${value.toLocaleString('pt-PT')} Kz`}
                  />
                  <Area
                    type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2}
                    fillOpacity={1} fill="url(#colorFuel)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('dashboard:charts.fleetStatus')}</CardTitle>
            <CardDescription>{t('dashboard:charts.fleetDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetStatusData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value"
                  >
                    {fleetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {fleetStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground text-xs">{item.name}</span>
                  </div>
                  <span className="font-semibold text-xs tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Activities + Upcoming Maintenances ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activities */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('dashboard:recentActivities.title')}</CardTitle>
              <CardDescription>{t('dashboard:recentActivities.description')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => setShowAllActivities(true)}>
              {t('dashboard:recentActivities.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>{t('dashboard:recentActivities.noActivities')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dashboard:table.type')}</TableHead>
                    <TableHead>{t('dashboard:table.description')}</TableHead>
                    <TableHead>{t('dashboard:table.vehicle')}</TableHead>
                    <TableHead>{t('dashboard:table.date')}</TableHead>
                    <TableHead className="text-right">{t('dashboard:table.value')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.slice(0, 5).map((activity) => {
                    const Icon =
                      activity.type === 'trip'        ? MapPin :
                      activity.type === 'refueling'   ? Fuel :
                      activity.type === 'maintenance' ? Wrench :
                      activity.type === 'expense'     ? DollarSign :
                      activity.type === 'fine'        ? AlertTriangle :
                      activity.type === 'vehicle'     ? Truck :
                      activity.type === 'driver'      ? Users :
                      Activity;

                    const colorClass =
                      activity.type === 'trip'        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' :
                      activity.type === 'refueling'   ? 'text-green-600 bg-green-50 dark:bg-green-950/30' :
                      activity.type === 'maintenance' ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' :
                      activity.type === 'expense'     ? 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' :
                      activity.type === 'fine'        ? 'text-red-600 bg-red-50 dark:bg-red-950/30' :
                      activity.type === 'vehicle'     ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' :
                      activity.type === 'driver'      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' :
                      'text-gray-600 bg-gray-50 dark:bg-gray-950/30';

                    return (
                      <TableRow key={activity.id} className="group">
                        <TableCell>
                          <div className={`inline-flex p-2 rounded-lg ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{t(activity.title)}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{activity.description}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono">{activity.vehicle || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold">
                          {activity.amount ? `${(activity.amount / 1000).toFixed(0)}K Kz` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Maintenances */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                {t('dashboard:upcomingMaintenances.title')}
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600 -mr-2" onClick={() => onNavigate?.('maintenance')}>
                {t('dashboard:recentActivities.viewAll')} <ChevronRight className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingMaintenances.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">{t('dashboard:upcomingMaintenances.noData')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingMaintenances.map(m => {
                  const accent = m.category_color || '#f59e0b';
                  const isUrgent  = m.priority === 'urgent';
                  const isHigh    = m.priority === 'high';
                  return (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl border border-muted/60 bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => onNavigate?.('maintenance')}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${accent}22`, color: accent }}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-semibold truncate">
                              {m.vehicle_license ?? '—'}
                            </p>
                            {(isUrgent || isHigh) && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                isUrgent ? 'bg-destructive text-destructive-foreground' : 'bg-amber-500 text-white'
                              }`}>
                                {t(`maintenances:priority.${m.priority}.label`)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {m.category_name ?? m.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(m.entry_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span
                              className="text-[10px] font-medium"
                              style={{ color: m.status === 'in_progress' ? '#3b82f6' : '#f59e0b' }}
                            >
                              {t(`maintenances:status.${m.status}.label`)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Expenses by Category ──────────────────────────────────────────── */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('dashboard:charts.expensesByCategory')}</CardTitle>
          <CardDescription>{t('dashboard:charts.expensesByCategoryDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseCategoryData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground italic">
              {t('common:noData')}
            </div>
          ) : (
            <div className="h-[Math.max(expenseCategoryData.length * 40, 160)]" style={{ height: Math.max(expenseCategoryData.length * 44, 160) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategoryData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category" dataKey="name"
                    tick={{ fontSize: 11 }} width={100}
                    tickLine={false} axisLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [`${(value / 1000).toFixed(1)}K Kz`, t('dashboard:table.value')]}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <AllActivitiesDialog
        open={showAllActivities}
        onOpenChange={setShowAllActivities}
        activities={recentActivities}
      />
    </div>
  );
}
