// ========================================
// FILE: src/components/fuel-station/EditFuelStationDialog.tsx (ATUALIZADO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { 
  MapPin, Building2, Phone, MapPinned, Fuel, 
  Store, Droplets, StickyNote, Save, X 
} from 'lucide-react';
import { updateFuelStation as updateFuelStationHelper } from '@/helpers/fuel-station-helpers';
import { IUpdateFuelStation } from '@/lib/types/fuel-station';
import { useRefuelings } from '@/contexts/RefuelingsContext';
import { FuelType } from '@/lib/db/schemas/refuelings';

const FUEL_TYPE_OPTIONS = [
  { value: 'gasoline', label: 'refuelings:fuelTypes.gasoline', icon: '⛽' },
  { value: 'diesel', label: 'refuelings:fuelTypes.diesel', icon: '🛢️' },
  { value: 'ethanol', label: 'refuelings:fuelTypes.ethanol', icon: '🌱' },
  { value: 'cng', label: 'refuelings:fuelTypes.cng', icon: '🔥' },
];

interface EditFuelStationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditFuelStationDialog({ open, onOpenChange }: EditFuelStationDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedFuelStation }, updateFuelStation } = useRefuelings();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState<IUpdateFuelStation>({
    name: '',
    brand: '',
    phone: '',
    address: '',
    city: '',
    fuel_types: undefined,
    has_convenience_store: 'false',
    has_car_wash: 'false',
    notes: '',
  });

  useEffect(() => {
    if (open && selectedFuelStation) {
      const fuelTypes = selectedFuelStation.fuel_types 
        ? (selectedFuelStation.fuel_types as string).split(',').map(f => f.trim())
        : [];
      setSelectedFuelTypes(fuelTypes);
      
      setFormData({
        name: selectedFuelStation.name,
        brand: selectedFuelStation.brand || '',
        phone: selectedFuelStation.phone || '',
        address: selectedFuelStation.address || '',
        city: selectedFuelStation.city || '',
        fuel_types: selectedFuelStation.fuel_types as FuelType || undefined,
        has_convenience_store: selectedFuelStation.has_convenience_store || 'false',
        has_car_wash: selectedFuelStation.has_car_wash || 'false',
        notes: selectedFuelStation.notes || '',
      });
    }
  }, [open, selectedFuelStation]);

  if (!selectedFuelStation) return null;

  const toggleFuelType = (type: string) => {
    const newTypes = selectedFuelTypes.includes(type)
      ? selectedFuelTypes.filter(t => t !== type)
      : [...selectedFuelTypes, type];
    setSelectedFuelTypes(newTypes);
    setFormData({ ...formData, fuel_types: newTypes.join(', ') as FuelType });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await updateFuelStationHelper(selectedFuelStation!.id, formData);
      updateFuelStation(updated);
      showSuccess('refuelings:toast.stationUpdateSuccess');
      onOpenChange(false);
    } catch (error: any) {
      handleError(error, 'refuelings:toast.stationUpdateError');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 to-transparent border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {t('refuelings:dialogs.editStation.title')}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {selectedFuelStation.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {t('refuelings:sections.basicInfo')}
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  {t('refuelings:fields.stationName')}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder={t('refuelings:placeholders.stationName')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                  className="bg-muted/30 border-muted"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-medium">{t('refuelings:fields.brand')}</Label>
                <Input
                  placeholder={t('refuelings:placeholders.brand')}
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="bg-muted/30 border-muted"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {t('refuelings:fields.phone')}
              </Label>
              <Input
                type="tel"
                placeholder={t('refuelings:placeholders.phone')}
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-muted/30 border-muted"
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Location */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MapPinned className="w-4 h-4" />
              {t('refuelings:sections.location')}
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium">{t('refuelings:fields.address')}</Label>
                <Input
                  placeholder={t('refuelings:placeholders.address')}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-muted/30 border-muted"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-medium">{t('refuelings:fields.city')}</Label>
                <Input
                  placeholder={t('refuelings:placeholders.city')}
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-muted/30 border-muted"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Fuel Types */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Fuel className="w-4 h-4" />
              {t('refuelings:fields.fuelTypesAvailable')}
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {FUEL_TYPE_OPTIONS.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleFuelType(type.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200",
                    selectedFuelTypes.includes(type.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-sm font-medium">{t(type.label)}</span>
                  {selectedFuelTypes.includes(type.value) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Store className="w-4 h-4" />
              {t('refuelings:info.services')}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  has_convenience_store: formData.has_convenience_store === 'true' ? 'false' : 'true' 
                })}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  formData.has_convenience_store === 'true'
                    ? "border-primary bg-primary/10"
                    : "border-muted bg-muted/30 hover:border-muted-foreground/30"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  formData.has_convenience_store === 'true' ? "bg-primary text-white" : "bg-background"
                )}>
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    formData.has_convenience_store === 'true' ? "text-primary" : "text-foreground"
                  )}>
                    {t('refuelings:fields.convenienceStore')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.has_convenience_store === 'true' ? t('common:yes') : t('common:no')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  has_car_wash: formData.has_car_wash === 'true' ? 'false' : 'true' 
                })}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  formData.has_car_wash === 'true'
                    ? "border-primary bg-primary/10"
                    : "border-muted bg-muted/30 hover:border-muted-foreground/30"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  formData.has_car_wash === 'true' ? "bg-primary text-white" : "bg-background"
                )}>
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    formData.has_car_wash === 'true' ? "text-primary" : "text-foreground"
                  )}>
                    {t('refuelings:fields.carWash')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.has_car_wash === 'true' ? t('common:yes') : t('common:no')}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Notes */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" />
              {t('refuelings:fields.notes')}
            </Label>
            <Textarea
              placeholder={t('refuelings:placeholders.stationNotes')}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="bg-muted/30 border-muted resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t bg-muted/20 -mx-6 -mb-6 px-6 pb-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              {t('common:actions.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? t('refuelings:actions.updating') : t('refuelings:actions.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}