// ========================================
// FILE: src/pages/provider/VehiclesPageContent.tsx
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { 
  Search, Truck, Edit, Trash2, Eye, Tag, LayoutGrid, List, Rows, 
  Plus, Filter, MoreHorizontal, CheckCircle2, Clock, Settings2, Ban
} from 'lucide-react';
import { getAllVehicles, deleteVehicle } from '@/helpers/vehicle-helpers';
import { getAllVehicleCategories, deleteVehicleCategory } from '@/helpers/vehicle-category-helpers';
import { cn } from '@/lib/utils';
import { useVehicles } from '@/contexts/VehiclesContext';

// Dialogs
import NewVehicleCategoryDialog from '@/components/vehicle/NewVehicleCategoryDialog';
import NewVehicleDialog from '@/components/vehicle/NewVehicleDialog';
import EditVehicleDialog from '@/components/vehicle/EditVehicleDialog';
import EditVehicleCategoryDialog from '@/components/vehicle/EditVehicleCategoryDialog';
import ViewVehicleDialog from '@/components/vehicle/ViewVehicleDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  closeDropdownsAndOpenDialog 
} from '@/components/ui/dropdown-menu';

type ViewMode = 'compact' | 'normal' | 'cards';

export default function VehiclesPageContent() {
  const { t } = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();

  const { 
    state: { vehicles, selectedVehicle, isLoading, categories, selectedCategory, isCategoriesLoading },
    setVehicles,
    deleteVehicle: removeVehicleFromContext,
    selectVehicle,
    setLoading,
    setCategories,
    selectCategory,
    deleteCategory: removeCategoryFromContext,
    setCategoriesLoading,
  } = useVehicles();

  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Counts por status — vindos do back, independentes dos filtros activos
  const [statusCounts, setStatusCounts] = useState({
    available:   0,
    in_use:      0,
    maintenance: 0,
    inactive:    0,
  });

  // Debounce para search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [categorySearch, setCategorySearch] = useState('');
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Debounce — reset para página 1 quando o search mudar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [currentPage, itemsPerPage, debouncedSearch, statusFilter, categoryFilter]);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllVehicles({
        page:        currentPage,
        limit:       itemsPerPage,
        search:      debouncedSearch,
        status:      statusFilter   === 'all' ? undefined : statusFilter,
        category_id: categoryFilter === 'all' ? undefined : categoryFilter,
      });

      setVehicles(result.data);
      setPaginationInfo(result.pagination);

      // Counts reais vindos do back — não afectados pelos filtros
      if (result.statusCounts) {
        setStatusCounts(result.statusCounts as typeof statusCounts);
      }
    } catch (error) {
      handleError(error, 'vehicles:errors.errorLoading');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, statusFilter, categoryFilter]);

  async function loadCategories() {
    setCategoriesLoading(true);
    try {
      const data = await getAllVehicleCategories();
      setCategories(data);
    } catch (error) {
      handleError(error, 'vehicles:errors.errorLoadingCategories');
    } finally {
      setCategoriesLoading(false);
    }
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  function handleLimitChange(limit: number) {
    setItemsPerPage(limit);
    setCurrentPage(1);
  }

  function openDeleteDialog(vehicle: any) {
    closeDropdownsAndOpenDialog(() => {
      selectVehicle(vehicle);
      setDeleteDialogOpen(true);
    });
  }

  async function handleDeleteVehicle() {
    if (!selectedVehicle) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(selectedVehicle.id);
      removeVehicleFromContext(selectedVehicle.id);
      showSuccess('vehicles:toast.deleteSuccess');
      setDeleteDialogOpen(false);
      selectVehicle(null);
      loadVehicles();
    } catch (error) {
      handleError(error, 'vehicles:toast.deleteError');
    } finally {
      setIsDeleting(false);
    }
  }

  function openCategoryEditDialog(category: any) {
    selectCategory(category);
    setEditCategoryDialogOpen(true);
  }

  function openCategoryDeleteDialog(category: any) {
    selectCategory(category);
    setCategoryDeleteDialogOpen(true);
  }

  async function handleDeleteCategory() {
    if (!selectedCategory) return;
    setIsDeletingCategory(true);
    try {
      await deleteVehicleCategory(selectedCategory.id);
      removeCategoryFromContext(selectedCategory.id);
      showSuccess('vehicles:toast.categoryDeleteSuccess');
      setCategoryDeleteDialogOpen(false);
      selectCategory(null);
    } catch (error) {
      handleError(error, 'vehicles:toast.categoryDeleteError');
    } finally {
      setIsDeletingCategory(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusMap = {
      available: { 
        label: t('vehicles:status.available.label'), 
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
      },
      in_use: { 
        label: t('vehicles:status.in_use.label'), 
        icon: Clock,
        className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
      },
      maintenance: { 
        label: t('vehicles:status.maintenance.label'), 
        icon: Settings2,
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
      },
      inactive: { 
        label: t('vehicles:status.inactive.label'), 
        icon: Ban,
        className: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
      },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.available;
    const Icon = statusInfo.icon;
    return (
      <Badge variant="outline" className={cn("flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider", statusInfo.className)}>
        <Icon className="w-3.5 h-3.5" />
        {statusInfo.label}
      </Badge>
    );
  }

  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  function getVehicleCountByCategory(categoryId: string) {
    return vehicles.filter(v => v.category_id === categoryId).length;
  }

  // Stats — totais reais do back, não afectados pelos filtros
  function formatStatValue(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
    return String(n);
  }

  const stats = [
    { label: t('vehicles:stats.total'),       value: paginationInfo.total,     icon: Truck,        color: 'text-slate-600',   bg: 'bg-slate-100/60'  },
    { label: t('vehicles:stats.available'),   value: statusCounts.available,   icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
    { label: t('vehicles:stats.inUse'),       value: statusCounts.in_use,      icon: Clock,        color: 'text-blue-600',    bg: 'bg-blue-50/60'    },
    { label: t('vehicles:stats.maintenance'), value: statusCounts.maintenance, icon: Settings2,    color: 'text-amber-600',   bg: 'bg-amber-50/60'   },
    { label: t('vehicles:stats.inactive'),    value: statusCounts.inactive,    icon: Ban,          color: 'text-slate-500',   bg: 'bg-slate-50/60'   },
  ];

  const viewModes = [
    { mode: 'compact', icon: Rows },
    { mode: 'normal',  icon: List },
    { mode: 'cards',   icon: LayoutGrid },
  ] as const;

  // ---------------------------------------------------------------
  // Views — usam "vehicles" directamente (já filtrados pelo back)
  // ---------------------------------------------------------------

  function renderCompactView() {
    return (
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 px-6 py-4 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
          <div className="col-span-3">{t('vehicles:table.plate')}</div>
          <div className="col-span-3">{t('vehicles:table.vehicle')}</div>
          <div className="col-span-2">{t('vehicles:table.category')}</div>
          <div className="col-span-2">{t('vehicles:table.status')}</div>
          <div className="col-span-2 text-right">{t('vehicles:table.actions')}</div>
        </div>
        <div className="divide-y">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/10 transition-colors duration-150">
              <div className="col-span-3">
                <span className="font-mono font-bold text-sm bg-muted/50 px-2.5 py-1 rounded border border-muted-foreground/10">
                  {vehicle.license_plate}
                </span>
              </div>
              <div className="col-span-3">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{vehicle.brand} {vehicle.model}</span>
                  <span className="text-xs text-muted-foreground">{vehicle.year}</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: vehicle?.category_color }} />
                <span className="text-sm font-medium">{vehicle.category_name}</span>
              </div>
              <div className="col-span-2">{getStatusBadge(vehicle.status)}</div>
              <div className="col-span-2 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => closeDropdownsAndOpenDialog(() => { selectVehicle(vehicle); setViewDialogOpen(true); })}>
                      <Eye className="w-4 h-4 mr-2" /> {t('vehicles:actions.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => closeDropdownsAndOpenDialog(() => { selectVehicle(vehicle); setEditDialogOpen(true); })}>
                      <Edit className="w-4 h-4 mr-2" /> {t('vehicles:actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openDeleteDialog(vehicle)}>
                      <Trash2 className="w-4 h-4 mr-2" /> {t('vehicles:actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden border-l-4 group hover:shadow-md transition-all duration-200 bg-card" style={{ borderLeftColor: vehicle.category_color }}>
            <CardContent className="p-0">
              <div className="flex items-center p-5 gap-5">
                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg tracking-tight">{vehicle.license_plate}</h3>
                    {getStatusBadge(vehicle.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="font-bold text-foreground/80">{vehicle.brand} {vehicle.model}</span>
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      {vehicle.category_name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => { selectVehicle(vehicle); setViewDialogOpen(true); }}>
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => { selectVehicle(vehicle); setEditDialogOpen(true); }}>
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10" onClick={() => { selectVehicle(vehicle); setDeleteDialogOpen(true); }}>
                    <Trash2 className="w-5 h-5" />
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
        {vehicles.map((vehicle) => (
          <Card 
            key={vehicle.id} 
            className="flex flex-col h-full group hover:shadow-lg transition-all duration-300 border-t-4 border-t-gray-200/50 dark:border-t-gray-700/50 bg-card relative"
          >
            <div 
              className="absolute top-5 left-12 w-3 h-3 rounded-full ring-2 ring-background shadow-sm opacity-45"
              style={{ backgroundColor: vehicle.category_color }}
              title={vehicle.category_name}
            />
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  <Truck className="w-5 h-5" />
                </div>
                {getStatusBadge(vehicle.status)}
              </div>
              <CardTitle className="text-xl font-mono font-bold">{vehicle.license_plate}</CardTitle>
              <CardDescription className="text-sm font-bold text-foreground/70">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 p-5 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-muted/50">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('vehicles:fields.mileage')}</p>
                  <p className="text-lg font-bold tracking-tight">
                    {vehicle.current_mileage?.toLocaleString('pt-AO')}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">km</span>
                  </p>
                </div>
                <div className="h-8 w-px bg-muted-foreground/10" />
                <div className="text-right space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('vehicles:table.category')}</p>
                  <p className="text-sm font-bold truncate max-w-[90px]">{vehicle.category_name}</p>
                </div>
              </div>
              <div className="mt-auto pt-2 flex gap-2">
                <Button className="flex-1 h-10 text-sm font-bold shadow-sm" onClick={() => { selectVehicle(vehicle); setViewDialogOpen(true); }}>
                  {t('vehicles:actions.view')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 border-muted-foreground/20 bg-background">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => closeDropdownsAndOpenDialog(() => { selectVehicle(vehicle); setEditDialogOpen(true); })}>
                      <Edit className="w-4 h-4 mr-2" /> {t('vehicles:actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openDeleteDialog(vehicle)}>
                      <Trash2 className="w-4 h-4 mr-2" /> {t('vehicles:actions.delete')}
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

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent -m-6 p-6">
      <div className="max-w-[1500px] mx-auto space-y-8 pb-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('vehicles:title')}</h1>
            <p className="text-muted-foreground text-base">{t('vehicles:description')}</p>
          </div>
          <div className="flex items-center gap-3">
            <NewVehicleDialog />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-[440px] grid-cols-2 bg-muted/60 p-1 rounded-xl border border-muted/50">
            <TabsTrigger value="vehicles" className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
              {t('vehicles:tabs.vehicles')}
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
              {t('vehicles:tabs.categories')}
            </TabsTrigger>
          </TabsList>

          {/* ---- TAB: VEÍCULOS ---- */}
          <TabsContent value="vehicles" className="space-y-6 mt-0 outline-none">

            {/* Stats — overflow-hidden evita corte do primeiro card */}
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
                      <p
                        className={cn("font-black tracking-tight leading-tight", stat.value >= 10_000 ? "text-lg" : "text-2xl")}
                        title={stat.value.toLocaleString('pt-PT')}
                      >
                        {formatStatValue(stat.value)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Toolbar — filtros + view modes numa linha, paginação na linha abaixo */}
            <div className="bg-card rounded-2xl border border-muted/50 shadow-sm overflow-hidden">
              {/* Linha 1: filtros + view modes */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3">
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t('vehicles:placeholders.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[160px] h-10 text-sm bg-muted/20 border-none">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder={t('vehicles:filters.status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('vehicles:filters.all')}</SelectItem>
                      <SelectItem value="available">{t('vehicles:status.available.label')}</SelectItem>
                      <SelectItem value="in_use">{t('vehicles:status.in_use.label')}</SelectItem>
                      <SelectItem value="maintenance">{t('vehicles:status.maintenance.label')}</SelectItem>
                      <SelectItem value="inactive">{t('vehicles:status.inactive.label')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[200px] h-10 text-sm bg-muted/20 border-none">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder={t('vehicles:filters.category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="flex items-center gap-2">
                          <span>{t('vehicles:filters.allCategories')}</span>
                          <span className="text-xs text-muted-foreground">({paginationInfo.total})</span>
                        </span>
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                            <span className="truncate">{category.name}</span>
                            <span className="text-xs text-muted-foreground">({getVehicleCountByCategory(category.id)})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* View modes */}
                <div className="flex bg-muted/30 p-1 rounded-xl border border-muted/50 self-center sm:self-auto shrink-0">
                  {viewModes.map((item) => (
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

              {/* Linha 2: paginação — só aparece quando há mais de 1 página */}
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
                <p className="text-sm text-muted-foreground font-bold animate-pulse">{t('vehicles:loading.syncing')}</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <Truck className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">{t('vehicles:empty.noVehicles')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('vehicles:empty.adjustFilters')}</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                {viewMode === 'compact' && renderCompactView()}
                {viewMode === 'normal'  && renderNormalView()}
                {viewMode === 'cards'   && renderCardsView()}
              </div>
            )}
          </TabsContent>

          {/* ---- TAB: CATEGORIAS ---- */}
          <TabsContent value="categories" className="space-y-6 mt-0 outline-none">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('vehicles:placeholders.search')}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-10 h-10 text-sm bg-card border-muted/50"
                />
              </div>
              <NewVehicleCategoryDialog />
            </div>

            {isCategoriesLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category) => (
                  <Card 
                    key={category.id} 
                    className="overflow-hidden group hover:shadow-lg transition-all border-muted/60 bg-card cursor-pointer"
                    onClick={() => openCategoryEditDialog(category)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110"
                            style={{ backgroundColor: `${category.color}15` }}
                          >
                            <Tag className="w-7 h-7" style={{ color: category.color }} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                            <Badge variant={category.is_active ? "outline" : "secondary"} className={cn(
                              "rounded-full text-[10px] font-bold px-2.5 py-0.5",
                              category.is_active ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" : ""
                            )}>
                              {category.is_active ? t('vehicles:categories.active') : t('vehicles:categories.inactive')}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-5 min-h-[40px]">
                        {category.description || t('vehicles:categories.noDescription')}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-muted/40">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: category.color }} />
                          <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">{category.color}</span>
                        </div>
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={(e) => { e.stopPropagation(); openCategoryEditDialog(category); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); openCategoryDeleteDialog(category); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <button 
                  onClick={() => document.getElementById('new-category-trigger')?.click()}
                  className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-card/50 hover:border-primary/40 hover:bg-primary/5 transition-all group min-h-[200px]"
                >
                  <div className="p-4 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors">
                    <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-base font-bold text-muted-foreground group-hover:text-primary transition-colors">
                    {t('vehicles:categories.new')}
                  </span>
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <EditVehicleDialog       open={editDialogOpen}         onOpenChange={setEditDialogOpen}         />
        <EditVehicleCategoryDialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen} />
        <ViewVehicleDialog       open={viewDialogOpen}         onOpenChange={setViewDialogOpen}         />

        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteVehicle}
          title={t('vehicles:dialogs.delete.title')}
          description={t('vehicles:dialogs.delete.description')}
          warning={t('vehicles:dialogs.delete.warning')}
          itemName={selectedVehicle?.license_plate}
          isLoading={isDeleting}
        />

        <ConfirmDeleteDialog
          open={categoryDeleteDialogOpen}
          onOpenChange={setCategoryDeleteDialogOpen}
          onConfirm={handleDeleteCategory}
          title={t('vehicles:categories.delete')}
          description={t('vehicles:categories.deleteDescription')}
          warning={t('vehicles:dialogs.delete.warning')}
          itemName={selectedCategory?.name}
          isLoading={isDeletingCategory}
        />
      </div>
    </div>
  );
}