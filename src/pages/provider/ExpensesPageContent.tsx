
// ========================================
// FILE: src/components/expense/ExpensesPageContent.tsx (CARDS ESTILIZADOS COMO VEHICLES)
// ========================================
import React, { useState, useEffect } from 'react';
import { useExpenses } from '@/contexts/ExpensesContext';
import { getAllExpenses, deleteExpense as deleteExpenseHelper } from '@/helpers/expense-helpers';
import { getAllExpenseCategories, deleteExpenseCategory } from '@/helpers/expense-category-helpers';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, AlertCircle, Calendar, Tag, Eye, Edit, Trash2, CheckCircle2, Search, LayoutGrid, List, Rows } from 'lucide-react';
import { RESTORE_EXPENSE_CATEGORY } from '@/helpers/ipc/db/expense_categories/expense-categories-channels';
import { cn } from '@/lib/utils';

import NewExpenseDialog from '@/components/expense/NewExpenseDialog';
import EditExpenseDialog from '@/components/expense/EditExpenseDialog';
import ViewExpenseDialog from '@/components/expense/ViewExpenseDialog';
import MarkAsPaidDialog from '@/components/expense/MarkAsPaidDialog';
import NewExpenseCategoryDialog from '@/components/expense/NewExpenseCategoryDialog';
import EditExpenseCategoryDialog from '@/components/expense/EditExpenseCategoryDialog';

type ViewMode = 'compact' | 'normal' | 'cards';

