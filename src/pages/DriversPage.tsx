// ========================================
// FILE: src/pages/DriversPage.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Search, Users, Edit, Trash2, Eye, Phone, Mail, Calendar, AlertTriangle } from 'lucide-react';
import { getAllDrivers, deleteDriver } from '@/helpers/driver-helpers';

// Driver dialogs
import NewDriverDialog from '@/components/driver/NewDriverDialog';
import EditDriverDialog from '@/components/driver/EditDriverDialog';
import ViewDriverDialog from '@/components/driver/ViewDriverDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

export default function DriversPage() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDriver, setSelectedDriver]: any = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers() {
    setIsLoading(true);
    try {
      const data = await getAllDrivers();
      setDrivers(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar motoristas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(driverId: string) {
    try {
      await deleteDriver(driverId);
      await loadDrivers();
      toast({
        title: 'Sucesso',
        description: 'Motorista excluído com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir motorista',
        variant: 'destructive',
      });
    }
  }

  function isLicenseExpiring(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }

  function isLicenseExpired(expiryDate: string): boolean {
    return new Date(expiryDate) < new Date();
  }

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.license_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestão de Motoristas</h2>
          <p className="text-muted-foreground">
            {drivers.length} motorista{drivers.length !== 1 ? 's' : ''} registado{drivers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <NewDriverDialog onDriverCreated={(driver) => setDrivers([...drivers, driver])} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar motorista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Drivers List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">
            {searchTerm ? 'Nenhum motorista encontrado' : 'Nenhum motorista cadastrado'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {driver.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{driver.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        CNH: {driver.license_number} - Categoria {driver.license_category}
                      </p>
                    </div>
                    <Badge>{driver.status === 'active' ? 'Activo' : 'Inactivo'}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {driver.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{driver.phone}</span>
                      </div>
                    )}
                    {driver.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{driver.email}</span>
                      </div>
                    )}
                    {driver.hire_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Admitido: {new Date(driver.hire_date).toLocaleDateString('pt-AO')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>CNH válida até: {new Date(driver.license_expiry_date).toLocaleDateString('pt-AO')}</span>
                    </div>
                  </div>

                  {(isLicenseExpiring(driver.license_expiry_date) || isLicenseExpired(driver.license_expiry_date)) && (
                    <div className={`flex items-center gap-2 p-2 rounded-md text-sm mb-3 ${
                      isLicenseExpired(driver.license_expiry_date)
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                      <span>
                        {isLicenseExpired(driver.license_expiry_date)
                          ? 'CNH EXPIRADA!'
                          : 'CNH expira em breve'}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => { 
                        setSelectedDriver(driver); 
                        setViewDialogOpen(true); 
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => { 
                        setSelectedDriver(driver); 
                        setEditDialogOpen(true); 
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => { 
                        setSelectedDriver(driver); 
                        setDeleteDialogOpen(true); 
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <EditDriverDialog 
        driver={selectedDriver}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onDriverUpdated={(updated) => {
          setDrivers(drivers.map(d => d.id === updated.id ? updated : d));
        }}
      />

      <ViewDriverDialog 
        driver={selectedDriver}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedDriver?.name}
        onConfirm={async () => {
          await handleDelete(selectedDriver.id);
          setDeleteDialogOpen(false);
        }}
      />
    </div>
  );
}