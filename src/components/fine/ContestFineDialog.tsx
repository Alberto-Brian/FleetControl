// ========================================
// FILE: src/components/fine/ContestFineDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { Scale, AlertCircle, FileText } from 'lucide-react';
import { updateFine } from '@/helpers/fine-helpers';
import { useFines } from '@/contexts/FinesContext';

interface ContestFineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContestFineDialog({ open, onOpenChange }: ContestFineDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedFine }, updateFine: updateFineContext } = useFines();
  
  const [isLoading, setIsLoading] = useState(false);
  const [contestData, setContestData] = useState({
    contest_date: new Date().toISOString().split('T')[0],
    contest_reason: '',
    contest_documents: '',
    notes: '',
  });

  // ✅ useEffect ANTES do early return
  useEffect(() => {
    if (open) {
      setContestData({
        contest_date: new Date().toISOString().split('T')[0],
        contest_reason: '',
        contest_documents: '',
        notes: selectedFine?.notes || '',
      });
    }
  }, [open, selectedFine]);

  // ✅ Early return DEPOIS do useEffect
  if (!selectedFine) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!contestData.contest_reason.trim()) {
      handleError(new Error('Motivo da contestação é obrigatório'), 'Preencha o motivo da contestação');
      return;
    }

    setIsLoading(true);

    try {
      // Atualiza o status para 'contested' e adiciona os dados da contestação às notas
      const contestNotes = `
═══════════════════════════════════════
📋 RECURSO/CONTESTAÇÃO
═══════════════════════════════════════
📅 Data: ${new Date(contestData.contest_date).toLocaleDateString('pt-PT')}

📝 Motivo:
${contestData.contest_reason}

${contestData.contest_documents ? `📎 Documentos Anexados:\n${contestData.contest_documents}\n\n` : ''}
${contestData.notes ? `💬 Observações:\n${contestData.notes}` : ''}
═══════════════════════════════════════
      `.trim();

      const updated = await updateFine(selectedFine!.id, {
        status: 'contested',
        notes: `${selectedFine?.notes ? selectedFine.notes + '\n\n' : ''}${contestNotes}`,
      });
      
      updateFineContext(updated);
      showSuccess('fines:toast.contestSuccess');
      onOpenChange(false);
    } catch (error: any) {
      handleError(error, 'fines:toast.contestError');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-600" />
            {t('fines:dialogs.contest.title')}
          </DialogTitle>
          <DialogDescription>
            {t('fines:dialogs.contest.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resumo da Multa */}
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
                <p className="text-xl font-bold text-red-600 font-mono">
                  {selectedFine.fine_amount.toLocaleString('pt-PT')} Kz
                </p>
              </div>
            </div>
          </div>

          {/* Data do Recurso */}
          <div className="space-y-2">
            <Label htmlFor="contest-date" className="text-sm font-medium">
              Data do Recurso
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="contest-date"
              type="date"
              value={contestData.contest_date}
              onChange={(e) => setContestData({ ...contestData, contest_date: e.target.value })}
              required
              autoFocus
            />
          </div>

          {/* Motivo da Contestação */}
          <div className="space-y-2">
            <Label htmlFor="contest-reason" className="text-sm font-medium">
              <FileText className="w-4 h-4 inline mr-1" />
              Motivo da Contestação
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="contest-reason"
              placeholder="Descreva detalhadamente os motivos para contestar esta multa..."
              value={contestData.contest_reason}
              onChange={(e) => setContestData({ ...contestData, contest_reason: e.target.value })}
              rows={6}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Seja específico e objetivo. Inclua datas, horários, testemunhas e qualquer informação relevante.
            </p>
          </div>

          {/* Documentos Anexados */}
          <div className="space-y-2">
            <Label htmlFor="contest-documents" className="text-sm font-medium">
              Documentos Anexados (referência)
            </Label>
            <Textarea
              id="contest-documents"
              placeholder="Liste os documentos que serão anexados ao processo (fotos, vídeos, testemunhas, etc.)"
              value={contestData.contest_documents}
              onChange={(e) => setContestData({ ...contestData, contest_documents: e.target.value })}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Ex: Foto do local, Vídeo da câmera, Testemunho de João Silva
            </p>
          </div>

          {/* Observações Adicionais */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Observações Adicionais
            </Label>
            <Textarea
              id="notes"
              placeholder="Informações complementares..."
              value={contestData.notes}
              onChange={(e) => setContestData({ ...contestData, notes: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Alerta */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
                  Atenção
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  Ao confirmar, o status da multa será alterado para "Contestada". 
                  Guarde todos os comprovantes e documentos mencionados para apresentar quando solicitado.
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              <Scale className="w-4 h-4 mr-2" />
              {isLoading ? t('fines:actions.contest') + '...' : t('fines:actions.contest')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}