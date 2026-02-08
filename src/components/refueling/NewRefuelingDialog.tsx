// ========================================
// FILE: src/components/refueling/NewRefuelingDialog.tsx (VERSÃO LIMPA E PROFISSIONAL)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { 
  Fuel, Plus, AlertCircle, Car, User, MapPin, 
  Gauge, Droplets, DollarSign, FileText, StickyNote, 
  Route, Calculator, CheckCircle2, Link2, ArrowRight
} from 'lucide-react';
import { createRefueling } from '@/helpers/refueling-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import { getAllDrivers } from '@/helpers/driver-helpers';
import { getActiveTrips } from '@/helpers/trip-helpers';
import { ICreateRefueling } from '@/lib/types/refueling';
import { useRefuelings } from '@/contexts/RefuelingsContext';

const FUEL_TYPES = [
  { value: 'gasoline', label: 'refuelings:fuelTypes.gasoline', icon: '⛽' },
  { value: 'diesel', label: 'refuelings:fuelTypes.diesel', icon: '🛢️' },
  { value: 'ethanol', label: 'refuelings:fuelTypes.ethanol', icon: '🌱' },
  { value: 'cng', label: 'refuelings:fuelTypes.cng', icon: '🔥' },
];

export default function NewRefuelingDialog() {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { fuelStations }, addRefueling } = useRefuelings();
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [formData, setFormData] = useState<ICreateRefueling>({
    vehicle_id: '',
    driver_id: undefined,
    station_id: undefined,
    trip_id: undefined,
    fuel_type: 'diesel',
    liters: 0,
    price_per_liter: 0,
    current_mileage: 0,
    is_full_tank: true,
    invoice_number: '',
    notes: '',
  });
  
  const [autoFilledDriver, setAutoFilledDriver] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  async function loadData() {
    try {
      const [vehiclesData, driversData, tripsData] = await Promise.all([
        getAllVehicles(),
        getAllDrivers(),
        getActiveTrips(),
      ]);
      setVehicles(vehiclesData.filter((v: any) => v.status !== 'inactive'));
      setDrivers(driversData.filter((d: any) => d.is_active === true));
      setTrips(tripsData || []);
    } catch (error) {
      handleError(error, 'common:errors.loadingData');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newRefueling = await createRefueling(formData);
      
      if (newRefueling) {
        addRefueling(newRefueling);
        showSuccess('refuelings:toast.createSuccess');
        setOpen(false);
        resetForm();
      }
    } catch (error: any) {
      handleError(error, 'refuelings:toast.createError');
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      vehicle_id: '',
      driver_id: undefined,
      station_id: undefined,
      trip_id: undefined,
      fuel_type: 'diesel',
      liters: 0,
      price_per_liter: 0,
      current_mileage: 0,
      is_full_tank: true,
      invoice_number: '',
      notes: '',
    });
    setAutoFilledDriver(false);
  }

  const handleTripChange = (value: string) => {
    const tripId = value === 'none' ? undefined : value;
    const selectedTrip = trips.find(t => t.id === tripId);
    
    if (selectedTrip && selectedTrip.driver_id) {
      setFormData({ 
        ...formData, 
        trip_id: tripId,
        driver_id: selectedTrip.driver_id
      });
      setAutoFilledDriver(true);
    } else {
      setFormData({ 
        ...formData, 
        trip_id: tripId,
        driver_id: undefined
      });
      setAutoFilledDriver(false);
    }
  };

  const handleDriverChange = (value: string) => {
    const driverId = value === 'none' ? undefined : value;
    setFormData({ ...formData, driver_id: driverId });
    setAutoFilledDriver(false);
  };

  const totalCost = formData.liters * formData.price_per_liter;
  const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);
  const selectedTrip = trips.find(t => t.id === formData.trip_id);
  const selectedDriver = drivers.find(d => d.id === formData.driver_id);
  const activeStations = fuelStations.filter(s => s.is_active);
  const filteredTrips = formData.vehicle_id 
    ? trips.filter(t => t.vehicle_id === formData.vehicle_id)
    : trips;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t('refuelings:newRefueling')}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Fuel className="w-5 h-5 text-primary" />
            {t('refuelings:dialogs.new.title')}
          </DialogTitle>
          <DialogDescription>
            {t('refuelings:dialogs.new.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Seção 1: Identificação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Car className="w-4 h-4" />
              {t('refuelings:sections.identification')}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Veículo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('refuelings:fields.vehicle')}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Select
                  value={formData.vehicle_id}
                  onValueChange={(value) => {
                    const vehicle = vehicles.find(v => v.id === value);
                    setFormData({ 
                      ...formData, 
                      vehicle_id: value,
                      trip_id: undefined,
                      driver_id: undefined,
                      current_mileage: vehicle?.current_mileage || 0
                    });
                    setAutoFilledDriver(false);
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('refuelings:placeholders.selectVehicle')} />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                        {t('refuelings:alerts.noVehicles')}
                      </div>
                    ) : (
                      vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{v.license_plate}</span>
                            <span className="text-muted-foreground text-sm">- {v.brand} {v.model}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedVehicle && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    {t('refuelings:fields.currentMileage')}: {selectedVehicle.current_mileage?.toLocaleString('pt-PT')} km
                  </p>
                )}
              </div>

              {/* Viagem */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Route className="w-3.5 h-3.5" />
                  {t('refuelings:fields.trip')}
                </Label>
                <Select
                  value={formData.trip_id || 'none'}
                  onValueChange={handleTripChange}
                  disabled={!formData.vehicle_id}
                >
                  <SelectTrigger className={cn(!formData.vehicle_id && "opacity-50")}>
                    <SelectValue placeholder={!formData.vehicle_id ? t('refuelings:placeholders.selectVehicleFirst') : t('refuelings:placeholders.selectTrip')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('common:none')}</SelectItem>
                    {filteredTrips.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{t.route_name || t.destination}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(t.start_date).toLocaleDateString('pt-PT')} • {t.driver_name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTrip && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="truncate">{selectedTrip.route_name || selectedTrip.destination}</span>
                  </div>
                )}
              </div>

              {/* Motorista */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {t('refuelings:fields.driver')}
                  </Label>
                  {autoFilledDriver && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      <Link2 className="w-3 h-3 mr-1" />
                      {t('refuelings:info.auto')}
                    </Badge>
                  )}
                </div>
                <Select
                  value={formData.driver_id || 'none'}
                  onValueChange={handleDriverChange}
                >
                  <SelectTrigger className={cn(autoFilledDriver && "border-primary/50 bg-primary/5")}>
                    <SelectValue placeholder={t('refuelings:placeholders.selectDriver')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('common:none')}</SelectItem>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {d.name.charAt(0).toUpperCase()}
                          </div>
                          {d.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {autoFilledDriver && selectedDriver && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    {t('refuelings:info.driverLinkedToTrip', { driver: selectedDriver.name })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção 2: Local e Tipo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              {t('refuelings:sections.location')}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Posto */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('refuelings:fields.station')}</Label>
                <Select
                  value={formData.station_id || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, station_id: value === 'none' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('refuelings:placeholders.selectStation')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('common:none')}</SelectItem>
                    {activeStations.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{s.name}</span>
                          {s.brand && <Badge variant="outline" className="text-[10px]">{s.brand}</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Combustível */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" />
                  {t('refuelings:fields.fuelType')}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('refuelings:placeholders.selectFuelType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{t(type.label)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção 3: Quantidades */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              {t('refuelings:sections.quantities')}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Quilometragem */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('refuelings:fields.mileage')}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.current_mileage || ''}
                    onChange={(e) => setFormData({ ...formData, current_mileage: parseInt(e.target.value) || 0 })}
                    className="pr-10 font-mono"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">km</span>
                </div>
              </div>

              {/* Litros */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('refuelings:fields.liters')}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.liters || ''}
                    onChange={(e) => setFormData({ ...formData, liters: parseFloat(e.target.value) || 0 })}
                    className="pr-8 font-mono"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">L</span>
                </div>
              </div>

              {/* Preço por Litro */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('refuelings:fields.pricePerLiter')}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price_per_liter || ''}
                    onChange={(e) => setFormData({ ...formData, price_per_liter: parseFloat(e.target.value) || 0 })}
                    className="pl-8 font-mono"
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">Kz</span>
                </div>
              </div>

              {/* Custo Total */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">{t('refuelings:fields.totalCost')}</Label>
                <div className="h-10 flex items-center px-3 rounded-md bg-primary/10 border border-primary/20">
                  <span className="font-bold text-primary font-mono">
                    {totalCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="ml-1 text-xs text-primary/70">Kz</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção 4: Detalhes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              {t('refuelings:sections.details')}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tanque Cheio */}
              <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/30">
                <Checkbox
                  id="is_full_tank"
                  checked={formData.is_full_tank}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_full_tank: checked as boolean })}
                />
                <label htmlFor="is_full_tank" className="text-sm font-medium cursor-pointer flex-1">
                  {t('refuelings:fields.fullTank')}
                </label>
                {formData.is_full_tank && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>

              {/* Fatura */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('refuelings:fields.invoiceNumber')}</Label>
                <Input
                  placeholder="INV-2024-001"
                  value={formData.invoice_number || ''}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  className="font-mono uppercase"
                />
              </div>

              {/* Observações */}
              <div className="space-y-2 md:col-span-1">
                <Label className="text-sm font-medium">{t('refuelings:fields.notes')}</Label>
                <Textarea
                  placeholder={t('refuelings:placeholders.addNotes')}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={1}
                  className="resize-none min-h-[38px]"
                />
              </div>
            </div>
          </div>

          {/* Resumo */}
          {totalCost > 0 && (
            <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formData.liters}L × {formData.price_per_liter.toLocaleString('pt-PT')} Kz
                </span>
                <span className="text-xl font-bold text-primary font-mono">
                  {totalCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedVehicle && (
                  <Badge variant="outline" className="gap-1">
                    <Car className="w-3 h-3" />
                    {selectedVehicle.license_plate}
                  </Badge>
                )}
                {selectedTrip && (
                  <Badge variant="outline" className="gap-1">
                    <Route className="w-3 h-3" />
                    {selectedTrip.route_name || selectedTrip.destination}
                  </Badge>
                )}
                {selectedDriver && (
                  <Badge variant="outline" className={cn("gap-1", autoFilledDriver && "bg-primary/10")}>
                    <User className="w-3 h-3" />
                    {selectedDriver.name}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || vehicles.length === 0}>
              {isLoading ? t('refuelings:actions.creating') : t('refuelings:actions.register')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}