import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import ToggleTheme from "@/components/ToggleTheme";
import LangToggle from "@/components/LangToggle";
import {
    Settings, Globe, Palette, Info, Package, AlertCircle,
    Mail, Phone, MapPin, Building2, HardDrive, Download,
    Upload, Clock, Loader2, CheckCircle, XCircle,
    Camera, Trash2, Save, Building, Hash, AtSign,
    FileText, RefreshCw, ImageIcon, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { exportBackup, restoreBackup } from "@/helpers/backup-helpers";
import { getSystemVersion, forceDbRotation } from "@/helpers/system-helpers";
import {
    getCompanySettings,
    updateCompanySettings,
    uploadCompanyLogo,
    removeCompanyLogo,
} from "@/helpers/company-helpers";
import { ICompanySettings, IUpdateCompanySettings } from "@/lib/types/company";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
//   Modais Auxiliares (sem alterações)
// ────────────────────────────────────────────────────────────────────────────

interface ProgressModalProps {
    open: boolean;
    type: 'backup' | 'restore';
    progress: number;
    phase: string;
    message: string;
    status: 'loading' | 'success' | 'error';
}

function ProgressModal({ open, type, progress, phase, message, status }: ProgressModalProps) {
    const getIcon = () => {
        if (status === 'error')   return <XCircle className="w-12 h-12 text-destructive" />;
        if (status === 'success') return <CheckCircle className="w-12 h-12 text-green-500" />;
        return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
    };
    const title = type === 'backup' ? 'A criar backup...' : 'A restaurar backup...';
    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={e => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5" />{title}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-6">
                    <div className="flex justify-center">{getIcon()}</div>
                    <div className="text-center space-y-1.5">
                        <p className="text-base font-semibold">{phase}</p>
                        <p className="text-sm text-muted-foreground">{message}</p>
                    </div>
                    {status === 'loading' && (
                        <div className="space-y-3">
                            <Progress value={progress} className="h-2.5" />
                            <p className="text-sm text-center text-muted-foreground font-medium">{progress.toFixed(0)}%</p>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center text-sm text-destructive">{message}</div>
                    )}
                    {status === 'success' && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center text-sm text-green-700 dark:text-green-400">{message}</div>
                    )}
                </div>
                {status === 'loading' && (
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />Não feche esta janela
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}

function ConfirmRestoreModal({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: () => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-5 h-5" />Confirmar restauração
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm">Tem a certeza que deseja restaurar um backup?</p>
                    <div className="text-sm text-muted-foreground space-y-1.5">
                        <p>• Os dados actuais serão substituídos</p>
                        <p>• Será necessário reactivar a licença</p>
                        <p>• A aplicação será reiniciada automaticamente</p>
                        <p className="font-medium text-foreground pt-2">Esta acção não pode ser desfeita.</p>
                    </div>
                </div>
                <DialogFooter className="gap-3 sm:gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={onConfirm}>Sim, restaurar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ResultModal({ open, onOpenChange, type, title, message, needsReactivation }: {
    open: boolean; onOpenChange: (o: boolean) => void; type: 'success' | 'error';
    title: string; message: string; needsReactivation?: boolean;
}) {
    const Icon  = type === 'success' ? CheckCircle : XCircle;
    const color = type === 'success' ? 'text-green-600' : 'text-destructive';
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${color}`}>
                        <Icon className="w-5 h-5" />{title}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-4">
                    <p className="text-sm leading-relaxed text-center">{message}</p>
                    {needsReactivation && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-700">
                            <strong>Atenção:</strong> Será necessário reactivar a licença após o reinício.
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full">Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ────────────────────────────────────────────────────────────────────────────
//   Tab Empresa
// ────────────────────────────────────────────────────────────────────────────

function CompanyTab() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [settings, setSettings]   = useState<ICompanySettings | null>(null);
    const [form, setForm]           = useState<IUpdateCompanySettings>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isDirty, setIsDirty]     = useState(false);
    const [isSaving, setIsSaving]   = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isRemovingLogo, setIsRemovingLogo]   = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

    // Carregar dados ao montar
    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const data = await getCompanySettings();
            if (data) {
                setSettings(data);
                setForm({
                    company_name: data.company_name,
                    tax_id:       data.tax_id       ?? '',
                    phone:        data.phone        ?? '',
                    email:        data.email        ?? '',
                    address:      data.address      ?? '',
                    city:         data.city         ?? '',
                    state:        data.state        ?? '',
                    postal_code:  data.postal_code  ?? '',
                    currency:     data.currency,
                    timezone:     data.timezone,
                });
                setLogoPreview(data.logo_base64 ?? null);
            }
        } catch (err) {
            console.error('[CompanyTab] Erro ao carregar:', err);
        }
    }

    function handleChange(field: keyof IUpdateCompanySettings, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        setSaveStatus('idle');
    }

    async function handleSave() {
        setIsSaving(true);
        try {
            const updated = await updateCompanySettings(form);
            setSettings(updated);
            setIsDirty(false);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err) {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleLogoFile(file: File) {
        setIsUploadingLogo(true);
        try {
            const { settings: updated, logo } = await uploadCompanyLogo(file);
            setSettings(updated);
            setLogoPreview(logo.base64);
        } catch (err: any) {
            alert(err.message ?? 'Erro ao carregar logo.');
        } finally {
            setIsUploadingLogo(false);
        }
    }

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleLogoFile(file);
        e.target.value = '';
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) handleLogoFile(file);
    }

    async function handleRemoveLogo() {
        setIsRemovingLogo(true);
        try {
            const updated = await removeCompanyLogo();
            if (updated) setSettings(updated);
            setLogoPreview(null);
        } catch (err) {
            console.error('[CompanyTab] Erro ao remover logo:', err);
        } finally {
            setIsRemovingLogo(false);
        }
    }

    const companyInitial = form.company_name?.charAt(0)?.toUpperCase() ?? 'E';

    return (
        <div className="space-y-7">

            {/* ── Cabeçalho ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-base font-semibold mb-0.5">Dados da Empresa</h3>
                    <p className="text-sm text-muted-foreground">
                        Informações que aparecem nos relatórios PDF e documentos gerados
                    </p>
                </div>

                {/* Botão Guardar */}
                <Button
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    size="sm"
                    className={cn(
                        "gap-2 min-w-[110px] transition-all",
                        saveStatus === 'saved' && "bg-emerald-600 hover:bg-emerald-700",
                        saveStatus === 'error' && "bg-destructive hover:bg-destructive/90",
                    )}
                >
                    {isSaving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />A guardar...</>
                    ) : saveStatus === 'saved' ? (
                        <><CheckCircle className="w-4 h-4" />Guardado</>
                    ) : saveStatus === 'error' ? (
                        <><XCircle className="w-4 h-4" />Erro</>
                    ) : (
                        <><Save className="w-4 h-4" />Guardar</>
                    )}
                </Button>
            </div>

            {/* ── Logo ── */}
            <div className="flex items-start gap-6 p-4 rounded-xl border border-border bg-card/50">
                {/* Preview / Drop zone */}
                <div
                    className={cn(
                        "relative group w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all flex-shrink-0",
                        isDragging
                            ? "border-primary bg-primary/10 scale-105"
                            : "border-border hover:border-primary/50 hover:bg-muted/50",
                        (isUploadingLogo) && "pointer-events-none opacity-60"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    {isUploadingLogo ? (
                        <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    ) : logoPreview ? (
                        <>
                            <img
                                src={logoPreview}
                                alt="Logo"
                                className="w-full h-full object-contain p-1"
                            />
                            {/* overlay no hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-1.5 text-center px-2">
                            {isDragging ? (
                                <ImageIcon className="w-7 h-7 text-primary" />
                            ) : (
                                <>
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black text-white"
                                        style={{ background: 'hsl(var(--primary))' }}
                                    >
                                        {companyInitial}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground leading-tight">
                                        Clique ou arraste
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Info + acções */}
                <div className="flex-1 space-y-3">
                    <div>
                        <p className="text-sm font-semibold">Logótipo da empresa</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            Aparece no cabeçalho de todos os relatórios PDF.<br />
                            PNG, JPG, WEBP ou SVG · Máximo 2 MB
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingLogo || isRemovingLogo}
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {logoPreview ? 'Alterar' : 'Carregar'}
                        </Button>
                        {logoPreview && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={handleRemoveLogo}
                                disabled={isRemovingLogo || isUploadingLogo}
                            >
                                {isRemovingLogo
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Trash2 className="w-3.5 h-3.5" />
                                }
                                Remover
                            </Button>
                        )}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleFileInput}
                />
            </div>

            {/* ── Dados principais ── */}
            <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Identificação
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-muted-foreground" />
                            Nome da Empresa *
                        </Label>
                        <Input
                            value={form.company_name ?? ''}
                            onChange={e => handleChange('company_name', e.target.value)}
                            placeholder="Ex: Empresa ABC, Lda"
                            className="h-9 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                            NIF / Contribuinte
                        </Label>
                        <Input
                            value={form.tax_id ?? ''}
                            onChange={e => handleChange('tax_id', e.target.value)}
                            placeholder="Ex: 5401234567"
                            className="h-9 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            Telefone
                        </Label>
                        <Input
                            value={form.phone ?? ''}
                            onChange={e => handleChange('phone', e.target.value)}
                            placeholder="+244 923 000 000"
                            className="h-9 text-sm"
                        />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <AtSign className="w-3.5 h-3.5 text-muted-foreground" />
                            Email
                        </Label>
                        <Input
                            value={form.email ?? ''}
                            onChange={e => handleChange('email', e.target.value)}
                            placeholder="info@empresa.ao"
                            type="email"
                            className="h-9 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* ── Morada ── */}
            <div className="space-y-4 pt-1 border-t border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground pt-3">
                    Morada
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            Endereço
                        </Label>
                        <Input
                            value={form.address ?? ''}
                            onChange={e => handleChange('address', e.target.value)}
                            placeholder="Rua / Avenida, Nº"
                            className="h-9 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Cidade</Label>
                        <Input
                            value={form.city ?? ''}
                            onChange={e => handleChange('city', e.target.value)}
                            placeholder="Luanda"
                            className="h-9 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Província / Estado</Label>
                        <Input
                            value={form.state ?? ''}
                            onChange={e => handleChange('state', e.target.value)}
                            placeholder="Luanda"
                            className="h-9 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Código Postal</Label>
                        <Input
                            value={form.postal_code ?? ''}
                            onChange={e => handleChange('postal_code', e.target.value)}
                            placeholder="0000-000"
                            className="h-9 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* ── Moeda / Fuso ── */}
            <div className="space-y-4 pt-1 border-t border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground pt-3">
                    Regionalização
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Moeda</Label>
                        <Input
                            value={form.currency ?? 'AOA'}
                            onChange={e => handleChange('currency', e.target.value)}
                            placeholder="AOA"
                            className="h-9 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Fuso Horário</Label>
                        <Input
                            value={form.timezone ?? 'Africa/Luanda'}
                            onChange={e => handleChange('timezone', e.target.value)}
                            placeholder="Africa/Luanda"
                            className="h-9 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Aviso unsaved */}
            {isDirty && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Há alterações não guardadas. Clique em <strong>Guardar</strong> para aplicar.
                </div>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
//   Componente Principal — SettingsDialog
// ────────────────────────────────────────────────────────────────────────────

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab]       = useState("appearance");
    const [systemVersion, setSystemVersion] = useState('');
    const [operation, setOperation]       = useState<'idle' | 'exporting' | 'restoring'>('idle');
    const [showProgress, setShowProgress] = useState(false);
    const [showConfirmRestore, setShowConfirmRestore] = useState(false);
    const [showResult, setShowResult]     = useState(false);

    const [progressData, setProgressData] = useState({
        type: 'backup' as 'backup' | 'restore',
        progress: 0, phase: '', message: '', status: 'loading' as 'loading' | 'success' | 'error',
    });

    const [result, setResult] = useState({
        type: 'success' as 'success' | 'error',
        title: '', message: '', needsReactivation: false,
    });

    const isBusy = operation !== 'idle';

    useEffect(() => {
        if (open) getSystemVersion().then(v => setSystemVersion(v));
    }, [open]);

    const settingsSections = [
        { id: "appearance", icon: Palette,    label: "Aparência"  },
        { id: "language",   icon: Globe,      label: "Idioma"     },
        { id: "company",    icon: Building2,  label: "Empresa"    },
        { id: "backups",    icon: HardDrive,  label: "Backups"    },
        { id: "about",      icon: Info,       label: "Sobre"      },
    ];

    // ── Backup handlers (sem alterações) ──────────────────────────────────

    const handleExportBackup = async () => {
        setOperation('exporting');
        try {
            const result = await exportBackup();
            if (!result.success && result.error === 'Cancelado pelo usuário') { setOperation('idle'); return; }
            setProgressData({ type: 'backup', progress: 0, phase: 'A iniciar...', message: 'A preparar ficheiros...', status: 'loading' });
            setShowProgress(true);
            const phases = [
                { phase: 'Bases de dados', msg: 'A copiar bases de dados...', pct: 30 },
                { phase: 'Configurações',  msg: 'A copiar ficheiros do utilizador...', pct: 60 },
                { phase: 'Compactação',    msg: 'A criar arquivo ZIP...', pct: 85 },
            ];
            for (const step of phases) {
                await new Promise(r => setTimeout(r, 600));
                setProgressData(prev => ({ ...prev, phase: step.phase, message: step.msg, progress: step.pct }));
            }
            setProgressData(prev => ({ ...prev, progress: 100, phase: 'Concluído', message: 'Backup criado com sucesso', status: 'success' }));
            await new Promise(r => setTimeout(r, 1200));
            setShowProgress(false);
            const sizeInMB = result.size ? (result.size / 1024 / 1024).toFixed(2) : '?';
            setResult({
                type: result.success ? 'success' : 'error',
                title: result.success ? '✅ Backup exportado' : '❌ Erro ao exportar',
                message: result.success ? `Backup criado com sucesso! (${sizeInMB} MB)` : (result.error || 'Falha ao criar backup'),
                needsReactivation: false,
            });
            setShowResult(true);
        } catch (error: any) {
            setProgressData(prev => ({ ...prev, phase: 'Erro', message: error.message || 'Erro inesperado', status: 'error' }));
            await new Promise(r => setTimeout(r, 1800));
            setShowProgress(false);
            setResult({ type: 'error', title: '❌ Erro', message: error.message || 'Falha ao criar backup', needsReactivation: false });
            setShowResult(true);
        } finally { setOperation('idle'); }
    };

    const handleRestoreConfirm = () => setShowConfirmRestore(true);

    const handleDoRestore = async () => {
        setShowConfirmRestore(false);
        setOperation('restoring');
        try {
            const result = await restoreBackup();
            if (!result?.success) { setOperation('idle'); return; }
            setProgressData({ type: 'restore', progress: 0, phase: 'A iniciar...', message: 'A validar o ficheiro seleccionado...', status: 'loading' });
            setShowProgress(true);
            const phases = [
                { phase: 'Validação',   msg: 'A verificar integridade...', pct: 20 },
                { phase: 'Extração',    msg: 'A extrair conteúdos...',     pct: 45 },
                { phase: 'Restauração', msg: 'A restaurar bases de dados e configurações...', pct: 80 },
                { phase: 'Finalização', msg: 'A aplicar alterações...',    pct: 95 },
            ];
            for (const step of phases) {
                await new Promise(r => setTimeout(r, 800));
                setProgressData(prev => ({ ...prev, phase: step.phase, message: step.msg, progress: step.pct }));
            }
            setProgressData(prev => ({ ...prev, progress: 100, phase: 'Concluído', message: 'Restauração finalizada', status: 'success' }));
            await new Promise(r => setTimeout(r, 1400));
            setShowProgress(false);
            setResult({
                type: 'success', title: 'Backup restaurado',
                message: result.requiresRestart ? 'Restauração concluída. A aplicação será reiniciada em breve...' : 'Restauração concluída com sucesso.',
                needsReactivation: false,
            });
            setShowResult(true);
            if (result.requiresRestart) setTimeout(() => window.location.reload(), 2200);
        } catch (err: any) {
            setShowProgress(false);
            setResult({ type: 'error', title: 'Erro durante a restauração', message: err.message || 'Ocorreu um problema inesperado.', needsReactivation: false });
            setShowResult(true);
        } finally { setOperation('idle'); }
    };

    const handleRotation = async () => {
        try { await forceDbRotation(); } catch (e: any) { console.log("Erro ao forçar rotation:", e); }
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl h-[600px] max-h-[85vh] p-0 gap-0 flex flex-col">
                    <div className="flex flex-1 min-h-0">

                        {/* Sidebar */}
                        <aside className="w-64 border-r border-border bg-muted/30 flex flex-col shrink-0">
                            <DialogHeader className="p-6 pb-4 shrink-0">
                                <DialogTitle className="flex items-center gap-2 text-lg">
                                    <Settings className="w-5 h-5" />Definições
                                </DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 min-h-0 overflow-y-auto px-3">
                                <nav className="space-y-1 py-2">
                                    {settingsSections.map((section) => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveTab(section.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                                    activeTab === section.id
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {section.label}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </aside>

                        {/* Conteúdo */}
                        <main className="flex-1 min-h-0 min-w-0 flex flex-col">
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-6 space-y-6">

                                    {/* ── Aparência ── */}
                                    {activeTab === "appearance" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-base font-semibold mb-1">Tema</h3>
                                                <p className="text-sm text-muted-foreground mb-4">Escolha entre tema claro ou escuro</p>
                                                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                            <Palette className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Aparência</p>
                                                            <p className="text-xs text-muted-foreground">Modo claro ou escuro</p>
                                                        </div>
                                                    </div>
                                                    <ToggleTheme />
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-border">
                                                <h3 className="text-base font-semibold mb-1">Personalização</h3>
                                                <p className="text-sm text-muted-foreground mb-4">Ajuste a interface de acordo com suas preferências</p>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <span className="text-sm">Animações</span>
                                                        <span className="text-xs text-muted-foreground">Ativado</span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <span className="text-sm">Efeitos de transparência</span>
                                                        <span className="text-xs text-muted-foreground">Ativado</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Idioma ── */}
                                    {activeTab === "language" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-base font-semibold mb-1">Idioma da aplicação</h3>
                                                <p className="text-sm text-muted-foreground mb-4">Selecione o idioma preferido para a interface</p>
                                                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                            <Globe className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Idioma</p>
                                                            <p className="text-xs text-muted-foreground">Português / English</p>
                                                        </div>
                                                    </div>
                                                    <LangToggle />
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-border">
                                                <h3 className="text-base font-semibold mb-1">Região e formato</h3>
                                                <p className="text-sm text-muted-foreground mb-4">Configurações de localização</p>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <span className="text-sm">Formato de data</span>
                                                        <span className="text-xs text-muted-foreground">DD/MM/AAAA</span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <span className="text-sm">Formato de hora</span>
                                                        <span className="text-xs text-muted-foreground">24 horas</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Empresa ── */}
                                    {activeTab === "company" && <CompanyTab />}

                                    {/* ── Backups ── */}
                                    {activeTab === "backups" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-base font-semibold mb-1">Gestão de Backups</h3>
                                                <p className="text-sm text-muted-foreground">Configure e gerencie os backups do sistema</p>
                                            </div>
                                            <div className="p-4 rounded-lg border border-border bg-card/50 space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-semibold mb-1">Backup Automático</h4>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            Backups diários automáticos das bases de dados. Os últimos 7 backups são mantidos automaticamente.
                                                        </p>
                                                    </div>
                                                    <Switch defaultChecked />
                                                </div>
                                                <div className="pl-13 space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Frequência</span>
                                                        <span className="font-medium">Diário</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Backups mantidos</span>
                                                        <span className="font-medium">7 últimos</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Último backup</span>
                                                        <span className="font-medium">Hoje, 03:00</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-border space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-1">Backup Manual</h4>
                                                    <p className="text-xs text-muted-foreground">Exporte ou restaure backups completos do sistema</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button onClick={handleExportBackup} disabled={isBusy} className="h-auto flex flex-col items-start gap-2 p-4" variant="outline">
                                                        <div className="flex items-center gap-2 w-full">
                                                            {operation === 'exporting' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                                            <span className="font-semibold text-sm">Exportar Backup</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground text-left whitespace-normal break-words max-w-full">
                                                            Cria arquivo ZIP com todos os dados para transferir para outro computador
                                                        </p>
                                                    </Button>
                                                    <Button onClick={handleRestoreConfirm} disabled={isBusy} className="h-auto flex flex-col items-start gap-2 p-4" variant="outline">
                                                        <div className="flex items-center gap-2 w-full">
                                                            {operation === 'restoring' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                                            <span className="font-semibold text-sm">Restaurar Backup</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground text-left whitespace-normal break-words max-w-full">
                                                            Importa backup de outro computador. Requer reativação da licença.
                                                        </p>
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-xs text-amber-600 leading-relaxed">
                                                    <strong>Importante:</strong> Ao restaurar um backup em outro computador, será necessário reativar a licença com o novo Machine ID.
                                                </div>
                                            </div>
                                            <div className="pt-6 border-t border-border space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-destructive mb-1">Ferramentas Avançadas (Testes)</h4>
                                                    <p className="text-xs text-muted-foreground">Estas ações são apenas para testes e manutenção. Não utilize em produção sem orientação técnica.</p>
                                                </div>
                                                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-destructive">Forçar rotação da base de dados</p>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">Cria uma nova base de dados ativa e arquiva a atual. Útil apenas para testes de rotação e backup.</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="destructive" size="sm" onClick={handleRotation} disabled={isBusy} className="w-full flex items-center gap-2">
                                                        <HardDrive className="w-4 h-4" />Forçar rotação agora
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Sobre ── */}
                                    {activeTab === "about" && (
                                        <div className="space-y-6">
                                            <div className="text-center pb-6 border-b border-border">
                                                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                                                    <Package className="w-10 h-10 text-primary-foreground" />
                                                </div>
                                                <h3 className="text-2xl font-bold mb-1">FleetControl</h3>
                                                <p className="text-sm text-muted-foreground mb-3">Sistema de Gestão de Frotas</p>
                                                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                                    {systemVersion ? `Versão ${systemVersion} • ` : ''}Build 2026.02.25
                                                </span>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-base font-semibold">Informações do Sistema</h3>
                                                <div className="p-4 rounded-lg border bg-card/50 space-y-3 text-sm">
                                                    <div className="flex justify-between"><span className="text-muted-foreground">Versão</span><span className="font-medium">{systemVersion || 'Carregando...'}</span></div>
                                                    <div className="flex justify-between"><span className="text-muted-foreground">Build</span><span className="font-medium">2026.02.01</span></div>
                                                    <div className="flex justify-between"><span className="text-muted-foreground">Última atualização</span><span className="font-medium">1 de Fevereiro de 2026</span></div>
                                                    <div className="flex justify-between"><span className="text-muted-foreground">Licença</span><span className="font-medium">Proprietária</span></div>
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-2">
                                                <h3 className="text-base font-semibold">Desenvolvido por</h3>
                                                <div className="p-5 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 space-y-4">
                                                    <div>
                                                        <h4 className="text-lg font-bold flex items-center gap-2 mb-2">
                                                            <Building2 className="w-5 h-5 text-primary" />TechSoft Solutions
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            Empresa angolana especializada no desenvolvimento de software de gestão empresarial, oferecendo soluções tecnológicas modernas e adaptadas ao mercado nacional.
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-2">
                                                        <div><p className="text-xs text-muted-foreground uppercase">Localização</p><p className="font-medium">Luanda, Angola</p></div>
                                                        <div><p className="text-xs text-muted-foreground uppercase">Fundação</p><p className="font-medium">2025</p></div>
                                                        <div><p className="text-xs text-muted-foreground uppercase">NIF</p><p className="font-medium">5401234567</p></div>
                                                        <div><p className="text-xs text-muted-foreground uppercase">Reg. Comercial</p><p className="font-medium">RC-123456</p></div>
                                                    </div>
                                                    <div className="pt-4 border-t border-border/50 space-y-3">
                                                        <p className="text-xs font-medium text-muted-foreground uppercase">Contactos</p>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span className="truncate">suporte.techsoft@gmail.com</span></div>
                                                            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span className="truncate">comercial@techsoft.ao</span></div>
                                                            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>+244 923 456 789</span></div>
                                                            <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /><span>www.techsoft.ao</span></div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-3 border-t border-border/50">
                                                        <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Endereço</p>
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                            <div className="leading-relaxed">
                                                                <p>Avenida 4 de Fevereiro, Torre Executiva</p>
                                                                <p>7º Andar, Escritório 705 - Luanda, Angola</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center pt-6 text-xs text-muted-foreground border-t border-border">
                                                <p>© 2025–2026 TechSoft Solutions. Todos os direitos reservados.</p>
                                                <p className="mt-1">Desenvolvido em Angola para Angola</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </DialogContent>
            </Dialog>

            <ProgressModal open={showProgress} type={progressData.type} progress={progressData.progress} phase={progressData.phase} message={progressData.message} status={progressData.status} />
            <ConfirmRestoreModal open={showConfirmRestore} onOpenChange={setShowConfirmRestore} onConfirm={handleDoRestore} />
            <ResultModal open={showResult} onOpenChange={setShowResult} type={result.type} title={result.title} message={result.message} needsReactivation={result.needsReactivation} />
        </>
    );
}