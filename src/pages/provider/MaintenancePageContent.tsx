// ========================================
// FILE: src/components/maintenance/MaintenancePageContent.tsx (CORRIGIDO - BOTÕES START/COMPLETE VISÍVEIS)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { maintenanceStatus } from '@/lib/db/schemas/maintenances';
import { cn } from '@/lib/utils';
import { 
  Wrench, Search, Tag, Edit, Trash2, LayoutGrid, List, Rows, 
  Building2, AlertCircle, Clock, Flag, Settings, Phone, Mail, MapPin, Plus, Eye, Play, CheckCircle2
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
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
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
  
  // ✅ Start/Complete dialogs
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

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
    return <Badge variant="outline" className={cn("rounded-full text-[10px] font-bold px-2.5 py-0.5", p.className)}>{p.label}</Badge>;
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
      <Badge variant="outline" className={cn("flex items-center gap-1.5 font-bold rounded-full text-[10px] px-2.5 py-0.5", s.className)}>
        <Icon className="w-3.5 h-3.5" />
        {s.label}
      </Badge>
    );
  }

  // View modes com labels
  const viewModes = [
    { mode: 'compact', icon: Rows, label: t('common:viewModes.compact') },
    { mode: 'normal', icon: List, label: t('common:viewModes.normal') },
    { mode: 'cards', icon: LayoutGrid, label: t('common:viewModes.cards') },
  ] as const;

  // Views
  function renderCompactView() {
    return (
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 px-6 py-4 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
          <div className="col-span-3">{t('maintenances:fields.vehicle')}</div>
          <div className="col-span-3">{t('maintenances:fields.category')}</div>
          <div className="col-span-2">{t('maintenances:fields.status')}</div>
          <div className="col-span-2">{t('maintenances:fields.totalCost')}</div>
          <div className="col-span-2 text-right">{t('common:actions.actions')}</div>
        </div>
        <div className="divide-y">
          {filteredMaintenances.map((m) => (
            <div key={m.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/10 transition-colors duration-150">
              <div className="col-span-3">
                <span className="font-mono font-bold text-sm">{m.vehicle_license}</span>
                <p className="text-xs text-muted-foreground">{m.vehicle_brand} {m.vehicle_model}</p>
              </div>
              <div className="col-span-3">
                <span className="text-sm font-medium truncate block">{m.category_name}</span>
              </div>
              <div className="col-span-2">{getStatusBadge(m.status)}</div>
              <div className="col-span-2">
                <span className="text-sm font-bold">{m.total_cost.toLocaleString('pt-PT')} Kz</span>
              </div>
              <div className="col-span-2 flex gap-1 justify-end items-center">
                {m.status === maintenanceStatus.SCHEDULED && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectMaintenance(m);
                        setStartDialogOpen(true);
                      }}
                      title={t('maintenances:actions.start')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectMaintenance(m);
                        setCompleteDialogOpen(true);
                      }}
                      title={t('maintenances:actions.complete')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {m.status === maintenanceStatus.IN_PROGRESS && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectMaintenance(m);
                      setCompleteDialogOpen(true);
                    }}
                    title={t('maintenances:actions.complete')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={(e) => {
                    e.stopPropagation();
                    selectMaintenance(m);
                  }}
                  title={t('maintenances:actions.view')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectMaintenance(m);
                    setDeleteDialogOpen(true);
                  }}
                  title={t('common:actions.delete')}
                >
                  <Trash2 className="w-4 h-4" />
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
        {filteredMaintenances.map((maintenance) => (
          <Card 
            key={maintenance.id} 
            className="overflow-hidden border-l-4 group hover:shadow-md transition-all duration-200 bg-card"
            style={{ borderLeftColor: maintenance.type === 'preventive' ? '#3b82f6' : '#f97316' }}
          >
            <CardContent className="p-0">
              <div className="flex items-center p-5 gap-5">
                <div className={cn(
                  "hidden sm:flex h-12 w-12 items-center justify-center rounded-xl transition-colors cursor-pointer",
                  maintenance.type === 'preventive' 
                    ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' 
                    : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
                )}
                onClick={() => selectMaintenance(maintenance)}
                >
                  <Wrench className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => selectMaintenance(maintenance)}>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg tracking-tight">{maintenance.category_name}</h3>
                    {getStatusBadge(maintenance.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="font-mono font-bold text-foreground/80">{maintenance.vehicle_license}</span>
                    <span>{maintenance.vehicle_brand} {maintenance.vehicle_model}</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(maintenance.entry_date).toLocaleDateString('pt-PT')}
                    </span>
                    {maintenance.workshop_name && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        {maintenance.workshop_name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={maintenance.type === 'preventive' ? 'default' : 'secondary'} className="text-[10px]">
                      {t(`maintenances:type.${maintenance.type}.label`)}
                    </Badge>
                    {getPriorityBadge(maintenance.priority)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className="text-xs text-muted-foreground">{t('maintenances:fields.totalCost')}</p>
                    <p className="text-xl font-bold text-primary">{maintenance.total_cost.toLocaleString('pt-PT')} Kz</p>
                  </div>
                  {maintenance.status === maintenanceStatus.SCHEDULED && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-9 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectMaintenance(maintenance);
                          setStartDialogOpen(true);
                        }}
                      >
                        <Play className="w-4 h-4 mr-1.5" />
                        {t('maintenances:actions.start')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-9 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectMaintenance(maintenance);
                          setCompleteDialogOpen(true);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        {t('maintenances:actions.complete')}
                      </Button>
                    </>
                  )}
                  {maintenance.status === maintenanceStatus.IN_PROGRESS && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectMaintenance(maintenance);
                        setCompleteDialogOpen(true);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {t('maintenances:actions.complete')}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      selectMaintenance(maintenance); 
                    }}
                    title={t('maintenances:actions.view')}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10" onClick={(e) => { 
                    e.stopPropagation(); 
                    selectMaintenance(maintenance); 
                    setDeleteDialogOpen(true); 
                  }}>
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

  // Cards estilizados como VehiclesPageContent
  function renderCardsView() {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMaintenances.map((maintenance) => (
          <Card 
            key={maintenance.id} 
            className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-card border-muted/60"
          >
            <CardHeader className="pb-3 pt-5 px-5 cursor-pointer" onClick={() => selectMaintenance(maintenance)}>
              <div className="flex justify-between items-start mb-3">
                <div 
                  className={cn(
                    "p-2.5 rounded-xl transition-colors",
                    maintenance.type === 'preventive' 
                      ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
                      : 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'
                  )}
                >
                  <Wrench className="w-5 h-5" />
                </div>
                {getStatusBadge(maintenance.status)}
              </div>
              <CardTitle className="text-lg font-bold leading-tight line-clamp-2" title={maintenance.category_name}>
                {maintenance.category_name}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className="font-mono">{maintenance.vehicle_license}</span>
                <span>•</span>
                <span>{maintenance.vehicle_brand} {maintenance.vehicle_model}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col gap-3 p-5 pt-0">
              {/* Info Grid */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-muted/50">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('maintenances:fields.entryDate')}</p>
                  <p className="text-sm font-bold">
                    {new Date(maintenance.entry_date).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </p>
                </div>
                <div className="h-8 w-px bg-muted-foreground/10" />
                <div className="text-right space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('maintenances:fields.type')}</p>
                  <p className="text-sm font-bold">
                    {t(`maintenances:type.${maintenance.type}.short`)}
                  </p>
                </div>
              </div>

              {/* Workshop & Priority */}
              <div className="space-y-2">
                {maintenance.workshop_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{maintenance.workshop_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {getPriorityBadge(maintenance.priority)}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">{t('maintenances:fields.totalCost')}</span>
                  <span className="text-xl font-black text-primary">
                    {maintenance.total_cost.toLocaleString('pt-PT')} <span className="text-sm font-bold">Kz</span>
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {maintenance.status === maintenanceStatus.SCHEDULED && (
                    <>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectMaintenance(maintenance);
                          setStartDialogOpen(true);
                        }}
                      >
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        {t('maintenances:actions.start')}
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-xs font-bold text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectMaintenance(maintenance);
                          setCompleteDialogOpen(true);
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        {t('maintenances:actions.complete')}
                      </Button>
                    </>
                  )}
                  {maintenance.status === maintenanceStatus.IN_PROGRESS && (
                    <Button 
                      variant="default"
                      size="sm"
                      className="flex-1 h-9 text-xs font-bold bg-green-600 hover:bg-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectMaintenance(maintenance);
                        setCompleteDialogOpen(true);
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      {t('maintenances:actions.complete')}
                    </Button>
                  )}
                  {(maintenance.status === maintenanceStatus.COMPLETED || maintenance.status === maintenanceStatus.CANCELLED) && (
                    <Button 
                      variant="default"
                      size="sm"
                      className="flex-1 h-9 text-xs font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectMaintenance(maintenance);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      {t('maintenances:actions.view')}
                    </Button>
                  )}
                  {(maintenance.status === maintenanceStatus.SCHEDULED || maintenance.status === maintenanceStatus.IN_PROGRESS) && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="h-9 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectMaintenance(maintenance);
                      }}
                      title={t('maintenances:actions.view')}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
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
          <div className="flex items-center gap-3">
            <NewMaintenanceDialog />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
          <TabsContent value="maintenances" className="space-y-8 mt-0 outline-none">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t('maintenances:stats.total'), value: maintenances.length, icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-100/60' },
                { label: t('maintenances:stats.scheduled'), value: scheduled, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50/60' },
                { label: t('maintenances:stats.inProgress'), value: inProgress, icon: Settings, color: 'text-orange-600', bg: 'bg-orange-50/60' },
                { label: t('maintenances:stats.completed'), value: maintenances.filter(m => m.status === 'completed').length, icon: Flag, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
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
              </div>
                {/* View modes com labels */}
                <div className="flex bg-muted/30 p-1 rounded-xl border border-muted/50">
                  {viewModes.map((item) => (
                    <Button
                      key={item.mode}
                      variant={viewMode === item.mode ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode(item.mode as ViewMode)}
                      className={cn(
                        "h-9 px-3 rounded-lg transition-all flex items-center gap-2",
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
              <div className="animate-in fade-in duration-300">
                {viewMode === 'compact' && renderCompactView()}
                {viewMode === 'normal' && renderNormalView()}
                {viewMode === 'cards' && renderCardsView()}
              </div>
            )}
          </TabsContent>

          {/* TAB: CATEGORIAS - ESTILIZADO COMO VEHICLES */}
          <TabsContent value="categories" className="space-y-8 mt-0 outline-none">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('maintenances:stats.total')}</p>
                    <p className="text-2xl font-black tracking-tight">{categories.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-50/60 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('maintenances:categories.preventive')}</p>
                    <p className="text-2xl font-black tracking-tight">{preventiveCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('maintenances:categories.corrective')}</p>
                    <p className="text-2xl font-black tracking-tight">{correctiveCount}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-card p-4 rounded-2xl border border-muted/50 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('common:search')}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <NewMaintenanceCategoryDialog />
            </div>

            {isCategoriesLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-bold animate-pulse">{t('common:loading')}...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <Tag className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">{t('maintenances:categories.noCategories')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('common:noResults')}</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-300">
                {filteredCategories.map((category) => (
                  <Card 
                    key={category.id} 
                    className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-card border-muted/60 cursor-pointer"
                    onClick={() => {
                      selectCategory(category);
                      // Abrir dialog de edição se existir
                    }}
                  >
                    <CardHeader className="pb-3 pt-5 px-5">
                      <div className="flex justify-between items-start mb-3">
                        <div 
                          className="p-2.5 rounded-xl transition-colors"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <Tag className="w-5 h-5" style={{ color: category.color }} />
                        </div>
                        <Badge 
                          variant={category.type === 'preventive' ? 'default' : 'secondary'} 
                          className="rounded-full text-[10px] font-bold px-2.5 py-0.5"
                        >
                          {t(`maintenances:type.${category.type}.label`)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold leading-tight">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                        {category.description || t('maintenances:categories.noDescription')}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col gap-3 p-5 pt-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: category.color }} />
                        <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">{category.color}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-muted/50 flex gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9 text-xs font-bold bg-background hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Abrir edição
                          }}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          {t('common:actions.edit')}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive bg-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectCategory(category);
                            setCategoryDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          {t('common:actions.delete')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB: OFICINAS - ESTILIZADO COMO VEHICLES */}
          <TabsContent value="workshops" className="space-y-8 mt-0 outline-none">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('maintenances:workshops.stats.total')}</p>
                    <p className="text-2xl font-black tracking-tight">{workshops.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-50/60 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('maintenances:workshops.stats.active')}</p>
                    <p className="text-2xl font-black tracking-tight">{activeWorkshops}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('maintenances:workshops.stats.inactive')}</p>
                    <p className="text-2xl font-black tracking-tight">{workshops.length - activeWorkshops}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-card p-4 rounded-2xl border border-muted/50 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('common:search')}
                  value={workshopSearch}
                  onChange={(e) => setWorkshopSearch(e.target.value)}
                  className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <NewWorkshopDialog />
            </div>

            {isWorkshopsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-bold animate-pulse">{t('common:loading')}...</p>
              </div>
            ) : filteredWorkshops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <Building2 className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">{t('maintenances:workshops.noWorkshops')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('common:noResults')}</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-300">
                {filteredWorkshops.map((workshop) => (
                  <Card 
                    key={workshop.id} 
                    className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-card border-muted/60 cursor-pointer"
                    onClick={() => {
                      selectWorkshop(workshop);
                      setEditWorkshopDialogOpen(true);
                    }}
                  >
                    <CardHeader className="pb-3 pt-5 px-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className={cn(
                          "p-2.5 rounded-xl transition-colors",
                          workshop.is_active 
                            ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' 
                            : 'bg-muted text-muted-foreground'
                        )}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <Badge 
                          variant={workshop.is_active ? 'outline' : 'secondary'} 
                          className={cn(
                            "rounded-full text-[10px] font-bold px-2.5 py-0.5",
                            workshop.is_active 
                              ? "border-green-200 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800" 
                              : "border-slate-200 text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          )}
                        >
                          {workshop.is_active ? t('common:status.active') : t('common:status.inactive')}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold leading-tight truncate" title={workshop.name}>
                        {workshop.name}
                      </CardTitle>
                      {workshop.specialties && (
                        <CardDescription className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                          {workshop.specialties}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col gap-2 p-5 pt-0">
                      <div className="space-y-2 min-h-[60px]">
                        {workshop.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4 shrink-0" />
                            <span className="truncate">{workshop.phone}</span>
                          </div>
                        )}
                        {workshop.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 shrink-0" />
                            <span className="truncate">{workshop.email}</span>
                          </div>
                        )}
                        {workshop.city && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{workshop.city}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4 border-t border-muted/50 flex gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9 text-xs font-bold bg-background hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectWorkshop(workshop);
                            setEditWorkshopDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          {t('common:actions.edit')}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive bg-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectWorkshop(workshop);
                            setWorkshopDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          {t('common:actions.delete')}
                        </Button>
                      </div>
                    </CardContent>
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

        <StartMaintenanceDialog 
          open={startDialogOpen}
          onOpenChange={setStartDialogOpen}
        />

        <CompleteMaintenanceDialog 
          open={completeDialogOpen}
          onOpenChange={setCompleteDialogOpen}
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