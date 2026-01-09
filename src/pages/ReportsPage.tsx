import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const weeklyReports = [
  { 
    week: 'Semana 1 (01-07 Jan)', 
    collected: 245000, 
    pending: 82500, 
    overdue: 34000, 
    spaces: 56, 
    occupancy: 92,
    sellers: [
      { name: 'João Silva', status: 'paid', amount: 15000 },
      { name: 'Maria Santos', status: 'pending', amount: 2500 },
      { name: 'Carlos Mendes', status: 'paid', amount: 18000 },
      { name: 'Ana Costa', status: 'overdue', amount: 8000 },
    ]
  },
  { 
    week: 'Semana 4 (22-28 Dez)', 
    collected: 238000, 
    pending: 65000, 
    overdue: 28000, 
    spaces: 56, 
    occupancy: 91,
    sellers: [
      { name: 'Pedro Alves', status: 'paid', amount: 2500 },
      { name: 'Sofia Lima', status: 'paid', amount: 16000 },
      { name: 'Miguel Fernandes', status: 'overdue', amount: 9000 },
    ]
  },
  { 
    week: 'Semana 3 (15-21 Dez)', 
    collected: 252000, 
    pending: 71000, 
    overdue: 19000, 
    spaces: 55, 
    occupancy: 89,
    sellers: []
  },
  { 
    week: 'Semana 2 (08-14 Dez)', 
    collected: 229000, 
    pending: 88000, 
    overdue: 42000, 
    spaces: 54, 
    occupancy: 87,
    sellers: []
  },
];

const blockReports = [
  { 
    block: 'A', 
    spaces: 23, 
    occupied: 21, 
    revenue: 89000, 
    pending: 15000, 
    occupancy: 91,
    sellers: [
      { name: 'João Silva', status: 'paid', space: 'Contentor 01' },
      { name: 'Ana Costa', status: 'overdue', space: 'Casota 02' },
    ]
  },
  { 
    block: 'B', 
    spaces: 18, 
    occupied: 16, 
    revenue: 67000, 
    pending: 22000, 
    occupancy: 89,
    sellers: [
      { name: 'Maria Santos', status: 'pending', space: 'Bancada 05' },
      { name: 'Miguel Fernandes', status: 'overdue', space: 'Casota 01' },
    ]
  },
  { 
    block: 'C', 
    spaces: 29, 
    occupied: 27, 
    revenue: 125000, 
    pending: 18000, 
    occupancy: 93,
    sellers: [
      { name: 'Carlos Mendes', status: 'paid', space: 'Contentor 12' },
      { name: 'Isabel Rodrigues', status: 'paid', space: 'Bancada 12' },
    ]
  },
  { 
    block: 'D', 
    spaces: 15, 
    occupied: 13, 
    revenue: 54000, 
    pending: 12000, 
    occupancy: 87,
    sellers: [
      { name: 'Pedro Alves', status: 'paid', space: 'Bancada 03' },
    ]
  },
  { 
    block: 'E', 
    spaces: 21, 
    occupied: 19, 
    revenue: 98000, 
    pending: 15500, 
    occupancy: 90,
    sellers: [
      { name: 'Sofia Lima', status: 'paid', space: 'Contentor 08' },
    ]
  },
];

