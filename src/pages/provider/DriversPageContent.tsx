// ========================================
// FILE: src/components/driver/DriversPageContent.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { 
  Search, Users, Edit, Trash2, Eye, Phone, Mail, Calendar, AlertTriangle, Truck,
  LayoutGrid, List, Filter, MoreHorizontal, CheckCircle2, Clock, UserX, Ban
} from 'lucide-react';
import { getAllDrivers, deleteDriver as deleteDriverHelper } from '@/helpers/driver-helpers';
import { cn } from '@/lib/utils';
import { useDrivers } from '@/contexts/DriversContext';

// Dialogs
import NewDriverDialog from '@/components/driver/NewDriverDialog';
import EditDriverDialog from '@/components/driver/EditDriverDialog';
import ViewDriverDialog from '@/components/driver/ViewDriverDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  closeDropdownsAndOpenDialog 
} from '@/components/ui/dropdown-menu';

type ViewMode = 'list' | 'cards';

export default function DriversPageContent() {
  const { t } = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();

  // ✨ CONTEXT
  const { 
    state: { drivers, selectedDriver, isLoading },
    setDrivers,
    selectDriver,
    deleteDriver: removeDriverFromContext,
    setLoading,
  } = useDrivers();

  // Estados UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers() {
    setLoading(true);
    try {
      const data = await getAllDrivers();
      setDrivers(data);
    } catch (error) {
      handleError(error, 'drivers:errors.errorLoading');
    } finally {
      setLoading(false);
    }
  }

  function openDeleteDialog(driver: any) {
    closeDropdownsAndOpenDialog(() => {
      selectDriver(driver);
      setDeleteDialogOpen(true);
    });
  }

  async function handleDeleteDriver() {
    if (!selectedDriver) return;
    setIsDeleting(true);
    
    try {
      await deleteDriverHelper(selectedDriver.id);
      
      removeDriverFromContext(selectedDriver.id);
      showSuccess('drivers:toast.deleteSuccess');
      
      setDeleteDialogOpen(false);
      selectDriver(null);
      
    } catch (error) {
      handleError(error, 'drivers:toast.deleteError');
    } finally {
      setIsDeleting(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusMap = {
      active: { 
        label: t('drivers:status.active.label'), 
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
      },
      on_leave: { 
        label: t('drivers:status.on_leave.label'), 
        icon: Clock,
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
      },
      terminated: { 
        label: t('drivers:status.terminated.label'), 
        icon: UserX,
        className: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
      },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    const Icon = statusInfo.icon;

    return (
      <Badge variant="outline" className={cn("flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider", statusInfo.className)}>
        <Icon className="w-3.5 h-3.5" />
        {statusInfo.label}
      </Badge>
    );
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

  function getDaysUntilExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

const filteredDrivers = drivers.filter(d => {
  const matchesSearch = d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesAvailability = availabilityFilter === 'all' || d.availability === availabilityFilter;
  return matchesSearch && matchesAvailability;
});

  function renderListView() {
    return (
      <div className="grid gap-4">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="overflow-hidden group hover:shadow-md transition-all duration-200 bg-card">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 p-5">
                <Avatar className="w-16 h-16 ring-2 ring-muted">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {driver.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg tracking-tight truncate">{driver.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('drivers:fields.licenseNumber')}: {driver.license_number} - {t('drivers:categories.' + driver.license_category)}
                      </p>
                    </div>
                    {getStatusBadge(driver.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {driver.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{driver.phone}</span>
                      </div>
                    )}
                    {driver.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{driver.email}</span>
                      </div>
                    )}
                    {driver.hire_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">
                          {t('drivers:info.admittedOn')}: {new Date(driver.hire_date).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">
                        {t('drivers:info.validUntil')}: {new Date(driver.license_expiry_date).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </div>

                  {(isLicenseExpiring(driver.license_expiry_date) || isLicenseExpired(driver.license_expiry_date)) && (
                    <div className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg text-sm mb-3 font-semibold",
                      isLicenseExpired(driver.license_expiry_date)
                        ? 'bg-destructive/10 text-destructive border border-destructive/20'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
                    )}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {isLicenseExpired(driver.license_expiry_date)
                          ? t('drivers:alerts.licenseExpired')
                          : t('drivers:alerts.licenseExpiringSoon', { days: getDaysUntilExpiry(driver.license_expiry_date) })}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => { 
                        selectDriver(driver); 
                        setViewDialogOpen(true); 
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('drivers:actions.view')}
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => { 
                        selectDriver(driver); 
                        setEditDialogOpen(true); 
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {t('drivers:actions.edit')}
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => openDeleteDialog(driver)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

    function renderCardsView() {
    return (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDrivers.map((driver) => (
            <Card 
            key={driver.id} 
            className={cn("flex flex-col h-full group hover:shadow-lg transition-all duration-300 bg-card relative overflow-hidden")}>
            {/* Indicador de Status (Administrativo) - Canto superior direito, discreto */}
            <div 
                className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full ring-2 ring-background shadow-sm"
                style={{
                backgroundColor: driver.status === 'active' ? '#10b981' : 
                                driver.status === 'on_leave' ? '#f59e0b' : '#64748b'
                }}
                title={`Status: ${driver.status}`}
            />

            <CardContent className="flex flex-col gap-4 p-6">
                {/* Avatar e Availability Badge */}
                <div className="flex items-start justify-between">
                <Avatar className="w-16 h-16 ring-2 ring-muted group-hover:ring-primary transition-all">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {driver.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                
                {/* AVAILABILITY - Badge destacado */}
                <Badge 
                    variant="outline" 
                    className={cn(
                    "flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider",
                    driver.availability === 'available' && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
                    driver.availability === 'on_trip' && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
                    driver.availability === 'offline' && "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                    )}
                >
                    {driver.availability === 'available' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {driver.availability === 'on_trip' && <Truck className="w-3.5 h-3.5" />}
                    {driver.availability === 'offline' && <Ban className="w-3.5 h-3.5" />}
                    {driver.availability === 'available' && 'Disponível'}
                    {driver.availability === 'on_trip' && 'Em Viagem'}
                    {driver.availability === 'offline' && 'Offline'}
                </Badge>
                </div>

                {/* Nome e Carta */}
                <div>
                <h3 className="font-bold text-lg tracking-tight mb-1">{driver.name}</h3>
                <p className="text-xs text-muted-foreground">
                    {driver.license_number} - {t('drivers:categories.' + driver.license_category)}
                </p>
                </div>

                {/* Alerta de Carta */}
                {(isLicenseExpiring(driver.license_expiry_date) || isLicenseExpired(driver.license_expiry_date)) && (
                <div className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-xs font-semibold",
                    isLicenseExpired(driver.license_expiry_date)
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                )}>
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                    {isLicenseExpired(driver.license_expiry_date)
                        ? t('drivers:alerts.licenseExpired')
                        : t('drivers:alerts.licenseExpiring')}
                    </span>
                </div>
                )}

                {/* Info de Contacto */}
                <div className="space-y-2 text-sm">
                {driver.phone && (
                    <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{driver.phone}</span>
                    </div>
                )}
                {driver.email && (
                    <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{driver.email}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs truncate">
                    {t('drivers:info.validUntil')}: {new Date(driver.license_expiry_date).toLocaleDateString('pt-PT')}
                    </span>
                </div>
                </div>

                {/* Acções */}
                <div className="mt-auto pt-4 flex gap-2 border-t">
                <Button 
                    className={cn(
                    "flex-1 h-9 text-sm font-bold shadow-sm",
                    driver.availability === 'available' && driver.status === 'active'
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-slate-100 text-slate-500"
                    )}
                    disabled={driver.availability !== 'available' || driver.status !== 'active'}
                    onClick={() => {
                    selectDriver(driver);
                    setViewDialogOpen(true);
                    }}
                >
                    {driver.availability === 'available' && driver.status === 'active' 
                    ? 'Atribuir Viagem' 
                    : driver.availability === 'on_trip' 
                        ? 'Em Viagem' 
                        : driver.status === 'on_leave'
                        ? 'De Licença'
                        : driver.status === 'terminated'
                            ? 'Desligado'
                            : 'Indisponível'}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 border-muted-foreground/20">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                        closeDropdownsAndOpenDialog(() => {
                        selectDriver(driver);
                        setViewDialogOpen(true);
                        });
                    }}>
                        <Eye className="w-4 h-4 mr-2" /> {t('drivers:actions.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        closeDropdownsAndOpenDialog(() => {
                        selectDriver(driver);
                        setEditDialogOpen(true);
                        });
                    }}>
                        <Edit className="w-4 h-4 mr-2" /> {t('drivers:actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openDeleteDialog(driver)}>
                        <Trash2 className="w-4 h-4 mr-2" /> {t('drivers:actions.delete')}
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </CardContent>
            </Card>
        ))}
        </div>
    );
    }

const availableCount = drivers.filter(d => d.availability === 'available').length;
const onTripCount = drivers.filter(d => d.availability === 'on_trip').length;
const offlineCount = drivers.filter(d => d.availability === 'offline').length;
const expiringLicenses = drivers.filter(d => isLicenseExpiring(d.license_expiry_date) || isLicenseExpired(d.license_expiry_date)).length;
  
return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent -m-6 p-6">
      <div className="max-w-[1500px] mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('drivers:title')}</h1>
            <p className="text-muted-foreground text-base">
              {t('drivers:description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NewDriverDialog />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
                { label: t('drivers:stats.total'), value: drivers.length, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100/60' },
                { label: t('drivers:stats.available'), value: availableCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
                { label: t('drivers:stats.onTrip'), value: onTripCount, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50/60' },
                { label: t('drivers:tabs.expiringLicenses'), value: expiringLicenses, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50/60' },
            ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm bg-card">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                    <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                    </div>
                </CardContent>
                </Card>
            ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card p-4 rounded-2xl border border-muted/50 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('drivers:searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
              />
            </div>
            
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-10 text-sm bg-muted/20 border-none">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder={t('drivers:filters.all')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('drivers:filters.all')}</SelectItem>
                    <SelectItem value="available">{t('drivers:availability.available.label')}</SelectItem>
                    <SelectItem value="on_trip">{t('drivers:availability.on_trip.label')}</SelectItem>
                    <SelectItem value="offline">{t('drivers:availability.offline.label')}</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 self-center lg:self-auto">
            <div className="flex bg-muted/30 p-1 rounded-xl border border-muted/50">
              {[
                { mode: 'list', icon: List },
                { mode: 'cards', icon: LayoutGrid },
              ].map((item) => (
                <Button
                  key={item.mode}
                  variant={viewMode === item.mode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(item.mode as ViewMode)}
                  className={cn(
                    "h-8 w-10 p-0 rounded-lg transition-all",
                    viewMode === item.mode ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-bold animate-pulse">
              {t('common:loading')}...
            </p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
            <Users className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold">{t('drivers:noDrivers')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? t('common:noResults') : t('common:noData')}
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            {viewMode === 'list' && renderListView()}
            {viewMode === 'cards' && renderCardsView()}
          </div>
        )}

        {/* Dialogs */}
        <EditDriverDialog 
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />

        <ViewDriverDialog 
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />

        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteDriver}
          title={t('drivers:dialogs.delete.title')}
          itemName={selectedDriver?.name}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}