// ========================================
// FILE: src/components/fine/MarkAsPaidDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { markFineAsPaid } from '@/helpers/fine-helpers';
import { PayFineData } from '@/lib/types/fine';
import { useFines } from '@/contexts/FinesContext';

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MarkAsPaidDialog({ open, onOpenChange }: MarkAsPaidDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedFine }, updateFine } = useFines();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PayFineData>({
    payment_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (open) {
      setPaymentData({
        payment_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [open]);

  if (!selectedFine) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await markFineAsPaid(selectedFine!.id, paymentData);
      updateFine(updated);
      showSuccess('fines:toast.markAsPaidSuccess');
      onOpenChange(false);
    } catch (error: any) {
      handleError(error, 'fines:toast.markAsPaidError');
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
            {t('fines:dialogs.markAsPaid.title')}
          </DialogTitle>
          <DialogDescription>
            {t('fines:dialogs.markAsPaid.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">{t('fines:fields.fineNumber')}</p>
              <p className="font-mono font-bold">{selectedFine.fine_number}</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">{t('fines:fields.infractionType')}</p>
              <p className="font-medium">{selectedFine.infraction_type}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">{t('fines:fields.vehicle')}</p>
              <p className="font-medium">{selectedFine.vehicle_license}</p>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t('fines:fields.fineAmount')}</p>
                <p className="text-2xl font-bold text-red-600 font-mono">
                  {selectedFine.fine_amount.toLocaleString('pt-PT')} Kz
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-date" className="text-sm font-medium">
              {t('fines:fields.paymentDate')}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentData.payment_date}
              onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-700 dark:text-green-400">
                {t('fines:info.markAsPaidInfo')}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isLoading ? t('fines:actions.markAsPaid') + '...' : t('fines:actions.markAsPaid')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}