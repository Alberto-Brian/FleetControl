// ========================================
// FILE: src/components/driver/UpdateDriverLicenseDialog.tsx (ATUALIZADO - SEM TEXTOS ESTÁTICOS)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { updateDriver as updateDriverHelper } from '@/helpers/driver-helpers';
import { useDrivers } from '@/contexts/DriversContext';
import { FileText, X, Save } from 'lucide-react';

interface UpdateDriverLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateDriverLicenseDialog({ open, onOpenChange }: UpdateDriverLicenseDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedDriver }, updateDriver } = useDrivers();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    license_number: '',
    license_category: '',
    license_expiry_date: '',
  });

  useEffect(() => {
    if (open && selectedDriver) {
      setFormData({
        license_number: selectedDriver.license_number,
        license_category: selectedDriver.license_category,
        license_expiry_date: selectedDriver.license_expiry_date,
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
          <DialogTitle>{t('drivers:dialogs.license.title')}</DialogTitle>
          <DialogDescription>
            {t('drivers:dialogs.license.description', { name: selectedDriver.name })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="license_number" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> {t('drivers:fields.licenseNumber')} *
            </Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value.toUpperCase() })}
              placeholder={t('drivers:placeholders.licenseNumber')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_category">{t('drivers:fields.licenseCategory')} *</Label>
              <Select
                value={formData.license_category}
                onValueChange={(value) => setFormData({ ...formData, license_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common:select')} />
                </SelectTrigger>
                <SelectContent>
                  {['A', 'B', 'C', 'D', 'E'].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat} - {t('drivers:categories.' + cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_expiry">{t('drivers:fields.licenseExpiryDate')} *</Label>
              <Input
                id="license_expiry"
                type="date"
                value={formData.license_expiry_date}
                onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
                required
              />
            </div>
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