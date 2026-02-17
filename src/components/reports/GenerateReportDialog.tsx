// ========================================
// FILE: src/components/reports/GenerateReportDialog.tsx
// ========================================
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  FileText, Download, Eye, Printer, Calendar,
  Truck, Users, MapPin, Fuel, Wrench, DollarSign, Activity, Loader2,
} from 'lucide-react';

// ==================== TIPOS ====================

type ReportType = 'vehicles' | 'drivers' | 'trips' | 'fuel' | 'maintenance' | 'financial' | 'general';
type ActionType = 'download' | 'preview' | 'print';

interface ReportDefinition {
  type:    ReportType;
  icon:    React.ElementType;
  color:   string;
  bgColor: string;
}

interface DateRange {
  start: string;
  end:   string;
}

interface GenerateReportDialogProps {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  onGenerate:    (type: ReportType, dateRange: DateRange, action: ActionType) => Promise<void>;
  generating:    ReportType | null;
  defaultType?:  ReportType;
}

// ==================== CONFIG ====================

const REPORT_DEFINITIONS: ReportDefinition[] = [
  { type: 'vehicles',    icon: Truck,      color: 'text-blue-600',    bgColor: 'bg-blue-50 dark:bg-blue-950/20'       },
  { type: 'drivers',     icon: Users,      color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { type: 'trips',       icon: MapPin,     color: 'text-violet-600',  bgColor: 'bg-violet-50 dark:bg-violet-950/20'   },
  { type: 'fuel',        icon: Fuel,       color: 'text-amber-600',   bgColor: 'bg-amber-50 dark:bg-amber-950/20'     },
  { type: 'maintenance', icon: Wrench,     color: 'text-rose-600',    bgColor: 'bg-rose-50 dark:bg-rose-950/20'       },
  { type: 'financial',   icon: DollarSign, color: 'text-green-600',   bgColor: 'bg-green-50 dark:bg-green-950/20'     },
  { type: 'general',     icon: Activity,   color: 'text-slate-600',   bgColor: 'bg-slate-50 dark:bg-slate-950/20'     },
];

const DATE_PRESETS = [
  { value: 'today',     label: 'Hoje'            },
  { value: 'thisWeek',  label: 'Esta Semana'     },
  { value: 'thisMonth', label: 'Este Mês'        },
  { value: 'lastMonth', label: 'Mês Passado'     },
  { value: 'last90Days',label: 'Últimos 90 Dias' },
  { value: 'thisYear',  label: 'Este Ano'        },
  { value: 'custom',    label: 'Personalizado'   },
];

function getPresetRange(preset: string): DateRange {
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
    case 'thisMonth':  return { start: fmt(new Date(y, m, 1)),     end: fmt(new Date(y, m + 1, 0)) };
    case 'lastMonth':  return { start: fmt(new Date(y, m - 1, 1)), end: fmt(new Date(y, m, 0))     };
    case 'last90Days': { const d = new Date(now); d.setDate(d.getDate() - 90); return { start: fmt(d), end: fmt(now) }; }
    case 'thisYear':   return { start: fmt(new Date(y, 0, 1)),     end: fmt(new Date(y, 11, 31))   };
    default:           return { start: fmt(new Date(y, m, 1)),     end: fmt(new Date(y, m + 1, 0)) };
  }
}

function fmtDisplay(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ==================== COMPONENTE ====================

export function GenerateReportDialog({
  open, onOpenChange, onGenerate, generating, defaultType,
}: GenerateReportDialogProps) {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState<ReportType>(defaultType || 'vehicles');
  const [datePreset,   setDatePreset]   = useState('thisMonth');
  const [customStart,  setCustomStart]  = useState('');
  const [customEnd,    setCustomEnd]    = useState('');
  const [dateError,    setDateError]    = useState('');

  const isCustom    = datePreset === 'custom';
  const isGenerating = generating === selectedType;

  React.useEffect(() => {
    if (open) {
      setSelectedType(defaultType || 'vehicles');
      setDatePreset('thisMonth');
      setCustomStart('');
      setCustomEnd('');
      setDateError('');
    }
  }, [open, defaultType]);

  const getDateRange = (): DateRange | null => {
    if (!isCustom) return getPresetRange(datePreset);

    if (!customStart || !customEnd) {
      setDateError('Preencha ambas as datas');
      return null;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setDateError('Data inicial não pode ser posterior à data final');
      return null;
    }
    const diffDays = Math.ceil((new Date(customEnd).getTime() - new Date(customStart).getTime()) / 86400000);
    if (diffDays > 365) {
      setDateError('Período máximo de 365 dias');
      return null;
    }
    setDateError('');
    return { start: customStart, end: customEnd };
  };

  const handleAction = async (action: ActionType) => {
    const dateRange = getDateRange();
    if (!dateRange) return;
    await onGenerate(selectedType, dateRange, action);
    if (action === 'download') onOpenChange(false);
  };

  const selectedDef  = REPORT_DEFINITIONS.find(r => r.type === selectedType)!;
  const previewRange = isCustom
    ? (customStart && customEnd ? `${fmtDisplay(customStart)} – ${fmtDisplay(customEnd)}` : '—')
    : (() => { const r = getPresetRange(datePreset); return `${fmtDisplay(r.start)} – ${fmtDisplay(r.end)}`; })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <FileText className="w-5 h-5" />
            Novo Relatório
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* ── 1. Tipo ── */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Tipo de Relatório
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {REPORT_DEFINITIONS.map(def => (
                <button
                  key={def.type}
                  onClick={() => setSelectedType(def.type)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer',
                    selectedType === def.type
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-muted/60 hover:border-muted hover:bg-muted/20'
                  )}
                >
                  <div className={cn('p-2 rounded-lg', def.bgColor, def.color)}>
                    <def.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-center leading-tight">
                    {/* Mostrar nome curto: remover "Relatório de " */}
                    {t(`reports:types.${def.type}.title`)
                      .replace('Relatório de ', '')
                      .replace('Relatório ', '')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── 2. Período ── */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Período
            </Label>

            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map(preset => (
                <Button
                  key={preset.value}
                  variant={datePreset === preset.value ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => { setDatePreset(preset.value); setDateError(''); }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Inputs de data personalizada */}
            {isCustom && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Data inicial</Label>
                  <Input
                    type="date"
                    value={customStart}
                    max={customEnd || undefined}
                    onChange={e => { setCustomStart(e.target.value); setDateError(''); }}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Data final</Label>
                  <Input
                    type="date"
                    value={customEnd}
                    min={customStart || undefined}
                    onChange={e => { setCustomEnd(e.target.value); setDateError(''); }}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            )}

            {dateError && (
              <p className="text-xs text-destructive font-medium">{dateError}</p>
            )}

            {/* Preview da seleção */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
              <div className={cn('p-2 rounded-lg shrink-0', selectedDef.bgColor, selectedDef.color)}>
                <selectedDef.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold">{t(`reports:types.${selectedType}.title`)}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {previewRange}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/20 flex-row justify-between gap-2">
          <Button variant="ghost" className="h-9" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm" className="h-9 gap-1.5"
              disabled={!!generating}
              onClick={() => handleAction('print')}
            >
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
            <Button
              variant="outline" size="sm" className="h-9 gap-1.5"
              disabled={!!generating}
              onClick={() => handleAction('preview')}
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Visualizar
            </Button>
            <Button
              size="sm" className="h-9 gap-1.5"
              disabled={!!generating}
              onClick={() => handleAction('download')}
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Gerar PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}