import React, { useState, useEffect } from 'react';
import { 
  Truck, Fuel, Wrench, Users, MapPin, DollarSign, 
  FileText, BarChart3, Home, Settings, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/UserMenu';
import DashboardPage from '@/pages/DashboardPage';
import SettingsDialog from '@/components/SettingsDialog';

export default function HomePage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'vehicles', icon: Truck, label: 'Veículos' },
    { id: 'drivers', icon: Users, label: 'Motoristas' },
    { id: 'trips', icon: MapPin, label: 'Viagens' },
    { id: 'fuel', icon: Fuel, label: 'Abastecimentos' },
    { id: 'maintenance', icon: Wrench, label: 'Manutenções' },
    { id: 'expenses', icon: DollarSign, label: 'Despesas' },
    { id: 'reports', icon: FileText, label: 'Relatórios' },
    { id: 'analytics', icon: BarChart3, label: 'Análises' },
  ];

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

  const showCompactSidebar = windowWidth < 640;

  const handleLogout = () => {
    logout();
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
    if (showCompactSidebar) setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardPage />;
      case 'vehicles':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestão de Veículos</h2>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          </div>
        );
      case 'drivers':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestão de Motoristas</h2>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          </div>
        );
      case 'trips':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestão de Viagens</h2>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          </div>
        );
      case 'fuel':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Abastecimentos</h2>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          </div>
        );
      case 'maintenance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Manutenções</h2>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Despesas</h2>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Relatórios</h2>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Análises</h2>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          </div>
        );
      default:
        return <DashboardPage />;
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
          <div className={`${showCompactSidebar ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-md`}>
            <Truck className="w-6 h-6 text-primary-foreground" />
          </div>
          {!showCompactSidebar && (
            <div className="mt-2 text-center">
              <h2 className="font-bold text-sm">FleetControl</h2>
              <p className="text-xs text-muted-foreground">Gestão de Frotas</p>
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
            onClick={handleSettingsClick}
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
        <header className="h-14 min-h-[56px] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 flex-shrink-0">
          {/* Lado esquerdo - Menu e título */}
          <div className="flex items-center gap-3 min-w-0">
            {(showCompactSidebar || !isSidebarOpen) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 flex-shrink-0"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            {menuItems.find(item => item.id === activeSection)?.icon && 
              React.createElement(menuItems.find(item => item.id === activeSection)!.icon, {
                className: "w-5 h-5 text-muted-foreground flex-shrink-0"
              })
            }
            <h1 className="text-base font-semibold truncate">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h1>
          </div>

          {/* Lado direito - Perfil do usuário */}
          <UserMenu 
            user={user ? {
              name: user.name,
              email: user.email,
              avatar: user.avatar || null
            } : undefined}
            onLogout={handleLogout}
            onSettingsClick={handleSettingsClick}
          />
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