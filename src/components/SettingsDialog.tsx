import React, { useState } from "react";
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
    Settings,
    Globe,
    Palette,
    Info,
    Package,
    FileText,
    AlertCircle,
    Mail,
    Phone,
    MapPin,
    Building2,
    HardDrive,
    Download,
    Upload,
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
    exportBackup,
    restoreBackup,
} from "@/helpers/backup-helpers";

// ────────────────────────────────────────────────
//   Modais Auxiliares
// ────────────────────────────────────────────────

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
        if (status === 'error') return <XCircle className="w-12 h-12 text-destructive" />;
        if (status === 'success') return <CheckCircle className="w-12 h-12 text-green-500" />;
        return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
    };

    const title = type === 'backup' ? 'A criar backup...' : 'A restaurar backup...';

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={e => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5" />
                        {title}
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
                            <p className="text-sm text-center text-muted-foreground font-medium">
                                {progress.toFixed(0)}%
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center text-sm text-destructive">
                            {message}
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center text-sm text-green-700 dark:text-green-400">
                            {message}
                        </div>
                    )}
                </div>

                {status === 'loading' && (
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Não feche esta janela
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}

interface ConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

function ConfirmRestoreModal({ open, onOpenChange, onConfirm }: ConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-5 h-5" />
                        Confirmar restauração
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <p className="text-sm">
                        Tem a certeza que deseja restaurar um backup?
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1.5">
                        <p>• Os dados actuais serão substituídos</p>
                        <p>• Será necessário reactivar a licença</p>
                        <p>• A aplicação será reiniciada automaticamente</p>
                        <p className="font-medium text-foreground pt-2">Esta acção não pode ser desfeita.</p>
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Sim, restaurar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ResultModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'success' | 'error';
    title: string;
    message: string;
    needsReactivation?: boolean;
}

function ResultModal({ open, onOpenChange, type, title, message, needsReactivation }: ResultModalProps) {
    const Icon = type === 'success' ? CheckCircle : XCircle;
    const color = type === 'success' ? 'text-green-600' : 'text-destructive';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${color}`}>
                        <Icon className="w-5 h-5" />
                        {title}
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
                    <Button onClick={() => onOpenChange(false)} className="w-full">
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ────────────────────────────────────────────────
//   Componente Principal
// ────────────────────────────────────────────────

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("appearance");

    // Estados de operação
    const [operation, setOperation] = useState<'idle' | 'exporting' | 'restoring'>('idle');

    // Modais
    const [showProgress, setShowProgress] = useState(false);
    const [showConfirmRestore, setShowConfirmRestore] = useState(false);
    const [showResult, setShowResult] = useState(false);

    // Dados do progresso
    const [progressData, setProgressData] = useState({
        type: 'backup' as 'backup' | 'restore',
        progress: 0,
        phase: '',
        message: '',
        status: 'loading' as 'loading' | 'success' | 'error',
    });

    // Resultado final
    const [result, setResult] = useState({
        type: 'success' as 'success' | 'error',
        title: '',
        message: '',
        needsReactivation: false,
    });

    const isBusy = operation !== 'idle';

    const settingsSections = [
        { id: "appearance", icon: Palette, label: "Aparência" },
        { id: "language", icon: Globe, label: "Idioma" },
        { id: "backups", icon: HardDrive, label: "Backups" },
        { id: "about", icon: Info, label: "Sobre" },
    ];

    // ═══════════════════════════════════════════════
    //   HANDLER: Exportar Backup
    // ═══════════════════════════════════════════════
    const handleExportBackup = async () => {
        setOperation('exporting');
        
        try {
            // 1. Chamar a função que abre o diálogo de seleção
            const result = await exportBackup();
            
            // 2. Se o usuário cancelou, sair
            if (!result.success && result.error === 'Cancelado pelo usuário') {
                setOperation('idle');
                return;
            }

            // 3. Mostrar progresso SOMENTE depois de escolher o local
            setProgressData({
                type: 'backup',
                progress: 0,
                phase: 'A iniciar...',
                message: 'A preparar ficheiros...',
                status: 'loading',
            });
            setShowProgress(true);

            // 4. Simular progresso (substituir por eventos IPC reais)
            const phases = [
                { phase: 'Bases de dados', msg: 'A copiar bases de dados...', pct: 30 },
                { phase: 'Configurações', msg: 'A copiar ficheiros do utilizador...', pct: 60 },
                { phase: 'Compactação', msg: 'A criar arquivo ZIP...', pct: 85 },
            ];

            for (const step of phases) {
                await new Promise(r => setTimeout(r, 600));
                setProgressData(prev => ({ 
                    ...prev, 
                    phase: step.phase,
                    message: step.msg, 
                    progress: step.pct 
                }));
            }

            // 5. Conclusão
            setProgressData(prev => ({
                ...prev,
                progress: 100,
                phase: 'Concluído',
                message: 'Backup criado com sucesso',
                status: 'success',
            }));

            await new Promise(r => setTimeout(r, 1200));
            setShowProgress(false);

            // 6. Mostrar resultado
            if (result.success) {
                const sizeInMB = result.size ? (result.size / 1024 / 1024).toFixed(2) : '?';
                setResult({
                    type: 'success',
                    title: '✅ Backup exportado',
                    message: `Backup criado com sucesso! (${sizeInMB} MB)`,
                    needsReactivation: false,
                });
            } else {
                setResult({
                    type: 'error',
                    title: '❌ Erro ao exportar',
                    message: result.error || 'Falha ao criar backup',
                    needsReactivation: false,
                });
            }
            setShowResult(true);

        } catch (error: any) {
            setProgressData(prev => ({
                ...prev,
                phase: 'Erro',
                message: error.message || 'Ocorreu um erro inesperado',
                status: 'error',
            }));

            await new Promise(r => setTimeout(r, 1800));
            setShowProgress(false);

            setResult({
                type: 'error',
                title: '❌ Erro',
                message: error.message || 'Falha ao criar backup',
                needsReactivation: false,
            });
            setShowResult(true);
        } finally {
            setOperation('idle');
        }
    };

    // ═══════════════════════════════════════════════
    //   HANDLER: Restaurar Backup (Confirmar)
    // ═══════════════════════════════════════════════
    const handleRestoreConfirm = () => {
        setShowConfirmRestore(true);
    };

    // ═══════════════════════════════════════════════
    //   HANDLER: Executar Restauração
    // ═══════════════════════════════════════════════
   // ═══════════════════════════════════════════════
//   HANDLER: Restaurar Backup (após confirmação)
// ═══════════════════════════════════════════════
const handleDoRestore = async () => {
  setShowConfirmRestore(false);
  setOperation('restoring');

  try {
    const result = await restoreBackup();

    // ────────────────────────────────────────────────
    // Cancelamento ou falha inicial → silencioso
    // ────────────────────────────────────────────────
    if (!result?.success) {
      setOperation('idle');
      return;
    }

    // ────────────────────────────────────────────────
    // Só mostramos progresso se o ficheiro foi seleccionado e a restauração começou
    // ────────────────────────────────────────────────
    setProgressData({
      type: 'restore',
      progress: 0,
      phase: 'A iniciar...',
      message: 'A validar o ficheiro seleccionado...',
      status: 'loading',
    });
    setShowProgress(true);

    // Simulação (substituir por progresso real via IPC quando disponível)
    const phases = [
      { phase: 'Validação', msg: 'A verificar integridade...', pct: 20 },
      { phase: 'Extração', msg: 'A extrair conteúdos...', pct: 45 },
      { phase: 'Restauração', msg: 'A restaurar bases de dados e configurações...', pct: 80 },
      { phase: 'Finalização', msg: 'A aplicar alterações...', pct: 95 },
    ];

    for (const step of phases) {
      await new Promise(r => setTimeout(r, 800));
      setProgressData(prev => ({
        ...prev,
        phase: step.phase,
        message: step.msg,
        progress: step.pct,
      }));
    }

    setProgressData(prev => ({
      ...prev,
      progress: 100,
      phase: 'Concluído',
      message: 'Restauração finalizada',
      status: 'success',
    }));

    await new Promise(r => setTimeout(r, 1400));
    setShowProgress(false);

    setResult({
      type: 'success',
      title: 'Backup restaurado',
      message: result.requiresRestart
        ? 'Restauração concluída. A aplicação será reiniciada em breve...'
        : 'Restauração concluída com sucesso.',
      needsReactivation: false,
    });
    setShowResult(true);

    if (result.requiresRestart) {
      setTimeout(() => window.location.reload(), 2200);
    }
  } catch (err: any) {
    setShowProgress(false);
    setResult({
      type: 'error',
      title: 'Erro durante a restauração',
      message: err.message || 'Ocorreu um problema inesperado.',
      needsReactivation: false,
    });
    setShowResult(true);
  } finally {
    setOperation('idle');
  }
};

    return (
        <>
            {/* ============================================= */}
            {/*   Dialog Principal de Definições             */}
            {/* ============================================= */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl h-[600px] p-0 gap-0 overflow-hidden">
                    <div className="flex h-full">
                        {/* Sidebar de navegação */}
                        <aside className="w-64 border-r border-border bg-muted/30 flex flex-col">
                            <DialogHeader className="p-6 pb-4">
                                <DialogTitle className="flex items-center gap-2 text-lg">
                                    <Settings className="w-5 h-5" />
                                    Definições
                                </DialogTitle>
                            </DialogHeader>

                            <ScrollArea className="flex-1 px-3">
                                <nav className="space-y-1 py-2">
                                    {settingsSections.map((section) => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveTab(section.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                                    activeTab === section.id
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {section.label}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </ScrollArea>
                        </aside>

                        {/* Conteúdo das definições */}
                        <main className="flex-1 flex flex-col">
                            <ScrollArea className="flex-1 px-1 py-2">
                                <div className="p-6 space-y-6">
                                    {activeTab === "appearance" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-base font-semibold mb-1">Tema</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Escolha entre tema claro ou escuro
                                                </p>
                                                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                            <Palette className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Aparência</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Modo claro ou escuro
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ToggleTheme />
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-border">
                                                <h3 className="text-base font-semibold mb-1">Personalização</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Ajuste a interface de acordo com suas preferências
                                                </p>
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

                                    {activeTab === "language" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-base font-semibold mb-1">Idioma da aplicação</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Selecione o idioma preferido para a interface
                                                </p>
                                                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                            <Globe className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Idioma</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Português / English
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <LangToggle />
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-border">
                                                <h3 className="text-base font-semibold mb-1">Região e formato</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Configurações de localização
                                                </p>
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

                                    {activeTab === "backups" && (
                                        <div className="space-y-6">
                                            {/* Header */}
                                            <div>
                                                <h3 className="text-base font-semibold mb-1">Gestão de Backups</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Configure e gerencie os backups do sistema
                                                </p>
                                            </div>

                                            {/* Backup Automático */}
                                            <div className="p-4 rounded-lg border border-border bg-card/50 space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-semibold mb-1">Backup Automático</h4>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            Backups diários automáticos das bases de dados. 
                                                            Os últimos 7 backups são mantidos automaticamente.
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

                                            {/* Backup Manual */}
                                            <div className="pt-4 border-t border-border space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-1">Backup Manual</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        Exporte ou restaure backups completos do sistema
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Exportar Backup */}
                                                    <Button
                                                        onClick={handleExportBackup}
                                                        disabled={isBusy}
                                                        className="h-auto flex flex-col items-start gap-2 p-4"
                                                        variant="outline"
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            {operation === 'exporting' ? (
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                            ) : (
                                                                <Download className="w-5 h-5" />
                                                            )}
                                                            <span className="font-semibold text-sm">
                                                                Exportar Backup
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground text-left whitespace-normal break-words max-w-full">
                                                            Cria arquivo ZIP com todos os dados para transferir para outro computador
                                                        </p>
                                                    </Button>

                                                    {/* Restaurar Backup */}
                                                    <Button
                                                        onClick={handleRestoreConfirm}
                                                        disabled={isBusy}
                                                        className="h-auto flex flex-col items-start gap-2 p-4"
                                                        variant="outline"
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            {operation === 'restoring' ? (
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                            ) : (
                                                                <Upload className="w-5 h-5" />
                                                            )}
                                                            <span className="font-semibold text-sm">
                                                                Restaurar Backup
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground text-left whitespace-normal break-words max-w-full">
                                                            Importa backup de outro computador. Requer reativação da licença.
                                                        </p>
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Aviso */}
                                            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-xs text-amber-600 leading-relaxed">
                                                    <strong>Importante:</strong> Ao restaurar um backup em outro computador, 
                                                    será necessário reativar a licença com o novo Machine ID.
                                                </div>
                                            </div>
                                        </div>
                                    )}

{activeTab === "about" && (
    <div className="space-y-6">
        {/* Cabeçalho / Logo */}
        <div className="text-center pb-6 border-b border-border">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                <Package className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-1">MarketPro</h3>
            <p className="text-sm text-muted-foreground mb-3">
                Sistema de Gestão de Mercado (SGM)
            </p>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Versão 1.0.0 • Build 2025.01.08
            </span>
        </div>

        {/* Informações do Sistema */}
        <div className="space-y-4">
            <h3 className="text-base font-semibold">Informações do Sistema</h3>
            <div className="p-4 rounded-lg border bg-card/50 space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Versão</span>
                    <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Build</span>
                    <span className="font-medium">2025.01.08</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Última atualização</span>
                    <span className="font-medium">8 de Janeiro de 2025</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Licença</span>
                    <span className="font-medium">Proprietária</span>
                </div>
            </div>
        </div>

        {/* Desenvolvido por */}
        <div className="space-y-4 pt-2">
            <h3 className="text-base font-semibold">Desenvolvido por</h3>
            <div className="p-5 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 space-y-4">
                <div>
                    <h4 className="text-lg font-bold flex items-center gap-2 mb-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        TechSoft Solutions
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Empresa angolana especializada no desenvolvimento de software de gestão empresarial, 
                        oferecendo soluções tecnológicas modernas e adaptadas ao mercado nacional.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-2">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase">Localização</p>
                        <p className="font-medium">Luanda, Angola</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase">Fundação</p>
                        <p className="font-medium">2020</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase">NIF</p>
                        <p className="font-medium">5401234567</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase">Reg. Comercial</p>
                        <p className="font-medium">RC-123456</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Contactos</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">suporte.techsoft@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">comercial@techsoft.ao</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>+244 923 456 789</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span>www.techsoft.ao</span>
                        </div>
                    </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Endereço</p>
                    <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="leading-relaxed">
                            <p>Rua Comandante Gika, Edifício Tech Plaza</p>
                            <p>5º Andar, Sala 502 - Ingombota, Luanda</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 text-xs text-muted-foreground border-t border-border">
            <p>© 2020–2025 TechSoft Solutions. Todos os direitos reservados.</p>
            <p className="mt-1">Desenvolvido em Angola para Angola</p>
        </div>
    </div>
)}
                                </div>
                            </ScrollArea>
                        </main>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ────────────────────────────────────────────────
                Modais de suporte
            ──────────────────────────────────────────────── */}

            <ProgressModal
                open={showProgress}
                type={progressData.type}
                progress={progressData.progress}
                phase={progressData.phase}
                message={progressData.message}
                status={progressData.status}
            />

            <ConfirmRestoreModal
                open={showConfirmRestore}
                onOpenChange={setShowConfirmRestore}
                onConfirm={handleDoRestore}
            />

            <ResultModal
                open={showResult}
                onOpenChange={setShowResult}
                type={result.type}
                title={result.title}
                message={result.message}
                needsReactivation={result.needsReactivation}
            />
        </>
    );
}