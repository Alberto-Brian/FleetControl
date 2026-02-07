// ========================================
// FILE: src/components/driver/EditDriverDialog.tsx
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
import { updateDriver as updateDriverHelper } from '@/helpers/driver-helpers';
import { IUpdateDriver } from '@/lib/types/driver';
import { useDrivers } from '@/contexts/DriversContext';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, UserX, Truck, Ban, MapPin } from 'lucide-react';

interface EditDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDriverDialog({ open, onOpenChange }: EditDriverDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedDriver }, updateDriver } = useDrivers();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IUpdateDriver>({});

  useEffect(() => {
    if (open && selectedDriver) {
      setFormData({
        name: selectedDriver.name,
        phone: selectedDriver.phone || '',
        email: selectedDriver.email || '',
        tax_id: selectedDriver.tax_id || '',
        id_number: selectedDriver.id_number || '',
        birth_date: selectedDriver.birth_date || '',
        address: selectedDriver.address || '',
        city: selectedDriver.city || '',
        state: selectedDriver.state || '',
        postal_code: selectedDriver.postal_code || '',
        license_number: selectedDriver.license_number,
        license_category: selectedDriver.license_category,
        license_expiry_date: selectedDriver.license_expiry_date,
        hire_date: selectedDriver.hire_date || '',
        status: selectedDriver.status,
        availability: selectedDriver.availability,
        notes: selectedDriver.notes || '',
      });
    }
  }, [open, selectedDriver]);

  if (!selectedDriver) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await updateDriverHelper(selectedDriver!.id, formData);

      if (updated) {
        updateDriver(updated);
        showSuccess('drivers:toast.updateSuccess');
        onOpenChange(false);
      }
    } catch (error: any) {
      handleError(error, 'drivers:toast.updateError');
    } finally {
      setIsLoading(false);
    }
  }

  const statusOptions = [
    { value: 'active', label: t('drivers:status.active.label'), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { value: 'on_leave', label: t('drivers:status.on_leave.label'), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { value: 'terminated', label: t('drivers:status.terminated.label'), icon: UserX, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  ];

  const availabilityOptions = [
    { value: 'available', label: t('drivers:availability.available.label'), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { value: 'on_trip', label: t('drivers:availability.on_trip.label'), icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { value: 'offline', label: t('drivers:availability.offline.label'), icon: Ban, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('drivers:dialogs.edit.title')}</DialogTitle>
          <DialogDescription>
            {t('drivers:dialogs.edit.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Estados - Disponibilidade e Status */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-muted">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Estados do Motorista
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Availability */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {t('drivers:fields.availability')} *
                </Label>
                <Select
                  value={formData.availability || ''}
                  onValueChange={(value: any) => setFormData({ ...formData, availability: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className={cn("w-4 h-4", option.color)} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('drivers:availability.' + (formData.availability || 'offline') + '.description')}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {t('drivers:fields.status')} *
                </Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className={cn("w-4 h-4", option.color)} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('drivers:status.' + (formData.status || 'active') + '.description')}
                </p>
              </div>
            </div>

            {/* Preview dos estados selecionados */}
            <div className="flex gap-3 pt-2">
              <div className={cn(
                "flex-1 p-3 rounded-lg border-2 flex items-center gap-3",
                availabilityOptions.find(o => o.value === formData.availability)?.bg,
                availabilityOptions.find(o => o.value === formData.availability)?.border
              )}>
                {availabilityOptions.find(o => o.value === formData.availability)?.icon && 
                  React.createElement(availabilityOptions.find(o => o.value === formData.availability)!.icon, {
                    className: cn("w-5 h-5", availabilityOptions.find(o => o.value === formData.availability)?.color)
                  })
                }
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Disponibilidade</p>
                  <p className={cn("font-bold text-sm", availabilityOptions.find(o => o.value === formData.availability)?.color)}>
                    {availabilityOptions.find(o => o.value === formData.availability)?.label}
                  </p>
                </div>
              </div>

              <div className={cn(
                "flex-1 p-3 rounded-lg border-2 flex items-center gap-3",
                statusOptions.find(o => o.value === formData.status)?.bg,
                statusOptions.find(o => o.value === formData.status)?.border
              )}>
                {statusOptions.find(o => o.value === formData.status)?.icon && 
                  React.createElement(statusOptions.find(o => o.value === formData.status)!.icon, {
                    className: cn("w-5 h-5", statusOptions.find(o => o.value === formData.status)?.color)
                  })
                }
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Estado</p>
                  <p className={cn("font-bold text-sm", statusOptions.find(o => o.value === formData.status)?.color)}>
                    {statusOptions.find(o => o.value === formData.status)?.label}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t('drivers:dialogs.view.personalInfo')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">{t('drivers:fields.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">{t('drivers:fields.taxId')}</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id || ''}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_number">{t('drivers:fields.idNumber')}</Label>
                <Input
                  id="id_number"
                  value={formData.id_number || ''}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">{t('drivers:fields.birthDate')}</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date || ''}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Contactos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t('drivers:dialogs.view.contactInfo')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('drivers:fields.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('drivers:fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">{t('drivers:fields.address')}</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t('drivers:fields.city')}</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">{t('drivers:fields.state')}</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Carta de Condução */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t('drivers:dialogs.view.licenseInfo')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_number">{t('drivers:fields.licenseNumber')} *</Label>
                <Input
                  id="license_number"
                  value={formData.license_number || ''}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_category">{t('drivers:fields.licenseCategory')} *</Label>
                <Select
                  value={formData.license_category || ''}
                  onValueChange={(value) => setFormData({ ...formData, license_category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">{t('drivers:categories.A')}</SelectItem>
                    <SelectItem value="B">{t('drivers:categories.B')}</SelectItem>
                    <SelectItem value="C">{t('drivers:categories.C')}</SelectItem>
                    <SelectItem value="D">{t('drivers:categories.D')}</SelectItem>
                    <SelectItem value="E">{t('drivers:categories.E')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_expiry">{t('drivers:fields.licenseExpiryDate')} *</Label>
                <Input
                  id="license_expiry"
                  type="date"
                  value={formData.license_expiry_date || ''}
                  onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">{t('drivers:fields.hireDate')}</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date || ''}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('drivers:fields.notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('drivers:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('drivers:actions.updating') : t('drivers:actions.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}