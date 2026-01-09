import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus, Filter, Calendar } from 'lucide-react';

const transactions = [
  { id: '1', date: '07/01/2026', type: 'Receita', category: 'Pagamento Contentor', description: 'João Silva - Bloco A', amount: 15000, status: 'Confirmado', method: 'Transferência' },
  { id: '2', date: '07/01/2026', type: 'Despesa', category: 'Manutenção', description: 'Reparo Contentor 04', amount: -3500, status: 'Pago', method: 'Dinheiro' },
  { id: '3', date: '06/01/2026', type: 'Receita', category: 'Pagamento Bancada', description: 'Maria Santos - Bloco B', amount: 2500, status: 'Confirmado', method: 'Dinheiro' },
  { id: '4', date: '05/01/2026', type: 'Receita', category: 'Pagamento Contentor', description: 'Carlos Mendes - Bloco C', amount: 18000, status: 'Confirmado', method: 'Transferência' },
  { id: '5', date: '05/01/2026', type: 'Despesa', category: 'Serviços', description: 'Limpeza Geral', amount: -8000, status: 'Pago', method: 'Transferência' },
  { id: '6', date: '04/01/2026', type: 'Receita', category: 'Pagamento Casota', description: 'Ana Costa - Bloco A', amount: 8000, status: 'Confirmado', method: 'Dinheiro' },
  { id: '7', date: '04/01/2026', type: 'Despesa', category: 'Utilities', description: 'Conta de Água', amount: -12000, status: 'Pendente', method: 'Transferência' },
  { id: '8', date: '03/01/2026', type: 'Receita', category: 'Pagamento Bancada', description: 'Pedro Alves - Bloco D', amount: 2500, status: 'Confirmado', method: 'Dinheiro' },
  { id: '9', date: '03/01/2026', type: 'Receita', category: 'Pagamento Contentor', description: 'Sofia Lima - Bloco E', amount: 16000, status: 'Confirmado', method: 'Transferência' },
  { id: '10', date: '02/01/2026', type: 'Despesa', category: 'Segurança', description: 'Serviço de Vigilância', amount: -15000, status: 'Pago', method: 'Transferência' },
];

const monthlyData = [
  { month: 'Janeiro', income: 450000, expenses: 85000, profit: 365000 },
  { month: 'Dezembro', income: 425000, expenses: 92000, profit: 333000 },
  { month: 'Novembro', income: 438000, expenses: 78000, profit: 360000 },
  { month: 'Outubro', income: 412000, expenses: 81000, profit: 331000 },
];

const categories = [
  { name: 'Pagamentos Contentores', amount: 285000, percentage: 63, type: 'income' },
  { name: 'Pagamentos Bancadas', amount: 80000, percentage: 18, type: 'income' },
  { name: 'Pagamentos Casotas', amount: 68000, percentage: 15, type: 'income' },
  { name: 'Manutenção', amount: -35000, percentage: 41, type: 'expense' },
  { name: 'Serviços', amount: -25000, percentage: 29, type: 'expense' },
  { name: 'Utilities', amount: -25000, percentage: 29, type: 'expense' },
];

export default function FinancialPage() {
  const [filterType, setFilterType] = useState('Todas');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [viewMode, setViewMode] = useState('transactions');

  const filteredTransactions = transactions.filter(t => {
    const matchType = filterType === 'Todas' || t.type === filterType;
    const matchCategory = filterCategory === 'Todas' || t.category === filterCategory;
    return matchType && matchCategory;
  });

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const balance = totalIncome - totalExpenses;
  const currentMonth = monthlyData[0];
  const margin = Math.round((balance / totalIncome) * 100);

  const uniqueCategories = ['Todas', ...new Set(transactions.map(t => t.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestão Financeira</h2>
          <p className="text-muted-foreground">Controle financeiro e fluxo de caixa</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-500/10 backdrop-blur-sm rounded-xl border border-green-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-600">Receitas</p>
            <ArrowUpRight className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()} AOA</p>
          <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
        </div>
        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-600">Despesas</p>
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} AOA</p>
          <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
        </div>
        <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-600">Saldo</p>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{balance.toLocaleString()} AOA</p>
          <p className="text-xs text-muted-foreground mt-1">Lucro líquido</p>
        </div>
        <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-600">Margem</p>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{margin}%</p>
          <p className="text-xs text-muted-foreground mt-1">Lucro sobre receita</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('transactions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'transactions' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            Transações
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            Resumo Mensal
          </button>
          <button
            onClick={() => setViewMode('categories')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'categories' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            Por Categoria
          </button>
        </div>
      </div>

      {viewMode === 'transactions' && (
        <>
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
              <button
                onClick={() => setFilterType('Todas')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
                  filterType === 'Todas' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType('Receita')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
                  filterType === 'Receita' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                Receitas
              </button>
              <button
                onClick={() => setFilterType('Despesa')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
                  filterType === 'Despesa' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                Despesas
              </button>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                {uniqueCategories.map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Transações Recentes ({filteredTransactions.length})</h3>
              <div className="text-sm text-muted-foreground">
                {filteredTransactions.filter(t => t.amount > 0).length} receitas • {filteredTransactions.filter(t => t.amount < 0).length} despesas
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        transaction.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {transaction.amount > 0 ? (
                          <ArrowUpRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{transaction.date}</span>
                          <span>•</span>
                          <span>{transaction.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} AOA
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          transaction.status === 'Confirmado' ? 'bg-green-500/10 text-green-600' : 
                          'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === 'monthly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">Resumo Mensal</h3>
            <div className="space-y-3">
              {monthlyData.map((data, idx) => (
                <div key={idx} className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  idx === 0 ? 'border-primary bg-primary/5' : 'border-border bg-background/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{data.month}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((data.profit / data.income) * 100)}% margem
                      </p>
                    </div>
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Receita</p>
                      <p className="font-bold text-green-600">{Math.round(data.income/1000)}K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Despesa</p>
                      <p className="font-bold text-red-600">{Math.round(data.expenses/1000)}K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Lucro</p>
                      <p className="font-bold text-primary">{Math.round(data.profit/1000)}K</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Análise do Mês - {currentMonth.month}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div>
                    <p className="text-sm text-green-600 mb-1">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">{currentMonth.income.toLocaleString()} AOA</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div>
                    <p className="text-sm text-red-600 mb-1">Despesa Total</p>
                    <p className="text-2xl font-bold text-red-600">{currentMonth.expenses.toLocaleString()} AOA</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Lucro Líquido</p>
                    <p className="text-2xl font-bold text-blue-600">{currentMonth.profit.toLocaleString()} AOA</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Crescimento</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                  <span className="text-sm">vs Mês Anterior</span>
                  <span className="text-sm font-bold text-green-600">+9.6%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                  <span className="text-sm">vs Mesmo Período 2025</span>
                  <span className="text-sm font-bold text-green-600">+15.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">Receitas por Categoria</h3>
            <div className="space-y-4">
              {categories.filter(c => c.type === 'income').map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <span className="text-sm font-bold text-green-600">{cat.amount.toLocaleString()} AOA</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 rounded-full h-2 transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.percentage}% do total</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">Despesas por Categoria</h3>
            <div className="space-y-4">
              {categories.filter(c => c.type === 'expense').map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <span className="text-sm font-bold text-red-600">{cat.amount.toLocaleString()} AOA</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-red-500 rounded-full h-2 transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.percentage}% do total</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}