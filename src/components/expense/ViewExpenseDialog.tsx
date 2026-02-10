// ========================================
// FILE: src/components/expense/ViewExpenseDialog.tsx (BUG CORRIGIDO)
// ========================================
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { DollarSign, Calendar, CreditCard, FileText, Truck, User, Tag, AlertCircle } from 'lucide-react';
import { useExpenses } from '@/contexts/ExpensesContext';

interface ViewExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewExpenseDialog({ open, onOpenChange }: ViewExpenseDialogProps) {
  const { t } = useTranslation();
  const { state: { selectedExpense } } = useExpenses();

  // ✨ Funções auxiliares (DENTRO do componente, mas ANTES do early return)
  function isOverdue(): boolean {
    if (!selectedExpense) return false;
    if (selectedExpense.status === 'paid' || selectedExpense.status === 'cancelled') return false;
    if (!selectedExpense.due_date) return false;
    return new Date(selectedExpense.due_date) < new Date();
  }

  function getDaysOverdue(): number | null {
    if (!selectedExpense) return null;
    if (!isOverdue() || !selectedExpense.due_date) return null;
    const diff = new Date().getTime() - new Date(selectedExpense.due_date).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getStatusBadge() {
    if (!selectedExpense) return null;
    
    if (isOverdue()) {
      const days = getDaysOverdue();
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          {t('expenses:status.overdue.label')}
          {days && ` (${t('expenses:info.daysOverdue', { days, plural: days > 1 ? 's' : '' })})`}
        </Badge>
      );
    }

    const map = {
      pending: { label: t('expenses:status.pending.label'), className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      paid: { label: t('expenses:status.paid.label'), className: 'bg-green-50 text-green-700 border-green-200' },
      cancelled: { label: t('expenses:status.cancelled.label'), className: 'bg-gray-50 text-gray-600 border-gray-200' },
    };
    const status = map[selectedExpense.status as keyof typeof map] || map.pending;
    return <Badge variant="outline" className={status.className}>{status.label}</Badge>;
  }

  // ✅ EARLY RETURN DEPOIS DAS FUNÇÕES
  if (!selectedExpense || !open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            {t('expenses:dialogs.view.title')}
          </DialogTitle>
          <DialogDescription>
            {t('expenses:dialogs.view.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{selectedExpense.description}</h3>
                <div className="flex items-center gap-2">
                  {selectedExpense.category_color && (
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: selectedExpense.category_color }} 
                    />
                  )}
                  <span className="text-sm text-muted-foreground">{selectedExpense.category_name}</span>
                </div>
              </div>
              {getStatusBadge()}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t('expenses:fields.amount')}</p>
              <p className="text-3xl font-bold">{selectedExpense.amount.toLocaleString('pt-PT')} Kz</p>
            </div>
          </div>

          {/* Informações da Despesa */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t('expenses:dialogs.view.expenseInfo')}
            </h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('expenses:fields.expenseDate')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedExpense.expense_date).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {selectedExpense.due_date && (
                <div className={`flex items-start gap-3 p-3 border rounded-lg ${isOverdue() ? 'border-red-200 bg-red-50' : ''}`}>
                  <Calendar className={`w-5 h-5 mt-0.5 ${isOverdue() ? 'text-red-600' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('expenses:fields.dueDate')}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedExpense.due_date).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {selectedExpense.vehicle_license && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t('expenses:fields.vehicle')}</p>
                    <p className="text-sm text-muted-foreground">{selectedExpense.vehicle_license}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações de Pagamento */}
          {(selectedExpense.payment_date || selectedExpense.payment_method) && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t('expenses:dialogs.view.paymentInfo')}
                </h4>
                <div className="grid gap-3">
                  {selectedExpense.payment_date && (
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{t('expenses:fields.paymentDate')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedExpense.payment_date).toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedExpense.payment_method && (
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{t('expenses:fields.paymentMethod')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t(`expenses:paymentMethods.${selectedExpense.payment_method}`)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Informações Adicionais */}
          {(selectedExpense.supplier || selectedExpense.document_number || selectedExpense.notes) && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('expenses:dialogs.view.additionalInfo')}
                </h4>
                <div className="space-y-3">
                  {selectedExpense.supplier && (
                    <div>
                      <p className="text-sm font-medium mb-1">{t('expenses:fields.supplier')}</p>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {selectedExpense.supplier}
                      </p>
                    </div>
                  )}

                  {selectedExpense.document_number && (
                    <div>
                      <p className="text-sm font-medium mb-1">{t('expenses:fields.documentNumber')}</p>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded font-mono">
                        {selectedExpense.document_number}
                      </p>
                    </div>
                  )}

                  {selectedExpense.notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">{t('expenses:fields.notes')}</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded whitespace-pre-wrap">
                        {selectedExpense.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}