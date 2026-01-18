// ========================================
// FILE: src/renderer/src/components/driver/NewDriverDialog.tsx
// ========================================
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { createDriver } from '@/helpers/driver-helpers';
import { ICreateDriver } from '@/lib/types/driver';

interface NewDriverDialogProps {
  onDriverCreated: (driver: any) => void;
}

export default function NewDriverDialog({ onDriverCreated }: NewDriverDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateDriver>({
    name: '',
    phone: '',
    email: '',
    license_number: '',
    license_category: 'B',
    license_expiry_date: '',
    hire_date: new Date().toISOString().split('T')[0],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newDriver = await createDriver(formData);
      
      // Mock temporário
      // const newDriver = {
      //   id: Math.random().toString(),
      //   ...formData,
      //   status: 'active',
      //   created_at: new Date().toISOString(),
      // };

      if (newDriver) {
        toast({
          title: 'Sucesso!',
          description: 'Motorista criado com sucesso.',
        });
        onDriverCreated(newDriver);
        setOpen(false);
        resetForm();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar motorista',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      phone: '',
      email: '',
      license_number: '',
      license_category: 'B',
      license_expiry_date: '',
      hire_date: new Date().toISOString().split('T')[0],
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Motorista
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Motorista</DialogTitle>
          <DialogDescription>
            Preencha os dados do motorista abaixo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+244 923 456 789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">Número da CNH *</Label>
              <Input
                id="license_number"
                placeholder="CNH123456"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_category">Categoria CNH *</Label>
              <Select
                value={formData.license_category}
                onValueChange={(value) => setFormData({ ...formData, license_category: value })}
                required
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
              <Label htmlFor="license_expiry">Validade CNH *</Label>
              <Input
                id="license_expiry"
                type="date"
                value={formData.license_expiry_date}
                onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hire_date">Data de Admissão</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações adicionais..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Motorista'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}