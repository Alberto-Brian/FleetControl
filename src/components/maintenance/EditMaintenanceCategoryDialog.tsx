// ========================================
// FILE: src/components/maintenance/EditMaintenanceCategoryDialog.tsx
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
import { Tag } from 'lucide-react';
import { updateMaintenanceCategory } from '@/helpers/maintenance-category-helpers';
import { IUpdateMaintenanceCategory } from '@/lib/types/maintenance_category';
import { useMaintenances } from '@/contexts/MaintenancesContext';

interface EditMaintenanceCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: any | null;
}

// Listas estáticas — Select normal é suficiente
const CATEGORY_TYPES = [
  { value: 'preventive', label: 'maintenances:type.preventive.label' },
  { value: 'corrective', label: 'maintenances:type.corrective.label' },
];

const COLORS = [
  { value: '#EF4444', label: 'maintenances:categories.colors.red' },
  { value: '#F59E0B', label: 'maintenances:categories.colors.orange' },
  { value: '#10B981', label: 'maintenances:categories.colors.green' },
  { value: '#3B82F6', label: 'maintenances:categories.colors.blue' },
  { value: '#8B5CF6', label: 'maintenances:categories.colors.purple' },
  { value: '#EC4899', label: 'maintenances:categories.colors.pink' },
  { value: '#6B7280', label: 'maintenances:categories.colors.gray' },
];

export default function EditMaintenanceCategoryDialog({
  open,
  onOpenChange,
  category,
}: EditMaintenanceCategoryDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { updateCategory } = useMaintenances();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IUpdateMaintenanceCategory>({
    name: '',
    type: 'corrective',
    description: '',
    color: '#F59E0B',
    is_active: true,
  });

  // Preenche o formulário quando a categoria muda
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        type: category.type || 'corrective',
        description: category.description || '',
        color: category.color || '#F59E0B',
        is_active: category.is_active ?? true,
      });
    }
  }, [category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    setIsLoading(true);

    try {
      const updated = await updateMaintenanceCategory(category.id, formData);
      updateCategory(updated);
      showSuccess('maintenances:toast.categoryUpdateSuccess');
      onOpenChange(false);
    } catch (error: any) {
      handleError(error, 'maintenances:toast.categoryUpdateError');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            {t('maintenances:dialogs.editCategory.title', 'Editar Categoria')}
          </DialogTitle>
          <DialogDescription>
            {t('maintenances:dialogs.editCategory.description', 'Altere os dados da categoria seleccionada.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label>{t('maintenances:fields.categoryName')} *</Label>
            <Input
              placeholder={t('maintenances:placeholders.categoryName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>{t('maintenances:fields.categoryType')} *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              required
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {t(type.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label>{t('maintenances:fields.categoryColor')}</Label>
            <Select
              value={formData.color}
              onValueChange={(value) => setFormData({ ...formData, color: value })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.value }} />
                      {t(color.label)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado activo/inactivo */}
          <div className="space-y-2">
            <Label>{t('common:status.label', 'Estado')}</Label>
            <Select
              value={formData.is_active ? 'active' : 'inactive'}
              onValueChange={(v) => setFormData({ ...formData, is_active: v === 'active' })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('common:status.active', 'Activa')}</SelectItem>
                <SelectItem value="inactive">{t('common:status.inactive', 'Inactiva')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>{t('maintenances:fields.categoryDescription')}</Label>
            <Textarea
              placeholder={t('maintenances:placeholders.categoryDescription')}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Pré-visualização */}
          <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.color }} />
            <span className="text-sm font-medium">
              {formData.name || t('maintenances:fields.categoryName')}
            </span>
            {formData.type && (
              <span className="text-xs text-muted-foreground ml-auto">
                ({t(`maintenances:type.${formData.type}.label`)})
              </span>
            )}
            <span className={`text-xs ml-1 ${formData.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
              • {formData.is_active ? t('common:status.active', 'Activa') : t('common:status.inactive', 'Inactiva')}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common:actions.saving', 'A guardar...') : t('common:actions.save', 'Guardar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}