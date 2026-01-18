// src/components/workshop/NewWorkshopDialog.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Wrench } from 'lucide-react';
import { createWorkshop } from '@/helpers/workshop-helpers';
import { ICreateWorkshop } from '@/lib/types/workshop';

interface NewWorkshopDialogProps {
  onWorkshopCreated?: (workshop: any) => void;
}

export default function NewWorkshopDialog({ onWorkshopCreated }: NewWorkshopDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateWorkshop>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    specialties: '',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newWorkshop = await createWorkshop(formData);
      
      toast({
        title: 'Sucesso!',
        description: 'Oficina registada com sucesso.',
      });
      
      if (onWorkshopCreated) {
        onWorkshopCreated(newWorkshop);
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registar oficina',
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
      address: '',
      city: '',
      specialties: '',
      notes: '',
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Oficina
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Registar Oficina
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da oficina mecânica
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label>Nome da Oficina *</Label>
            <Input
              placeholder="Ex: Oficina Central"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Telefone e Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                type="tel"
                placeholder="Ex: 923 456 789"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Ex: oficina@exemplo.com"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Endereço e Cidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                placeholder="Ex: Rua da Missão, 123"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                placeholder="Ex: Luanda"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          {/* Especialidades */}
          <div className="space-y-2">
            <Label>Especialidades</Label>
            <Input
              placeholder="Ex: Mecânica geral, Elétrica, Funilaria"
              value={formData.specialties || ''}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Informações adicionais sobre a oficina..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registando...' : 'Registar Oficina'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}