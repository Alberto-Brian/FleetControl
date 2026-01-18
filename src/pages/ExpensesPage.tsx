// ========================================
// FILE: src/pages/ExpensesPage.tsx
// ========================================
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, TrendingUp } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses] = useState([
    { id: '1', category: 'Combustível', amount: 9000, date: '2025-01-16', status: 'paid' },
    { id: '2', category: 'Manutenção', amount: 45000, date: '2025-01-12', status: 'paid' },
    { id: '3', category: 'Pedágio', amount: 2500, date: '2025-01-15', status: 'paid' },
    { id: '4', category: 'Seguro', amount: 125000, date: '2025-01-10', status: 'pending' },
  ]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Despesas</h2>
          <p className="text-muted-foreground">Controle financeiro da frota</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total do Mês</p>
              <p className="text-2xl font-bold">{(totalExpenses / 100).toLocaleString('pt-AO')} Kz</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Despesas Pagas</p>
              <p className="text-2xl font-bold">{(paidExpenses / 100).toLocaleString('pt-AO')} Kz</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">
                {((totalExpenses - paidExpenses) / 100).toLocaleString('pt-AO')} Kz
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Card key={expense.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{expense.category}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(expense.date).toLocaleDateString('pt-AO')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold">{(expense.amount / 100).toLocaleString('pt-AO')} Kz</p>
                <Badge variant={expense.status === 'paid' ? 'default' : 'secondary'}>
                  {expense.status === 'paid' ? 'Paga' : 'Pendente'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}