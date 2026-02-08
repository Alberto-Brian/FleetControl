// ========================================
// FILE: src/components/maintenance/MaintenancePageContent.tsx (COMPLETO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { 
  Wrench, Search, Tag, Edit, Trash2, LayoutGrid, List, Rows, 
  Building2, AlertCircle, Clock, Flag, Settings, Phone, Mail, MapPin, Plus, Eye
} from 'lucide-react';

// Context
import { useMaintenances } from '@/contexts/MaintenancesContext';

// Helpers
import { getAllMaintenances as getAllMaintenancesHelper, deleteMaintenance as deleteMaintenanceHelper } from '@/helpers/maintenance-helpers';
import { getAllMaintenanceCategories as getAllCategoriesHelper, deleteMaintenanceCategory as deleteCategoryHelper } from '@/helpers/maintenance-category-helpers';
import { getAllWorkshops, deleteWorkshop as deleteWorkshopHelper } from '@/helpers/workshop-helpers';

// Dialogs
import NewMaintenanceDialog from '@/components/maintenance/NewMaintenanceDialog';
import StartMaintenanceDialog from '@/components/maintenance/StartMaintenanceDialog';
import CompleteMaintenanceDialog from '@/components/maintenance/CompleteMaintenanceDialog';
import ViewMaintenanceDialog from '@/components/maintenance/ViewMaintenanceDialog';
import NewMaintenanceCategoryDialog from '@/components/maintenance/NewMaintenanceCategoryDialog';
import NewWorkshopDialog from '@/components/maintenance/NewWorkshopDialog';
import EditWorkshopDialog from '@/components/maintenance/EditWorkshopDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { RESTORE_MAINTENANCE_CATEGORY } from '@/helpers/ipc/db/maintenance_categories/maintenance-categories-channels';

type ViewMode = 'compact' | 'normal' | 'cards';

