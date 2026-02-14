// ========================================
// FILE: src/components/vehicle/EditVehicleDialog.tsx (ATUALIZADO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { FileText, Wrench, DollarSign, StickyNote } from 'lucide-react';
import { updateVehicle as updateBdVehicle } from '@/helpers/vehicle-helpers';
import { getAllVehicleCategories } from '@/helpers/vehicle-category-helpers';
import { IUpdateVehicle } from '@/lib/types/vehicle';
import { useVehicles } from '@/contexts/VehiclesContext';

interface EditVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditVehicleDialog({ 
  open, 
  onOpenChange, 
}: EditVehicleDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: {selectedVehicle}, updateVehicle } = useVehicles()
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState<IUpdateVehicle>({
    category_id: '',
    license_plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    chassis_number: '',
    engine_number: '',
    fuel_tank_capacity: 0,
    acquisition_date: '',
    acquisition_value: 0,
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadCategories();
      setActiveTab('basic');
    }
  }, [open]);

  useEffect(() => {
    if (open && selectedVehicle && categories.length > 0) {
      setFormData({
        category_id: selectedVehicle.category_id || '',
        license_plate: selectedVehicle.license_plate || '',
        brand: selectedVehicle.brand || '',
        model: selectedVehicle.model || '',
        year: selectedVehicle.year || new Date().getFullYear(),
        color: selectedVehicle.color || '',
        chassis_number: selectedVehicle.chassis_number || '',
        engine_number: selectedVehicle.engine_number || '',
        fuel_tank_capacity: selectedVehicle.fuel_tank_capacity || 0,
        acquisition_date: selectedVehicle.acquisition_date || '',
        acquisition_value: selectedVehicle.acquisition_value || 0,
        notes: selectedVehicle.notes || '',
      });
    }
  }, [open, selectedVehicle, categories]);

  async function loadCategories() {
    try {
      const cats = await getAllVehicleCategories();
      setCategories(cats);
    } catch (error: any) {
      handleError(error, t('vehicles:errors.errorLoadingCategories'));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updated = await updateBdVehicle(selectedVehicle!.id, formData);
      
      if (updated) {
        updateVehicle(updated);
        showSuccess(t('vehicles:toast.updateSuccess'));
        onOpenChange(false);
      }
    } catch (error: any) {
      handleError(error, t('vehicles:toast.updateError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('vehicles:dialogs.edit.title')}</DialogTitle>
          <DialogDescription>
            {selectedVehicle?.license_plate} - {selectedVehicle?.brand} {selectedVehicle?.model}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">{t('vehicles:tabs.basic')}</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span className="hidden sm:inline">{t('vehicles:tabs.technical')}</span>
              </TabsTrigger>
              <TabsTrigger value="acquisition" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">{t('vehicles:tabs.acquisition')}</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                <span className="hidden sm:inline">{t('vehicles:tabs.notes')}</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-2">
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">{t('vehicles:fields.category')} *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      disabled={categories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          categories.length === 0 
                            ? t('common:loading') 
                            : t('vehicles:placeholders.selectCategory')
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_plate">{t('vehicles:fields.licensePlate')} *</Label>
                    <Input
                      id="license_plate"
                      value={formData.license_plate}
                      onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                      placeholder={t('vehicles:placeholders.licensePlate')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">{t('vehicles:fields.brand')} *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder={t('vehicles:placeholders.brand')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">{t('vehicles:fields.model')} *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder={t('vehicles:placeholders.model')}
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
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder={t('vehicles:placeholders.color')}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="chassis_number">{t('vehicles:fields.chassisNumber')}</Label>
                    <Input
                      id="chassis_number"
                      value={formData.chassis_number}
                      onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value.toUpperCase() })}
                      placeholder={t('vehicles:placeholders.chassisNumber')}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="engine_number">{t('vehicles:fields.engineNumber')}</Label>
                    <Input
                      id="engine_number"
                      value={formData.engine_number}
                      onChange={(e) => setFormData({ ...formData, engine_number: e.target.value.toUpperCase() })}
                      placeholder={t('vehicles:placeholders.engineNumber')}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuel_capacity">{t('vehicles:fields.fuelTankCapacity')} (L)</Label>
                    <Input
                      id="fuel_capacity"
                      type="number"
                      min="0"
                      value={formData.fuel_tank_capacity}
                      onChange={(e) => setFormData({ ...formData, fuel_tank_capacity: parseInt(e.target.value) || 0 })}
                      placeholder={t('vehicles:placeholders.fuelTankCapacity')}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-muted">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>{t('common:tip')}:</strong> {t('vehicles:dialogs.edit.technicalHint')}
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                    <li>• {t('vehicles:dialogs.edit.technicalHint1')}</li>
                    <li>• {t('vehicles:dialogs.edit.technicalHint2')}</li>
                    <li>• {t('vehicles:dialogs.edit.technicalHint3')}</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="acquisition" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acquisition_date">{t('vehicles:fields.acquisitionDate')}</Label>
                    <Input
                      id="acquisition_date"
                      type="date"
                      value={formData.acquisition_date}
                      onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acquisition_value">{t('vehicles:fields.acquisitionValue')} (Kz)</Label>
                    <Input
                      id="acquisition_value"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.acquisition_value ? formData.acquisition_value / 100 : ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        acquisition_value: Math.round(parseFloat(e.target.value || '0') * 100)
                      })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('vehicles:dialogs.edit.valueInCents')}
                    </p>
                  </div>
                </div>

                {formData.acquisition_date && formData.acquisition_value && formData?.acquisition_value > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg border border-muted">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t('vehicles:fields.acquisitionDate')}:</p>
                        <p className="font-semibold">
                          {new Date(formData.acquisition_date).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('vehicles:fields.acquisitionValue')}:</p>
                        <p className="font-semibold">
                          {(formData?.acquisition_value / 100).toLocaleString('pt-AO', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} Kz
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="notes">{t('vehicles:fields.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('vehicles:placeholders.notes')}
                    rows={10}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.notes?.length || 0} {t('common:characters')}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    ℹ️ <strong>{t('common:info')}:</strong> {t('vehicles:dialogs.edit.notesInfo')}
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
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