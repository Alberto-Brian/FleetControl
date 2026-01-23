// src/components/maintenance/StartMaintenanceDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Play } from 'lucide-react';
import { updateMaintenance } from '@/helpers/maintenance-helpers';
import { useToast } from '@/components/ui/use-toast';

interface StartMaintenanceDialogProps {
  maintenanceId: string;
  vehicleLicense: string;
  categoryName: string;
  onMaintenanceStarted: () => void;
}

export default function StartMaintenanceDialog({
  maintenanceId,
  vehicleLicense,
  categoryName,
  onMaintenanceStarted,
}: StartMaintenanceDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');

  async function handleStartMaintenance() {
    if (!diagnosis.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, adicione um diagnóstico inicial',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateMaintenance(maintenanceId, {
        status: 'in_progress',
        diagnosis: diagnosis.trim(),
        work_order_number: workOrderNumber.trim() || undefined,
      });

      toast({
        title: 'Sucesso',
        description: 'Manutenção iniciada com sucesso',
      });

      setOpen(false);
      setDiagnosis('');
      setWorkOrderNumber('');
      onMaintenanceStarted();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao iniciar manutenção',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Play className="w-4 h-4 mr-2" />
          Iniciar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Manutenção</DialogTitle>
          <DialogDescription>
            Inicie a manutenção para {vehicleLicense} - {categoryName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="work-order">
              Número da Ordem de Serviço <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="work-order"
              placeholder="Ex: OS-2025-001"
              value={workOrderNumber}
              onChange={(e) => setWorkOrderNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">
              Diagnóstico Inicial <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="diagnosis"
              placeholder="Descreva o diagnóstico inicial e os trabalhos a serem realizados..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleStartMaintenance} disabled={isLoading}>
            {isLoading ? 'Iniciando...' : 'Iniciar Manutenção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}