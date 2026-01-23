// src/pages/MaintenancePage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, AlertCircle, Search, Settings, Tag, Edit, Trash2, LayoutGrid, List, Rows } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import NewMaintenanceDialog from '@/components/maintenance/NewMaintenceDialog';
import NewWorkshopDialog from '@/components/workshop/NewWorkshopDialog';
import NewMaintenanceCategoryDialog from '@/components/maintenance/NewMaintenanceCategoryDialog';
import StartMaintenanceDialog from '@/components/maintenance/StartMaintenanceDialog';
import CompleteMaintenanceDialog from '@/components/maintenance/CompleteMaintenanceDialog';
import ViewMaintenanceDialog from '@/components/maintenance/ViewMaintenanceDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { getAllMaintenances, deleteMaintenance } from '@/helpers/maintenance-helpers';
import { getAllMaintenanceCategories, deleteMaintenanceCategory } from '@/helpers/maintenance-category-helpers';
import { IMaintenance } from '@/lib/types/maintenance';

type ViewMode = 'compact' | 'normal' | 'cards';

export default function MaintenancePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('maintenances');
  
  // Maintenances state
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  const [isLoading, setIsLoading] = useState(true);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  useEffect(() => {
    loadMaintenances();
    loadCategories();
  }, []);

  async function loadMaintenances() {
    setIsLoading(true);
    try {
      const data = await getAllMaintenances();
      setMaintenances(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar manutenções',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCategories() {
    setIsCategoriesLoading(true);
    try {
      const data = await getAllMaintenanceCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  function openDeleteDialog(maintenance: any) {
    setMaintenanceToDelete(maintenance);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteMaintenance() {
    if (!maintenanceToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMaintenance(maintenanceToDelete.id);
      setMaintenances(maintenances.filter(m => m.id !== maintenanceToDelete.id));
      toast({
        title: 'Sucesso',
        description: 'Manutenção excluída com sucesso',
      });
      setDeleteDialogOpen(false);
      setMaintenanceToDelete(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir manutenção',
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
      await deleteMaintenanceCategory(categoryToDelete.id);
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      toast({
        title: 'Sucesso',
        description: 'Categoria excluída com sucesso',
      });
      setCategoryDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir categoria',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingCategory(false);
    }
  }

  const filteredMaintenances = maintenances.filter((m: IMaintenance) => {
    const matchesSearch = m.vehicle_license?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  function getPriorityBadge(priority: string) {
    const map = {
      low: { label: 'Baixa', variant: 'outline' as const },
      normal: { label: 'Normal', variant: 'secondary' as const },
      high: { label: 'Alta', variant: 'destructive' as const },
      urgent: { label: 'Urgente', variant: 'destructive' as const },
    };
    const p = map[priority as keyof typeof map] || map.normal;
    return <Badge variant={p.variant}>{p.label}</Badge>;
  }

  function getStatusBadge(status: string) {
    const map = {
      scheduled: { label: 'Agendada', variant: 'outline' as const },
      in_progress: { label: 'Em Andamento', variant: 'secondary' as const },
      completed: { label: 'Concluída', variant: 'default' as const },
      cancelled: { label: 'Cancelada', variant: 'outline' as const },
    };
    const s = map[status as keyof typeof map] || map.scheduled;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  }

  function renderMaintenanceActions(maintenance: any) {
    return (
      <div className="flex gap-1">
        {maintenance.status === 'scheduled' && (
          <>
            <StartMaintenanceDialog
              maintenanceId={maintenance.id}
              vehicleLicense={maintenance.vehicle_license}
              categoryName={maintenance.category_name}
              onMaintenanceStarted={loadMaintenances}
            />
            <CompleteMaintenanceDialog
              maintenanceId={maintenance.id}
              vehicleLicense={maintenance.vehicle_license}
              categoryName={maintenance.category_name}
              currentStatus={maintenance.status}
              currentPartsCost={maintenance.parts_cost}
              currentLaborCost={maintenance.labor_cost}
              onMaintenanceCompleted={loadMaintenances}
            />
          </>
        )}
        {maintenance.status === 'in_progress' && (
          <CompleteMaintenanceDialog
            maintenanceId={maintenance.id}
            vehicleLicense={maintenance.vehicle_license}
            categoryName={maintenance.category_name}
            currentStatus={maintenance.status}
            currentPartsCost={maintenance.parts_cost}
            currentLaborCost={maintenance.labor_cost}
            onMaintenanceCompleted={loadMaintenances}
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openDeleteDialog(maintenance)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  function renderCompactView() {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-2 grid grid-cols-12 gap-4 text-sm font-medium">
          <div className="col-span-3">Veículo</div>
          <div className="col-span-3">Categoria</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Custo</div>
          <div className="col-span-2 text-right">Acções</div>
        </div>
        {filteredMaintenances.map((m) => (
          <div key={m.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center border-t hover:bg-muted/50">
            <div className="col-span-3 text-sm font-medium truncate">{m.vehicle_license}</div>
            <div className="col-span-3 text-sm text-muted-foreground truncate">{m.category_name}</div>
            <div className="col-span-2">{getStatusBadge(m.status)}</div>
            <div className="col-span-2 text-sm font-semibold truncate">{m.total_cost.toLocaleString('pt-AO')} Kz</div>
            <div className="col-span-2 flex gap-1 justify-end items-center">
              <ViewMaintenanceDialog maintenance={m} />
              {m.status === 'scheduled' && (
                <>
                  <StartMaintenanceDialog
                    maintenanceId={m.id}
                    vehicleLicense={m.vehicle_license}
                    categoryName={m.category_name}
                    onMaintenanceStarted={loadMaintenances}
                  />
                  <CompleteMaintenanceDialog
                    maintenanceId={m.id}
                    vehicleLicense={m.vehicle_license}
                    categoryName={m.category_name}
                    currentStatus={m.status}
                    currentPartsCost={m.parts_cost}
                    currentLaborCost={m.labor_cost}
                    onMaintenanceCompleted={loadMaintenances}
                  />
                </>
              )}
              {m.status === 'in_progress' && (
                <CompleteMaintenanceDialog
                  maintenanceId={m.id}
                  vehicleLicense={m.vehicle_license}
                  categoryName={m.category_name}
                  currentStatus={m.status}
                  currentPartsCost={m.parts_cost}
                  currentLaborCost={m.labor_cost}
                  onMaintenanceCompleted={loadMaintenances}
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => openDeleteDialog(m)}
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
          <Card key={maintenance.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                  maintenance.type === 'preventive' ? 'bg-blue-100 dark:bg-blue-950' : 'bg-orange-100 dark:bg-orange-950'
                }`}>
                  <Wrench className={`w-5 h-5 ${
                    maintenance.type === 'preventive' ? 'text-blue-600' : 'text-orange-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{maintenance.category_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {maintenance.vehicle_license} ({maintenance.vehicle_brand} {maintenance.vehicle_model})
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrada: {new Date(maintenance.entry_date).toLocaleDateString('pt-AO')}
                    {maintenance.exit_date && ` • Saída: ${new Date(maintenance.exit_date).toLocaleDateString('pt-AO')}`}
                  </p>
                  {maintenance.workshop_name && (
                    <div className="flex items-center gap-1 mt-1">
                      <Settings className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{maintenance.workshop_name}</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Badge variant={maintenance.type === 'preventive' ? 'default' : 'secondary'}>
                      {maintenance.type === 'preventive' ? 'Preventiva' : 'Correctiva'}
                    </Badge>
                    {getPriorityBadge(maintenance.priority)}
                    {getStatusBadge(maintenance.status)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Custo Total</p>
                  <p className="text-lg font-bold">{maintenance.total_cost.toLocaleString('pt-AO')} Kz</p>
                </div>
                <div className="flex gap-1">
                  <ViewMaintenanceDialog maintenance={maintenance} />
                  {renderMaintenanceActions(maintenance)}
                </div>
              </div>
            </div>

            {maintenance.status === 'in_progress' && (
              <div className="flex items-center gap-2 p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-md text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Manutenção em andamento</span>
              </div>
            )}
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
              <div className={`p-2 rounded-lg ${
                maintenance.type === 'preventive' ? 'bg-blue-100 dark:bg-blue-950' : 'bg-orange-100 dark:bg-orange-950'
              }`}>
                <Wrench className={`w-5 h-5 ${
                  maintenance.type === 'preventive' ? 'text-blue-600' : 'text-orange-600'
                }`} />
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
                {maintenance.type === 'preventive' ? 'Preventiva' : 'Correctiva'}
              </Badge>
              {getPriorityBadge(maintenance.priority)}
            </div>

            <div className="mt-auto space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Custo Total</p>
                <p className="text-lg font-bold truncate">{maintenance.total_cost.toLocaleString('pt-AO')} Kz</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  <ViewMaintenanceDialog maintenance={maintenance} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDeleteDialog(maintenance)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {maintenance.status === 'scheduled' && (
                  <div className="flex gap-1">
                    <StartMaintenanceDialog
                      maintenanceId={maintenance.id}
                      vehicleLicense={maintenance.vehicle_license}
                      categoryName={maintenance.category_name}
                      onMaintenanceStarted={loadMaintenances}
                    />
                    <CompleteMaintenanceDialog
                      maintenanceId={maintenance.id}
                      vehicleLicense={maintenance.vehicle_license}
                      categoryName={maintenance.category_name}
                      currentStatus={maintenance.status}
                      currentPartsCost={maintenance.parts_cost}
                      currentLaborCost={maintenance.labor_cost}
                      onMaintenanceCompleted={loadMaintenances}
                    />
                  </div>
                )}
                {maintenance.status === 'in_progress' && (
                  <CompleteMaintenanceDialog
                    maintenanceId={maintenance.id}
                    vehicleLicense={maintenance.vehicle_license}
                    categoryName={maintenance.category_name}
                    currentStatus={maintenance.status}
                    currentPartsCost={maintenance.parts_cost}
                    currentLaborCost={maintenance.labor_cost}
                    onMaintenanceCompleted={loadMaintenances}
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const inProgress = maintenances.filter(m => m.status === 'in_progress').length;
  const preventiveCount = categories.filter(c => c.type === 'preventive').length;
  const correctiveCount = categories.filter(c => c.type === 'corrective').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestão de Manutenções</h2>
          <p className="text-muted-foreground">
            {activeTab === 'maintenances' 
              ? `${inProgress} manutenç${inProgress !== 1 ? 'ões' : 'ão'} em andamento`
              : `${categories.length} categoria${categories.length !== 1 ? 's' : ''} registada${categories.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="maintenances" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Manutenções
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categorias
          </TabsTrigger>
        </TabsList>

        {/* TAB: MANUTENÇÕES */}
        <TabsContent value="maintenances" className="space-y-4 mt-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:flex-1">
              <div className="relative w-full sm:flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por veículo ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1 border rounded-lg p-1">
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
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <NewWorkshopDialog onWorkshopCreated={() => {
                toast({ title: 'Sucesso!', description: 'Oficina registada com sucesso.' });
              }} />
              <NewMaintenanceDialog onMaintenanceCreated={(maintenance) => {
                setMaintenances([maintenance, ...maintenances]);
              }} />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredMaintenances.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma manutenção encontrada</p>
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
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <Tag className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Preventivas</p>
                  <p className="text-2xl font-bold">{preventiveCount}</p>
                </div>
                <Tag className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Corretivas</p>
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
                placeholder="Pesquisar categoria..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <NewMaintenanceCategoryDialog onCategoryCreated={(category) => {
              setCategories([category, ...categories]);
            }} />
          </div>

          {isCategoriesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando...</p>
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
                        {category.type === 'preventive' ? 'Preventiva' : 'Corretiva'}
                      </Badge>
                      <Badge variant={category.is_active ? 'default' : 'outline'}>
                        {category.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openCategoryDeleteDialog(category)}
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
      </Tabs>

      {/* Confirm Delete Dialogs */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteMaintenance}
        title="Excluir Manutenção"
        itemName={maintenanceToDelete ? `${maintenanceToDelete.vehicle_license} - ${maintenanceToDelete.category_name}` : ''}
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
  );
}