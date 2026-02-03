import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Search, Truck, Edit, Trash2, Eye, Tag, LayoutGrid, List, Rows, 
  AlertCircle, Plus, Filter, MoreHorizontal,
  CheckCircle2, Clock, Settings2, Ban
} from 'lucide-react';
import { getAllVehicles, deleteVehicle } from '@/helpers/vehicle-helpers';
import { getAllVehicleCategories, deleteVehicleCategory } from '@/helpers/vehicle-category-helpers';
import { cn } from '@/lib/utils';

// Dialogs
import NewVehicleCategoryDialog from '@/components/vehicle-category/NewVehicleCategoryDialog';
import NewVehicleDialog from '@/components/vehicle/NewVehicleDialog';
import EditVehicleDialog from '@/components/vehicle/EditVehicleDialog';
import ViewVehicleDialog from '@/components/vehicle/ViewVehicleDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type ViewMode = 'compact' | 'normal' | 'cards';

export default function VehiclesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('vehicles');

  // Vehicles state
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [isLoading, setIsLoading] = useState(true);

  // Vehicle dialogs state
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  useEffect(() => {
    loadVehicles();
    loadCategories();
  }, []);

  async function loadVehicles() {
    setIsLoading(true);
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (error) {
      console.error(error);
      toast({
        title: t('common:error'),
        description: t('vehicles:errorLoading'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCategories() {
    setIsCategoriesLoading(true);
    try {
      const data = await getAllVehicleCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
      toast({
        title: t('common:error'),
        description: t('vehicles:errorLoadingCategories'),
        variant: 'destructive',
      });
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  function openDeleteDialog(vehicle: any) {
    setSelectedVehicle(vehicle);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteVehicle() {
    if (!selectedVehicle) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(selectedVehicle.id);
      setVehicles(vehicles.filter(v => v.id !== selectedVehicle.id));
      toast({
        title: t('common:success'),
        description: t('vehicles:deleteSuccess'),
      });
      setDeleteDialogOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      toast({
        title: t('common:error'),
        description: t('vehicles:deleteError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  function openCategoryDeleteDialog(category: any) {
    setCategoryToDelete(category);
    setCategoryDeleteDialogOpen(true);
  }

  async function handleDeleteCategory() {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    try {
      await deleteVehicleCategory(categoryToDelete.id);
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      toast({
        title: t('common:success'),
        description: t('vehicles:categoryDeleteSuccess'),
      });
      setCategoryDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      toast({
        title: t('common:error'),
        description: t('vehicles:categoryDeleteError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeletingCategory(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusMap = {
      available: { 
        label: t('vehicles:available'), 
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
      },
      in_use: { 
        label: t('vehicles:inUse'), 
        icon: Clock,
        className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
      },
      maintenance: { 
        label: t('vehicles:maintenance'), 
        icon: Settings2,
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
      },
      inactive: { 
        label: t('vehicles:inactive'), 
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

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  function renderCompactView() {
    return (
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 px-6 py-4 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
          <div className="col-span-3">{t('vehicles:table:plate')}</div>
          <div className="col-span-3">{t('vehicles:table:vehicle')}</div>
          <div className="col-span-2">{t('vehicles:table:category')}</div>
          <div className="col-span-2">{t('vehicles:table:status')}</div>
          <div className="col-span-2 text-right">{t('vehicles:table:actions')}</div>
        </div>
        <div className="divide-y">
          {filteredVehicles.map((vehicle) => (
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
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: vehicle.category_color }} />
                <span className="text-sm font-medium">{vehicle.category_name}</span>
              </div>
              <div className="col-span-2">{getStatusBadge(vehicle.status)}</div>
              <div className="col-span-2 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreHorizontal className="w-4.5 h-4.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => { setSelectedVehicle(vehicle); setViewDialogOpen(true); }}>
                      <Eye className="w-4 h-4 mr-2" /> {t('vehicles:details')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSelectedVehicle(vehicle); setEditDialogOpen(true); }}>
                      <Edit className="w-4 h-4 mr-2" /> {t('vehicles:edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openDeleteDialog(vehicle)}>
                      <Trash2 className="w-4 h-4 mr-2" /> {t('vehicles:delete')}
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
        {filteredVehicles.map((vehicle) => (
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
                  <div className="flex wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="font-bold text-foreground/80">{vehicle.brand} {vehicle.model}</span>
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      {vehicle.category_name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => { setSelectedVehicle(vehicle); setViewDialogOpen(true); }}>
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => { setSelectedVehicle(vehicle); setEditDialogOpen(true); }}>
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10" onClick={() => openDeleteDialog(vehicle)}>
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
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="flex flex-col h-full group hover:shadow-lg transition-all duration-300 border-t-4 bg-card" style={{ borderTopColor: vehicle.category_color }}>
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
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('vehicles:mileage')}</p>
                  <p className="text-lg font-bold tracking-tight">
                    {vehicle.current_mileage?.toLocaleString('pt-AO')} 
                    <span className="ml-1 text-xs font-normal text-muted-foreground">km</span>
                  </p>
                </div>
                <div className="h-8 w-px bg-muted-foreground/10" />
                <div className="text-right space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('vehicles:table:category')}</p>
                  <p className="text-sm font-bold truncate max-w-[90px]">{vehicle.category_name}</p>
                </div>
              </div>

              <div className="mt-auto pt-2 flex gap-2">
                <Button 
                  className="flex-1 h-10 text-sm font-bold shadow-sm" 
                  onClick={() => { setSelectedVehicle(vehicle); setViewDialogOpen(true); }}
                >
                  {t('vehicles:details')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 border-muted-foreground/20 bg-background">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedVehicle(vehicle); setEditDialogOpen(true); }}>
                      <Edit className="w-4 h-4 mr-2" /> {t('vehicles:edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openDeleteDialog(vehicle)}>
                      <Trash2 className="w-4 h-4 mr-2" /> {t('vehicles:delete')}
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

  const availableCount = vehicles.filter(v => v.status === 'available').length;
  const inUseCount = vehicles.filter(v => v.status === 'in_use').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;

  return (
    /* Fundo cinza suave apenas no modo claro, modo escuro mantém o original */
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent -m-6 p-6"> 
      <div className="max-w-[1500px] mx-auto space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('vehicles:title')}</h1>
            <p className="text-muted-foreground text-base">
              {t('vehicles:description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NewVehicleDialog onVehicleCreated={(vehicle) => setVehicles([vehicle, ...vehicles])} />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-[440px] grid-cols-2 bg-muted/60 p-1 rounded-xl border border-muted/50">
            <TabsTrigger 
              value="vehicles" 
              className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              {t('vehicles:tabs:vehicles')}
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              {t('vehicles:tabs:categories')}
            </TabsTrigger>
          </TabsList>

          {/* TAB: VEÍCULOS */}
          <TabsContent value="vehicles" className="space-y-8 mt-0 outline-none">
            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t('vehicles:total'), value: vehicles.length, icon: Truck, color: 'text-slate-600', bg: 'bg-slate-100/60' },
                { label: t('vehicles:available'), value: availableCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
                { label: t('vehicles:inUse'), value: inUseCount, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50/60' },
                { label: t('vehicles:maintenance'), value: maintenanceCount, icon: Settings2, color: 'text-amber-600', bg: 'bg-amber-50/60' },
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
                    placeholder={t('vehicles:searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10 text-sm bg-muted/20 border-none">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={t('vehicles:statusFilter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('vehicles:allStatus')}</SelectItem>
                    <SelectItem value="available">{t('vehicles:available')}</SelectItem>
                    <SelectItem value="in_use">{t('vehicles:inUse')}</SelectItem>
                    <SelectItem value="maintenance">{t('vehicles:maintenance')}</SelectItem>
                    <SelectItem value="inactive">{t('vehicles:inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 self-center lg:self-auto">
                <div className="flex bg-muted/30 p-1 rounded-xl border border-muted/50">
                  {[
                    { mode: 'compact', icon: Rows },
                    { mode: 'normal', icon: List },
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

            {/* Content Area */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-bold animate-pulse">Sincronizando frota...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <Truck className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">Nenhum veículo encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1">Tente ajustar os seus filtros de pesquisa.</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                {viewMode === 'compact' && renderCompactView()}
                {viewMode === 'normal' && renderNormalView()}
                {viewMode === 'cards' && renderCardsView()}
              </div>
            )}
          </TabsContent>

          {/* TAB: CATEGORIAS */}
          <TabsContent value="categories" className="space-y-6 mt-0 outline-none">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar categoria..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-10 h-10 text-sm bg-card border-muted/50"
                />
              </div>
              <NewVehicleCategoryDialog onCategoryCreated={(category) => setCategories([category, ...categories])} />
            </div>

            {isCategoriesLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="overflow-hidden group hover:shadow-md transition-all border-muted/60 bg-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                            style={{ backgroundColor: `${category.color}15` }}
                          >
                            <Tag className="w-5 h-5" style={{ color: category.color }} />
                          </div>
                          <h3 className="font-bold text-base">{category.name}</h3>
                        </div>
                        <Badge variant={category.is_active ? "outline" : "secondary"} className={cn(
                          "rounded-full text-[10px] font-bold px-2.5 py-0.5",
                          category.is_active ? "border-emerald-200 text-emerald-700 bg-emerald-50" : ""
                        )}>
                          {category.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                        {category.description || "Sem descrição definida."}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-muted/60">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">{category.color}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/5"
                            onClick={() => openCategoryDeleteDialog(category)}
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
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-card/50 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                >
                  <div className="p-2.5 rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground group-hover:text-primary">Nova Categoria</span>
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
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
          onConfirm={handleDeleteVehicle}
          title="Excluir Veículo"
          itemName={selectedVehicle?.license_plate}
          isLoading={isDeleting}
        />

        <ConfirmDeleteDialog
          open={categoryDeleteDialogOpen}
          onOpenChange={setCategoryDeleteDialogOpen}
          onConfirm={handleDeleteCategory}
          title="Excluir Categoria"
          itemName={categoryToDelete?.name}
          isLoading={isDeletingCategory}
        />
      </div>
    </div>
  );
}
