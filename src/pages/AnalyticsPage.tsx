import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Package } from 'lucide-react';

const performanceData = [
  { metric: 'Taxa de Ocupação', value: '92%', change: '+3%', trend: 'up', color: 'green' },
  { metric: 'Receita Mensal', value: '850K AOA', change: '+12%', trend: 'up', color: 'blue' },
  { metric: 'Inadimplência', value: '6%', change: '-2%', trend: 'down', color: 'red' },
  { metric: 'Novos Vendedores', value: '5', change: '+25%', trend: 'up', color: 'purple' },
];

const topSellers = [
  { name: 'Carlos Mendes', block: 'C', revenue: 18000, payments: 4, status: 'excellent' },
  { name: 'Sofia Lima', block: 'E', revenue: 16000, payments: 4, status: 'excellent' },
  { name: 'João Silva', block: 'A', revenue: 15000, payments: 4, status: 'excellent' },
  { name: 'Ana Costa', block: 'A', revenue: 8000, payments: 2, status: 'warning' },
  { name: 'Miguel Fernandes', block: 'B', revenue: 9000, payments: 1, status: 'critical' },
];

const blockPerformance = [
  { block: 'C', occupancy: 93, revenue: 125000, growth: 15 },
  { block: 'A', occupancy: 91, revenue: 89000, growth: 12 },
  { block: 'E', occupancy: 90, revenue: 98000, growth: 8 },
  { block: 'B', occupancy: 89, revenue: 67000, growth: 5 },
  { block: 'D', occupancy: 87, revenue: 54000, growth: 3 },
];

const spaceTypeAnalysis = [
  { type: 'Contentor', total: 56, occupied: 52, revenue: 285000, avg: 5481 },
  { type: 'Bancada', total: 36, occupied: 32, revenue: 80000, avg: 2500 },
  { type: 'Casota', total: 14, occupied: 13, revenue: 68000, avg: 5231 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Análises e Estatísticas</h2>
          <p className="text-muted-foreground">Insights e métricas do mercado</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
          Exportar Dados
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceData.map((item, idx) => (
          <div key={idx} className={`bg-${item.color}-500/10 backdrop-blur-sm rounded-xl border border-${item.color}-500/20 p-4`}>
            <p className={`text-sm text-${item.color}-600 mb-1`}>{item.metric}</p>
            <div className="flex items-end justify-between">
              <p className={`text-2xl font-bold text-${item.color}-600`}>{item.value}</p>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                item.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-3 h-3 ${item.trend === 'down' ? 'rotate-180' : ''}`} />
                {item.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Vendedores</h3>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {topSellers.map((seller, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-sm text-primary">#{idx + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{seller.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Bloco {seller.block} • {seller.payments} pagamentos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{seller.revenue.toLocaleString()} AOA</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    seller.status === 'excellent' ? 'bg-green-500/10 text-green-600' :
                    seller.status === 'warning' ? 'bg-yellow-500/10 text-yellow-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {seller.status === 'excellent' ? 'Excelente' :
                     seller.status === 'warning' ? 'Atenção' : 'Crítico'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Performance por Bloco</h3>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {blockPerformance.map((block, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{block.block}</span>
                    </div>
                    <span className="font-medium">Bloco {block.block}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{block.occupancy}%</p>
                    <p className="text-xs text-green-600">+{block.growth}%</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${block.occupancy}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Receita: {block.revenue.toLocaleString()} AOA
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Análise por Tipo de Espaço</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {spaceTypeAnalysis.map((space, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-background/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">{space.type}</h4>
                  </div>
                  <span className="text-xl font-bold text-primary">
                    {Math.round((space.occupied / space.total) * 100)}%
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{space.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ocupados:</span>
                    <span className="font-medium text-green-600">{space.occupied}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disponíveis:</span>
                    <span className="font-medium text-blue-600">{space.total - space.occupied}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receita Total:</span>
                      <span className="font-bold text-primary">{space.revenue.toLocaleString()} AOA</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted-foreground">Média/Espaço:</span>
                      <span className="font-medium">{space.avg.toLocaleString()} AOA</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Comparativo Trimestral</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
              <span className="font-medium">Q1 2026 (Jan-Mar)</span>
              <span className="font-bold text-green-600">850K AOA</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
              <span className="font-medium">Q4 2025 (Out-Dez)</span>
              <span className="font-bold">758K AOA</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
              <span className="font-medium">Q3 2025 (Jul-Set)</span>
              <span className="font-bold">692K AOA</span>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-600 mb-1">Crescimento Trimestral</p>
            <p className="text-2xl font-bold text-blue-600">+12.1%</p>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Insights Principais</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-600">Ocupação Excelente</p>
                  <p className="text-sm text-muted-foreground">Bloco C atingiu 93% de ocupação</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-600">Receita em Alta</p>
                  <p className="text-sm text-muted-foreground">+12% comparado ao mês anterior</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <Users className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-600">Atenção Necessária</p>
                  <p className="text-sm text-muted-foreground">2 vendedores com pagamentos atrasados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}