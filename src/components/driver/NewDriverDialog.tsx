// ========================================
// FILE: src/components/driver/NewDriverDialog.tsx (ATUALIZADO)
// ========================================
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { createDriver } from '@/helpers/driver-helpers';
import { ICreateDriver } from '@/lib/types/driver';
import { useDrivers } from '@/contexts/DriversContext';

export default function NewDriverDialog() {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { addDriver } = useDrivers(); // ✨ Usa contexto
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateDriver>({
    name: '',
    phone: '',
    email: '',
    license_number: '',
    license_category: 'B',
    license_expiry_date: '',
    hire_date: new Date().toISOString().split('T')[0],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newDriver = await createDriver(formData);
      
      if (newDriver) {
        addDriver(newDriver); // ✨ Adiciona ao contexto
        showSuccess('drivers:toast.createSuccess');
        setOpen(false);
        resetForm();
      }
    } catch (error: any) {
      handleError(error, 'drivers:toast.createError');
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      phone: '',
      email: '',
      tax_id: '',
      id_number: '',
      birth_date: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      license_number: '',
      license_category: 'B',
      license_expiry_date: '',
      hire_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('drivers:newDriver')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('drivers:dialogs.new.title')}</DialogTitle>
          <DialogDescription>
            {t('drivers:dialogs.new.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t('drivers:dialogs.view.personalInfo')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">{t('drivers:fields.name')} *</Label>
                <Input
                  id="name"
                  placeholder={t('drivers:placeholders.name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">{t('drivers:fields.taxId')}</Label>
                <Input
                  id="tax_id"
                  placeholder={t('drivers:placeholders.taxId')}
                  value={formData.tax_id || ''}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_number">{t('drivers:fields.idNumber')}</Label>
                <Input
                  id="id_number"
                  placeholder={t('drivers:placeholders.idNumber')}
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
                  placeholder={t('drivers:placeholders.phone')}
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('drivers:fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('drivers:placeholders.email')}
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">{t('drivers:fields.address')}</Label>
                <Input
                  id="address"
                  placeholder={t('drivers:placeholders.address')}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t('drivers:fields.city')}</Label>
                <Input
                  id="city"
                  placeholder={t('drivers:placeholders.city')}
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">{t('drivers:fields.state')}</Label>
                <Input
                  id="state"
                  placeholder={t('drivers:placeholders.state')}
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
                  placeholder={t('drivers:placeholders.licenseNumber')}
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_category">{t('drivers:fields.licenseCategory')} *</Label>
                <Select
                  value={formData.license_category}
                  onValueChange={(value) => setFormData({ ...formData, license_category: value })}
                  required
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
                  value={formData.license_expiry_date}
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
              placeholder={t('drivers:placeholders.notes')}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('drivers:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('drivers:actions.creating') : t('drivers:actions.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}