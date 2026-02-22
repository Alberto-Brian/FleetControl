// ========================================
// FILE: src/components/refueling/FuelPageContent.tsx
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Fuel, Search, TrendingUp, MapPin, Eye, Edit, Trash2,
  LayoutGrid, List, Rows, Building2, Phone, Mail, TrendingDown,
  Calendar, Gauge, MoreHorizontal, Filter
} from 'lucide-react';

import { useRefuelings } from '@/contexts/RefuelingsContext';
import { getAllRefuelings } from '@/helpers/refueling-helpers';
import { getAllFuelStations, deleteFuelStation as deleteFuelStationHelper } from '@/helpers/fuel-station-helpers';

import NewRefuelingDialog from '@/components/refueling/NewRefuelingDialog';
import ViewRefuelingDialog from '@/components/refueling/ViewRefuelingDialog';
import NewFuelStationDialog from '@/components/refueling/NewFuelStationDialog';
import EditFuelStationDialog from '@/components/refueling/EditFuelStationDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { RESTORE_FUEL_STATION } from '@/helpers/ipc/db/fuel_stations/fuel-stations-channels';

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  closeDropdownsAndOpenDialog
} from '@/components/ui/dropdown-menu';

type ViewMode = 'compact' | 'normal' | 'cards';

export default function FuelPageContent() {
  const { t } = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();

  const {
    state: { refuelings, fuelStations, selectedRefueling, selectedFuelStation, isLoading, isFuelStationsLoading },
    setRefuelings, setFuelStations, selectRefueling, selectFuelStation,
    deleteFuelStation: removeStationFromContext, setLoading, setFuelStationsLoading,
    updateFuelStation,
  } = useRefuelings();

  const [activeTab, setActiveTab]     = useState('refuelings');
  const [searchTerm, setSearchTerm]   = useState('');
  const [viewMode, setViewMode]       = useState<ViewMode>('cards');
  const [stationSearch, setStationSearch] = useState('');

  // Paginação
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false,
  });

  // Stats vindos do back
  const [stats, setStats] = useState({
    totalCost: 0, totalLiters: 0, avgPrice: 0, totalCount: 0,
  });

  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [viewDialogOpen, setViewDialogOpen]             = useState(false);
  const [stationDeleteDialogOpen, setStationDeleteDialogOpen] = useState(false);
  const [isDeletingStation, setIsDeletingStation]       = useState(false);
  const [editStationDialogOpen, setEditStationDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadRefuelings();
  }, [currentPage, itemsPerPage, debouncedSearch]);

  useEffect(() => {
    loadStations();
    window.addEventListener('action-completed', handleStationRestored);
    return () => window.removeEventListener('action-completed', handleStationRestored);
  }, []);

  const handleStationRestored = useCallback((event: any) => {
    const { handler, result } = event.detail;
    if (handler === RESTORE_FUEL_STATION && result) updateFuelStation(result);
  }, [updateFuelStation]);

  const loadRefuelings = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllRefuelings({
        page:   currentPage,
        limit:  itemsPerPage,
        search: debouncedSearch,
      });
      setRefuelings(result.data);
      setPaginationInfo(result.pagination);
      if (result.statusCounts) {
        setStats(result.statusCounts as typeof stats);
      }
    } catch (error) {
      handleError(error, 'refuelings:errors.errorLoading');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch]);

  async function loadStations() {
    setFuelStationsLoading(true);
    try {
      const data = await getAllFuelStations();
      setFuelStations(data);
    } catch (error) {
      handleError(error, 'refuelings:errors.errorLoadingStations');
    } finally {
      setFuelStationsLoading(false);
    }
  }

  async function handleDeleteStation() {
    if (!selectedFuelStation) return;
    setIsDeletingStation(true);
    try {
      await deleteFuelStationHelper(selectedFuelStation.id);
      removeStationFromContext(selectedFuelStation.id);
      showSuccess('refuelings:toast.stationDeleteSuccess');
      setStationDeleteDialogOpen(false);
      selectFuelStation(null);
    } catch (error) {
      handleError(error, 'refuelings:toast.stationDeleteError');
    } finally {
      setIsDeletingStation(false);
    }
  }

  const filteredStations = fuelStations.filter(s =>
    s.name?.toLowerCase().includes(stationSearch.toLowerCase()) ||
    s.city?.toLowerCase().includes(stationSearch.toLowerCase())
  );

  const activeStations = fuelStations.filter(s => s.is_active).length;

  const viewModes = [
    { mode: 'compact', icon: Rows,       label: t('common:viewModes.compact') },
    { mode: 'normal',  icon: List,       label: t('common:viewModes.normal')  },
    { mode: 'cards',   icon: LayoutGrid, label: t('common:viewModes.cards')   },
  ] as const;

  // ---------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------

  function renderCompactView() {
    return (
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 px-6 py-4 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
          <div className="col-span-2">{t('refuelings:table.date')}</div>
          <div className="col-span-2">{t('refuelings:table.vehicle')}</div>
          <div className="col-span-2">{t('refuelings:table.station')}</div>
          <div className="col-span-1">{t('refuelings:table.liters')}</div>
          <div className="col-span-2">{t('refuelings:table.price')}</div>
          <div className="col-span-2">{t('refuelings:table.total')}</div>
          <div className="col-span-1 text-right">{t('refuelings:table.actions')}</div>
        </div>
        <div className="divide-y">
          {refuelings.map((refueling) => (
            <div key={refueling.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/10 transition-colors duration-150">
              <div className="col-span-2">
                <span className="text-sm font-medium">
                  {new Date(refueling.refueling_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: '2-digit' })}
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-mono font-bold text-sm">{refueling.vehicle_license}</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-muted-foreground truncate block">{refueling.station_name || '-'}</span>
              </div>
              <div className="col-span-1">
                <span className="text-sm font-semibold">{refueling.liters}L</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-muted-foreground">{refueling.price_per_liter.toFixed(2)} Kz</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-bold text-primary">{refueling.total_cost.toLocaleString('pt-PT')} Kz</span>
              </div>
              <div className="col-span-1 flex justify-end">
                <Button variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => { selectRefueling(refueling); setViewDialogOpen(true); }}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderNormalView() {
    return (
      <div className="grid gap-4">
        {refuelings.map((refueling) => (
          <Card key={refueling.id} className="overflow-hidden border-l-4 group hover:shadow-md transition-all duration-200 bg-card border-l-primary">
            <CardContent className="p-0">
              <div className="flex items-center p-5 gap-5">
                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Fuel className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg tracking-tight font-mono">{refueling.vehicle_license}</h3>
                    {refueling.is_full_tank && (
                      <Badge variant="outline" className="text-[10px]">{t('refuelings:info.fullTank')}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(refueling.refueling_date).toLocaleDateString('pt-PT')}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{refueling.station_name || t('refuelings:info.noStation')}</span>
                    <span className="flex items-center gap-1.5"><Gauge className="w-4 h-4" />{refueling.current_mileage?.toLocaleString('pt-PT')} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t('refuelings:fields.totalCost')}</p>
                    <p className="text-xl font-bold text-primary">{refueling.total_cost.toLocaleString('pt-PT')} Kz</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10"
                    onClick={() => { selectRefueling(refueling); setViewDialogOpen(true); }}>
                    <Eye className="w-5 h-5" />
                  </Button>
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
        {refuelings.map((refueling) => (
          <Card
            key={refueling.id}
            className={cn('overflow-hidden group hover:shadow-lg transition-all duration-300 bg-card border-muted/60 cursor-pointer', refueling.is_full_tank && 'border-t-4 border-t-green-500')}
            onClick={() => { selectRefueling(refueling); setViewDialogOpen(true); }}
          >
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex justify-between items-start mb-3">
                <div className={cn('p-2.5 rounded-xl transition-all duration-300', refueling.is_full_tank ? 'bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white')}>
                  <Fuel className="w-5 h-5" />
                </div>
                {refueling.is_full_tank && (
                  <Badge className="rounded-full text-[10px] font-bold px-2.5 py-0.5 border-0 bg-green-100 text-green-700 group-hover:bg-green-200">
                    {t('refuelings:info.fullTank')}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl font-mono font-bold">{refueling.vehicle_license}</CardTitle>
              <CardDescription className="text-sm font-bold text-foreground/70 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(refueling.refueling_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 p-5 pt-0">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-muted/50 group-hover:bg-muted/70 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('refuelings:fields.liters')}</p>
                  <p className="text-lg font-bold tracking-tight">{refueling.liters}<span className="ml-1 text-xs font-normal text-muted-foreground">L</span></p>
                </div>
                <div className="h-8 w-px bg-muted-foreground/10" />
                <div className="text-right space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('refuelings:fields.pricePerLiter')}</p>
                  <p className="text-lg font-bold tracking-tight">{refueling.price_per_liter.toFixed(0)}<span className="ml-1 text-xs font-normal text-muted-foreground">Kz</span></p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{refueling.station_name || t('refuelings:info.noStation')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge className="w-4 h-4 shrink-0" />
                  <span>{refueling.current_mileage?.toLocaleString('pt-PT')} km</span>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">{t('refuelings:fields.totalCost')}</span>
                  <span className="text-xl font-black text-primary">{refueling.total_cost.toLocaleString('pt-PT')} <span className="text-sm font-bold">Kz</span></span>
                </div>
                <Button className="w-full h-10 text-sm font-bold shadow-sm"
                  onClick={(e) => { e.stopPropagation(); selectRefueling(refueling); setViewDialogOpen(true); }}>
                  <Eye className="w-4 h-4 mr-2" />{t('refuelings:actions.view')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent -m-6 p-6">
      <div className="max-w-[1500px] mx-auto space-y-8 pb-10">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('refuelings:title')}</h1>
            <p className="text-muted-foreground text-base">
              {activeTab === 'refuelings'
                ? t('refuelings:info.totalRefuelings', { count: paginationInfo.total, plural: paginationInfo.total === 1 ? '' : 's' })
                : t('refuelings:info.activeCount', { count: activeStations, plural: activeStations === 1 ? '' : 's' })}
            </p>
          </div>
          <NewRefuelingDialog />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-[440px] grid-cols-2 bg-muted/60 p-1 rounded-xl border border-muted/50">
            <TabsTrigger value="refuelings" className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2">
              <Fuel className="w-4 h-4" />{t('refuelings:tabs.refuelings')}
            </TabsTrigger>
            <TabsTrigger value="stations" className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />{t('refuelings:tabs.stations')}
            </TabsTrigger>
          </TabsList>

          {/* ---- TAB: ABASTECIMENTOS ---- */}
          <TabsContent value="refuelings" className="space-y-6 mt-0 outline-none">

            {/* Stats vindas do back */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t('refuelings:stats.totalSpent'),   value: `${Number(stats.totalCost).toLocaleString('pt-PT')} Kz`, icon: TrendingUp,  color: 'text-blue-600',   bg: 'bg-blue-50/60'   },
                { label: t('refuelings:stats.totalLiters'),  value: `${Number(stats.totalLiters).toFixed(1)}L`,              icon: Fuel,         color: 'text-green-600',  bg: 'bg-green-50/60'  },
                { label: t('refuelings:stats.averagePrice'), value: `${Number(stats.avgPrice).toFixed(2)} Kz`,               icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50/60' },
                { label: t('refuelings:stats.refuelings'),   value: paginationInfo.total,                                    icon: MapPin,       color: 'text-purple-600', bg: 'bg-purple-50/60' },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm bg-card overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn('p-2.5 rounded-xl shrink-0', stat.bg, stat.color)}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground truncate leading-tight">{stat.label}</p>
                      <p className="text-2xl font-black tracking-tight leading-tight">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Toolbar */}
            <div className="bg-card rounded-2xl border border-muted/50 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder={t('refuelings:searchPlaceholder')} value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1" />
                </div>
                <div className="flex bg-muted/30 p-1 rounded-xl border border-muted/50 self-center sm:self-auto shrink-0">
                  {viewModes.map((item) => (
                    <Button key={item.mode} variant={viewMode === item.mode ? 'secondary' : 'ghost'} size="sm"
                      onClick={() => setViewMode(item.mode as ViewMode)}
                      className={cn('h-8 px-3 rounded-lg transition-all flex items-center gap-2', viewMode === item.mode ? 'bg-background shadow-sm font-bold' : 'text-muted-foreground hover:text-foreground')}
                      title={item.label}>
                      <item.icon className="w-4 h-4" />
                      <span className="hidden sm:inline text-xs">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              {paginationInfo.totalPages > 1 && (
                <div className="border-t border-muted/40 px-3 py-2 flex justify-end">
                  <Pagination pagination={paginationInfo}
                    onPageChange={(p) => setCurrentPage(p)}
                    onLimitChange={(l) => { setItemsPerPage(l); setCurrentPage(1); }} />
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-bold animate-pulse">{t('common:loading')}...</p>
              </div>
            ) : refuelings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <Fuel className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">{t('refuelings:noRefuelings')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{searchTerm ? t('common:noResults') : t('common:noData')}</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                {viewMode === 'compact' && renderCompactView()}
                {viewMode === 'normal'  && renderNormalView()}
                {viewMode === 'cards'   && renderCardsView()}
              </div>
            )}
          </TabsContent>

          {/* ---- TAB: POSTOS ---- */}
          <TabsContent value="stations" className="space-y-6 mt-0 outline-none">
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {[
                { label: t('refuelings:stations.stats.total'),    value: fuelStations.length,                icon: Building2, color: 'text-blue-600',    bg: 'bg-blue-50/60'    },
                { label: t('refuelings:stations.stats.active'),   value: activeStations,                     icon: MapPin,    color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
                { label: t('refuelings:stations.stats.inactive'), value: fuelStations.length - activeStations, icon: MapPin,  color: 'text-slate-500',   bg: 'bg-slate-50/60'   },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm bg-card overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn('p-2.5 rounded-xl shrink-0', stat.bg, stat.color)}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground truncate leading-tight">{stat.label}</p>
                      <p className="text-2xl font-black tracking-tight leading-tight">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-card rounded-2xl border border-muted/50 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder={t('common:search')} value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1" />
                </div>
                <div className="sm:ml-auto"><NewFuelStationDialog /></div>
              </div>
            </div>

            {isFuelStationsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-bold animate-pulse">{t('common:loading')}...</p>
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <Building2 className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">{t('refuelings:stations.noStations')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('common:noResults')}</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-300">
                {filteredStations.map((station) => (
                  <Card key={station.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-card border-muted/60 cursor-pointer"
                    onClick={() => { selectFuelStation(station); setEditStationDialogOpen(true); }}>
                    <CardHeader className="pb-3 pt-5 px-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className={cn('p-2.5 rounded-xl transition-colors', station.is_active ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-muted text-muted-foreground')}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <Badge variant={station.is_active ? 'outline' : 'secondary'}
                          className={cn('rounded-full text-[10px] font-bold px-2.5 py-0.5', station.is_active ? 'border-green-200 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800' : 'border-slate-200 text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400')}>
                          {station.is_active ? t('common:status.active') : t('common:status.inactive')}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold leading-tight truncate" title={station.name}>{station.name}</CardTitle>
                      {station.brand && <CardDescription className="text-sm font-medium text-muted-foreground">{station.brand}</CardDescription>}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3 p-5 pt-0">
                      <div className="space-y-2 min-h-[60px]">
                        {station.phone && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4 shrink-0" /><span className="truncate">{station.phone}</span></div>}
                        {station.city  && <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4 shrink-0" /><span className="truncate">{station.city}</span></div>}
                        {station.email && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-4 h-4 shrink-0" /><span className="truncate">{station.email}</span></div>}
                      </div>
                      <div className="mt-auto pt-4 border-t border-muted/50 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 h-9 text-xs font-bold bg-background hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); selectFuelStation(station); setEditStationDialogOpen(true); }}>
                          <Edit className="w-3.5 h-3.5 mr-1.5" />{t('common:actions.edit')}
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 h-9 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive bg-background"
                          onClick={(e) => { e.stopPropagation(); selectFuelStation(station); setStationDeleteDialogOpen(true); }}>
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />{t('common:actions.delete')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ViewRefuelingDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
        <EditFuelStationDialog open={editStationDialogOpen} onOpenChange={setEditStationDialogOpen} />
        <ConfirmDeleteDialog
          open={stationDeleteDialogOpen} onOpenChange={setStationDeleteDialogOpen}
          onConfirm={handleDeleteStation}
          title={t('refuelings:dialogs.deleteStation.title')}
          description={t('refuelings:dialogs.deleteStation.description')}
          warning={t('refuelings:dialogs.deleteStation.warning')}
          itemName={selectedFuelStation?.name}
          isLoading={isDeletingStation}
        />
      </div>
    </div>
  );
}