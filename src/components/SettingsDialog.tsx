import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import ToggleTheme from "@/components/ToggleTheme";
import LangToggle from "@/components/LangToggle";
import { Settings, Globe, Palette, Info, Package, FileText, AlertCircle, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("appearance");

    const settingsSections = [
        { id: "appearance", icon: Palette, label: "Aparência" },
        { id: "language", icon: Globe, label: "Idioma" },
        { id: "about", icon: Info, label: "Sobre" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[600px] p-0 gap-0">
                <div className="flex h-full max-h-[100vh]">
                    {/* Sidebar de navegação - Estilo Windows 11 */}
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
                    <main className="flex-1 flex flex-col overflow-hidden">
                        <ScrollArea className="flex-1">
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

                                {activeTab === "about" && (
                                    <div className="space-y-4">
                                        {/* Logo e Nome do Sistema */}
                                        <div className="text-center pb-4 border-b border-border">
                                            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                                                <Package className="w-8 h-8 text-primary-foreground" />
                                                {/* <img src={icon} alt="Logo" className="w-8 h-8" /> */}
                                            </div>
                                            <h3 className="text-xl font-bold mb-1">MarketPro</h3>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                Sistema de Gestão de Mercado (SGM)
                                            </p>
                                            <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                                Versão 1.0.0 (Build 2025.01.08)
                                            </span>
                                        </div>

                                        {/* Informações do Sistema */}
                                        <div>
                                            <h3 className="text-sm font-semibold mb-2">Informações do Sistema</h3>
                                            <div className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">Versão</span>
                                                    <span className="text-xs font-medium">1.0.0</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">Build</span>
                                                    <span className="text-xs font-medium">2025.01.08</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">Última Atualização</span>
                                                    <span className="text-xs font-medium">08 Janeiro 2025</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">Licença</span>
                                                    <span className="text-xs font-medium">Proprietária</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Informações da Empresa */}
                                        <div className="pt-3 border-t border-border">
                                            <h3 className="text-sm font-semibold mb-2">Desenvolvido por</h3>
                                            <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3">
                                                <div>
                                                    <h4 className="text-base font-bold mb-1.5 flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-primary" />
                                                        TechSoft Solutions
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        Empresa angolana especializada em desenvolvimento de software de gestão empresarial,
                                                        proporcionando soluções tecnológicas inovadoras para o mercado nacional.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 pt-2">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] text-muted-foreground uppercase">Localização</p>
                                                        <p className="text-xs font-medium">Luanda, Angola</p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] text-muted-foreground uppercase">Fundação</p>
                                                        <p className="text-xs font-medium">2020</p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] text-muted-foreground uppercase">NIF</p>
                                                        <p className="text-xs font-medium">5401234567</p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] text-muted-foreground uppercase">Reg. Comercial</p>
                                                        <p className="text-xs font-medium">RC-123456</p>
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-border/50 space-y-1.5">
                                                    <p className="text-[10px] font-medium text-muted-foreground uppercase">Contactos</p>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                                            <span className="truncate">suporte.techsoft@gmail.com</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                                            <span className="truncate">comercial@techsoft.ao</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                                            <span className="truncate">+244 923 456 789</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                                            <span className="truncate">www.techsoft.ao</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-border/50 space-y-1.5">
                                                    <p className="text-[10px] font-medium text-muted-foreground uppercase">Endereço</p>
                                                    <div className="flex items-start gap-2 text-xs">
                                                        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                        <div className="leading-relaxed">
                                                            <p>Rua Comandante Gika, Edifício Tech Plaza</p>
                                                            <p>5º Andar, Sala 502 - Ingombota, Luanda</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recursos */}
                                        <div className="pt-3 border-t border-border">
                                            <h3 className="text-sm font-semibold mb-2">Recursos</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
                                                    <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                                    <span className="text-xs font-medium">Documentação</span>
                                                </button>
                                                <button className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
                                                    <AlertCircle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                                                    <span className="text-xs font-medium">Reportar problema</span>
                                                </button>
                                                <button className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
                                                    <Package className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                                    <span className="text-xs font-medium">Atualizações</span>
                                                </button>
                                                <button className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
                                                    <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                                    <span className="text-xs font-medium">Termos de uso</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Copyright */}
                                        <div className="pt-3 border-t border-border text-center">
                                            <p className="text-[10px] text-muted-foreground">
                                                © 2020-2025 TechSoft Solutions. Todos os direitos reservados.
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                Desenvolvido em Angola para Angola
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
}
