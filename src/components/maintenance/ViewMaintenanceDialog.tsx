// src/components/maintenance/ViewMaintenanceDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, DollarSign, FileText, Wrench, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ViewMaintenanceDialogProps {
  maintenance: any;
}

export default function ViewMaintenanceDialog({ maintenance }: ViewMaintenanceDialogProps) {
  function getPriorityBadge(priority: string) {
    const map = {
      low: { label: 'Baixa', variant: 'outline' as const },
      normal: { label: 'Normal', variant: 'secondary' as const },
      high: { label: 'Alta', variant: 'destructive' as const },
      urgent: { label: 'Urgente', variant: 'destructive' as const },
    };
    const p = map[priority as keyof typeof map] || map.normal;
    return <Badge variant={p.variant}>{p.label}</Badge>;
  }

  function getStatusBadge(status: string) {
    const map = {
      scheduled: { label: 'Agendada', variant: 'outline' as const },
      in_progress: { label: 'Em Andamento', variant: 'secondary' as const },
      completed: { label: 'Concluída', variant: 'default' as const },
      cancelled: { label: 'Cancelada', variant: 'outline' as const },
    };
    const s = map[status as keyof typeof map] || map.scheduled;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes da Manutenção</DialogTitle>
          <DialogDescription>
            Informações completas sobre a manutenção
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
            <div> 
              <h3 className="text-xl font-semibold mb-2">{maintenance.category_name}</h3>
              <p className="text-sm text-muted-foreground">
                {maintenance.vehicle_license} - {maintenance.vehicle_brand} {maintenance.vehicle_model}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant={maintenance.type === 'preventive' ? 'default' : 'secondary'}>
                  {maintenance.type === 'preventive' ? 'Preventiva' : 'Correctiva'}
                </Badge>
                {getPriorityBadge(maintenance.priority)}
                {getStatusBadge(maintenance.status)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold">{maintenance.total_cost.toLocaleString('pt-AO')} Kz</p>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Data de Entrada</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(maintenance.entry_date).toLocaleDateString('pt-AO', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            {maintenance.exit_date && (
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Data de Saída</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(maintenance.exit_date).toLocaleDateString('pt-AO', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Custos */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Custos
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Peças</p>
                <p className="text-lg font-semibold">{maintenance.parts_cost.toLocaleString('pt-AO')} Kz</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Mão de Obra</p>
                <p className="text-lg font-semibold">{maintenance.labor_cost.toLocaleString('pt-AO')} Kz</p>
              </div>
              <div className="p-3 border rounded-lg bg-primary/5">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{maintenance.total_cost.toLocaleString('pt-AO')} Kz</p>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="space-y-4">
            {maintenance.workshop_name && (
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Oficina</p>
                  <p className="text-sm text-muted-foreground">{maintenance.workshop_name}</p>
                </div>
              </div>
            )}

            {maintenance.work_order_number && (
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Ordem de Serviço</p>
                  <p className="text-sm text-muted-foreground">{maintenance.work_order_number}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Wrench className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Quilometragem</p>
                <p className="text-sm text-muted-foreground">{maintenance.vehicle_mileage.toLocaleString('pt-AO')} km</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Descrições */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Descrição</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {maintenance.description || 'Sem descrição'}
              </p>
            </div>

            {maintenance.diagnosis && (
              <div>
                <h4 className="font-semibold mb-2">Diagnóstico</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {maintenance.diagnosis}
                </p>
              </div>
            )}

            {maintenance.solution && (
              <div>
                <h4 className="font-semibold mb-2">Solução Aplicada</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {maintenance.solution}
                </p>
              </div>
            )}

            {maintenance.notes && (
              <div>
                <h4 className="font-semibold mb-2">Observações</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {maintenance.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}