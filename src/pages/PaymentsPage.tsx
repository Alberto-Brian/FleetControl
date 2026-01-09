import React from 'react';
import PaymentRow from '@/components/PaymentRow';

const mockPayments = [
  { seller: 'João Silva', block: 'A', space: 'Contentor 01', status: 'Pago' as const, amount: 15000, date: '03/01/2026' },
  { seller: 'Maria Santos', block: 'B', space: 'Bancada 05', status: 'Pendente' as const, amount: 2500, date: '06/01/2026' },
  { seller: 'Carlos Mendes', block: 'C', space: 'Contentor 12', status: 'Pago' as const, amount: 18000, date: '02/01/2026' },
  { seller: 'Ana Costa', block: 'A', space: 'Casota 02', status: 'Atrasado' as const, amount: 8000, date: '30/12/2025' },
  { seller: 'Pedro Alves', block: 'D', space: 'Bancada 03', status: 'Pago' as const, amount: 2500, date: '05/01/2026' },
  { seller: 'Sofia Lima', block: 'E', space: 'Contentor 08', status: 'Pendente' as const, amount: 16000, date: '07/01/2026' },
  { seller: 'Miguel Fernandes', block: 'B', space: 'Casota 01', status: 'Atrasado' as const, amount: 9000, date: '28/12/2025' },
  { seller: 'Isabel Rodrigues', block: 'C', space: 'Bancada 12', status: 'Pago' as const, amount: 2500, date: '04/01/2026' },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestão de Pagamentos</h2>
          <p className="text-muted-foreground">Controle de pagamentos e cobranças</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors font-medium">
            Filtrar
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
            + Registrar Pagamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-500/10 backdrop-blur-sm rounded-xl border border-green-500/20 p-4">
          <p className="text-sm text-green-600 mb-1">Pagamentos Recebidos</p>
          <p className="text-2xl font-bold text-green-600">245.000 AOA</p>
          <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
        </div>
        <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl border border-yellow-500/20 p-4">
          <p className="text-sm text-yellow-600 mb-1">Pagamentos Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">82.500 AOA</p>
          <p className="text-xs text-muted-foreground mt-1">A vencer esta semana</p>
        </div>
        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20 p-4">
          <p className="text-sm text-red-600 mb-1">Pagamentos Atrasados</p>
          <p className="text-2xl font-bold text-red-600">34.000 AOA</p>
          <p className="text-xs text-muted-foreground mt-1">Requer ação</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Lista de Pagamentos</h3>
          <span className="text-sm text-muted-foreground">{mockPayments.length} registros</span>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {mockPayments.map((payment, idx) => (
            <PaymentRow key={idx} payment={payment} />
          ))}
        </div>
      </div>
    </div>
  );
}