const paymentTypes = [
  { type: 'Contentores - Semanal', count: 45, collected: 285000, pending: 48000, percentage: 86 },
  { type: 'Bancadas - Diário', count: 32, collected: 80000, pending: 12000, percentage: 87 },
  { type: 'Casotas - Semanal', count: 13, collected: 68000, pending: 22500, percentage: 75 },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('weekly');
  const [selectedWeek, setSelectedWeek] = useState<typeof weeklyReports[0] | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<typeof blockReports[0] | null>(null);

  const totalRevenue = blockReports.reduce((sum, b) => sum + b.revenue, 0);
  const totalPending = blockReports.reduce((sum, b) => sum + b.pending, 0);
  const avgOccupancy = Math.round(blockReports.reduce((sum, b) => sum + b.occupancy, 0) / blockReports.length);
  const totalOverdue = weeklyReports[0].overdue;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Relatórios</h2>
          <p className="text-muted-foreground">Análise detalhada de pagamentos e ocupação</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Imprimir
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-500/10 backdrop-blur-sm rounded-xl border border-green-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-600">Receita Total</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} AOA</p>
          <p className="text-xs text-green-600 mt-1">+12% vs semana anterior</p>
        </div>
        <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl border border-yellow-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-yellow-600">Valores Pendentes</p>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{totalPending.toLocaleString()} AOA</p>
          <p className="text-xs text-yellow-600 mt-1">-8% vs semana anterior</p>
        </div>
        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-600">Pagamentos Atrasados</p>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{totalOverdue.toLocaleString()} AOA</p>
          <p className="text-xs text-red-600 mt-1">Requer ação imediata</p>
        </div>
        <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-600">Taxa de Ocupação</p>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{avgOccupancy}%</p>
          <p className="text-xs text-blue-600 mt-1">Média dos blocos</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setReportType('weekly');
              setSelectedBlock(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportType === 'weekly' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Relatório Semanal
          </button>
          <button
            onClick={() => {
              setReportType('blocks');
              setSelectedWeek(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportType === 'blocks' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Relatório por Bloco
          </button>
          <button
            onClick={() => {
              setReportType('payment');
              setSelectedWeek(null);
              setSelectedBlock(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportType === 'payment' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Tipos de Pagamento
          </button>
        </div>
      </div>

      {reportType === 'weekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Histórico Semanal</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {weeklyReports.map((report, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedWeek(report)}
                  className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${
                    selectedWeek?.week === report.week ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{report.week}</h4>
                        <p className="text-sm text-muted-foreground">{report.occupancy}% de ocupação</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Recebido</p>
                      <p className="font-bold text-green-600">{report.collected.toLocaleString()} AOA</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Pendente</p>
                      <p className="font-bold text-yellow-600">{report.pending.toLocaleString()} AOA</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Atrasado</p>
                      <p className="font-bold text-red-600">{report.overdue.toLocaleString()} AOA</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Espaços</p>
                      <p className="font-bold">{report.spaces}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedWeek && (
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Detalhes - {selectedWeek.week}</h3>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-600 mb-1">Total Arrecadado</p>
                  <p className="text-3xl font-bold text-green-600">{selectedWeek.collected.toLocaleString()} AOA</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-600 mb-1">Pendente</p>
                    <p className="text-lg font-bold text-yellow-600">{selectedWeek.pending.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-600 mb-1">Atrasado</p>
                    <p className="text-lg font-bold text-red-600">{selectedWeek.overdue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedWeek.sellers.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Vendedores Destacados</h4>
                  <div className="space-y-2">
                    {selectedWeek.sellers.map((seller, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                        <div className="flex items-center gap-2">
                          {seller.status === 'paid' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {seller.status === 'pending' && <Clock className="w-4 h-4 text-yellow-600" />}
                          {seller.status === 'overdue' && <AlertCircle className="w-4 h-4 text-red-600" />}
                          <span className="text-sm font-medium">{seller.name}</span>
                        </div>
                        <span className="text-sm font-bold">{seller.amount.toLocaleString()} AOA</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {reportType === 'blocks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Desempenho por Bloco</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {blockReports.map((report) => (
                <div 
                  key={report.block}
                  onClick={() => setSelectedBlock(report)}
                  className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${
                    selectedBlock?.block === report.block ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">{report.block}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Bloco {report.block}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.occupied}/{report.spaces} espaços ocupados
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{report.occupancy}%</p>
                      <p className="text-xs text-muted-foreground">Ocupação</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Receita</p>
                      <p className="font-bold text-green-600">{report.revenue.toLocaleString()} AOA</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Pendente</p>
                      <p className="font-bold text-yellow-600">{report.pending.toLocaleString()} AOA</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedBlock && (
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Detalhes - Bloco {selectedBlock.block}</h3>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-primary mb-1">Ocupação</p>
                    <p className="text-3xl font-bold text-primary">{selectedBlock.occupancy}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-600 mb-1">Receita</p>
                    <p className="text-2xl font-bold text-green-600">{Math.round(selectedBlock.revenue/1000)}K</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total de Espaços</span>
                    <span className="font-bold">{selectedBlock.spaces}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Ocupados</span>
                    <span className="font-bold text-green-600">{selectedBlock.occupied}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Disponíveis</span>
                    <span className="font-bold text-blue-600">{selectedBlock.spaces - selectedBlock.occupied}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Vendedores Ativos</h4>
                <div className="space-y-2">
                  {selectedBlock.sellers.map((seller, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                      <div>
                        <p className="text-sm font-medium">{seller.name}</p>
                        <p className="text-xs text-muted-foreground">{seller.space}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        seller.status === 'paid' ? 'bg-green-500/10 text-green-600' :
                        seller.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {seller.status === 'paid' ? 'Pago' :
                         seller.status === 'pending' ? 'Pendente' : 'Atrasado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {reportType === 'payment' && (
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Análise por Tipo de Pagamento</h3>
          </div>
          <div className="p-4 space-y-4">
            {paymentTypes.map((payment, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-background/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{payment.type}</h4>
                    <p className="text-sm text-muted-foreground">{payment.count} espaços</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{payment.percentage}%</p>
                    <p className="text-xs text-muted-foreground">Taxa de cobrança</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Arrecadado</p>
                    <p className="font-bold text-green-600">{payment.collected.toLocaleString()} AOA</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pendente</p>
                    <p className="font-bold text-yellow-600">{payment.pending.toLocaleString()} AOA</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 rounded-full h-2 transition-all"
                    style={{ width: `${payment.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}