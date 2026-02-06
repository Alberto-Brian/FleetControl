// ========================================
// FILE: src/components/vehicle/EditVehicleDialog.tsx (REFATORADO)
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
      setActiveTab('basic'); // Reset para primeira aba
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
      handleError(error, 'common:errors.errorLoadingCategories');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updated = await updateBdVehicle(selectedVehicle!.id, formData);
      
      if (updated) {
        updateVehicle(updated); // actualiza o context
        showSuccess('vehicles:toast.updateSuccess');
        onOpenChange(false);
      }
    } catch (error: any) {
      handleError(error, 'vehicles:toast.updateError');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Dados do Veículo</DialogTitle>
          <DialogDescription>
            {selectedVehicle?.license_plate} - {selectedVehicle?.brand} {selectedVehicle?.model}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Básico</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span className="hidden sm:inline">Técnico</span>
              </TabsTrigger>
              <TabsTrigger value="acquisition" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Aquisição</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                <span className="hidden sm:inline">Observações</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-2">
              {/* ABA 1: INFORMAÇÕES BÁSICAS */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      disabled={categories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          categories.length === 0 
                            ? "Carregando..." 
                            : "Selecione a categoria"
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
                    <Label htmlFor="license_plate">Matrícula *</Label>
                    <Input
                      id="license_plate"
                      value={formData.license_plate}
                      onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                      placeholder="LD-12-34-AB"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Toyota"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Hilux"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Ano *</Label>
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
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Branca"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ABA 2: DADOS TÉCNICOS */}
              <TabsContent value="technical" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="chassis_number">Número do Chassi</Label>
                    <Input
                      id="chassis_number"
                      value={formData.chassis_number}
                      onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value.toUpperCase() })}
                      placeholder="Ex: 9BWZZZ377VT004251"
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="engine_number">Número do Motor</Label>
                    <Input
                      id="engine_number"
                      value={formData.engine_number}
                      onChange={(e) => setFormData({ ...formData, engine_number: e.target.value.toUpperCase() })}
                      placeholder="Ex: 2GD1234567"
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuel_capacity">Capacidade do Tanque (L)</Label>
                    <Input
                      id="fuel_capacity"
                      type="number"
                      min="0"
                      value={formData.fuel_tank_capacity}
                      onChange={(e) => setFormData({ ...formData, fuel_tank_capacity: parseInt(e.target.value) || 0 })}
                      placeholder="Ex: 80"
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-muted">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Dica:</strong> Estes dados são úteis para:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                    <li>• Identificação única do veículo</li>
                    <li>• Cálculo de consumo de combustível</li>
                    <li>• Documentação e seguros</li>
                  </ul>
                </div>
              </TabsContent>

              {/* ABA 3: AQUISIÇÃO */}
              <TabsContent value="acquisition" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acquisition_date">Data de Aquisição</Label>
                    <Input
                      id="acquisition_date"
                      type="date"
                      value={formData.acquisition_date}
                      onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acquisition_value">Valor de Aquisição (Kz)</Label>
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
                      Valor armazenado em centavos
                    </p>
                  </div>
                </div>

                {formData.acquisition_date && formData.acquisition_value && formData?.acquisition_value > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg border border-muted">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Data de Aquisição:</p>
                        <p className="font-semibold">
                          {new Date(formData.acquisition_date).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor:</p>
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

              {/* ABA 4: OBSERVAÇÕES */}
              <TabsContent value="notes" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações Gerais</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Adicione observações, histórico de reparos, ou qualquer informação relevante sobre o veículo..."
                    rows={10}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.notes?.length || 0} caracteres
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    ℹ️ <strong>Histórico de Status:</strong> Alterações de status são automaticamente registadas aqui.
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
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}