export default function ExpensesPageContent() {
  const { t } = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();
  
  const {
    state: { expenses, categories, isLoading, isCategoriesLoading },
    setExpenses,
    setCategories,
    selectExpense,
    selectCategory,
    deleteExpense: removeExpenseFromContext,
    deleteCategory: removeCategoryFromContext,
    setLoading,
    setCategoriesLoading,
    updateCategory,
  } = useExpenses();

  const [activeTab, setActiveTab] = useState('expenses');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);

  // ✨ Listener para categorias restauradas
  useEffect(() => {
    const handleCategoryRestored = (event: any) => {
      const { handler, result } = event.detail;
      if (handler === RESTORE_EXPENSE_CATEGORY && result) {
        updateCategory(result);
      }
    };
    window.addEventListener('action-completed', handleCategoryRestored);
    return () => window.removeEventListener('action-completed', handleCategoryRestored);
  }, [updateCategory]);

  // Load data
  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  async function loadExpenses() {
    setLoading(true);
    try {
      const data = await getAllExpenses();
      setExpenses(data);
    } catch (error) {
      handleError(error, 'expenses:errors.errorLoading');
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    setCategoriesLoading(true);
    try {
      const data = await getAllExpenseCategories();
      setCategories(data);
    } catch (error) {
      handleError(error, 'expenses:errors.errorLoadingCategories');
    } finally {
      setCategoriesLoading(false);
    }
  }

  // ✨ OVERDUE DETECTION
  function isOverdue(expense: any): boolean {
    if (expense.status === 'paid' || expense.status === 'cancelled') return false;
    if (!expense.due_date) return false;
    return new Date(expense.due_date) < new Date();
  }

  function getDaysOverdue(expense: any): number | null {
    if (!isOverdue(expense) || !expense.due_date) return null;
    const diff = new Date().getTime() - new Date(expense.due_date).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getStatusBadge(expense: any) {
    if (isOverdue(expense)) {
      return (
        <Badge variant="outline" className="rounded-full text-[10px] font-bold px-2.5 py-0.5 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t('expenses:status.overdue.label')}
        </Badge>
      );
    }
    
    const map = {
      pending: { 
        label: t('expenses:status.pending.label'), 
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800' 
      },
      paid: { 
        label: t('expenses:status.paid.label'), 
        className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800' 
      },
      cancelled: { 
        label: t('expenses:status.cancelled.label'), 
        className: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800' 
      },
    };
    
    const status = map[expense.status as keyof typeof map] || map.pending;
    return <Badge variant="outline" className={cn("rounded-full text-[10px] font-bold px-2.5 py-0.5", status.className)}>{status.label}</Badge>;
  }

  // Filtros
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = !searchTerm || 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.supplier && e.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'overdue' && isOverdue(e)) ||
      e.status === statusFilter;
    
    const matchesCategory = categoryFilter === 'all' || e.category_id === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredCategories = categories.filter(c =>
    !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculados
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  const overdueExpenses = expenses.filter(e => isOverdue(e)).reduce((sum, e) => sum + e.amount, 0);

  const activeCategories = categories.filter(c => c.is_active).length;
  const operationalCategories = categories.filter(c => c.type === 'operational').length;
  const administrativeCategories = categories.filter(c => c.type === 'administrative').length;
  const extraordinaryCategories = categories.filter(c => c.type === 'extraordinary').length;

  // View modes
  const viewModes = [
    { mode: 'compact', icon: Rows, label: t('common:viewModes.compact') },
    { mode: 'normal', icon: List, label: t('common:viewModes.normal') },
    { mode: 'cards', icon: LayoutGrid, label: t('common:viewModes.cards') },
  ] as const;

  async function handleDeleteExpense(id: string) {
    try {
      await deleteExpenseHelper(id);
      removeExpenseFromContext(id);
      showSuccess('expenses:toast.deleteSuccess');
    } catch (error) {
      handleError(error, 'expenses:toast.deleteError');
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      await deleteExpenseCategory(id);
      removeCategoryFromContext(id);
      showSuccess('expenses:toast.categoryDeleteSuccess');
    } catch (error) {
      handleError(error, 'expenses:toast.categoryDeleteError');
    }
  }

  // Render functions para despesas
  function renderCompactView() {
    return (
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 px-6 py-4 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
          <div className="col-span-3">{t('expenses:fields.description')}</div>
          <div className="col-span-2">{t('expenses:fields.category')}</div>
          <div className="col-span-2">{t('expenses:fields.dueDate')}</div>
          <div className="col-span-2">{t('expenses:fields.status')}</div>
          <div className="col-span-2">{t('expenses:fields.amount')}</div>
          <div className="col-span-1 text-right">{t('expenses:table.actions')}</div>
        </div>
        <div className="divide-y">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/10 transition-colors duration-150">
              <div className="col-span-3">
                <span className="text-sm font-medium truncate block">{expense.description}</span>
                {expense.vehicle_license && (
                  <span className="text-xs text-muted-foreground font-mono">{expense.vehicle_license}</span>
                )}
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  {expense.category_color && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: expense.category_color }} />
                  )}
                  <span className="text-sm text-muted-foreground truncate">{expense.category_name}</span>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-sm">
                  {expense.due_date ? new Date(expense.due_date).toLocaleDateString('pt-PT') : '-'}
                </span>
              </div>
              <div className="col-span-2">
                {getStatusBadge(expense)}
              </div>
              <div className="col-span-2">
                <span className="text-sm font-bold">{expense.amount.toLocaleString('pt-PT')} Kz</span>
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { selectExpense(expense); setViewDialogOpen(true); }}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); selectExpense(expense); setEditDialogOpen(true); }}>
                  <Edit className="w-4 h-4" />
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
        {filteredExpenses.map((expense) => (
          <Card 
            key={expense.id} 
            className="overflow-hidden border-l-4 group hover:shadow-md transition-all duration-200 bg-card cursor-pointer"
            style={{ borderLeftColor: expense.category_color }}
            onClick={() => { selectExpense(expense); setViewDialogOpen(true); }}
          >
            <CardContent className="p-0">
              <div className="flex items-center p-5 gap-5">
                <div 
                  className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${expense.category_color}20` }}
                >
                  <DollarSign className="w-6 h-6" style={{ color: expense.category_color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg tracking-tight truncate">{expense.description}</h3>
                    {getStatusBadge(expense)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      {expense.category_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(expense.expense_date).toLocaleDateString('pt-PT')}
                    </span>
                    {expense.vehicle_license && (
                      <span className="flex items-center gap-1.5 font-mono">
                        {expense.vehicle_license}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t('expenses:fields.amount')}</p>
                    <p className="text-xl font-bold text-primary">{expense.amount.toLocaleString('pt-PT')} Kz</p>
                  </div>
                  <div className="flex gap-1">
                    {expense.status === 'pending' && !isOverdue(expense) && (
                      <Button size="icon" variant="ghost" className="h-10 w-10 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); selectExpense(expense); setMarkAsPaidDialogOpen(true); }}>
                        <CheckCircle2 className="w-5 h-5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={(e) => { e.stopPropagation(); selectExpense(expense); setEditDialogOpen(true); }}>
                      <Edit className="w-5 h-5" />
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

  // Cards estilizados como VehiclesPageContent
  function renderCardsView() {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredExpenses.map((expense) => (
          <Card 
            key={expense.id} 
            className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-card border-muted/60 cursor-pointer"
            onClick={() => { selectExpense(expense); setViewDialogOpen(true); }}
          >
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex justify-between items-start mb-3">
                <div 
                  className="p-2.5 rounded-xl transition-colors"
                  style={{ backgroundColor: `${expense.category_color}20` }}
                >
                  <DollarSign className="w-5 h-5" style={{ color: expense.category_color }} />
                </div>
                {getStatusBadge(expense)}
              </div>
              <CardTitle className="text-lg font-bold leading-tight line-clamp-2" title={expense.description}>
                {expense.description}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                {expense.category_name}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col gap-3 p-5 pt-0">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-muted/50">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('expenses:fields.expenseDate')}</p>
                  <p className="text-sm font-bold">
                    {new Date(expense.expense_date).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </p>
                </div>
                <div className="h-8 w-px bg-muted-foreground/10" />
                <div className="text-right space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('expenses:fields.dueDate')}</p>
                  <p className="text-sm font-bold">
                    {expense.due_date 
                      ? new Date(expense.due_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
                      : '-'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {expense.vehicle_license && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{expense.vehicle_license}</span>
                  </div>
                )}
                {expense.supplier && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="truncate">{expense.supplier}</span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">{t('expenses:fields.amount')}</span>
                  <span className="text-xl font-black text-primary">
                    {expense.amount.toLocaleString('pt-PT')} <span className="text-sm font-bold">Kz</span>
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {expense.status === 'pending' && !isOverdue(expense) && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-xs font-bold text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectExpense(expense);
                        setMarkAsPaidDialogOpen(true);
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      {t('expenses:actions.markAsPaid')}
                    </Button>
                  )}
                  <Button 
                    className={cn(
                      "h-9 text-xs font-bold shadow-sm",
                      expense.status === 'pending' && !isOverdue(expense) ? "flex-[2]" : "flex-1"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectExpense(expense);
                      setViewDialogOpen(true);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    {expense.status !== 'pending' && !isOverdue(expense) && t('expenses:actions.view')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent -m-6 p-6">
      <div className="max-w-[1500px] mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t('expenses:title')}
            </h1>
            <p className="text-muted-foreground text-base">
              {activeTab === 'expenses' 
                ? t('expenses:info.totalExpenses', { count: expenses.length })
                : t('expenses:info.totalCategories', { count: categories.length })
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NewExpenseDialog />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs estilizadas igual ao FuelPageContent */}
          <TabsList className="grid w-full max-w-[440px] grid-cols-2 bg-muted/60 p-1 rounded-xl border border-muted/50">
            <TabsTrigger 
              value="expenses" 
              className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              {t('expenses:tabs.expenses')}
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="rounded-lg py-2.5 text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              {t('expenses:tabs.categories')}
            </TabsTrigger>
          </TabsList>

          {/* TAB: DESPESAS */}
          <TabsContent value="expenses" className="space-y-8 mt-0 outline-none">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('expenses:stats.total')}</p>
                    <p className="text-2xl font-black tracking-tight">{totalExpenses.toLocaleString('pt-PT')} Kz</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-50/60 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('expenses:stats.paid')}</p>
                    <p className="text-2xl font-black tracking-tight">{paidExpenses.toLocaleString('pt-PT')} Kz</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-50/60 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('expenses:stats.pending')}</p>
                    <p className="text-2xl font-black tracking-tight">{pendingExpenses.toLocaleString('pt-PT')} Kz</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('expenses:stats.overdue')}</p>
                    <p className="text-2xl font-black tracking-tight">{overdueExpenses.toLocaleString('pt-PT')} Kz</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card p-4 rounded-2xl border border-muted/50 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('expenses:searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-10 bg-muted/20 border-none">
                    <SelectValue placeholder={t('expenses:filters.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('expenses:filters.all')}</SelectItem>
                    <SelectItem value="pending">{t('expenses:filters.pending')}</SelectItem>
                    <SelectItem value="paid">{t('expenses:filters.paid')}</SelectItem>
                    <SelectItem value="overdue">{t('expenses:filters.overdue')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10 bg-muted/20 border-none">
                    <SelectValue placeholder={t('expenses:filters.allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('expenses:filters.allCategories')}</SelectItem>
                    {categories.filter(c => c.is_active).map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 self-center lg:self-auto">
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
            </div>

            {/* Lista de Despesas */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-bold animate-pulse">{t('common:loading')}...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <DollarSign className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">{t('expenses:noExpenses')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('common:noResults')}</p>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('expenses:categories.stats.total')}</p>
                    <p className="text-2xl font-black tracking-tight">{categories.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-50/60 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('expenses:categories.stats.operational')}</p>
                    <p className="text-2xl font-black tracking-tight">{operationalCategories}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('expenses:categories.stats.administrative')}</p>
                    <p className="text-2xl font-black tracking-tight">{administrativeCategories}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{t('expenses:categories.stats.extraordinary')}</p>
                    <p className="text-2xl font-black tracking-tight">{extraordinaryCategories}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-card p-4 rounded-2xl border border-muted/50 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('expenses:searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <NewExpenseCategoryDialog />
            </div>

            {/* Lista de Categorias - Estilo Vehicles */}
            {isCategoriesLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-bold animate-pulse">{t('common:loading')}...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <Tag className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">{t('expenses:alerts.noCategories')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('common:noResults')}</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-300">
                {filteredCategories.map((category) => (
                  <Card 
                    key={category.id} 
                    className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-card border-muted/60 cursor-pointer"
                    onClick={() => { selectCategory(category); setEditCategoryDialogOpen(true); }}
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
                          variant={category.is_active ? 'outline' : 'secondary'} 
                          className={cn(
                            "rounded-full text-[10px] font-bold px-2.5 py-0.5",
                            category.is_active 
                              ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" 
                              : "border-slate-200 text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          )}
                        >
                          {category.is_active ? t('expenses:categories.active') : t('expenses:categories.inactive')}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold leading-tight">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium text-muted-foreground">
                        {t(`expenses:categoryTypes.${category.type}`)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col gap-3 p-5 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                        {category.description || t('expenses:categories.noDescription')}
                      </p>

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
                            selectCategory(category);
                            setEditCategoryDialogOpen(true);
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
                            if (confirm(t('expenses:dialogs.deleteCategory.warning'))) handleDeleteCategory(category.id);
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
        <ViewExpenseDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
        <EditExpenseDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
        <MarkAsPaidDialog open={markAsPaidDialogOpen} onOpenChange={setMarkAsPaidDialogOpen} />
        <EditExpenseCategoryDialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen} />
      </div>
    </div>
  );
}