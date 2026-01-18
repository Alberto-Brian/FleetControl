// src/pages/FuelPage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Fuel, Plus, TrendingUp, TrendingDown, Search, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import NewRefuelingDialog from '@/components/refueling/NewRefuelingDialog';
import NewFuelStationDialog from '@/components/fuel-station/NewFuelStationDialog';
import { getAllRefuelings } from '@/helpers/refueling-helpers';

export default function FuelPage() {
  const { toast } = useToast();
  const [refuelings, setRefuelings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRefuelings();
  }, []);

  async function loadRefuelings() {
    setIsLoading(true);
    try {
      const data = await getAllRefuelings();
      setRefuelings(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar abastecimentos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredRefuelings = refuelings.filter(r =>
    r.vehicle_license?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpent = refuelings.reduce((sum, r) => sum + (r.total_cost || 0), 0);
  const totalLiters = refuelings.reduce((sum, r) => sum + (r.liters || 0), 0);
  const averagePrice = refuelings.length > 0 
    ? refuelings.reduce((sum, r) => sum + (r.price_per_liter || 0), 0) / refuelings.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Abastecimentos</h2>
          <p className="text-muted-foreground">
            {refuelings.length} abastecimento{refuelings.length !== 1 ? 's' : ''} registado{refuelings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <NewFuelStationDialog onStationCreated={() => {
            toast({ title: 'Sucesso!', description: 'Posto registado com sucesso.' });
          }} />
          <NewRefuelingDialog onRefuelingCreated={(refueling) => {
            setRefuelings([refueling, ...refuelings]);
          }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gasto Total</p>
              <p className="text-2xl font-bold">{totalSpent.toLocaleString('pt-AO')} Kz</p>
            </div>
            <Fuel className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Litros</p>
              <p className="text-2xl font-bold">{totalLiters.toFixed(1)} L</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Preço Médio/L</p>
              <p className="text-2xl font-bold">{averagePrice.toFixed(2)} Kz</p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Abastecimentos</p>
              <p className="text-2xl font-bold">{refuelings.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por veículo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Refuelings List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRefuelings.map((refueling) => (
            <Card key={refueling.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{refueling.vehicle_license}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(refueling.refueling_date).toLocaleString('pt-AO')}
                  </p>
                </div>
                {refueling.is_full_tank && <Badge>Tanque Cheio</Badge>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Combustível</p>
                  <p className="font-medium capitalize">{refueling.fuel_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Litros</p>
                  <p className="font-medium">{refueling.liters}L</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preço/Litro</p>
                  <p className="font-medium">{refueling.price_per_liter.toFixed(2)} Kz</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quilometragem</p>
                  <p className="font-medium">{refueling.current_mileage?.toLocaleString('pt-AO')} km</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-medium text-lg">{refueling.total_cost.toLocaleString('pt-AO')} Kz</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}