// ========================================
// FILE: src/components/driver/EditDriverDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { updateDriver } from '@/helpers/driver-helpers';
import { IUpdateDriver } from '@/lib/types/driver';

interface EditDriverDialogProps {
  driver: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDriverUpdated: (driver: any) => void;
}

export default function EditDriverDialog({ driver, open, onOpenChange, onDriverUpdated }: EditDriverDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IUpdateDriver>({});

  useEffect(() => {
    if (open && driver) {
      setFormData({
        name: driver.name,
        phone: driver.phone || '',
        email: driver.email || '',
        license_number: driver.license_number,
        license_category: driver.license_category,
        license_expiry_date: driver.license_expiry_date,
        hire_date: driver.hire_date,
        status: driver.status,
        notes: driver.notes || '',
      });
    }
  }, [open, driver]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await updateDriver(driver.id, formData);

      if (updated) {
        toast({
          title: 'Sucesso!',
          description: 'Motorista atualizado com sucesso.',
        });
        onDriverUpdated(updated);
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar motorista',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Motorista</DialogTitle>
          <DialogDescription>
            Atualize os dados do motorista {driver?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">Número da CNH</Label>
              <Input
                id="license_number"
                value={formData.license_number || ''}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_category">Categoria CNH</Label>
              <Select
                value={formData.license_category || ''}
                onValueChange={(value) => setFormData({ ...formData, license_category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - Motos</SelectItem>
                  <SelectItem value="B">B - Carros</SelectItem>
                  <SelectItem value="AB">AB - Motos e Carros</SelectItem>
                  <SelectItem value="C">C - Veículos de Carga</SelectItem>
                  <SelectItem value="D">D - Transporte de Passageiros</SelectItem>
                  <SelectItem value="E">E - Combinação de Veículos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_expiry">Validade CNH</Label>
              <Input
                id="license_expiry"
                type="date"
                value={formData.license_expiry_date || ''}
                onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hire_date">Data de Admissão</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date || ''}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="on_leave">Afastado</SelectItem>
                  <SelectItem value="terminated">Demitido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}