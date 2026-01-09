import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Client } from "@/lib/types/client";
import { deleteClient, getAllClients } from "@/helpers/clients-helpers";
import ClientsTable from "@/components/ClientsTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import NewClientDialog from "@/components/NewClientDialog";
import SettingsDialog from "@/components/SettingsDialog";
import { useToast } from "@/components/ui/use-toast";
import { Users, Settings, Home, Menu, Building2, MapPin, Receipt, FileText, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Importar as novas páginas (criar estes componentes depois)
import DashboardPage from "@/pages/DashboardPage";
import BlocksPage from "@/pages/BlocksPage";
import PaymentsPage from "@/pages/PaymentsPage";
import SellersPage from "@/pages/SellersPage";
import SpacesPage from "@/pages/SpacesPage";
import ReportsPage from "@/pages/ReportsPage";
import FinancialPage from "@/pages/FinancialPage";
import AnalyticsPage from "@/pages/AnalyticsPage";

export default function HomePage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeSection, setActiveSection] = useState("home");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Menu items com as novas opções
    const menuItems = [
        { id: 'home', icon: Home, label: 'Início' },
        { id: 'blocks', icon: Building2, label: 'Blocos' },
        { id: 'sellers', icon: Users, label: 'Vendedores' },
        { id: 'clients', icon: Users, label: 'Clientes' },
        { id: 'spaces', icon: MapPin, label: 'Espaços' },
        { id: 'payments', icon: Receipt, label: 'Pagamentos' },
        { id: 'reports', icon: FileText, label: 'Relatórios' },
        { id: 'financial', icon: DollarSign, label: 'Financeiro' },
        { id: 'analytics', icon: BarChart3, label: 'Análises' },
    ];

    useEffect(() => {
        async function fetchClients() {
            return await getAllClients();
        }

        fetchClients()
            .then((data) => setClients(data))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth < 640) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function deleteClientRequest(clientId: string) {
        setClients((prev) => prev.filter((client) => client.id !== clientId));
        toast({
            title: t("toast:clientDeletedTitle"),
            description: t("toast:clientDeletedDescription"),
        });
        deleteClient(clientId);
    }

    const showCompactSidebar = windowWidth < 640;

    // Renderizar conteúdo baseado na secção activa
    const renderContent = () => {
        switch (activeSection) {
            case 'home':
                return <DashboardPage />;
            case 'blocks':
                return <BlocksPage />;
            case 'sellers':
                return <SellersPage />;
            case 'spaces':
                return <SpacesPage />;
            case 'payments':
                return <PaymentsPage />;
            case 'reports':
                return <ReportsPage />;
            case 'financial':
                return <FinancialPage />;
            case 'analytics':
                return <AnalyticsPage />;
            case 'clients':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Clientes</h2>
                                <p className="text-muted-foreground">
                                    {t("homePage:registeredClients", { count: clients.length })}
                                </p>
                            </div>
                            <NewClientDialog
                                onRegisterClient={(newClient) =>
                                    setClients((prev) => [...prev, newClient])
                                }
                            />
                        </div>

                        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
                            <div className="p-4 border-b border-border">
                                <h3 className="font-semibold">Lista de Clientes</h3>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto p-4">
                                <ClientsTable 
                                    clients={clients} 
                                    onClientDeleteRequest={deleteClientRequest} 
                                />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    return (
        <div className="flex h-full bg-background overflow-hidden">
            {/* Overlay para mobile */}
            {isSidebarOpen && showCompactSidebar && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`${
                    showCompactSidebar 
                        ? 'fixed z-50 transition-transform duration-300' 
                        : 'relative'
                } ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } h-full bg-muted/30 backdrop-blur-xl border-r border-border flex flex-col py-4 ${
                    showCompactSidebar ? 'w-16' : 'w-60'
                }`}
            >
                <div className="px-4 mb-6">
                    <div className={`${showCompactSidebar ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg bg-primary/10 flex items-center justify-center mx-auto`}>
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    {!showCompactSidebar && (
                        <div className="mt-2 text-center">
                            <h2 className="font-bold text-sm">Market Pro</h2>
                            <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
                        </div>
                    )}
                </div>

                <ScrollArea className="flex-1 px-3">
                    <nav className="space-y-1 pb-4">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        if (showCompactSidebar) setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                        activeSection === item.id
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted text-muted-foreground"
                                    } ${showCompactSidebar ? 'justify-center' : ''}`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!showCompactSidebar && <span>{item.label}</span>}
                                </button>
                            );
                        })}
                    </nav>
                </ScrollArea>

                <div className="px-3 mt-auto pt-4 border-t border-border">
                    <button 
                        onClick={() => {
                            setIsSettingsOpen(true);
                            if (showCompactSidebar) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors ${showCompactSidebar ? 'justify-center' : ''}`}
                    >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {!showCompactSidebar && <span>Definições</span>}
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <header className="h-12 min-h-[48px] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {(showCompactSidebar || !isSidebarOpen) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                        )}
                        {menuItems.find(item => item.id === activeSection)?.icon && 
                            React.createElement(menuItems.find(item => item.id === activeSection)!.icon, {
                                className: "w-4 h-4 text-muted-foreground flex-shrink-0"
                            })
                        }
                        <h1 className="text-sm font-semibold truncate">
                            {menuItems.find(item => item.id === activeSection)?.label}
                        </h1>
                    </div>
                </header>

                {/* Área de Conteúdo com Scroll */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
                    {renderContent()}
                </div>
            </main>

            {/* Dialog de Definições */}
            <SettingsDialog 
                open={isSettingsOpen} 
                onOpenChange={setIsSettingsOpen} 
            />
        </div>
    );
}