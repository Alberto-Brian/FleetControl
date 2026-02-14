// ========================================
// FILE: src/pages/provider/DashboardPageContent.tsx (ATUALIZADO - SEM TEXTO ESTÁTICO)
// ========================================
import React, { useEffect, useState } from 'react';
import { 
  Truck, Fuel, Wrench, Users, MapPin, DollarSign, 
  AlertTriangle, Calendar, TrendingUp, Activity, Bell,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Filter,
  Download, ChevronRight
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import StatCard from '@/components/StatCard';

// Context & Helpers
import { useDashboard } from '@/contexts/DashboardContext';
import { loadDashboardData } from '@/helpers/dashboard-helpers';

export function DashboardPageContent() {
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const { state, setStats, setActivities, setChartData, setLoading } = useDashboard();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await loadDashboardData();
      setStats(data.stats);
      setActivities(data.activities);
      setChartData(data.chartData);
    } catch (error) {
      handleError(error, 'dashboard:errors.loading');
    } finally {
      setLoading(false);
    }
  }

  if (state.isLoading || !state.stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-bold animate-pulse">
          {t('common:loading')}...
        </p>
      </div>
    );
  }

  const { stats, chartData, recentActivities } = state;

  // Preparar dados para gráficos
  const fleetStatusData = [
  { name: t('vehicles:stats.available'), value: stats.activeVehicles, color: '#10b981' },     // Verde
  { name: t('vehicles:stats.inUse'), value: stats.inUseVehicles, color: '#3b82f6' },          // Azul ✅ NOVO!
  { name: t('vehicles:stats.inMainenance'), value: stats.maintenanceVehicles, color: '#f59e0b' }, // Laranja
  { name: t('vehicles:stats.inactive'), value: stats.inactiveVehicles, color: '#ef4444' },     // Vermelho
].filter(item => item.value > 0); // Remove zeros

  // Formatar dados de combustível para o gráfico
  const fuelConsumptionData = chartData?.fuelByMonth.map(f => ({
    name: f.month.split('-')[1],
    value: f.amount,
  })) || [];

  // Preparar dados de despesas semanais
  const expenseData = chartData?.expensesByCategory.slice(0, 4).map((e, i) => ({
    name: `${t('dashboard:charts.week')} ${i + 1}`,
    fuel: stats.totalFuelCost / 4,
    maintenance: stats.totalMaintenanceCost / 4,
    other: e.amount / 4,
  })) || [];

  return (
    <div className="p-6 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard:title')}</h1>
          <p className="text-muted-foreground">{t('dashboard:welcome')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" /> {t('common:export')}
          </Button>
          <Button size="sm" onClick={loadData}>
            <Filter className="w-4 h-4 mr-2" /> {t('dashboard:refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Grid - Enhanced with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Truck}
          title={t('dashboard:stats.vehicles.total')}
          value={stats.totalVehicles}
          subtitle={`${stats.activeVehicles} ${t('dashboard:stats.vehicles.totalAvailable')}`}
          trend={((stats.activeVehicles / stats.totalVehicles) * 100).toFixed(1)}
          color="bg-blue-600"
        />
        <StatCard 
          icon={Users}
          title={t('dashboard:stats.drivers.total')}
          value={stats.totalDrivers}
          subtitle={`${stats.availableDrivers} ${t('dashboard:stats.drivers.totalAvailable')}`}
          trend={((stats.availableDrivers / stats.totalDrivers) * 100).toFixed(1)}
          color="bg-emerald-600"
        />
        <StatCard 
          icon={MapPin}
          title={t('dashboard:stats.trips.total')}
          value={stats.activeTrips}
          subtitle={`${stats.activeTrips} ${t('dashboard:stats.trips.totalInProgrees')}`}
          trend={stats.completedTrips > 0 ? ((stats.activeTrips / stats.completedTrips) * 100).toFixed(1) : 14.3}
          color="bg-violet-600"
        />
        <StatCard 
          icon={AlertTriangle}
          title="Pending Alerts"
          value={stats.overdueFines + stats.scheduledMaintenances}
          subtitle={`${stats.scheduledMaintenances} maintenances`}
          trend={1}
          color="bg-amber-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Fuel Consumption */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
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
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => `${value.toLocaleString('pt-PT')} Kz`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorFuel)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Distribution Pie Chart */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>{t('dashboard:charts.fleetStatus')}</CardTitle>
            <CardDescription>{t('dashboard:charts.fleetDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {fleetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {fleetStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities Table */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('dashboard:recentActivities.title')}</CardTitle>
              <CardDescription>{t('dashboard:recentActivities.description')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600">
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
                    const Icon = activity.type === 'trip' ? MapPin :
                                activity.type === 'refueling' ? Fuel :
                                activity.type === 'maintenance' ? Wrench :
                                activity.type === 'expense' ? DollarSign :
                                AlertTriangle;

                    const colorClass = activity.type === 'trip' ? 'text-blue-600 bg-blue-50' :
                                      activity.type === 'refueling' ? 'text-green-600 bg-green-50' :
                                      activity.type === 'maintenance' ? 'text-orange-600 bg-orange-50' :
                                      activity.type === 'expense' ? 'text-purple-600 bg-purple-50' :
                                      'text-red-600 bg-red-50';

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
                        <TableCell className="text-sm font-mono">
                          {activity.vehicle || '-'}
                        </TableCell>
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

        {/* Alerts and Notifications */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                {t('dashboard:alerts.title')}
              </CardTitle>
              <Badge variant="destructive" className="rounded-full px-2">
                {stats.overdueFines + stats.scheduledMaintenances}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Multas Vencidas */}
                {stats.overdueFines > 0 && (
                  <div className="p-3 rounded-xl border border-red-100 dark:border-red-900 bg-white dark:bg-slate-900 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-100 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{t('dashboard:alerts.overdueFines', { count: stats.overdueFines })}</p>
                          <span className="text-[10px] text-muted-foreground">{t('common:today')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('dashboard:alerts.actionRequired')}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Button variant="link" className="h-auto p-0 text-xs text-blue-600">{t('dashboard:alerts.resolve')}</Button>
                          <Button variant="link" className="h-auto p-0 text-xs text-slate-400">{t('dashboard:alerts.ignore')}</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manutenções Agendadas */}
                {stats.scheduledMaintenances > 0 && (
                  <div className="p-3 rounded-xl border border-amber-100 dark:border-amber-900 bg-white dark:bg-slate-900 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{t('dashboard:alerts.pendingMaintenances', { count: stats.scheduledMaintenances })}</p>
                          <span className="text-[10px] text-muted-foreground">{t('common:today')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('dashboard:alerts.requiresAttention')}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Button variant="link" className="h-auto p-0 text-xs text-blue-600">{t('dashboard:alerts.viewDetails')}</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sem alertas */}
                {stats.overdueFines === 0 && stats.scheduledMaintenances === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">{t('dashboard:alerts.noAlerts')}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            <Button variant="outline" className="w-full mt-4 text-xs">
              {t('dashboard:alerts.viewHistory')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Summary - Expenses Bar Chart */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>{t('dashboard:charts.weeklyExpenses')}</CardTitle>
          <CardDescription>{t('dashboard:charts.weeklyExpensesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => `${value.toLocaleString('pt-PT')} Kz`}
                />
                <Legend />
                <Bar dataKey="fuel" name={t('dashboard:charts.fuel')} fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maintenance" name={t('dashboard:charts.maintenance')} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="other" name={t('dashboard:charts.other')} fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}