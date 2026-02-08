// src/components/workshop/EditWorkshopDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { updateWorkshop } from '@/helpers/workshop-helpers';
import { useMaintenances } from '@/contexts/MaintenancesContext';
import { Wrench } from 'lucide-react';

interface EditWorkshopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditWorkshopDialog({ open, onOpenChange }: EditWorkshopDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedWorkshop }, updateWorkshop: updateWorkshopContext } = useMaintenances();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    specialties: '',
    notes: '',
  });

  useEffect(() => {
    if (open && selectedWorkshop) {
      setFormData({
        name: selectedWorkshop.name || '',
        phone: selectedWorkshop.phone || '',
        email: selectedWorkshop.email || '',
        address: selectedWorkshop.address || '',
        city: selectedWorkshop.city || '',
        state: selectedWorkshop.state || '',
        specialties: selectedWorkshop.specialties || '',
        notes: selectedWorkshop.notes || '',
      });
    }
  }, [open, selectedWorkshop]);

  // ✅ EARLY RETURN
  if (!selectedWorkshop) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updated = await updateWorkshop(selectedWorkshop!.id, formData);
      updateWorkshopContext(updated);
      showSuccess('maintenances:workshops.toast.updateSuccess');
      onOpenChange(false);
    } catch (error) {
      handleError(error, 'maintenances:workshops.toast.updateError');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            {t('maintenances:workshops.dialogs.edit.title')}
          </DialogTitle>
          <DialogDescription>
            {t('maintenances:workshops.dialogs.edit.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('maintenances:workshops.fields.name')} *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('maintenances:workshops.fields.phone')}</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('maintenances:workshops.fields.email')}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('maintenances:workshops.fields.city')}</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('maintenances:workshops.fields.state')}</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('maintenances:workshops.fields.address')}</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('maintenances:workshops.fields.specialties')}</Label>
            <Input
              value={formData.specialties}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('maintenances:workshops.fields.notes')}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('maintenances:actions.updating') : t('maintenances:actions.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}