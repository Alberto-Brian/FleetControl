// ========================================
// FILE: src/components/tracking/TraccarDevicesPanel.tsx
// ========================================
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, RefreshCw, ArrowLeft, Cpu, Search,
  MapPin, Gauge, Clock, Copy, CheckCircle2,
  Car, Navigation2, Unlink, Plus, Pencil, Trash2,
  Server, AlertTriangle, Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTrackedDevices } from '@/helpers/tracking-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import { useTracking } from '@/contexts/TrackingContext';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import type { IVehicle } from '@/lib/types/vehicle';
import { formatSpeed } from '@/helpers/tracking-helpers';

interface DeviceRow {
  device:        TrackedDevice;
  linkedVehicle: IVehicle | null;
}

interface DeviceFormData {
  name:     string;
  uniqueId: string;
  phone:    string;
  operator: string;
}

type PanelMode = 'list' | 'detail' | 'form';

interface Props {
  isOpen:          boolean;
  onClose:         () => void;
  onViewVehicle?:  (vehicleId: string) => void;
  onCenterDevice?: (device: TrackedDevice) => void;
}

const OPERATORS = ['', 'UNITEL', 'AFRICEL', 'MOVICEL'] as const;

function formatRelative(dateStr: string | null | undefined, t: (k: string) => string): string {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const ago = t('sidebar.relativeAgo');
  if (diff < 5)     return t('sidebar.relativeNow');
  if (diff < 60)    return `${diff}s ${ago}`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ${ago}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ${ago}`;
  return `${Math.floor(diff / 86400)}d ${ago}`;
}

function operatorLabel(op: string, t: (k: string) => string): string {
  switch (op) {
    case 'UNITEL':  return t('devicesPanel.operatorUnitel');
    case 'AFRICEL': return t('devicesPanel.operatorAfricel');
    case 'MOVICEL': return t('devicesPanel.operatorMovicel');
    default:        return t('devicesPanel.operatorOther');
  }
}

export function TraccarDevicesPanel({ isOpen, onClose, onViewVehicle, onCenterDevice }: Props) {
  const { t } = useTranslation('tracking');
  const { state: { positions } } = useTracking();

  const [rows,          setRows]          = useState<DeviceRow[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [selected,      setSelected]      = useState<DeviceRow | null>(null);
  const [copied,        setCopied]        = useState(false);
  const [search,        setSearch]        = useState('');
  const [linkFilter,    setLinkFilter]    = useState<'all' | 'linked' | 'unlinked'>('all');
  const [mode,          setMode]          = useState<PanelMode>('list');
  const [editingDevice, setEditingDevice] = useState<DeviceRow | null>(null);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'configure' | null>(null);
  const [formData,      setFormData]      = useState<DeviceFormData>({ name: '', uniqueId: '', phone: '', operator: '' });
  const [formErrors,    setFormErrors]    = useState<Partial<DeviceFormData>>({});
  const [submitting,    setSubmitting]    = useState(false);
  const [formError,     setFormError]     = useState<string | null>(null);
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string, ok = true) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [devices, vehiclesResult] = await Promise.all([
        getTrackedDevices(),
        getAllVehicles({ limit: 1000 }),
      ]);
      const vehicles = vehiclesResult?.data ?? [];
      const newRows = devices.map(device => ({
        device,
        linkedVehicle: vehicles.find(
          v => v.traccar_unique_id === device.uniqueId && !v.deleted_at,
        ) ?? null,
      }));
      setRows(newRows);
      if (selected) {
        const updated = newRows.find(r => r.device.id === selected.device.id);
        setSelected(updated ?? null);
      }
    } catch {
      setError(t('devicesPanel.error'));
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isOpen) load(); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelected(null);
      setSearch('');
      setLinkFilter('all');
      setMode('list');
      setConfirmAction(null);
    }
  }, [isOpen]);

  function handleCopyImei(imei: string) {
    navigator.clipboard.writeText(imei).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function openCreateForm() {
    setEditingDevice(null);
    setFormData({ name: '', uniqueId: '', phone: '', operator: '' });
    setFormErrors({});
    setFormError(null);
    setMode('form');
  }

  function openEditForm(row: DeviceRow) {
    setEditingDevice(row);
    const rawData = (row.device as any).rawData;
    setFormData({
      name:     row.device.name,
      uniqueId: row.device.uniqueId ?? '',
      phone:    rawData?.phone ?? '',
      operator: rawData?.attributes?.operator ?? '',
    });
    setFormErrors({});
    setFormError(null);
    setMode('form');
  }

  function validateForm(): boolean {
    const errs: Partial<DeviceFormData> = {};
    if (editingDevice && !formData.name.trim()) errs.name = t('devicesPanel.fieldName');
    if (!formData.uniqueId.trim())              errs.uniqueId = t('devicesPanel.fieldImei');
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        name:     formData.name.trim() || undefined,
        uniqueId: formData.uniqueId.trim(),
        phone:    formData.phone.trim() || undefined,
        operator: formData.operator || undefined,
      };
      if (editingDevice) {
        await (window as any)._tracking.updateDevice(editingDevice.device.traccar_id, payload);
        showToast(t('devicesPanel.updateSuccess'));
        await load();
        const refreshed = rows.find(r => r.device.id === editingDevice.device.id);
        setSelected(refreshed ?? null);
        setMode('detail');
      } else {
        await (window as any)._tracking.createDevice(payload);
        showToast(t('devicesPanel.createSuccess'));
        await load();
        setMode('list');
      }
    } catch (err: any) {
      // Erros HTTP chegam serializados do processo principal como "IPC_HTTP_ERROR:{...}"
      const rawMsg: string = err?.message ?? '';
      const httpMatch = rawMsg.match(/IPC_HTTP_ERROR:(\{.+\})$/);
      if (httpMatch) {
        try {
          const { status, message: serverMsg } = JSON.parse(httpMatch[1]) as { status: number; message: string };
          if (status === 409) {
            setFormError((serverMsg ?? '').includes('telefone')
              ? t('devicesPanel.phoneDuplicate')
              : t('devicesPanel.imeiDuplicate'),
            );
          } else {
            setFormError(`${t(editingDevice ? 'devicesPanel.updateError' : 'devicesPanel.createError')}: ${serverMsg}`);
          }
        } catch {
          setFormError(t(editingDevice ? 'devicesPanel.updateError' : 'devicesPanel.createError'));
        }
      } else {
        setFormError(t(editingDevice ? 'devicesPanel.updateError' : 'devicesPanel.createError'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await (window as any)._tracking.deleteDevice(selected.device.traccar_id);
      showToast(t('devicesPanel.deleteSuccess'));
      setConfirmAction(null);
      setSelected(null);
      setMode('list');
      await load();
    } catch (err: any) {
      showToast(t('devicesPanel.deleteError'), false);
      setConfirmAction(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmConfigure() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await (window as any)._tracking.configureServer(selected.device.traccar_id);
      showToast(t('devicesPanel.configureSuccess'));
    } catch (err: any) {
      showToast(t('devicesPanel.configureError'), false);
    } finally {
      setSubmitting(false);
      setConfirmAction(null);
    }
  }

  const onlineCount   = rows.filter(r => r.device.status === 'online').length;
  const offlineCount  = rows.length - onlineCount;
  const linkedCount   = rows.filter(r => r.linkedVehicle !== null).length;
  const unlinkedCount = rows.filter(r => r.linkedVehicle === null).length;

  const filteredRows = rows.filter(r => {
    if (linkFilter === 'linked'   && !r.linkedVehicle) return false;
    if (linkFilter === 'unlinked' &&  r.linkedVehicle) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.device.name.toLowerCase().includes(q) ||
      (r.device.uniqueId?.toLowerCase().includes(q) ?? false) ||
      (r.linkedVehicle?.license_plate.toLowerCase().includes(q) ?? false) ||
      (r.linkedVehicle ? `${r.linkedVehicle.brand} ${r.linkedVehicle.model}`.toLowerCase().includes(q) : false)
    );
  });

  // ── Toast overlay ────────────────────────────────────────────────────────────
  const toastEl = toast && (
    <div className={`absolute top-2 left-2 right-2 z-50 rounded-md px-3 py-2 text-xs font-medium shadow-lg flex items-center gap-2 ${
      toast.ok
        ? 'bg-emerald-500/90 text-white'
        : 'bg-destructive/90 text-destructive-foreground'
    }`}>
      {toast.ok
        ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
        : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
      }
      {toast.msg}
    </div>
  );

  // ── Diálogo de confirmação ───────────────────────────────────────────────────
  if (confirmAction && selected) {
    const isDelete    = confirmAction === 'delete';
    const isConfigure = confirmAction === 'configure';
    return (
      <div className="flex flex-col h-full relative">
        {toastEl}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0">
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
            onClick={() => setConfirmAction(null)}
            disabled={submitting}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-semibold flex-1 truncate text-destructive">
            {isDelete ? t('devicesPanel.deleteTitle') : t('devicesPanel.configureTitle')}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className={`rounded-lg border-2 p-4 space-y-2 ${
            isDelete ? 'border-destructive/60 bg-destructive/5' : 'border-amber-500/60 bg-amber-500/5'
          }`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDelete ? 'text-destructive' : 'text-amber-500'}`} />
              <p className="text-xs leading-relaxed">
                {isDelete ? t('devicesPanel.deleteWarning') : t('devicesPanel.configureWarning')}
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {t('devicesPanel.imeiSection')}
            </p>
            <p className="text-xs font-medium">{selected.device.name}</p>
            <p className="text-[11px] font-mono text-muted-foreground">{selected.device.uniqueId ?? '—'}</p>
          </div>
        </div>

        <div className="border-t p-3 space-y-2 flex-shrink-0">
          <button
            className={`w-full h-9 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${
              isDelete
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
            onClick={isDelete ? handleConfirmDelete : handleConfirmConfigure}
            disabled={submitting}
          >
            {submitting
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{isDelete ? t('devicesPanel.deleting') : t('devicesPanel.configuring')}</>
              : isDelete ? t('devicesPanel.deleteConfirm') : t('devicesPanel.configureConfirm')
            }
          </button>
          <button
            className="w-full h-8 rounded-md border text-xs font-medium hover:bg-muted transition-colors"
            onClick={() => setConfirmAction(null)}
            disabled={submitting}
          >
            {t('devicesPanel.cancelButton')}
          </button>
        </div>
      </div>
    );
  }

  // ── Formulário criar / editar ─────────────────────────────────────────────
  if (mode === 'form') {
    const isEdit = editingDevice !== null;
    return (
      <div className="flex flex-col h-full relative">
        {toastEl}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0">
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
            onClick={() => {
              if (isEdit) { setMode('detail'); }
              else        { setMode('list'); }
            }}
            disabled={submitting}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-semibold flex-1 truncate">
            {isEdit ? t('devicesPanel.editDevice') : t('devicesPanel.addDevice')}
          </span>
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
            onClick={() => { setMode('list'); setSelected(null); }}
            disabled={submitting}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form className="flex-1 overflow-y-auto p-3 space-y-3" onSubmit={handleFormSubmit}>
          {/* Campo nome — apenas no modo edição */}
          {isEdit && (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                {t('devicesPanel.fieldName')} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                placeholder={t('devicesPanel.namePlaceholder')}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                  formErrors.name ? 'border-destructive' : ''
                }`}
                disabled={submitting}
                autoFocus
              />
            </div>
          )}

          {/* Campo IMEI */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              {t('devicesPanel.fieldImei')} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.uniqueId}
              onChange={e => setFormData(d => ({ ...d, uniqueId: e.target.value }))}
              placeholder={t('devicesPanel.imeiPlaceholder')}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                formErrors.uniqueId ? 'border-destructive' : ''
              }`}
              disabled={submitting}
              autoFocus={!isEdit}
            />
            <p className="text-xs text-muted-foreground">{t('devicesPanel.imeiHelp')}</p>
          </div>

          {/* Campo telefone */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              {t('devicesPanel.fieldPhone')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
              placeholder={t('devicesPanel.phonePlaceholder')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">{t('devicesPanel.phoneHelp')}</p>
          </div>

          {/* Campo operadora */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              {t('devicesPanel.fieldOperator')}
            </label>
            <select
              value={formData.operator}
              onChange={e => setFormData(d => ({ ...d, operator: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              disabled={submitting}
            >
              {OPERATORS.map(op => (
                <option key={op} value={op}>
                  {op === '' ? `— ${t('devicesPanel.fieldOperator')} —` : operatorLabel(op, t)}
                </option>
              ))}
            </select>
          </div>

          {formError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{formError}</p>
            </div>
          )}

          <div className="pt-1 space-y-2">
            <button
              type="submit"
              className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />{t('devicesPanel.saving')}</>
                : t('devicesPanel.saveButton')
              }
            </button>
            <button
              type="button"
              className="w-full h-9 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
              onClick={() => {
                if (isEdit) { setMode('detail'); }
                else        { setMode('list'); }
              }}
              disabled={submitting}
            >
              {t('devicesPanel.cancelButton')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Vista de detalhe ────────────────────────────────────────────────────────
  if (mode === 'detail' && selected) {
    const { device, linkedVehicle } = selected;
    const pos      = positions.find(p => p.deviceId === device.traccar_id);
    const isOnline = device.status === 'online';
    const rawData  = (device as any).rawData;
    const phone    = rawData?.phone as string | undefined;
    const operator = rawData?.attributes?.operator as string | undefined;

    return (
      <div className="flex flex-col h-full relative">
        {toastEl}
        {/* Header detalhe */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0">
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
            onClick={() => { setSelected(null); setMode('list'); }}
            title={t('devicesPanel.backToList')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Cpu className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-semibold truncate">{device.name}</span>
          </div>
          <Badge
            variant={isOnline ? 'default' : 'secondary'}
            className="text-[10px] h-4 px-1.5 flex-shrink-0"
          >
            {device.status ?? 'unknown'}
          </Badge>
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
            onClick={() => { setSelected(null); onClose(); }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Corpo detalhe */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {/* IMEI */}
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('devicesPanel.imeiSection')}</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs flex-1 break-all">{device.uniqueId ?? '—'}</span>
              {device.uniqueId && (
                <button
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
                  onClick={() => handleCopyImei(device.uniqueId!)}
                  title={t('devicesPanel.copyImei')}
                >
                  {copied
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  }
                </button>
              )}
            </div>
          </div>

          {/* SIM / Operadora */}
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('devicesPanel.simCardSection')}</p>
            {(phone || operator) ? (
              <div className="space-y-1.5">
                {phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{t('devicesPanel.phoneInfo')}</span>
                    <span className="text-xs font-medium font-mono">{phone}</span>
                  </div>
                )}
                {operator && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{t('devicesPanel.operatorInfo')}</span>
                    <span className="text-xs font-medium">{operatorLabel(operator, t)}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">{t('devicesPanel.noSimData')}</p>
            )}
          </div>

          {/* Posição em tempo real */}
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('devicesPanel.currentPosition')}</p>
            {pos ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="font-mono">{pos.latitude.toFixed(6)}, {pos.longitude.toFixed(6)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    {formatSpeed(pos.speed ?? 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation2 className="w-3 h-3" style={{ transform: `rotate(${pos.course ?? 0}deg)` }} />
                    {Math.round(pos.course ?? 0)}°
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelative(pos.timestamp, t)}
                  </span>
                </div>
                {pos.address && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{pos.address}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {isOnline ? t('devicesPanel.awaitingPosition') : t('devicesPanel.offlineNoPosition')}
              </p>
            )}
          </div>

          {/* Última actualização */}
          {device.lastUpdate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{t('devicesPanel.lastUpdate')}: {formatRelative(device.lastUpdate, t)}</span>
            </div>
          )}

          {/* Veículo associado */}
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('devicesPanel.linkedVehicle')}</p>
            {linkedVehicle ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs font-medium">
                    {linkedVehicle.brand} {linkedVehicle.model}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-5">{linkedVehicle.license_plate}</p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Unlink className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t('devicesPanel.noVehicle')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Acções */}
        <div className="border-t p-3 space-y-2 flex-shrink-0">
          {pos && onCenterDevice && (
            <button
              className="w-full h-8 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              onClick={() => onCenterDevice(device)}
            >
              <MapPin className="w-3.5 h-3.5" />
              {t('devicesPanel.centerOnMap')}
            </button>
          )}
          {linkedVehicle && onViewVehicle && (
            <button
              className="w-full h-8 rounded-md border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
              onClick={() => onViewVehicle(linkedVehicle.id)}
            >
              <Car className="w-3.5 h-3.5" />
              {t('devicesPanel.viewVehicle')}
            </button>
          )}
          <div className="flex gap-2 pt-1">
            <button
              className="flex-1 h-8 rounded-md border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
              onClick={() => openEditForm(selected)}
              title={t('devicesPanel.editDevice')}
            >
              <Pencil className="w-3.5 h-3.5" />
              {t('devicesPanel.editButton')}
            </button>
            <button
              className="flex-1 h-8 rounded-md border border-amber-500/50 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-1.5"
              onClick={() => setConfirmAction('configure')}
              title={t('devicesPanel.configureServer')}
            >
              <Server className="w-3.5 h-3.5" />
              <span className="truncate">{t('devicesPanel.configureServer')}</span>
            </button>
            <button
              className="h-8 w-8 rounded-md border border-destructive/50 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors flex items-center justify-center flex-shrink-0"
              onClick={() => setConfirmAction('delete')}
              title={t('devicesPanel.deleteDevice')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista de lista ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full relative">
      {toastEl}
      {/* Header lista */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0">
        <Cpu className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-semibold flex-1 truncate">{t('devicesPanel.title')}</span>
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-primary"
          onClick={openCreateForm}
          title={t('devicesPanel.addDevice')}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted disabled:opacity-50"
          onClick={load}
          title={t('devicesPanel.refresh')}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
          onClick={onClose}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sumário + Pesquisa */}
      {rows.length > 0 && (
        <>
          <div className="flex items-center gap-3 px-3 py-2 border-b flex-shrink-0">
            <span className="text-[11px] text-muted-foreground">{t('devicesPanel.deviceCount', { count: rows.length })}</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              {onlineCount} {t('sidebar.statusOnline')}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
              {offlineCount} {t('sidebar.statusOffline')}
            </span>
          </div>
          <div className="px-3 py-2 border-b flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('devicesPanel.search')}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-muted/50 border outline-none focus:ring-1 focus:ring-ring"
              />
              {search && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch('')}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="flex px-3 py-1.5 gap-1 border-b flex-shrink-0">
            {(['all', 'linked', 'unlinked'] as const).map(f => {
              const count = f === 'linked' ? linkedCount : f === 'unlinked' ? unlinkedCount : null;
              return (
                <button
                  key={f}
                  onClick={() => setLinkFilter(f)}
                  className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                    linkFilter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {t(`devicesPanel.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
                  {count !== null && (
                    <span className={`text-[10px] font-bold ${linkFilter === f ? 'opacity-80' : 'opacity-60'}`}>
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Body lista */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading && (
          <p className="text-sm text-muted-foreground">{t('devicesPanel.loading')}</p>
        )}
        {!loading && error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {!loading && !error && rows.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-6">
            <p className="text-sm text-muted-foreground">{t('devicesPanel.empty')}</p>
            <button
              className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
              onClick={openCreateForm}
            >
              <Plus className="w-3.5 h-3.5" />
              {t('devicesPanel.addDevice')}
            </button>
          </div>
        )}
        {!loading && !error && rows.length > 0 && filteredRows.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('devicesPanel.noResults')}</p>
        )}
        {!loading && !error && filteredRows.length > 0 && (
          <div className="space-y-1.5">
            {filteredRows.map((row) => {
              const { device, linkedVehicle } = row;
              const isOnline = device.status === 'online';
              const pos = positions.find(p => p.deviceId === device.traccar_id);

              return (
                <button
                  key={device.id}
                  className="w-full rounded-lg border p-2.5 text-left hover:bg-muted/50 transition-colors group"
                  onClick={() => { setSelected(row); setMode('detail'); }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
                      style={{
                        background: isOnline ? '#4ade80' : 'var(--ui-t20)',
                        boxShadow:  isOnline ? '0 0 4px #4ade80' : 'none',
                      }}
                    />
                    <span className="font-medium text-xs flex-1 truncate">{device.name}</span>
                    <Badge
                      variant={isOnline ? 'default' : 'secondary'}
                      className="text-[10px] h-4 px-1.5 flex-shrink-0"
                    >
                      {device.status ?? 'unknown'}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground truncate pl-3.5">
                    {device.uniqueId ?? '—'}
                  </p>
                  {linkedVehicle ? (
                    <p className="text-[11px] text-muted-foreground truncate pl-3.5 mt-0.5 flex items-center gap-1">
                      <Car className="w-3 h-3 flex-shrink-0" />
                      {linkedVehicle.brand} {linkedVehicle.model} · {linkedVehicle.license_plate}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/50 pl-3.5 mt-0.5 flex items-center gap-1">
                      <Unlink className="w-3 h-3 flex-shrink-0" />
                      {t('devicesPanel.noVehicle')}
                    </p>
                  )}
                  {pos && (
                    <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 flex items-center gap-1">
                      <Gauge className="w-3 h-3 flex-shrink-0" />
                      {formatSpeed(pos.speed ?? 0)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
