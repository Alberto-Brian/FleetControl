// ========================================
// FILE: src/pages/VehiclesPage.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Search, Truck, Edit, Trash2, Eye } from 'lucide-react';
import { getAllVehicles, deleteVehicle } from '@/helpers/vehicle-helpers';

// vehicles dialogs
import NewVehicleCategoryDialog from '@/components/vehicle-category/NewVehicleCategoryDialog';
import NewVehicleDialog from '@/components/vehicle/NewVehicleDialog';
import EditVehicleDialog from '@/components/vehicle/EditVehicleDialog';
import ViewVehicleDialog from '@/components/vehicle/ViewVehicleDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

export default function VehiclesPage() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

const [selectedVehicle, setSelectedVehicle]:any = useState(null);
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [viewDialogOpen, setViewDialogOpen] = useState(false);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    setIsLoading(true);
    try {
      const data = await getAllVehicles();
      setVehicles(data);
      
      // // Mock temporário
      // setVehicles([
      //   {
      //     id: '1',
      //     license_plate: 'LD-12-34-AB',
      //     brand: 'Toyota',
      //     model: 'Hilux',
      //     year: 2023,
      //     category_name: 'Utilitário',
      //     category_color: '#10B981',
      //     status: 'available',
      //     current_mileage: 15000,
      //   },
      //   {
      //     id: '2',
      //     license_plate: 'LD-56-78-CD',
      //     brand: 'Ford',
      //     model: 'Ranger',
      //     year: 2022,
      //     category_name: 'Utilitário',
      //     category_color: '#10B981',
      //     status: 'in_use',
      //     current_mileage: 32000,
      //   },
      //   {
      //     id: '3',
      //     license_plate: 'LD-90-12-EF',
      //     brand: 'Hyundai',
      //     model: 'HB20',
      //     year: 2021,
      //     category_name: 'Passeio',
      //     category_color: '#3B82F6',
      //     status: 'maintenance',
      //     current_mileage: 45000,
      //   },
      // ]);

    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar veículos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(vehicleId: string) {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;

    try {
      await deleteVehicle(vehicleId);
      // setVehicles(vehicles.filter(v => v.id !== vehicleId));
      toast({
        title: 'Sucesso',
        description: 'Veículo excluído com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir veículo',
        variant: 'destructive',
      });
    }
  }

  function getStatusBadge(status: string) {
    const statusMap = {
      available: { label: 'Disponível', variant: 'default' as const },
      in_use: { label: 'Em Uso', variant: 'secondary' as const },
      maintenance: { label: 'Manutenção', variant: 'destructive' as const },
      inactive: { label: 'Inactivo', variant: 'outline' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.available;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  }

  const filteredVehicles = vehicles.filter(v =>
    v.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestão de Veículos</h2>
          <p className="text-muted-foreground">
            {vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''} registado{vehicles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className='space-x-6'>
          <NewVehicleCategoryDialog />
          <NewVehicleDialog onVehicleCreated={(vehicle) => setVehicles([...vehicles, vehicle])} />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por matrícula, marca ou modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vehicles Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">
            {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{vehicle.license_plate}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </p>
                </div>
                {getStatusBadge(vehicle.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: vehicle.category_color }}
                  />
                  <span className="text-sm">{vehicle.category_name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  KM: {vehicle.current_mileage?.toLocaleString('pt-AO')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => { setSelectedVehicle(vehicle); setViewDialogOpen(true); }}>
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button onClick={() => { setSelectedVehicle(vehicle); setEditDialogOpen(true); }}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button onClick={() => { setSelectedVehicle(vehicle); setDeleteDialogOpen(true); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <EditVehicleDialog 
        vehicle={selectedVehicle}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onVehicleUpdated={(updated) => {
            setVehicles(vehicles.map(v => v.id === updated.id ? updated : v));
        }}
    />

    <ViewVehicleDialog 
    vehicle={selectedVehicle}
    open={viewDialogOpen}
    onOpenChange={setViewDialogOpen}
    />

    <ConfirmDeleteDialog
    open={deleteDialogOpen}
    onOpenChange={setDeleteDialogOpen}
    itemName={selectedVehicle?.license_plate}
    onConfirm={async () => {
    await handleDelete(selectedVehicle.id);
    setDeleteDialogOpen(false);
    }}
    />
  </div>
  );
}