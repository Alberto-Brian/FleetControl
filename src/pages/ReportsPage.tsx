// ========================================
// FILE: src/pages/ReportsPage.tsx
// ========================================
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Download, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    { id: '1', name: 'Relatório de Veículos', description: 'Listagem completa de veículos' },
    { id: '2', name: 'Relatório de Viagens', description: 'Histórico de viagens do mês' },
    { id: '3', name: 'Relatório de Abastecimentos', description: 'Consumo e custos de combustível' },
    { id: '4', name: 'Relatório de Manutenções', description: 'Manutenções realizadas e agendadas' },
    { id: '5', name: 'Relatório Financeiro', description: 'Resumo de despesas e custos' },
    { id: '6', name: 'Relatório Geral', description: 'Resumo de todas ocorrências' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Relatórios</h2>
        <p className="text-muted-foreground">Gere relatórios detalhados da sua frota</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{report.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Selecionar Período
                  </Button>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Gerar PDF
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}