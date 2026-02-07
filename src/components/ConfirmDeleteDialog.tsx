// ========================================
// FILE: src/renderer/src/components/ConfirmDeleteDialog.tsx (ATUALIZADO)
// ========================================
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  warning?: string;
  itemName?: string;
  isLoading?: boolean;
  variant?: 'destructive' | 'warning';
}

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  warning,
  itemName,
  isLoading = false,
  variant = 'destructive',
}: ConfirmDeleteDialogProps) {
  const { t } = useTranslation();

  // Títulos padrão baseados na variante
  const defaultTitles = {
    destructive: t('common:confirmDelete.titleDestructive', { defaultValue: 'Confirmar Exclusão' }),
    warning: t('common:confirmDelete.titleWarning', { defaultValue: 'Atenção' }),
  };

  const tTitle = title || defaultTitles[variant];

  // Descrição padrão
  const defaultDescription = description || (
    itemName
      ? t('common:confirmDelete.descriptionWithItem', {
          itemName,
          defaultValue: `Tem certeza que deseja excluir "${itemName}"?`,
        })
      : t('common:confirmDelete.description', {
          defaultValue: 'Tem certeza que deseja realizar esta acção?',
        })
  );

  // Warning padrão
  const defaultWarning = warning || t('common:confirmDelete.warning', {
    defaultValue: 'Esta acção não pode ser desfeita.'
  });

  // Textos dos botões
  const cancelText = t('common:actions.cancel', { defaultValue: 'Cancelar' });
  const confirmText = isLoading
    ? t('common:actions.processing', { defaultValue: 'Processando...' })
    : variant === 'destructive'
      ? t('common:actions.delete', { defaultValue: 'Excluir' })
      : t('common:actions.confirm', { defaultValue: 'Confirmar' });

  const isDestructive = variant === 'destructive';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isDestructive ? "bg-destructive/10" : "bg-amber-100"
            )}>
              <AlertTriangle className={cn(
                "w-5 h-5",
                isDestructive ? "text-destructive" : "text-amber-600"
              )} />
            </div>
            <AlertDialogTitle className={cn(
              isDestructive ? "text-destructive" : "text-amber-700"
            )}>
              {tTitle}
            </AlertDialogTitle>
          </div>
          
          <AlertDialogDescription className="space-y-3">
            <p>{defaultDescription}</p>
            
            {defaultWarning && (
              <div className={cn(
                "flex items-start gap-2 p-3 rounded-lg text-sm",
                isDestructive 
                  ? "bg-destructive/5 text-destructive/90 border border-destructive/20"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              )}>
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{defaultWarning}</span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              isDestructive 
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-amber-600 text-white hover:bg-amber-700"
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}