// ========================================
// FILE: src/pages/provider/DriversPageContent.tsx
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { 
  Search, Users, Edit, Trash2, Eye, Phone, Mail, Calendar, AlertTriangle, Truck,
  LayoutGrid, List, Filter, MoreHorizontal, CheckCircle2, Clock, UserX, Ban, CalendarDays
} from 'lucide-react';
import { getAllDrivers, deleteDriver as deleteDriverHelper } from '@/helpers/driver-helpers';
import { cn } from '@/lib/utils';
import { useDrivers } from '@/contexts/DriversContext';
import { DriverLeavesProvider } from '@/contexts/DriverLeavesContext';

// Dialogs
import NewDriverDialog from '@/components/driver/NewDriverDialog';
import EditDriverDialog from '@/components/driver/EditDriverDialog';
import ViewDriverDialog from '@/components/driver/ViewDriverDialog';
import DriversLeavesTab from '@/components/driver/DriverLeavesTab';
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

  const { 
    state: { drivers, selectedDriver, isLoading },
    setDrivers,
    selectDriver,
    deleteDriver: removeDriverFromContext,
    setLoading,
  } = useDrivers();

  const [activeTab, setActiveTab]                   = useState('drivers');
  const [searchTerm, setSearchTerm]                 = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [viewMode, setViewMode]                     = useState<ViewMode>('cards');

  // Paginação
  const [currentPage, setCurrentPage]       = useState(1);
  const [itemsPerPage, setItemsPerPage]     = useState(20);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false,
  });

  const [statusCounts, setStatusCounts] = useState({
    available:  0,
    on_trip:    0,
    offline:    0,
    on_leave:   0,
    terminated: 0,
  });

  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [editDialogOpen, setEditDialogOpen]     = useState(false);
  const [viewDialogOpen, setViewDialogOpen]     = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting]             = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadDrivers();
  }, [currentPage, itemsPerPage, debouncedSearch, availabilityFilter]);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllDrivers({
        page:   currentPage,
        limit:  itemsPerPage,
        search: debouncedSearch,
        status: availabilityFilter === 'all' ? undefined : availabilityFilter,
      });

      setDrivers(result.data);
      setPaginationInfo(result.pagination);

      if (result.statusCounts) {
        setStatusCounts(result.statusCounts as typeof statusCounts);
      }
    } catch (error) {
      handleError(error, 'drivers:errors.errorLoading');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, availabilityFilter]);

  function handlePageChange(page: number) { setCurrentPage(page); }
  function handleLimitChange(limit: number) { setItemsPerPage(limit); setCurrentPage(1); }

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
      loadDrivers();
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
    return getDaysUntilExpiry(expiryDate) <= 30 && getDaysUntilExpiry(expiryDate) > 0;
  }
  function isLicenseExpired(expiryDate: string): boolean {
    return new Date(expiryDate) < new Date();
  }
  function getDaysUntilExpiry(expiryDate: string): number {
    return Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  const stats = [
    { label: t('drivers:stats.total'),                value: paginationInfo.total,   icon: Users,        color: 'text-slate-600',   bg: 'bg-slate-100/60'  },
    { label: t('drivers:stats.available'),            value: statusCounts.available, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
    { label: t('drivers:stats.onTrip'),               value: statusCounts.on_trip,   icon: Truck,        color: 'text-blue-600',    bg: 'bg-blue-50/60'    },
    { label: t('drivers:status.on_leave.label'),      value: statusCounts.on_leave,  icon: CalendarDays, color: 'text-purple-600',  bg: 'bg-purple-50/60'  },
    { label: t('drivers:availability.offline.label'), value: statusCounts.offline,   icon: Ban,          color: 'text-slate-500',   bg: 'bg-slate-50/60'   },
  ];

  const viewModes = [
    { mode: 'list',  icon: List,       label: t('common:viewModes.normal') },
    { mode: 'cards', icon: LayoutGrid, label: t('common:viewModes.cards')  },
  ] as const;

  // ── Views ────────────────────────────────────────────────────────────────

  function renderListView() {
    return (
      <div className="grid gap-4">
        {drivers.map((driver) => (
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
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(driver.status)}
                      {/* Badge extra de férias */}
                      {driver.status === 'on_leave' && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {t('drivers:leaves.status.active')}
                        </Badge>
                      )}
                    </div>
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
                    <Button size="sm" variant="outline" onClick={() => { selectDriver(driver); setViewDialogOpen(true); }}>
                      <Eye className="w-4 h-4 mr-2" />{t('drivers:actions.view')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { selectDriver(driver); setEditDialogOpen(true); }}>
                      <Edit className="w-4 h-4 mr-2" />{t('drivers:actions.edit')}
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => openDeleteDialog(driver)}>
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
        {drivers.map((driver) => (
          <Card key={driver.id} className="flex flex-col h-full group hover:shadow-lg transition-all duration-300 bg-card relative overflow-hidden">
            {/* Indicador de status no canto */}
            <div 
              className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full ring-2 ring-background shadow-sm"
              style={{
                backgroundColor: driver.status === 'active'    ? '#10b981' : 
                                  driver.status === 'on_leave'  ? '#a855f7' :
                                  driver.availability === 'on_trip'   ? '#3b82f6' : '#64748b'
              }}
            />
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-start justify-between">
                <Avatar className="w-16 h-16 ring-2 ring-muted group-hover:ring-primary transition-all">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {driver.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Badge de availability */}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider",
                    driver.availability === 'available' && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
                    driver.availability === 'on_trip'   && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
                    driver.availability === 'offline'   && "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                  )}
                >
                  {driver.availability === 'available' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {driver.availability === 'on_trip'   && <Truck className="w-3.5 h-3.5" />}
                  {driver.availability === 'offline'   && <Ban className="w-3.5 h-3.5" />}
                  <span>
                    {driver.availability === 'available' && t('drivers:availability.available.label')}
                    {driver.availability === 'on_trip'   && t('drivers:availability.on_trip.label')}
                    {driver.availability === 'offline'   && t('drivers:availability.offline.label')}
                  </span>
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-lg tracking-tight mb-1">{driver.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {driver.license_number} - {t('drivers:categories.' + driver.license_category)}
                </p>
              </div>

              {/* Badge de férias — aparece quando on_leave */}
              {driver.status === 'on_leave' && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-400 font-semibold">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                  {t('drivers:leaves.status.active')}
                </div>
              )}

              {/* Alerta carta */}
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

              <div className="mt-auto pt-4 flex gap-2 border-t">
                <Button 
                  className="flex-1 h-9 text-sm font-bold shadow-sm"
                  onClick={() => { selectDriver(driver); setViewDialogOpen(true); }}
                >
                  {t('drivers:actions.view')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 border-muted-foreground/20">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => closeDropdownsAndOpenDialog(() => { selectDriver(driver); setViewDialogOpen(true); })}>
                      <Eye className="w-4 h-4 mr-2" /> {t('drivers:actions.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => closeDropdownsAndOpenDialog(() => { selectDriver(driver); setEditDialogOpen(true); })}>
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

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <DriverLeavesProvider>
      <div className="min-h-screen bg-slate-50/50 dark:bg-transparent -m-6 p-6">
        <div className="max-w-[1500px] mx-auto space-y-8 pb-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('drivers:title')}</h1>
              <p className="text-muted-foreground text-base">{t('drivers:description')}</p>
            </div>
            {activeTab === 'drivers' && <NewDriverDialog />}
          </div>

          {/* ── TABS ─────────────────────────────────────────────────────── */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-[360px] grid-cols-2 bg-muted/60 p-1 rounded-xl border border-muted/50">
              <TabsTrigger value="drivers" className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t('drivers:tabs.drivers', 'Motoristas')}
              </TabsTrigger>
              <TabsTrigger value="leaves" className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {t('drivers:tabs.leaves', 'Férias')}
              </TabsTrigger>
            </TabsList>

            {/* ── TAB: MOTORISTAS ────────────────────────────────────────── */}
            <TabsContent value="drivers" className="space-y-6 mt-0 outline-none">

              {/* Stats */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {stats.map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm bg-card overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl shrink-0", stat.bg, stat.color)}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground truncate leading-tight">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-black tracking-tight leading-tight">{stat.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Toolbar */}
              <div className="bg-card rounded-2xl border border-muted/50 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={t('drivers:searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
                      />
                    </div>

                    <Select value={availabilityFilter} onValueChange={(v) => { setAvailabilityFilter(v); setCurrentPage(1); }}>
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

                  <div className="flex bg-muted/30 p-1 rounded-xl border border-muted/50 self-center sm:self-auto shrink-0">
                    {viewModes.map((item) => (
                      <Button
                        key={item.mode}
                        variant={viewMode === item.mode ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode(item.mode as ViewMode)}
                        className={cn(
                          "h-8 px-3 rounded-lg transition-all flex items-center gap-2",
                          viewMode === item.mode ? "bg-background shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                        )}
                        title={item.label}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs">{item.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {paginationInfo.totalPages > 1 && (
                  <div className="border-t border-muted/40 px-3 py-2 flex justify-end">
                    <Pagination
                      pagination={paginationInfo}
                      onPageChange={handlePageChange}
                      onLimitChange={handleLimitChange}
                    />
                  </div>
                )}
              </div>

              {/* Lista */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-sm text-muted-foreground font-bold animate-pulse">{t('common:loading')}...</p>
                </div>
              ) : drivers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                  <Users className="w-12 h-12 text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-bold">{t('drivers:noDrivers')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchTerm ? t('common:noResults') : t('common:noData')}
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  {viewMode === 'list'  && renderListView()}
                  {viewMode === 'cards' && renderCardsView()}
                </div>
              )}
            </TabsContent>

            {/* ── TAB: FÉRIAS ────────────────────────────────────────────── */}
            <TabsContent value="leaves" className="mt-0 outline-none">
              <DriversLeavesTab
                drivers={drivers.map(d => ({ id: d.id, name: d.name }))}
              />
            </TabsContent>

          </Tabs>

          {/* Dialogs */}
          <EditDriverDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
          <ViewDriverDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
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
    </DriverLeavesProvider>
  );
}