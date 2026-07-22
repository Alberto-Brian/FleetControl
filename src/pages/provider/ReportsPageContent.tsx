// ========================================
// FILE: src/pages/provider/ReportsPageContent.tsx
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText, Download, Calendar, Users, Truck,
  MapPin, Fuel, Wrench, DollarSign, Filter,
  Search, BarChart3, Activity, Clock, Printer,
  Eye, CheckCircle2, LayoutGrid, List, Trash2,
  RefreshCcw, Plus, ChevronRight, AlertCircle,
  Loader2, History, Navigation, ParkingCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { pt as ptLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { generateReport, generateExpensesReport } from '@/helpers/report-helpers';
import { GenerateReportDialog } from '@/components/reports/GenerateReportDialog';
import { SearchableSelect } from '@/components/ui/searchable-select';


// ==================== TIPOS ====================

type ReportType = 'vehicles' | 'drivers' | 'trips' | 'fuel' | 'maintenance' | 'financial' | 'expenses' | 'general';
type ReportCategory = 'all' | 'fleet' | 'financial' | 'operational';
type ViewMode = 'grid' | 'list';
type ActiveTab = 'reports' | 'history' | 'gps';

interface ReportDefinition {
  type: ReportType;
  category: 'fleet' | 'financial' | 'operational';
  icon: React.ElementType;
  color: string;
  bgColor: string;
  frequency: string;
}

interface GeneratedReport {
  id: string;
  type: ReportType;
  title: string;
  period_start: string;
  period_end: string;
  language: string;
  file_name: string;
  file_size?: number;
  stats: any;
  created_at: string;
}

// ==================== GPS REPORT TYPES ====================

interface GpsDevice { id: string; traccar_id: number; name: string; uniqueId: string; status: string; }

interface GpsSummary {
  deviceId:     number;
  distance:     number;
  maxSpeed:     number;
  averageSpeed: number;
  engineHours:  number;
  spentFuel?:   number;
  startTime?:   string;
  endTime?:     string;
}

interface GpsStop {
  deviceId:  number;
  latitude:  number;
  longitude: number;
  startTime: string;
  endTime:   string;
  duration:  number;
  address?:  string;
}

interface GpsEvent {
  id:          number;
  deviceId:    number;
  type:        string;
  eventTime:   string;
  geofenceId?: number;
  attributes?: Record<string, unknown>;
}

type GpsSubTab = 'summary' | 'stops' | 'events';

// ==================== CONFIG ====================

const REPORT_DEFINITIONS: ReportDefinition[] = [
  { type: 'vehicles',    category: 'fleet',       icon: Truck,       color: 'text-blue-600',    bgColor: 'bg-blue-50 dark:bg-blue-950/20',    frequency: 'monthly'     },
  { type: 'drivers',     category: 'fleet',       icon: Users,       color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/20', frequency: 'weekly'  },
  { type: 'trips',       category: 'operational', icon: MapPin,      color: 'text-violet-600',  bgColor: 'bg-violet-50 dark:bg-violet-950/20',  frequency: 'daily'    },
  { type: 'fuel',        category: 'financial',   icon: Fuel,        color: 'text-amber-600',   bgColor: 'bg-amber-50 dark:bg-amber-950/20',    frequency: 'monthly'    },
  { type: 'maintenance', category: 'fleet',       icon: Wrench,      color: 'text-rose-600',    bgColor: 'bg-rose-50 dark:bg-rose-950/20',      frequency: 'biweekly' },
  { type: 'financial',   category: 'financial',   icon: DollarSign,  color: 'text-green-600',   bgColor: 'bg-green-50 dark:bg-green-950/20',    frequency: 'monthly'    },
  { type: 'general',     category: 'operational', icon: Activity,    color: 'text-slate-600',   bgColor: 'bg-slate-50 dark:bg-slate-950/20',    frequency: 'quarterly'},
];

// ==================== DATE PRESETS ====================

function getDateRange(preset: string): { start: string; end: string } {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = now.getMonth();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  switch (preset) {
    case 'today':     return { start: fmt(now), end: fmt(now) };
    case 'thisWeek': {
      const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1);
      return { start: fmt(mon), end: fmt(now) };
    }
    case 'thisMonth':  return { start: fmt(new Date(y, m, 1)),   end: fmt(new Date(y, m + 1, 0)) };
    case 'lastMonth':  return { start: fmt(new Date(y, m - 1, 1)), end: fmt(new Date(y, m, 0)) };
    case 'thisYear':   return { start: fmt(new Date(y, 0, 1)),   end: fmt(new Date(y, 11, 31)) };
    case 'last30Days': return { start: fmt(new Date(now.setDate(now.getDate() - 30))), end: fmt(new Date()) };
    case 'last90Days': return { start: fmt(new Date(now.setDate(now.getDate() - 90))), end: fmt(new Date()) };
    default:           return { start: fmt(new Date(y, m, 1)),   end: fmt(new Date(y, m + 1, 0)) };
  }
}

// ==================== HELPERS ====================

function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getReportDef(type: ReportType): ReportDefinition {
  return REPORT_DEFINITIONS.find(r => r.type === type) || REPORT_DEFINITIONS[6];
}

// ==================== HELPERS GPS ====================

function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function fmtDate(iso?: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const EVENT_LABELS: Record<string, string> = {
  geofenceEnter:   'Entrou em zona',
  geofenceExit:    'Saiu de zona',
  speedLimit:      'Excesso velocidade',
  deviceOverspeed: 'Excesso velocidade',
  ignitionOn:      'Ignição ligada',
  ignitionOff:     'Ignição desligada',
  deviceMoving:    'Em movimento',
  deviceStopped:   'Parado',
};

// ==================== GPS REPORTS TAB ====================

function GpsReportsTab() {
  const [devices,     setDevices]     = useState<GpsDevice[]>([]);
  const [selectedId,  setSelectedId]  = useState<string>('');
  const [from,        setFrom]        = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 16);
  });
  const [to,          setTo]          = useState(() => new Date().toISOString().slice(0, 16));
  const [subTab,      setSubTab]      = useState<GpsSubTab>('summary');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const [summary,     setSummary]     = useState<GpsSummary[]>([]);
  const [stops,       setStops]       = useState<GpsStop[]>([]);
  const [events,      setEvents]      = useState<GpsEvent[]>([]);

  useEffect(() => {
    (window as any)._tracking?.getDevices()
      ?.then((devs: GpsDevice[]) => setDevices(devs ?? []))
      ?.catch(console.error);
  }, []);

  async function handleGenerate() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    const params = { deviceId: Number(selectedId), from: new Date(from).toISOString(), to: new Date(to).toISOString() };
    try {
      if (subTab === 'summary') {
        const data = await (window as any)._tracking?.getGpsSummary(params);
        setSummary(Array.isArray(data) ? data : [data].filter(Boolean));
      } else if (subTab === 'stops') {
        const data = await (window as any)._tracking?.getGpsStops(params);
        setStops(data ?? []);
      } else {
        const data = await (window as any)._tracking?.getGpsEvents(params);
        setEvents(data ?? []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  const SUB_TABS: { key: GpsSubTab; label: string; icon: React.ElementType }[] = [
    { key: 'summary', label: 'Resumo',    icon: BarChart3        },
    { key: 'stops',   label: 'Paragens',  icon: ParkingCircle    },
    { key: 'events',  label: 'Eventos',   icon: Zap              },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Device selector */}
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Dispositivo</label>
              <SearchableSelect
                placeholder="Seleccionar dispositivo..."
                searchPlaceholder="Pesquisar por nome ou IMEI..."
                emptyMessage="Nenhum dispositivo encontrado."
                value={selectedId}
                onValueChange={setSelectedId}
                options={devices.map(d => ({
                  value:         String(d.traccar_id),
                  searchText:    `${d.name} ${d.uniqueId}`,
                  label: (
                    <span className="flex items-center gap-2 w-full">
                      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', d.status === 'online' ? 'bg-green-500' : 'bg-slate-400')} />
                      <span className="font-medium truncate">{d.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto font-mono">{d.uniqueId}</span>
                    </span>
                  ),
                  selectedLabel: (
                    <span className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', d.status === 'online' ? 'bg-green-500' : 'bg-slate-400')} />
                      {d.name}
                    </span>
                  ),
                }))}
              />
            </div>

            {/* Date from */}
            <div className="flex-1 min-w-[170px]">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">De</label>
              <input
                type="datetime-local"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Date to */}
            <div className="flex-1 min-w-[170px]">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Até</label>
              <input
                type="datetime-local"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button onClick={handleGenerate} disabled={!selectedId || loading} className="h-9 gap-2 flex-shrink-0 self-end">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              Gerar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-lg border border-border w-fit">
        {SUB_TABS.map(st => (
          <button
            key={st.key}
            type="button"
            onClick={() => setSubTab(st.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              subTab === st.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <st.icon className="w-4 h-4" />
            {st.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {subTab === 'summary' && summary.length > 0 && (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 grid grid-cols-6 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
            <div className="col-span-2">Dispositivo</div>
            <div>Distância</div>
            <div>Vel. Máx.</div>
            <div>Vel. Média</div>
            <div>Tempo motor</div>
          </div>
          <div className="divide-y">
            {summary.map((s, i) => {
              const dev = devices.find(d => d.traccar_id === s.deviceId);
              return (
                <div key={i} className="px-6 py-4 grid grid-cols-6 gap-4 items-center hover:bg-muted/40 transition-colors">
                  <div className="col-span-2 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-semibold text-sm truncate">{dev?.name ?? `Device #${s.deviceId}`}</span>
                  </div>
                  <div className="text-sm font-medium">{(s.distance / 1000).toFixed(1)} km</div>
                  <div className="text-sm">{Math.round(s.maxSpeed)} km/h</div>
                  <div className="text-sm">{Math.round(s.averageSpeed)} km/h</div>
                  <div className="text-sm">{fmtDuration(s.engineHours)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {subTab === 'stops' && stops.length > 0 && (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
            <div className="col-span-2">Dispositivo</div>
            <div className="col-span-3">Início</div>
            <div className="col-span-3">Fim</div>
            <div className="col-span-2">Duração</div>
            <div className="col-span-2">Localização</div>
          </div>
          <div className="divide-y">
            {stops.map((s, i) => {
              const dev = devices.find(d => d.traccar_id === s.deviceId);
              return (
                <div key={i} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/40 transition-colors">
                  <div className="col-span-2 flex items-center gap-2">
                    <ParkingCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="font-semibold text-sm truncate">{dev?.name ?? `Device #${s.deviceId}`}</span>
                  </div>
                  <div className="col-span-3 text-sm">{fmtDate(s.startTime)}</div>
                  <div className="col-span-3 text-sm">{fmtDate(s.endTime)}</div>
                  <div className="col-span-2 text-sm font-medium">{fmtDuration(s.duration)}</div>
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {s.address ?? `${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {subTab === 'events' && events.length > 0 && (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
            <div className="col-span-2">Dispositivo</div>
            <div className="col-span-4">Tipo</div>
            <div className="col-span-3">Data/Hora</div>
            <div className="col-span-3">Geofence</div>
          </div>
          <div className="divide-y">
            {events.map((e, i) => {
              const dev = devices.find(d => d.traccar_id === e.deviceId);
              return (
                <div key={i} className="px-6 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/40 transition-colors">
                  <div className="col-span-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-violet-500 flex-shrink-0" />
                    <span className="font-semibold text-sm truncate">{dev?.name ?? `Device #${e.deviceId}`}</span>
                  </div>
                  <div className="col-span-4">
                    <Badge variant="secondary" className="text-xs">{EVENT_LABELS[e.type] ?? e.type}</Badge>
                  </div>
                  <div className="col-span-3 text-sm">{fmtDate(e.eventTime)}</div>
                  <div className="col-span-3 text-xs text-muted-foreground">
                    {e.geofenceId ? `#${e.geofenceId}` : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty states */}
      {!loading && !error && (
        <>
          {subTab === 'summary' && summary.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border-2 border-dashed border-muted/50">
              <BarChart3 className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="font-bold text-base">Sem dados de resumo</p>
              <p className="text-sm text-muted-foreground mt-1">Selecciona um dispositivo e clica em Gerar</p>
            </div>
          )}
          {subTab === 'stops' && stops.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border-2 border-dashed border-muted/50">
              <ParkingCircle className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="font-bold text-base">Sem paragens registadas</p>
              <p className="text-sm text-muted-foreground mt-1">Altera o intervalo de datas e clica em Gerar</p>
            </div>
          )}
          {subTab === 'events' && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border-2 border-dashed border-muted/50">
              <Zap className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="font-bold text-base">Sem eventos registados</p>
              <p className="text-sm text-muted-foreground mt-1">Altera o intervalo de datas e clica em Gerar</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export function ReportsPageContent() {
  const { t, i18n } = useTranslation();

  // State
  const [activeTab,      setActiveTab]      = useState<ActiveTab>('reports');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory>('all');
  const [viewMode,       setViewMode]       = useState<ViewMode>(() => (localStorage.getItem('viewMode_reports') as ViewMode) || 'list');
  useEffect(() => { localStorage.setItem('viewMode_reports', viewMode); }, [viewMode]);
  const [datePreset,     setDatePreset]     = useState('thisMonth');
  const [generating,     setGenerating]     = useState<ReportType | null>(null);
  const [historySearch,  setHistorySearch]  = useState('');
  const [historyFilter,  setHistoryFilter]  = useState<ReportType | 'all'>('all');
  const [deleteTarget,   setDeleteTarget]   = useState<string | null>(null);
  const [dialogOpen,        setDialogOpen]        = useState(false);
  const [dialogDefaultType, setDialogDefaultType] = useState<ReportType | undefined>();


  // Data
  const [history,        setHistory]        = useState<GeneratedReport[]>([]);
  const [stats,          setStats]          = useState({ total: 0, thisMonth: 0, byType: {} as Record<string, number> });
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ==================== FETCH ====================

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const filters: any = {};
      if (historyFilter !== 'all') filters.type = historyFilter;
      if (historySearch)           filters.search = historySearch;
      const data = await window._reports.listGenerated(filters);
      setHistory(data);
    } catch (err) {
      toast.error(t('reports:errors.loading'));
    } finally {
      setLoadingHistory(false);
    }
  }, [historyFilter, historySearch, t]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await window._reports.statsGenerated();
      setStats(data);
    } catch {}
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { fetchStats(); },  [fetchStats]);

  // ==================== GERAR RELATÓRIO ====================

  const handleGenerate = async (report: ReportDefinition, action: 'download' | 'preview' | 'print' = 'download') => {
    const dateRange = getDateRange(datePreset);
    setGenerating(report.type);
    toast.loading(t('reports:toast.generating'), { id: 'gen' });

    try {
      await generateReport(report.type, dateRange, action);
      toast.success(t('reports:toast.success'), { id: 'gen' });
      await fetchHistory();
      await fetchStats();
    } catch (err) {
      toast.error(t('reports:toast.error'), { id: 'gen' });
    } finally {
      setGenerating(null);
    }
  };

  // ==================== GERAR RELATÓRIO COM PARÂMETROS PERSONALIZÁVEIS ====================
  const handleDialogGenerate = async (
    type: ReportType,
    dateRange: { start: string; end: string },
    action: 'download' | 'preview' | 'print',
    dateField?: string,
  ) => {
    setGenerating(type);
    toast.loading(t('reports:toast.generating'), { id: 'gen' });
    try {
      if (type === 'expenses') {
        await generateExpensesReport(dateRange, dateField ?? 'expense_date', action);
      } else {
        await generateReport(type, dateRange, action);
      }
      toast.success(t('reports:toast.success'), { id: 'gen' });
      await fetchHistory();
      await fetchStats();
    } catch {
      toast.error(t('reports:toast.error'), { id: 'gen' });
    } finally {
      setGenerating(null);
    }
  };

  // ==================== REDOWNLOAD ====================

  const handleRedownload = async (id: string) => {
    toast.loading(t('reports:toast.downloading'), { id: 'dl' });
    try {
      const result = await window._reports.redownload(id);
      if (result.success && result.report) {
        await generateReport(
          result.report.type,
          result.report.dateRange,
          'download'
        );
        toast.success(t('reports:toast.success'), { id: 'dl' });
      } else {
        toast.error(t('reports:toast.error'), { id: 'dl' });
      }
    } catch {
      toast.error(t('reports:toast.error'), { id: 'dl' });
    }
  };

  // ==================== DELETE ====================

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await window._reports.deleteGenerated(deleteTarget);
      toast.success(t('reports:toast.deleteSuccess'));
      setDeleteTarget(null);
      await fetchHistory();
      await fetchStats();
    } catch {
      toast.error(t('reports:toast.error'));
    }
  };

  // ==================== FILTERED REPORTS ====================

  const filteredDefinitions = REPORT_DEFINITIONS.filter(r => {
    const title = t(`reports:types.${r.type}.title`).toLowerCase();
    const desc  = t(`reports:types.${r.type}.description`).toLowerCase();
    const matchSearch   = title.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || r.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // ==================== STAT CARDS ====================

  const statCards = [
    { label: t('reports:stats.totalGenerated'), value: String(stats.total),     icon: FileText,  color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { label: t('reports:stats.thisMonth'),      value: String(stats.thisMonth), icon: Calendar,  color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: t('reports:stats.typesUsed'),      value: String(Object.values(stats.byType).filter(v => v > 0).length), icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/20' },
    { label: t('reports:stats.available'),      value: String(REPORT_DEFINITIONS.length), icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  ];

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-transparent -m-6 p-6">
      <div className="max-w-[1500px] mx-auto space-y-8 pb-10">

        {/* ── Header + Tabs ── */}
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as ActiveTab)}>
          <div className="flex items-center gap-4">
            <div className="space-y-0.5">
              <h1 className="text-2xl font-extrabold tracking-tight">{t('reports:title')}</h1>
              <p className="text-muted-foreground text-sm">
                {t('reports:subtitle', { count: REPORT_DEFINITIONS.length, thisMonth: stats.thisMonth })}
              </p>
            </div>
            <TabsList className="flex h-9 items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 mx-auto">
              <TabsTrigger value="reports" className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> {t('reports:tabs.reportTypes')}
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-1.5">
                <History className="w-4 h-4" /> {t('reports:tabs.history')}
                {stats.total > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{stats.total}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="gps" className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-1.5">
                <Navigation className="w-4 h-4" /> Rastreamento GPS
              </TabsTrigger>
            </TabsList>
            <Button className="h-9 gap-2 flex-shrink-0" onClick={() => { setDialogDefaultType(undefined); setDialogOpen(true); }}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('reports:actions.newReport')}</span>
            </Button>
          </div>

          {/* ── Stats ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((s, i) => (
              <Card key={i} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={cn('p-3 rounded-xl', s.bg, s.color)}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="text-2xl font-black tracking-tight">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ══════════ TAB: REPORTS ══════════ */}
          <TabsContent value="reports" className="mt-6">
            <div className="grid lg:grid-cols-[260px_1fr] gap-6">

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Período */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" /> {t('reports:filters.period')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 pt-0">
                    {[
                      { value: 'today',     label: t('reports:datePresets.today') },
                      { value: 'thisWeek',  label: t('reports:datePresets.thisWeek') },
                      { value: 'thisMonth', label: t('reports:datePresets.thisMonth') },
                      { value: 'lastMonth', label: t('reports:datePresets.lastMonth') },
                      { value: 'last90Days',label: t('reports:datePresets.last90Days') },
                      { value: 'thisYear',  label: t('reports:datePresets.thisYear') },
                    ].map(opt => (
                      <Button
                        key={opt.value}
                        variant={datePreset === opt.value ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start text-sm font-medium h-9',
                          datePreset === opt.value && 'bg-primary/10 text-primary hover:bg-primary/20'
                        )}
                        onClick={() => setDatePreset(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Categorias */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                      <Filter className="w-4 h-4" /> {t('reports:filters.categories')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 pt-0">
                    {([
                      { value: 'all',         label: t('reports:categories.all'),       count: REPORT_DEFINITIONS.length },
                      { value: 'fleet',       label: t('reports:categories.fleet'),       count: REPORT_DEFINITIONS.filter(r => r.category === 'fleet').length },
                      { value: 'financial',   label: t('reports:categories.financial'),  count: REPORT_DEFINITIONS.filter(r => r.category === 'financial').length },
                      { value: 'operational', label: t('reports:categories.operational'), count: REPORT_DEFINITIONS.filter(r => r.category === 'operational').length },
                    ] as const).map(cat => (
                      <Button
                        key={cat.value}
                        variant={categoryFilter === cat.value ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-between text-sm font-medium h-9',
                          categoryFilter === cat.value && 'bg-primary/10 text-primary hover:bg-primary/20'
                        )}
                        onClick={() => setCategoryFilter(cat.value as ReportCategory)}
                      >
                        <span>{cat.label}</span>
                        <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Gerados recentes */}
                {history.length > 0 && (
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t('reports:recentlyGenerated')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      {history.slice(0, 4).map(r => {
                        const def = getReportDef(r.type);
                        return (
                          <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className={cn('p-2 rounded-lg', def.bgColor, def.color)}>
                              <def.icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{t(`reports:types.${r.type}.title`)}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {format(parseISO(r.created_at), 'dd MMM yyyy', { locale: ptLocale })}
                              </p>
                            </div>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          </div>
                        );
                      })}
                      <Button variant="ghost" size="sm" className="w-full text-xs mt-1" onClick={() => setActiveTab('history')}>
                        {t('reports:viewAllHistory')} <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main Grid */}
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3 rounded-xl border border-muted/50 shadow-sm">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t('reports:searchPlaceholder')}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm bg-muted/20 border-none focus-visible:ring-1"
                    />
                  </div>
                  <div className="flex bg-muted/30 p-1 rounded-lg border border-muted/50">
                    {(['grid', 'list'] as ViewMode[]).map(mode => (
                      <Button
                        key={mode}
                        variant={viewMode === mode ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode(mode)}
                        className={cn('h-8 px-3 rounded-md', viewMode === mode ? 'bg-background shadow-sm' : 'text-muted-foreground')}
                      >
                        {mode === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Cards Grid */}
                {viewMode === 'grid' ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredDefinitions.map(report => {
                      const isGen  = generating === report.type;
                      const count  = stats.byType[report.type] || 0;
                      return (
                        <Card key={report.type} className="group overflow-hidden border-muted/60 hover:shadow-lg transition-all duration-300 bg-card">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className={cn('p-3 rounded-xl transition-all duration-300 group-hover:scale-110', report.bgColor, report.color)}>
                                <report.icon className="w-6 h-6" />
                              </div>
                              <div className="flex items-center gap-2">
                                {count > 0 && (
                                  <Badge variant="secondary" className="text-[10px]">{count}x</Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                                  {t(`reports:frequencies.${report.frequency}`)}
                                </Badge>
                              </div>
                            </div>
                            <CardTitle className="text-base font-bold mt-3">
                              {t(`reports:types.${report.type}.title`)}
                            </CardTitle>
                            <CardDescription className="text-sm line-clamp-2">
                              {t(`reports:types.${report.type}.description`)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Info */}
                            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/40 border text-xs">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">{t('reports:fields.period')}</p>
                                <p className="font-semibold">{t(`reports:datePresets.${datePreset}`)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">{t('reports:fields.category')}</p>
                                <p className="font-semibold">{t(`reports:categories.${report.category}`)}</p>
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline" size="sm"
                                className="flex-1 h-8 text-xs gap-1.5"
                                disabled={isGen}
                                onClick={() => handleGenerate(report, 'preview')}
                              >
                                {isGen ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                                {t('reports:actions.preview')}
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 h-8 text-xs gap-1.5"
                                disabled={isGen}
                                onClick={() => handleGenerate(report, 'download')}
                              >
                                {isGen ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                {t('reports:actions.generatePDF')}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  /* List View */
                  <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-muted/50 px-6 py-3 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
                      <div className="col-span-4">{t('reports:table.report')}</div>
                      <div className="col-span-2">{t('reports:table.category')}</div>
                      <div className="col-span-2">{t('reports:table.frequency')}</div>
                      <div className="col-span-2">{t('reports:table.generated')}</div>
                      <div className="col-span-2 text-right">{t('reports:table.actions')}</div>
                    </div>
                    <div className="divide-y">
                      {filteredDefinitions.map(report => {
                        const isGen = generating === report.type;
                        return (
                          <div key={report.type} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/40 transition-colors">
                            <div className="col-span-4 flex items-center gap-3">
                              <div className={cn('p-2 rounded-lg', report.bgColor, report.color)}>
                                <report.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-sm">{t(`reports:types.${report.type}.title`)}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                  {t(`reports:types.${report.type}.description`)}
                                </p>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <Badge variant="secondary" className="text-xs">{t(`reports:categories.${report.category}`)}</Badge>
                            </div>
                            <div className="col-span-2 text-sm font-medium">{t(`reports:frequencies.${report.frequency}`)}</div>
                            <div className="col-span-2 text-sm text-muted-foreground">
                              {t('reports:timesGenerated', { count: stats.byType[report.type] || 0 })}
                            </div>
                            <div className="col-span-2 flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isGen} onClick={() => handleGenerate(report, 'preview')}>
                                {isGen ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isGen} onClick={() => handleGenerate(report, 'download')}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isGen} onClick={() => handleGenerate(report, 'print')}>
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredDefinitions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border-2 border-dashed border-muted/50">
                    <FileText className="w-10 h-10 text-muted-foreground/20 mb-3" />
                    <h3 className="text-base font-bold">{t('reports:empty.noReports')}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{t('reports:empty.adjustFilters')}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ══════════ TAB: HISTORY ══════════ */}
          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3 rounded-xl border border-muted/50 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('reports:history.searchPlaceholder')}
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    className="pl-10 h-9 text-sm bg-muted/20 border-none focus-visible:ring-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {/* Filter by type */}
                  <div className="flex gap-1 flex-wrap">
                    {(['all', ...REPORT_DEFINITIONS.map(r => r.type)] as const).map(type => {
                      if (type === 'all') return (
                        <Button key="all" variant={historyFilter === 'all' ? 'secondary' : 'outline'} size="sm" className="h-9 text-xs" onClick={() => setHistoryFilter('all')}>
                          {t('reports:filters.all')}
                        </Button>
                      );
                      const def = getReportDef(type as ReportType);
                      return (
                        <Button key={type} variant={historyFilter === type ? 'secondary' : 'outline'} size="sm" className={cn('h-9 text-xs gap-1.5', historyFilter === type && `${def.color}`)} onClick={() => setHistoryFilter(type as ReportType)}>
                          <def.icon className="w-3 h-3" />
                          <span className="hidden sm:inline">{t(`reports:types.${type}.shortTitle`)}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={fetchHistory} disabled={loadingHistory}>
                    <RefreshCcw className={cn('w-4 h-4', loadingHistory && 'animate-spin')} />
                  </Button>
                </div>
              </div>

              {/* History List */}
              {loadingHistory ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border-2 border-dashed border-muted/50">
                  <History className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <h3 className="text-base font-bold">{t('reports:empty.noHistory')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('reports:empty.historyDescription')}</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab('reports')}>
                    {t('reports:actions.generateFirst')}
                  </Button>
                </div>
              ) : (
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="bg-muted/50 px-6 py-3 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
                    <div className="col-span-3">{t('reports:table.report')}</div>
                    <div className="col-span-2">{t('reports:table.period')}</div>
                    <div className="col-span-2">{t('reports:table.language')}</div>
                    <div className="col-span-2">{t('reports:table.size')}</div>
                    <div className="col-span-2">{t('reports:table.generatedAt')}</div>
                    <div className="col-span-1 text-right">{t('reports:table.actions')}</div>
                  </div>
                  <div className="divide-y">
                    {history.map(r => {
                      const def = getReportDef(r.type);
                      return (
                        <div key={r.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/40 transition-colors">
                          <div className="col-span-3 flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg shrink-0', def.bgColor, def.color)}>
                              <def.icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{r.title}</p>
                              <p className="text-[11px] text-muted-foreground">{t(`reports:types.${r.type}.title`)}</p>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs font-medium">
                              {format(parseISO(r.period_start), 'dd/MM/yy')} –
                            </p>
                            <p className="text-xs font-medium">
                              {format(parseISO(r.period_end), 'dd/MM/yy')}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <Badge variant="outline" className="text-xs uppercase">{r.language}</Badge>
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {formatFileSize(r.file_size)}
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {format(parseISO(r.created_at), 'dd/MM/yyyy HH:mm')}
                          </div>
                          <div className="col-span-1 flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRedownload(r.id)} title={t('reports:actions.redownload')}>
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(r.id)} title={t('reports:actions.delete')}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          {/* ══════════ TAB: GPS ══════════ */}
          <TabsContent value="gps" className="mt-6">
            <GpsReportsTab />
          </TabsContent>

        </Tabs>
      </div>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reports:dialogs.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('reports:dialogs.delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('reports:dialogs.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GenerateReportDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      onGenerate={handleDialogGenerate}
      generating={generating}
      defaultType={dialogDefaultType}
    />
    </div>
  );
}