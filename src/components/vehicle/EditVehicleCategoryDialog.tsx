// ========================================
// FILE: src/components/vehicle/EditVehicleCategoryDialog.tsx (ATUALIZADO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { Tag } from 'lucide-react';
import { updateVehicleCategory } from '@/helpers/vehicle-category-helpers';
import { useVehicles } from '@/contexts/VehiclesContext';
import { IUpdateVehicleCategory } from '@/lib/types/vehicle-category';

interface EditVehicleCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditVehicleCategoryDialog({ 
  open, 
  onOpenChange 
}: EditVehicleCategoryDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedCategory }, updateCategory } = useVehicles();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IUpdateVehicleCategory>({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  const colorOptions = [
    { value: '#3b82f6', label: t('common:colors.blue') },
    { value: '#10b981', label: t('common:colors.green') },
    { value: '#f59e0b', label: t('common:colors.amber') },
    { value: '#ef4444', label: t('common:colors.red') },
    { value: '#8b5cf6', label: t('common:colors.purple') },
    { value: '#ec4899', label: t('common:colors.pink') },
    { value: '#06b6d4', label: t('common:colors.cyan') },
    { value: '#f97316', label: t('common:colors.orange') },
  ];

  useEffect(() => {
    if (open && selectedCategory) {
      setFormData({
        name: selectedCategory.name,
        description: selectedCategory.description || '',
        color: selectedCategory.color,
      });
    }
  }, [open, selectedCategory]);

  if (!selectedCategory) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await updateVehicleCategory(selectedCategory!.id, formData);

      if (updated) {
        updateCategory(updated);
        showSuccess(t('vehicles:toast.categoryUpdateSuccess'));
        onOpenChange(false);
      }
    } catch (error) {
      handleError(error, t('vehicles:toast.categoryUpdateError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            {t('vehicles:categories.edit')}
          </DialogTitle>
          <DialogDescription>
            {t('vehicles:categories.editDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  {t('vehicles:categories.name')} *
                </Label>
                <Input
                  id="name"
                  placeholder={t('vehicles:placeholders.categoryName')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  {t('vehicles:fields.description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('vehicles:placeholders.categoryDescription')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color" className="text-sm font-semibold">
                  {t('vehicles:fields.color')} ({t('common:optional')})
                </Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-border" 
                            style={{ backgroundColor: option.value }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('vehicles:categories.colorHint')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t('common:preview')}</Label>
                <div className="p-6 bg-muted/50 rounded-xl border-2 border-dashed border-muted">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div 
                      className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center transition-all"
                      style={{ backgroundColor: `${formData.color}15` }}
                    >
                      <Tag className="w-10 h-10" style={{ color: formData.color }} />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {formData.name || t('vehicles:categories.namePlaceholder')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.description || t('vehicles:categories.descriptionPlaceholder')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full border">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: formData.color }}
                      />
                      <span className="text-xs font-mono font-semibold">{formData.color}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>{t('common:tip')}:</strong> {t('vehicles:categories.colorTip')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('vehicles:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('vehicles:actions.updating') : t('vehicles:actions.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}