export default function MaintenancePageContent() {
  const { t } = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();

  // ✨ CONTEXT
  const {
    state: { 
      maintenances, 
      categories, 
      workshops,
      selectedMaintenance, 
      selectedCategory,
      selectedWorkshop,
      isLoading, 
      isCategoriesLoading,
      isWorkshopsLoading 
    },
    setMaintenances,
    setCategories,
    setWorkshops,
    selectMaintenance,
    selectCategory,
    selectWorkshop,
    deleteMaintenance: removeMaintenanceFromContext,
    deleteCategory: removeCategoryFromContext,
    deleteWorkshop: removeWorkshopFromContext,
    setLoading,
    setCategoriesLoading,
    setWorkshopsLoading,
    updateCategory,
    updateWorkshop,
  } = useMaintenances();

  // Estados UI
  const [activeTab, setActiveTab] = useState('maintenances');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards'); // ✨ Padrão é cards
  const [categorySearch, setCategorySearch] = useState('');
  const [workshopSearch, setWorkshopSearch] = useState('');

  // Delete dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [workshopDeleteDialogOpen, setWorkshopDeleteDialogOpen] = useState(false);
  const [isDeletingWorkshop, setIsDeletingWorkshop] = useState(false);

  // Edit dialogs
  const [editWorkshopDialogOpen, setEditWorkshopDialogOpen] = useState(false);

  // ✨ Escuta eventos de categorias e workshops restaurados
  useEffect(() => {
    const handleActionCompleted = (event: any) => {
      const { handler, result } = event.detail;
      
      if (handler === RESTORE_MAINTENANCE_CATEGORY && result) {
        updateCategory(result);
      }
    };

    window.addEventListener('action-completed', handleActionCompleted);
    
    return () => {
      window.removeEventListener('action-completed', handleActionCompleted);
    };
  }, [updateCategory]);

  useEffect(() => {
    loadMaintenances();
    loadCategories();
    loadWorkshops();
  }, []);

  async function loadMaintenances() {
    setLoading(true);
    try {
      const data = await getAllMaintenancesHelper();
      setMaintenances(data);
    } catch (error) {
      handleError(error, 'maintenances:errors.errorLoading');
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    setCategoriesLoading(true);
    try {
      const data = await getAllCategoriesHelper();
      setCategories(data);
    } catch (error) {
      handleError(error, 'maintenances:errors.errorLoadingCategories');
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function loadWorkshops() {
    setWorkshopsLoading(true);
    try {
      const data = await getAllWorkshops();
      setWorkshops(data);
    } catch (error) {
      handleError(error, 'common:errors.loadingData');
    } finally {
      setWorkshopsLoading(false);
    }
  }

  async function handleDeleteMaintenance() {
    if (!selectedMaintenance) return;
    setIsDeleting(true);
    
    try {
      await deleteMaintenanceHelper(selectedMaintenance.id);
      removeMaintenanceFromContext(selectedMaintenance.id);
      showSuccess('maintenances:toast.deleteSuccess');
      setDeleteDialogOpen(false);
      selectMaintenance(null);
    } catch (error) {
      handleError(error, 'maintenances:toast.deleteError');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleDeleteCategory() {
    if (!selectedCategory) return;
    setIsDeletingCategory(true);
    
    try {
      await deleteCategoryHelper(selectedCategory.id);
      removeCategoryFromContext(selectedCategory.id);
      showSuccess('maintenances:toast.categoryDeleteSuccess');
      setCategoryDeleteDialogOpen(false);
      selectCategory(null);
    } catch (error) {
      handleError(error, 'maintenances:toast.categoryDeleteError');
    } finally {
      setIsDeletingCategory(false);
    }
  }

  async function handleDeleteWorkshop() {
    if (!selectedWorkshop) return;
    setIsDeletingWorkshop(true);
    
    try {
      await deleteWorkshopHelper(selectedWorkshop.id);
      removeWorkshopFromContext(selectedWorkshop.id);
      showSuccess('maintenances:workshops.toast.deleteSuccess');
      setWorkshopDeleteDialogOpen(false);
      selectWorkshop(null);
    } catch (error) {
      handleError(error, 'maintenances:workshops.toast.deleteError');
    } finally {
      setIsDeletingWorkshop(false);
    }
  }

  // Filtros
  const filteredMaintenances = maintenances.filter((m) => {
    const matchesSearch = 
      m.vehicle_license?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredWorkshops = workshops.filter(w =>
    w.name?.toLowerCase().includes(workshopSearch.toLowerCase()) ||
    w.city?.toLowerCase().includes(workshopSearch.toLowerCase())
  );

  // Badges
  function getPriorityBadge(priority: string) {
    const map = {
      low: { label: t('maintenances:priority.low.label'), className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' },
      normal: { label: t('maintenances:priority.normal.label'), className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400' },
      high: { label: t('maintenances:priority.high.label'), className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400' },
      urgent: { label: t('maintenances:priority.urgent.label'), className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400' },
    };
    const p = map[priority as keyof typeof map] || map.normal;
    return <Badge variant="outline" className={cn("font-medium", p.className)}>{p.label}</Badge>;
  }

  function getStatusBadge(status: string) {
    const map = {
      scheduled: { label: t('maintenances:status.scheduled.label'), icon: Clock, className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400' },
      in_progress: { label: t('maintenances:status.in_progress.label'), icon: Settings, className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400' },
      completed: { label: t('maintenances:status.completed.label'), icon: Flag, className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' },
      cancelled: { label: t('maintenances:status.cancelled.label'), icon: AlertCircle, className: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400' },
    };
    const s = map[status as keyof typeof map] || map.scheduled;
    const Icon = s.icon;
    return (
      <Badge variant="outline" className={cn("flex items-center gap-1.5 font-bold", s.className)}>
        <Icon className="w-3.5 h-3.5" />
        {s.label}
      </Badge>
    );
  }

  // Views
  function renderCompactView() {
    return (
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="bg-muted px-4 py-2 grid grid-cols-12 gap-4 text-sm font-medium">
          <div className="col-span-3">{t('maintenances:fields.vehicle')}</div>
          <div className="col-span-3">{t('maintenances:fields.category')}</div>
          <div className="col-span-2">{t('maintenances:fields.status')}</div>
          <div className="col-span-2">{t('maintenances:fields.totalCost')}</div>
          <div className="col-span-2 text-right">{t('common:actions.actions')}</div>
        </div>
        {filteredMaintenances.map((m) => (
          <div key={m.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center border-t hover:bg-muted/50">
            <div className="col-span-3 text-sm font-medium truncate">{m.vehicle_license}</div>
            <div className="col-span-3 text-sm text-muted-foreground truncate">{m.category_name}</div>
            <div className="col-span-2">{getStatusBadge(m.status)}</div>
            <div className="col-span-2 text-sm font-semibold truncate">{m.total_cost.toLocaleString('pt-PT')} Kz</div>
            <div className="col-span-2 flex gap-1 justify-end items-center">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => selectMaintenance(m)}>
                <Eye className="w-4 h-4" />
              </Button>
              {m.status === 'scheduled' && (
                <>
                  <StartMaintenanceDialog />
                  <CompleteMaintenanceDialog />
                </>
              )}
              {m.status === 'in_progress' && <CompleteMaintenanceDialog />}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  selectMaintenance(m);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderNormalView() {
    return (
      <div className="grid gap-4">
        {filteredMaintenances.map((maintenance) => (
          <Card key={maintenance.id} className="overflow-hidden hover:shadow-md transition-shadow bg-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    "p-2 rounded-lg",
                    maintenance.type === 'preventive' 
                      ? 'bg-blue-100 dark:bg-blue-950' 
                      : 'bg-orange-100 dark:bg-orange-950'
                  )}>
                    <Wrench className={cn(
                      "w-5 h-5",
                      maintenance.type === 'preventive' ? 'text-blue-600' : 'text-orange-600'
                    )} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{maintenance.category_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {maintenance.vehicle_license} ({maintenance.vehicle_brand} {maintenance.vehicle_model})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('maintenances:info.enteredOn')} {new Date(maintenance.entry_date).toLocaleDateString('pt-PT')}
                      {maintenance.exit_date && ` • ${t('maintenances:info.exitedOn')} ${new Date(maintenance.exit_date).toLocaleDateString('pt-PT')}`}
                    </p>
                    {maintenance.workshop_name && (
                      <div className="flex items-center gap-1 mt-1">
                        <Settings className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{maintenance.workshop_name}</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant={maintenance.type === 'preventive' ? 'default' : 'secondary'}>
                        {t(`maintenances:type.${maintenance.type}.label`)}
                      </Badge>
                      {getPriorityBadge(maintenance.priority)}
                      {getStatusBadge(maintenance.status)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t('maintenances:fields.totalCost')}</p>
                    <p className="text-lg font-bold">{maintenance.total_cost.toLocaleString('pt-PT')} Kz</p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => selectMaintenance(maintenance)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {t('maintenances:actions.view')}
                    </Button>
                    {maintenance.status === 'scheduled' && (
                      <>
                        <StartMaintenanceDialog />
                        <CompleteMaintenanceDialog />
                      </>
                    )}
                    {maintenance.status === 'in_progress' && <CompleteMaintenanceDialog />}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        selectMaintenance(maintenance);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {maintenance.status === 'in_progress' && (
                <div className="flex items-center gap-2 p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t('maintenances:alerts.vehicleInMaintenance')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function renderCardsView() {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMaintenances.map((maintenance) => (
          <Card key={maintenance.id} className="p-4 flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-2 rounded-lg",
                maintenance.type === 'preventive' 
                  ? 'bg-blue-100 dark:bg-blue-950' 
                  : 'bg-orange-100 dark:bg-orange-950'
              )}>
                <Wrench className={cn(
                  "w-5 h-5",
                  maintenance.type === 'preventive' ? 'text-blue-600' : 'text-orange-600'
                )} />
              </div>
              {getStatusBadge(maintenance.status)}
            </div>

            <h3 className="font-semibold mb-1 line-clamp-1">{maintenance.category_name}</h3>
            <p className="text-sm text-muted-foreground mb-3 truncate">
              {maintenance.vehicle_license}
            </p>

            {maintenance.workshop_name && (
              <div className="flex items-center gap-1 mb-3">
                <Settings className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{maintenance.workshop_name}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1 mb-4">
              <Badge variant={maintenance.type === 'preventive' ? 'default' : 'secondary'} className="text-xs">
                {t(`maintenances:type.${maintenance.type}.label`)}
              </Badge>
              {getPriorityBadge(maintenance.priority)}
            </div>

            <div className="mt-auto space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">{t('maintenances:fields.totalCost')}</p>
                <p className="text-lg font-bold truncate">{maintenance.total_cost.toLocaleString('pt-PT')} Kz</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => selectMaintenance(maintenance)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {t('maintenances:actions.view')}
                </Button>
                
                {maintenance.status === 'scheduled' && (
                  <div className="flex gap-1">
                    <StartMaintenanceDialog />
                    <CompleteMaintenanceDialog />
                  </div>
                )}
                {maintenance.status === 'in_progress' && <CompleteMaintenanceDialog />}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    selectMaintenance(maintenance);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t('common:actions.delete')}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Stats
  const inProgress = maintenances.filter(m => m.status === 'in_progress').length;
  const scheduled = maintenances.filter(m => m.status === 'scheduled').length;
  const preventiveCount = categories.filter(c => c.type === 'preventive').length;
  const correctiveCount = categories.filter(c => c.type === 'corrective').length;
  const activeWorkshops = workshops.filter(w => w.is_active).length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent -m-6 p-6">
      <div className="max-w-[1500px] mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('maintenances:title')}</h1>
            <p className="text-muted-foreground text-base">
              {activeTab === 'maintenances' 
                ? t('maintenances:info.inProgressCount', { count: inProgress })
                : activeTab === 'categories'
                ? `${categories.length} ${t('maintenances:categories.title').toLowerCase()}`
                : t('maintenances:workshops.info.activeCount', { count: activeWorkshops, plural: activeWorkshops !== 1 ? 's' : '' })
              }
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-[440px] grid-cols-3 bg-muted/60 p-1 rounded-xl border border-muted/50">
            <TabsTrigger 
              value="maintenances" 
              className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              {t('maintenances:tabs.maintenances')}
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              {t('maintenances:tabs.categories')}
            </TabsTrigger>
            <TabsTrigger 
              value="workshops" 
              className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              {t('maintenances:tabs.workshops')}
            </TabsTrigger>
          </TabsList>

          {/* TAB: MANUTENÇÕES */}
          <TabsContent value="maintenances" className="space-y-4 mt-6">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t('maintenances:stats.total'), value: maintenances.length, icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-100/60' },
                { label: t('maintenances:stats.scheduled'), value: scheduled, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50/60' },
                { label: t('maintenances:stats.inProgress'), value: inProgress, icon: Settings, color: 'text-orange-600', bg: 'bg-orange-50/60' },
                { label: t('maintenances:stats.completed'), value: maintenances.filter(m => m.status === 'completed').length, icon: Flag, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
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
                    placeholder={t('maintenances:searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10 text-sm bg-muted/20 border-none">
                    <SelectValue placeholder={t('maintenances:filters.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('maintenances:filters.all')}</SelectItem>
                    <SelectItem value="scheduled">{t('maintenances:filters.scheduled')}</SelectItem>
                    <SelectItem value="in_progress">{t('maintenances:filters.in_progress')}</SelectItem>
                    <SelectItem value="completed">{t('maintenances:filters.completed')}</SelectItem>
                    <SelectItem value="cancelled">{t('maintenances:filters.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-1 border rounded-lg p-1 bg-muted/20">
                  <Button
                    variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('compact')}
                    className="h-8 w-8 p-0"
                  >
                    <Rows className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'normal' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('normal')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="h-8 w-8 p-0"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 w-full lg:w-auto">
                <NewMaintenanceDialog />
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
            ) : filteredMaintenances.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <Wrench className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">{t('maintenances:noMaintenances')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? t('common:noResults') : t('common:noData')}
                </p>
              </div>
            ) : (
              <>
                {viewMode === 'compact' && renderCompactView()}
                {viewMode === 'normal' && renderNormalView()}
                {viewMode === 'cards' && renderCardsView()}
              </>
            )}
          </TabsContent>

          {/* TAB: CATEGORIAS */}
          <TabsContent value="categories" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('maintenances:stats.total')}</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                  <Tag className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('maintenances:categories.preventive')}</p>
                    <p className="text-2xl font-bold">{preventiveCount}</p>
                  </div>
                  <Tag className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('maintenances:categories.corrective')}</p>
                    <p className="text-2xl font-bold">{correctiveCount}</p>
                  </div>
                  <Tag className="w-8 h-8 text-orange-600" />
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('common:search')}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <NewMaintenanceCategoryDialog />
            </div>

            {isCategoriesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('common:loading')}...</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <Tag className="w-5 h-5" style={{ color: category.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={category.type === 'preventive' ? 'default' : 'secondary'}>
                          {t(`maintenances:type.${category.type}.label`)}
                        </Badge>
                        <Badge variant={category.is_active ? 'default' : 'outline'}>
                          {category.is_active ? t('common:status.active') : t('common:status.active')}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            selectCategory(category);
                            setCategoryDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB: OFICINAS */}
          <TabsContent value="workshops" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('maintenances:workshops.stats.total')}</p>
                    <p className="text-2xl font-bold">{workshops.length}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('maintenances:workshops.stats.active')}</p>
                    <p className="text-2xl font-bold">{activeWorkshops}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('maintenances:workshops.stats.inactive')}</p>
                    <p className="text-2xl font-bold">{workshops.length - activeWorkshops}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('common:search')}
                  value={workshopSearch}
                  onChange={(e) => setWorkshopSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <NewWorkshopDialog />
            </div>

            {isWorkshopsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('common:loading')}...</p>
              </div>
            ) : filteredWorkshops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <Building2 className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">{t('maintenances:workshops.noWorkshops')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('common:noResults')}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredWorkshops.map((workshop) => (
                  <Card 
                    key={workshop.id} 
                    className="p-4 group hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      selectWorkshop(workshop);
                      setEditWorkshopDialogOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{workshop.name}</h3>
                          <Badge variant={workshop.is_active ? 'default' : 'outline'}>
                            {workshop.is_active ? t('common:status.active') : t('common:status.active')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs text-muted-foreground mb-3">
                      {workshop.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{workshop.phone}</span>
                        </div>
                      )}
                      {workshop.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{workshop.email}</span>
                        </div>
                      )}
                      {workshop.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{workshop.city}</span>
                        </div>
                      )}
                    </div>

                    {workshop.specialties && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        <span className="font-medium">{t('maintenances:workshops.fields.specialties')}:</span> {workshop.specialties}
                      </p>
                    )}

                    <div className="flex gap-1 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectWorkshop(workshop);
                          setEditWorkshopDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="flex-1 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectWorkshop(workshop);
                          setWorkshopDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <ViewMaintenanceDialog
          open={!!selectedMaintenance}
          onOpenChange={(open) => !open && selectMaintenance(null)}
        />

        <EditWorkshopDialog 
          open={editWorkshopDialogOpen} 
          onOpenChange={setEditWorkshopDialogOpen} 
        />

        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteMaintenance}
          title={t('maintenances:dialogs.delete.title')}
          description={t('maintenances:dialogs.delete.warning')}
          itemName={selectedMaintenance ? `${selectedMaintenance.vehicle_license} - ${selectedMaintenance.category_name}` : ''}
          isLoading={isDeleting}
        />

        <ConfirmDeleteDialog
          open={categoryDeleteDialogOpen}
          onOpenChange={setCategoryDeleteDialogOpen}
          onConfirm={handleDeleteCategory}
          title={t('maintenances:dialogs.deleteCategory.title')}
          description={t('maintenances:dialogs.deleteCategory.warning')}
          itemName={selectedCategory?.name}
          isLoading={isDeletingCategory}
        />

        <ConfirmDeleteDialog
          open={workshopDeleteDialogOpen}
          onOpenChange={setWorkshopDeleteDialogOpen}
          onConfirm={handleDeleteWorkshop}
          title={t('maintenances:workshops.dialogs.delete.title')}
          description={t('maintenances:workshops.dialogs.delete.warning')}
          itemName={selectedWorkshop?.name}
          isLoading={isDeletingWorkshop}
        />
      </div>
    </div>
  );
}