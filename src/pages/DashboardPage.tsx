import React from 'react';
import { 
  Truck, Fuel, Wrench, Users, MapPin, DollarSign, 
  AlertTriangle, Calendar, TrendingUp, Activity, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import VehicleStatusBadge from '@/components/VehicleStatusBadge';
import TripStatusBadge from '@/components/TripStatusBadge';
import AlertItem from '@/components/AlertItem';

// Mock data
const mockStats = {
  totalVehicles: 24,
  activeVehicles: 18,
  totalDrivers: 32,
  activeTrips: 5,
  monthlyFuel: 15420.50,
  pendingMaintenance: 3,
  documentsExpiring: 7,
  monthlyExpenses: 89340.00
};

const mockVehicles = [
  { id: '1', plate: 'LD-45-32-AB', model: 'Mercedes Sprinter', status: 'active' as const, driver: 'João Silva', km: 45230 },
  { id: '2', plate: 'LD-78-21-CD', model: 'Iveco Daily', status: 'maintenance' as const, driver: null, km: 78450 },
  { id: '3', plate: 'LD-12-98-EF', model: 'Ford Transit', status: 'active' as const, driver: 'Maria Santos', km: 32100 },
  { id: '4', plate: 'LD-56-43-GH', model: 'Fiat Ducato', status: 'inactive' as const, driver: null, km: 67890 },
  { id: '5', plate: 'LD-89-12-IJ', model: 'Renault Master', status: 'active' as const, driver: 'Carlos Costa', km: 23450 },
];

const mockAlerts = [
  { id: '1', type: 'document' as const, title: 'Seguro vence em 5 dias', vehicle: 'LD-45-32-AB', severity: 'high' as const },
  { id: '2', type: 'maintenance' as const, title: 'Manutenção programada', vehicle: 'LD-78-21-CD', severity: 'medium' as const },
  { id: '3', type: 'license' as const, title: 'CNH vence em 15 dias', driver: 'Ana Mendes', severity: 'medium' as const },
  { id: '4', type: 'document' as const, title: 'Inspeção vencida', vehicle: 'LD-12-98-EF', severity: 'high' as const },
];

const mockRecentTrips = [
  { id: '1', vehicle: 'LD-45-32-AB', driver: 'João Silva', route: 'Luanda → Benguela', status: 'completed' as const, date: '15/01/2026' },
  { id: '2', vehicle: 'LD-89-12-IJ', driver: 'Carlos Costa', route: 'Luanda → Huambo', status: 'in_progress' as const, date: '16/01/2026' },
  { id: '3', vehicle: 'LD-12-98-EF', driver: 'Maria Santos', route: 'Luanda → Lobito', status: 'in_progress' as const, date: '16/01/2026' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Truck}
          title="Veículos em Operação"
          value={mockStats.activeVehicles}
          subtitle={`${mockStats.totalVehicles} veículos totais`}
          trend={5.2}
          color="bg-blue-500"
        />
        <StatCard 
          icon={Users}
          title="Motoristas Ativos"
          value={mockStats.totalDrivers}
          subtitle="Disponíveis para viagens"
          trend={2.1}
          color="bg-green-500"
        />
        <StatCard 
          icon={MapPin}
          title="Viagens Ativas"
          value={mockStats.activeTrips}
          subtitle="Em andamento hoje"
          color="bg-purple-500"
        />
        <StatCard 
          icon={AlertTriangle}
          title="Alertas Pendentes"
          value={mockStats.documentsExpiring}
          subtitle={`${mockStats.pendingMaintenance} manutenções`}
          color="bg-orange-500"
        />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Fuel className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Combustível (Mês)</p>
            <p className="text-2xl font-bold mt-1">
              {mockStats.monthlyFuel.toLocaleString('pt-AO')} Kz
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              +8.2% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Manutenções (Mês)</p>
            <p className="text-2xl font-bold mt-1">32.450 Kz</p>
            <p className="text-xs text-muted-foreground mt-1">
              -12.5% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Despesas Totais</p>
            <p className="text-2xl font-bold mt-1">
              {mockStats.monthlyExpenses.toLocaleString('pt-AO')} Kz
            </p>
            <p className="text-xs text-muted-foreground mt-1">Janeiro 2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alertas Importantes
              </CardTitle>
              <Badge variant="destructive">{mockAlerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[380px] pr-4">
              <div className="space-y-3">
                {mockAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Vehicles Status */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Estado da Frota
              </CardTitle>
              <Button variant="outline" size="sm">Ver todos</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{vehicle.plate}</p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium">
                        {vehicle.driver || 'Sem motorista'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.km.toLocaleString()} km
                      </p>
                    </div>
                    <VehicleStatusBadge status={vehicle.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Viagens Recentes
            </CardTitle>
            <Button variant="outline" size="sm">Ver histórico</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecentTrips.map((trip) => (
              <div 
                key={trip.id} 
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{trip.route}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.vehicle} • {trip.driver}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {trip.date}
                    </p>
                  </div>
                  <TripStatusBadge status={trip.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}