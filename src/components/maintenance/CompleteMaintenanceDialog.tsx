// src/components/maintenance/CompleteMaintenanceDialog.tsx
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
import { CheckCircle2 } from 'lucide-react';
import { completeMaintenance } from '@/helpers/maintenance-helpers';
import { useToast } from '@/components/ui/use-toast';

interface CompleteMaintenanceDialogProps {
  maintenanceId: string;
  vehicleLicense: string;
  categoryName: string;
  currentStatus: string;
  currentPartsCost?: number;
  currentLaborCost?: number;
  onMaintenanceCompleted: () => void;
}

export default function CompleteMaintenanceDialog({
  maintenanceId,
  vehicleLicense,
  categoryName,
  currentStatus,
  currentPartsCost = 0,
  currentLaborCost = 0,
  onMaintenanceCompleted,
}: CompleteMaintenanceDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [solution, setSolution] = useState('');
  const [partsCost, setPartsCost] = useState(currentPartsCost.toString());
  const [laborCost, setLaborCost] = useState(currentLaborCost.toString());

  async function handleCompleteMaintenance() {
    if (!solution.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, descreva a solução aplicada',
        variant: 'destructive',
      });
      return;
    }

    // Se estiver agendada e não tiver diagnóstico, é necessário
    if (currentStatus === 'scheduled' && !diagnosis.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, adicione o diagnóstico',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await completeMaintenance(maintenanceId, {
        diagnosis: diagnosis.trim() || undefined,
        solution: solution.trim(),
        parts_cost: parseFloat(partsCost) || 0,
        labor_cost: parseFloat(laborCost) || 0,
      });

      toast({
        title: 'Sucesso',
        description: 'Manutenção concluída com sucesso',
      });

      setOpen(false);
      resetForm();
      onMaintenanceCompleted();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao concluir manutenção',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setDiagnosis('');
    setSolution('');
    setPartsCost('0');
    setLaborCost('0');
  }

  const totalCost = (parseFloat(partsCost) || 0) + (parseFloat(laborCost) || 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Concluir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Concluir Manutenção</DialogTitle>
          <DialogDescription>
            Finalize a manutenção para {vehicleLicense} - {categoryName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentStatus === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="diagnosis">
                Diagnóstico <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="diagnosis"
                placeholder="Descreva o diagnóstico realizado..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="solution">
              Solução Aplicada <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="solution"
              placeholder="Descreva os trabalhos realizados e soluções aplicadas..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parts-cost">Custo de Peças (Kz)</Label>
              <Input
                id="parts-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={partsCost}
                onChange={(e) => setPartsCost(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor-cost">Custo de Mão de Obra (Kz)</Label>
              <Input
                id="labor-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Custo Total:</span>
              <span className="text-2xl font-bold">{totalCost.toLocaleString('pt-AO')} Kz</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleCompleteMaintenance} disabled={isLoading}>
            {isLoading ? 'Concluindo...' : 'Concluir Manutenção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}