// ========================================
// FILE: src/components/driver/UpdateDriverContactDialog.tsx (ATUALIZADO - SEM TEXTOS ESTÁTICOS)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { updateDriver as updateDriverHelper } from '@/helpers/driver-helpers';
import { useDrivers } from '@/contexts/DriversContext';
import { Phone, Mail, MapPin, X, Save } from 'lucide-react';

interface UpdateDriverContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateDriverContactDialog({ open, onOpenChange }: UpdateDriverContactDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedDriver }, updateDriver } = useDrivers();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    if (open && selectedDriver) {
      setFormData({
        phone: selectedDriver.phone || '',
        email: selectedDriver.email || '',
        address: selectedDriver.address || '',
        city: selectedDriver.city || '',
      });
    }
  }, [open, selectedDriver]);

  if (!selectedDriver) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await updateDriverHelper(selectedDriver!.id, formData);
      if (updated) {
        updateDriver(updated);
        showSuccess(t('drivers:toast.updateSuccess'));
        onOpenChange(false);
      }
    } catch (error: any) {
      handleError(error, t('drivers:toast.updateError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('drivers:dialogs.contact.title')}</DialogTitle>
          <DialogDescription>
            {t('drivers:dialogs.contact.description', { name: selectedDriver.name })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> {t('drivers:fields.phone')}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t('drivers:placeholders.phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> {t('drivers:fields.email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('drivers:placeholders.email')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {t('drivers:fields.address')}
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t('drivers:placeholders.address')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t('drivers:fields.city')}</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder={t('drivers:placeholders.city')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              {t('common:cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('drivers:actions.updating')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {t('drivers:actions.save')}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}