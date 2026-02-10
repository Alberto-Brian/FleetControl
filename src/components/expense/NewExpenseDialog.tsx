// ========================================
// FILE: src/components/expense/NewExpenseDialog.tsx (COMPLETO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { Plus, DollarSign, AlertCircle, Tag } from 'lucide-react';
import { createExpense } from '@/helpers/expense-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import { getAllDrivers } from '@/helpers/driver-helpers';
import { ICreateExpense } from '@/lib/types/expense';
import { useExpenses } from '@/contexts/ExpensesContext';

export default function NewExpenseDialog() {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { categories }, addExpense } = useExpenses();
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [formData, setFormData] = useState<ICreateExpense>({
    category_id: '',
    description: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    vehicle_id: undefined,
    driver_id: undefined,
    due_date: undefined,
    supplier: '',
    document_number: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  async function loadData() {
    try {
      const [vehiclesData, driversData] = await Promise.all([
        getAllVehicles(),
        getAllDrivers(),
      ]);
      setVehicles(vehiclesData.data.filter((v: any) => v.status !== 'inactive'));
      setDrivers(driversData.filter((d: any) => d.is_active === true));
    } catch (error) {
      handleError(error, 'common:errors.loadingData');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newExpense = await createExpense(formData);
      
      if (newExpense) {
        addExpense(newExpense); // ✨ Adiciona ao contexto
        showSuccess('expenses:toast.createSuccess');
        setOpen(false);
        resetForm();
      }
    } catch (error: any) {
      handleError(error, 'expenses:toast.createError');
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
      vehicle_id: undefined,
      driver_id: undefined,
      due_date: undefined,
      supplier: '',
      document_number: '',
      notes: '',
    });
  }

  const activeCategories = categories.filter(c => c.is_active);
  const selectedCategory = categories.find(c => c.id === formData.category_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('expenses:newExpense')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t('expenses:dialogs.new.title')}
          </DialogTitle>
          <DialogDescription>
            {t('expenses:dialogs.new.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Categoria */}
          <div className="space-y-2">
            <Label>{t('expenses:fields.category')} *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={t('expenses:placeholders.category')} />
              </SelectTrigger>
              <SelectContent>
                {activeCategories.length === 0 ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                    {t('expenses:alerts.noCategories')}
                  </div>
                ) : (
                  activeCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({t(`expenses:categoryTypes.${c.type}`)})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedCategory && selectedCategory.description && (
              <p className="text-xs text-muted-foreground">{selectedCategory.description}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>{t('expenses:fields.description')} *</Label>
            <Input
              placeholder={t('expenses:placeholders.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              autoFocus
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('expenses:fields.amount')} (Kz) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={t('expenses:placeholders.amount')}
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t('expenses:fields.expenseDate')} *</Label>
              <Input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Veículo e Motorista (opcionais) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('expenses:fields.vehicle')}</Label>
              <Select
                value={formData.vehicle_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, vehicle_id: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('expenses:placeholders.vehicle')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common:none')}</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="font-semibold">{v.license_plate}</span>
                      <span className="text-muted-foreground"> - </span>
                      <span>{v.brand} {v.model}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('expenses:fields.driver')}</Label>
              <Select
                value={formData.driver_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, driver_id: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('expenses:placeholders.driver')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common:none')}</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fornecedor e Nº Documento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('expenses:fields.supplier')}</Label>
              <Input
                placeholder={t('expenses:placeholders.supplier')}
                value={formData.supplier || ''}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('expenses:fields.documentNumber')}</Label>
              <Input
                placeholder={t('expenses:placeholders.documentNumber')}
                value={formData.document_number || ''}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
              />
            </div>
          </div>

          {/* Data de Vencimento */}
          <div className="space-y-2">
            <Label>{t('expenses:fields.dueDate')}</Label>
            <Input
              type="date"
              value={formData.due_date || ''}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>{t('expenses:fields.notes')}</Label>
            <Textarea
              placeholder={t('expenses:placeholders.notes')}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Resumo */}
          {formData.amount > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">{t('expenses:fields.amount')}:</p>
                  <p className="text-2xl font-bold text-primary">
                    {formData.amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                  </p>
                </div>
                {selectedCategory && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" style={{ color: selectedCategory.color }} />
                    <span className="text-sm font-medium">{selectedCategory.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || activeCategories.length === 0}>
              {isLoading ? t('expenses:actions.creating') : t('expenses:actions.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}