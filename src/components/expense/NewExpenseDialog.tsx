// ========================================
// FILE: src/renderer/src/components/expense/NewExpenseDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
// import { createExpense, getExpenseCategories } from '@/helpers/expenses-helpers';
import { ICreateExpense } from '@/lib/types/expense';

interface NewExpenseDialogProps {
  onExpenseCreated: (expense: any) => void;
}

export default function NewExpenseDialog({ onExpenseCreated }: NewExpenseDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<ICreateExpense>({
    category_id: '',
    description: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    supplier: '',
  });

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  async function loadCategories() {
    // Mock temporário
    setCategories([
      { id: '1', name: 'Combustível', type: 'operational', color: '#10B981' },
      { id: '2', name: 'Manutenção', type: 'operational', color: '#F59E0B' },
      { id: '3', name: 'Seguro', type: 'operational', color: '#3B82F6' },
      { id: '4', name: 'Pedágio', type: 'operational', color: '#8B5CF6' },
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // const newExpense = await createExpense(formData);
      
      // Mock temporário
      const newExpense = {
        id: Math.random().toString(),
        ...formData,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      toast({
        title: 'Sucesso!',
        description: 'Despesa registrada com sucesso.',
      });
      onExpenseCreated(newExpense);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      category_id: '',
      description: '',
      amount: 0,
      expense_date: new Date().toISOString().split('T')[0],
      supplier: '',
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Despesa</DialogTitle>
          <DialogDescription>
            Adicione uma nova despesa ao sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Descrição *</Label>
              <Input
                placeholder="Ex: Pagamento de seguro anual"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Valor (Kz) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount / 100}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) * 100 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data da Despesa *</Label>
              <Input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input
                placeholder="Nome do fornecedor"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Informações adicionais..."
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
              {isLoading ? 'Registrando...' : 'Registrar Despesa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}