// src/pages/MaintenancePage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Wrench, Plus, AlertCircle, Search, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import NewMaintenanceDialog from '@/components/maintenance/NewMaintenceDialog';
import NewWorkshopDialog from '@/components/workshop/NewWorkshopDialog';
import { getAllMaintenances } from '@/helpers/maintenance-helpers';

export default function MaintenancePage() {
  const { toast } = useToast();
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMaintenances();
  }, []);

  async function loadMaintenances() {
    setIsLoading(true);
    try {
      const data = await getAllMaintenances();
      setMaintenances(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar manutenções',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredMaintenances = maintenances.filter(m =>
    m.vehicle_license?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const inProgress = maintenances.filter(m => m.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Manutenções</h2>
          <p className="text-muted-foreground">
            {inProgress} manutenç{inProgress !== 1 ? 'ões' : 'ão'} em andamento
          </p>
        </div>
        <div className="flex gap-2">
          <NewWorkshopDialog onWorkshopCreated={() => {
            toast({ title: 'Sucesso!', description: 'Oficina registada com sucesso.' });
          }} />
          <NewMaintenanceDialog onMaintenanceCreated={(maintenance) => {
            setMaintenances([maintenance, ...maintenances]);
          }} />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por veículo ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMaintenances.map((maintenance) => (
            <Card key={maintenance.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    maintenance.type === 'preventive' ? 'bg-blue-100 dark:bg-blue-950' : 'bg-orange-100 dark:bg-orange-950'
                  }`}>
                    <Wrench className={`w-5 h-5 ${
                      maintenance.type === 'preventive' ? 'text-blue-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{maintenance.category_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {maintenance.vehicle_license} ({maintenance.vehicle_brand} {maintenance.vehicle_model})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Entrada: {new Date(maintenance.entry_date).toLocaleDateString('pt-AO')}
                      {maintenance.exit_date && ` • Saída: ${new Date(maintenance.exit_date).toLocaleDateString('pt-AO')}`}
                    </p>
                    {maintenance.workshop_name && (
                      <div className="flex items-center gap-1 mt-1">
                        <Settings className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{maintenance.workshop_name}</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant={maintenance.type === 'preventive' ? 'default' : 'secondary'}>
                        {maintenance.type === 'preventive' ? 'Preventiva' : 'Correctiva'}
                      </Badge>
                      {getPriorityBadge(maintenance.priority)}
                      {getStatusBadge(maintenance.status)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Custo Total</p>
                  <p className="text-lg font-bold">{maintenance.total_cost.toLocaleString('pt-AO')} Kz</p>
                </div>
              </div>

              {maintenance.status === 'in_progress' && (
                <div className="flex items-center gap-2 p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Manutenção em andamento</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}