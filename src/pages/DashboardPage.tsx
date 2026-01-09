import React from 'react';
import { Building2, MapPin, Users, DollarSign, Calendar } from 'lucide-react';
import StatCard from '@/components/StatCard';
import PaymentRow from '@/components/PaymentRow';

const mockBlocks = [
  { id: 'A', name: 'Bloco A', containers: 12, booths: 8, huts: 3 },
  { id: 'B', name: 'Bloco B', containers: 10, booths: 6, huts: 2 },
  { id: 'C', name: 'Bloco C', containers: 15, booths: 10, huts: 4 },
  { id: 'D', name: 'Bloco D', containers: 8, booths: 5, huts: 2 },
  { id: 'E', name: 'Bloco E', containers: 11, booths: 7, huts: 3 },
];

const mockPayments = [
  { seller: 'João Silva', block: 'A', space: 'Contentor 01', status: 'Pago' as const, amount: 15000, date: '03/01/2026' },
  { seller: 'Maria Santos', block: 'B', space: 'Bancada 05', status: 'Pendente' as const, amount: 2500, date: '06/01/2026' },
  { seller: 'Carlos Mendes', block: 'C', space: 'Contentor 12', status: 'Pago' as const, amount: 18000, date: '02/01/2026' },
  { seller: 'Ana Costa', block: 'A', space: 'Casota 02', status: 'Atrasado' as const, amount: 8000, date: '30/12/2025' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Sistema de Gestão</h2>
        <p className="text-muted-foreground">Visão geral do mercado e operações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Building2}
          title="Total de Blocos"
          value="5"
          subtitle="A, B, C, D, E"
          color="bg-blue-500"
        />
        <StatCard 
          icon={MapPin}
          title="Espaços Totais"
          value="56"
          subtitle="Contentores e Bancadas"
          color="bg-green-500"
        />
        <StatCard 
          icon={Users}
          title="Vendedores Ativos"
          value="42"
          subtitle="+5 este mês"
          color="bg-purple-500"
        />
        <StatCard 
          icon={DollarSign}
          title="Receita Mensal"
          value="850K"
          subtitle="AOA • Janeiro 2026"
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Pagamentos Recentes</h3>
            <button className="text-sm text-primary hover:underline">Ver todos</button>
          </div>
          <div className="space-y-1">
            {mockPayments.slice(0, 4).map((payment, idx) => (
              <PaymentRow key={idx} payment={payment} />
            ))}
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Status dos Blocos</h3>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {mockBlocks.map((block) => (
              <div key={block.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{block.id}</span>
                  </div>
                  <div>
                    <p className="font-medium">{block.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {block.containers + block.booths + block.huts} espaços
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">92%</p>
                  <p className="text-xs text-muted-foreground">Ocupação</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}