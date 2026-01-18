// ========================================
// FILE: src/pages/AnalyticsPage.tsx
// ========================================
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Análises</h2>
        <p className="text-muted-foreground">Insights e métricas da sua frota</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Utilização</p>
              <p className="text-2xl font-bold">67%</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +12% vs mês anterior
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Custo por KM</p>
              <p className="text-2xl font-bold">45 Kz</p>
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3" />
                +5% vs mês anterior
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Consumo Médio</p>
              <p className="text-2xl font-bold">12.5 km/L</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                Eficiência +3%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Manutenções/Mês</p>
              <p className="text-2xl font-bold">2.3</p>
              <p className="text-xs text-muted-foreground mt-1">
                Média dos últimos 6 meses
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Gráfico de Performance</h3>
        <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">Gráfico em desenvolvimento...</p>
        </div>
      </Card>
    </div>
  );
}