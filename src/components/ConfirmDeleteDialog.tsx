// ========================================
// FILE: src/renderer/src/components/ConfirmDeleteDialog.tsx
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
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
}

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Tem certeza?',
  description,
  itemName,
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  const { t } = useTranslation();
  const tTitle = title || t('common:confirmDelete.title', { defaultValue: 'Tem certeza?' });
  const defaultDescription = description || (
    itemName
      ? t('common:confirmDelete.defaultWithItem', {
          itemName,
          defaultValue: `Esta acção não pode ser desfeita. O registo "${itemName}" será marcado como excluído.`,
        })
      : t('common:confirmDelete.default', {
          defaultValue: 'Esta acção não pode ser desfeita. Este registo será marcado como excluído.',
        })
  );
  const cancelText = t('common:actions.cancel', { defaultValue: 'Cancelar' });
  const deleteText = isLoading
    ? t('common:actions.deleting', { defaultValue: 'Excluindo...' })
    : t('common:actions.delete', { defaultValue: 'Excluir' });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle>{tTitle}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
