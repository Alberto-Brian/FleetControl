// ========================================
// FILE: src/components/expense/EditExpenseDialog.tsx (BUG CORRIGIDO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { DollarSign, AlertCircle, Tag } from 'lucide-react';
import { updateExpense } from '@/helpers/expense-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import { getAllDrivers } from '@/helpers/driver-helpers';
import { IUpdateExpense } from '@/lib/types/expense';
import { useExpenses } from '@/contexts/ExpensesContext';

interface EditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditExpenseDialog({ open, onOpenChange }: EditExpenseDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { categories, selectedExpense }, updateExpense: updateInContext } = useExpenses();
  
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [formData, setFormData] = useState<IUpdateExpense>({
    category_id: '',
    description: '',
    amount: 0,
    expense_date: '',
  });

  // ✅ TODOS OS useEffect ANTES DO EARLY RETURN
  useEffect(() => {
    if (open && selectedExpense) {
      setFormData({
        category_id: selectedExpense.category_id,
        description: selectedExpense.description,
        amount: selectedExpense.amount,
        expense_date: selectedExpense.expense_date,
        vehicle_id: selectedExpense.vehicle_id || undefined,
        driver_id: selectedExpense.driver_id || undefined,
        due_date: selectedExpense.due_date || undefined,
        supplier: selectedExpense.supplier || '',
        document_number: selectedExpense.document_number || '',
        notes: selectedExpense.notes || '',
      });
      loadData();
    }
  }, [open, selectedExpense]);

  // ✅ EARLY RETURN DEPOIS DE TODOS OS HOOKS
  if (!selectedExpense) return null;

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
      const updated = await updateExpense(selectedExpense!.id, formData);
      
      if (updated) {
        updateInContext(updated);
        showSuccess('expenses:toast.updateSuccess');
        onOpenChange(false);
      }
    } catch (error: any) {
      handleError(error, 'expenses:toast.updateError');
    } finally {
      setIsLoading(false);
    }
  }

  const activeCategories = categories.filter(c => c.is_active);
  const selectedCategory = categories.find(c => c.id === formData.category_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t('expenses:dialogs.edit.title')}
          </DialogTitle>
          <DialogDescription>
            {t('expenses:dialogs.edit.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('expenses:fields.category')} *</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })} required>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {activeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('expenses:fields.description')} *</Label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('expenses:fields.amount')} (Kz) *</Label>
              <Input type="number" min="0" step="0.01" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} required />
            </div>
            <div className="space-y-2">
              <Label>{t('expenses:fields.expenseDate')} *</Label>
              <Input type="date" value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('expenses:fields.vehicle')}</Label>
              <Select value={formData.vehicle_id || 'none'} onValueChange={(value) => setFormData({ ...formData, vehicle_id: value === 'none' ? undefined : value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common:none')}</SelectItem>
                  {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.license_plate}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('expenses:fields.driver')}</Label>
              <Select value={formData.driver_id || 'none'} onValueChange={(value) => setFormData({ ...formData, driver_id: value === 'none' ? undefined : value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common:none')}</SelectItem>
                  {drivers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('expenses:fields.supplier')}</Label>
              <Input value={formData.supplier || ''} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('expenses:fields.documentNumber')}</Label>
              <Input value={formData.document_number || ''} onChange={(e) => setFormData({ ...formData, document_number: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('expenses:fields.dueDate')}</Label>
            <Input type="date" value={formData.due_date || ''} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>{t('expenses:fields.notes')}</Label>
            <Textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('expenses:actions.updating') : t('expenses:actions.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}