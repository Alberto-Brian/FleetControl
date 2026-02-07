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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { updateDriver as updateDriverHelper } from '@/helpers/driver-helpers';
import { IUpdateDriver } from '@/lib/types/driver';
import { useDrivers } from '@/contexts/DriversContext';
import { User, Contact, CreditCard, FileText, MapPin } from 'lucide-react';

interface EditDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDriverDialog({ open, onOpenChange }: EditDriverDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedDriver }, updateDriver } = useDrivers();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState<IUpdateDriver>({});

  useEffect(() => {
    if (open && selectedDriver) {
      setFormData({
        name: selectedDriver.name,
        phone: selectedDriver.phone || '',
        email: selectedDriver.email || '',
        tax_id: selectedDriver.tax_id || undefined,
        id_number: selectedDriver.id_number || undefined,
        birth_date: selectedDriver.birth_date || undefined,
        address: selectedDriver.address || undefined,
        city: selectedDriver.city || undefined,
        state: selectedDriver.state || undefined,
        postal_code: selectedDriver.postal_code || undefined,
        license_number: selectedDriver.license_number,
        license_category: selectedDriver.license_category,
        license_expiry_date: selectedDriver.license_expiry_date,
        hire_date: selectedDriver.hire_date || undefined,
        status: selectedDriver.status,
        availability: selectedDriver.availability,
        notes: selectedDriver.notes || undefined,
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
        showSuccess('drivers:toast.updateSuccess');
        onOpenChange(false);
      }
    } catch (error: any) {
      handleError(error, 'drivers:toast.updateError');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Motorista - {selectedDriver.name}</DialogTitle>
          <DialogDescription>
            Edição completa de todas as informações do motorista
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="gap-2">
                <User className="w-4 h-4" /> Pessoal
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-2">
                <Contact className="w-4 h-4" /> Contacto
              </TabsTrigger>
              <TabsTrigger value="license" className="gap-2">
                <CreditCard className="w-4 h-4" /> Carta
              </TabsTrigger>
              <TabsTrigger value="status" className="gap-2">
                <MapPin className="w-4 h-4" /> Estados
              </TabsTrigger>
            </TabsList>

            {/* Aba Pessoal */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date || ''}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_id">NIF</Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id || ''}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_number">BI/Passaporte</Label>
                  <Input
                    id="id_number"
                    value={formData.id_number || ''}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba Contacto */}
            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Morada</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Província</Label>
                  <Input
                    id="state"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba Carta */}
            <TabsContent value="license" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_number">Nº da Carta *</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number || ''}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_category">Categoria *</Label>
                  <Select
                    value={formData.license_category || ''}
                    onValueChange={(value) => setFormData({ ...formData, license_category: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Label htmlFor="license_expiry">Validade da Carta *</Label>
                  <Input
                    id="license_expiry"
                    type="date"
                    value={formData.license_expiry_date || ''}
                    onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Data de Admissão</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date || ''}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba Estados */}
            <TabsContent value="status" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Disponibilidade *</Label>
                  <Select
                    value={formData.availability || ''}
                    onValueChange={(value: any) => setFormData({ ...formData, availability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">{t('drivers:availability.available.label')}</SelectItem>
                      <SelectItem value="on_trip">{t('drivers:availability.on_trip.label')}</SelectItem>
                      <SelectItem value="offline">{t('drivers:availability.offline.label')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t('drivers:availability.' + (formData.availability || 'offline') + '.description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Estado Contratual *</Label>
                  <Select
                    value={formData.status || ''}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('drivers:status.active.label')}</SelectItem>
                      <SelectItem value="on_leave">{t('drivers:status.on_leave.label')}</SelectItem>
                      <SelectItem value="terminated">{t('drivers:status.terminated.label')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t('drivers:status.' + (formData.status || 'active') + '.description')}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Notas (sempre visíveis no fundo) */}
          <div className="space-y-2 mt-6 pt-6 border-t">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Observações
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="resize-none"
              placeholder="Informações adicionais sobre o motorista..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'A guardar...' : 'Guardar Todas as Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}