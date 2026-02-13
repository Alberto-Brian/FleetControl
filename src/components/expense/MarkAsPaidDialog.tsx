// ========================================
// FILE: src/components/expense/MarkAsPaidDialog.tsx (BUG CORRIGIDO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  Landmark, 
  FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markAsPaid as markAsPaidHelper } from '@/helpers/expense-helpers';
import { PaymentData } from '@/lib/types/expense';
import { useExpenses } from '@/contexts/ExpensesContext';

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'expenses:paymentMethods.cash', icon: Banknote, color: 'text-green-600' },
  { value: 'card', label: 'expenses:paymentMethods.card', icon: CreditCard, color: 'text-blue-600' },
  { value: 'transfer', label: 'expenses:paymentMethods.transfer', icon: Landmark, color: 'text-purple-600' },
  { value: 'other', label: 'expenses:paymentMethods.other', icon: FileText, color: 'text-pink-600' },
];

export default function MarkAsPaidDialog({ open, onOpenChange }: MarkAsPaidDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedExpense }, updateExpense } = useExpenses();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
  });

  // ✅ useEffect SEMPRE executado (antes do early return)
  useEffect(() => {
    if (open) {
      setPaymentData({
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
      });
    }
  }, [open]);

  // ✅ EARLY RETURN DEPOIS DO useEffect
  if (!selectedExpense) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await markAsPaidHelper(selectedExpense!.id, paymentData);
      
      updateExpense(updated);
      showSuccess('expenses:toast.markAsPaidSuccess');
      onOpenChange(false);
    } catch (error: any) {
      handleError(error, 'expenses:toast.markAsPaidError');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            {t('expenses:dialogs.markAsPaid.title')}
          </DialogTitle>
          <DialogDescription>
            {t('expenses:dialogs.markAsPaid.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resumo da Despesa */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground">{t('expenses:fields.description')}</p>
                <p className="font-medium">{selectedExpense.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-muted-foreground">{t('expenses:fields.amount')}</p>
              <p className="text-xl font-bold">{selectedExpense.amount.toLocaleString('pt-PT')} Kz</p>
            </div>
          </div>

          {/* Data de Pagamento */}
          <div className="space-y-2">
            <Label>{t('expenses:fields.paymentDate')} *</Label>
            <Input
              type="date"
              value={paymentData.payment_date}
              onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
              required
              autoFocus
            />
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label>{t('expenses:fields.paymentMethod')} *</Label>
            <Select
              value={paymentData.payment_method}
              onValueChange={(value) => setPaymentData({ ...paymentData, payment_method: value as any })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={t('expenses:placeholders.paymentMethod')} />
              </SelectTrigger>
              <SelectContent>
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", method.color)} />
                      {t(method.label)}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isLoading ? t('expenses:actions.markingAsPaid') : t('expenses:actions.markAsPaid')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}