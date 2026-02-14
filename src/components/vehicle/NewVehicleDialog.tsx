// ========================================
// FILE: src/components/vehicle/NewVehicleDialog.tsx (ATUALIZADO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { createVehicle } from '@/helpers/vehicle-helpers';
import { getAllVehicleCategories } from '@/helpers/vehicle-category-helpers';
import { ICreateVehicle } from '@/lib/types/vehicle';
import { useVehicles } from '@/contexts/VehiclesContext';

export default function NewVehicleDialog() {
  const { showSuccess, handleError } = useErrorHandler();
  const { t } = useTranslation();
  
  const { addVehicle } = useVehicles();
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<ICreateVehicle>({
    category_id: '',
    license_plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    current_mileage: 0,
  });

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  async function loadCategories() {
    setIsLoading(true);
    try {
      const cats = await getAllVehicleCategories();
      setCategories(cats);
    } catch (error: any) {
      handleError(error, t('vehicles:errors.errorLoadingCategories'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newVehicle = await createVehicle(formData);
      
      if (newVehicle) {
        addVehicle(newVehicle);
        showSuccess(t('vehicles:toast.createSuccess'));
        setOpen(false);
        resetForm();
      }
    } catch (error: any) {
      handleError(error, t('vehicles:toast.createError'));
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      category_id: '',
      license_plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      current_mileage: 0,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('vehicles:actions.create')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('vehicles:dialogs.new.title')}</DialogTitle>
          <DialogDescription>
            {t('vehicles:dialogs.new.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t('vehicles:fields.category')} *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value: string) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('vehicles:placeholders.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate">{t('vehicles:fields.licensePlate')} *</Label>
              <Input
                id="license_plate"
                placeholder={t('vehicles:placeholders.licensePlate')}
                value={formData.license_plate}
                onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">{t('vehicles:fields.brand')} *</Label>
              <Input
                id="brand"
                placeholder={t('vehicles:placeholders.brand')}
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">{t('vehicles:fields.model')} *</Label>
              <Input
                id="model"
                placeholder={t('vehicles:placeholders.model')}
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">{t('vehicles:fields.year')} *</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">{t('vehicles:fields.color')}</Label>
              <Input
                id="color"
                placeholder={t('vehicles:placeholders.color')}
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">{t('vehicles:fields.mileage')}</Label>
              <Input
                id="mileage"
                type="number"
                min="0"
                value={formData.current_mileage}
                onChange={(e) => setFormData({ ...formData, current_mileage: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('vehicles:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('vehicles:actions.creating') : t('vehicles:actions.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}