// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/pages/HomePage.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import {
  Truck, Fuel, Wrench, Users, MapPin, Route as RouteIcon, DollarSign,
  FileText, BarChart3, Home, Settings, Menu, AlertTriangle,
} from 'lucide-react';
import { Button }      from '@/components/ui/button';
import { ScrollArea }  from '@/components/ui/scroll-area';
import { useAuth }     from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import UserMenu         from '@/components/UserMenu';
import SettingsDialog   from '@/components/SettingsDialog';
import { useLicense }   from '@/hooks/useLicense';
import { TrackingPageContent } from '@/pages/provider/TrackingPageContent';

// Page imports
import DashboardPage    from '@/pages/DashboardPage';
import VehiclesPage     from '@/pages/VehiclesPage';
import DriversPage      from '@/pages/DriversPage';
import TripsPage        from '@/pages/TripsPage';
import FuelPage         from '@/pages/FuelPage';
import MaintenancePage  from '@/pages/MaintenancePage';
import ExpensesPage     from '@/pages/ExpensesPage';
import FinesPage        from '@/pages/FinesPage';
import ReportsPage      from '@/pages/ReportsPage';
import AnalyticsPage    from '@/pages/AnalyticsPage';
import TrackingPage     from '@/pages/TrackingPage';

// ─── constante para a largura do nav rail em modo mapa ───────────────────────
const NAV_RAIL_W = 56; // px

export default function HomePage() {
  const { t }    = useTranslation();
  const { user, logout } = useAuth();
  const { license } = useLicense();
  const [activeSection,  setActiveSection]  = useState('dashboard');
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [windowWidth,    setWindowWidth]    = useState(window.innerWidth);

  const isConnected    = license?.mode === 'connected';
  const showCompactSidebar = windowWidth < 640;

  const menuItems = [
    { id: 'dashboard',   icon: Home,          label: t('navigation:menu.dashboard')   },
    { id: 'vehicles',    icon: Truck,          label: t('navigation:menu.vehicles')    },
    { id: 'drivers',     icon: Users,          label: t('navigation:menu.drivers')     },
    { id: 'trips',       icon: RouteIcon,      label: t('navigation:menu.trips')       },
    { id: 'fuel',        icon: Fuel,           label: t('navigation:menu.fuel')        },
    { id: 'maintenance', icon: Wrench,         label: t('navigation:menu.maintenance') },
    { id: 'expenses',    icon: DollarSign,     label: t('navigation:menu.expenses')    },
    { id: 'fines',       icon: AlertTriangle,  label: t('navigation:menu.fines')       },
    { id: 'reports',     icon: FileText,       label: t('navigation:menu.reports')     },
    ...(isConnected ? [{ id: 'tracking', icon: MapPin, label: t('navigation:menu.tracking') }] : []),
  ];

  useEffect(() => {
    if (activeSection === 'tracking' && !isConnected) setActiveSection('dashboard');
  }, [isConnected, activeSection]);

  useEffect(() => {
    const handle = () => {
      setWindowWidth(window.innerWidth);
      setIsSidebarOpen(window.innerWidth >= 640);
    };
    window.addEventListener('resize', handle);
    handle();
    return () => window.removeEventListener('resize', handle);
  }, []);

  function renderContent() {
    switch (activeSection) {
      case 'dashboard':   return <DashboardPage />;
      case 'vehicles':    return <VehiclesPage />;
      case 'drivers':     return <DriversPage />;
      case 'trips':       return <TripsPage />;
      case 'fuel':        return <FuelPage />;
      case 'maintenance': return <MaintenancePage />;
      case 'expenses':    return <ExpensesPage />;
      case 'fines':       return <FinesPage />;
      case 'reports':     return <ReportsPage />;
      case 'tracking':    return <TrackingPage />;
      case 'analytics':   return <AnalyticsPage />;
      default:            return <DashboardPage />;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MODO MAPA (connected) — mapa é o fundo de todo o sistema
  // ─────────────────────────────────────────────────────────────────────────────
  if (isConnected) {
    const activeItem = menuItems.find(m => m.id === activeSection);

    return (
      <div className="relative h-full overflow-hidden">

        {/* ── 1. Mapa como fundo absoluto ── */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <TrackingPageContent
            showControls={activeSection === 'tracking'}
            leftOffset={NAV_RAIL_W}
          />
        </div>

        {/* ── 2. Camada de UI ── */}
        <div className="relative h-full" style={{ zIndex: 10, pointerEvents: 'none' }}>

          {/* Nav Rail */}
          <aside
            className="absolute left-0 top-0 bottom-0 flex flex-col items-center py-3 overflow-hidden"
            style={{
              width:        NAV_RAIL_W,
              background:   'rgba(8,14,28,0.97)',
              boxShadow:    '3px 0 24px rgba(0,0,0,0.5)',
              pointerEvents: 'auto',
            }}
          >
            {/* Logo */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-3"
              style={{ background: 'rgba(59,130,246,0.85)' }}
            >
              <Truck className="w-5 h-5 text-white" />
            </div>

            {/* Nav items */}
            <div className="flex-1 flex flex-col items-center gap-0.5 w-full px-2 overflow-y-auto">
              {menuItems.map(item => {
                const Icon     = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <NavRailButton
                    key={item.id}
                    icon={<Icon className="w-5 h-5" />}
                    label={item.label}
                    active={isActive}
                    onClick={() => setActiveSection(item.id)}
                  />
                );
              })}
            </div>

            {/* Rodapé: definições + utilizador */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-2"
                 style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, width: '100%', alignItems: 'center' }}>
              <NavRailButton
                icon={<Settings className="w-5 h-5" />}
                label={t('navigation:header.settings')}
                active={false}
                onClick={() => setIsSettingsOpen(true)}
              />
              {/* UserMenu — já usa DropdownMenu com Avatar */}
              <div className="mt-1">
                <UserMenu />
              </div>
            </div>
          </aside>

          {/* Painel de conteúdo flutuante (secções que não são rastreamento) */}
          {activeSection !== 'tracking' && (
            <div
              className="absolute flex flex-col overflow-hidden"
              style={{
                top:           8,
                bottom:        8,
                left:          NAV_RAIL_W + 6,
                width:         400,
                background:    'rgba(8,14,28,0.88)',
                backdropFilter: 'blur(20px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                borderRadius:  14,
                border:        '1px solid rgba(255,255,255,0.07)',
                boxShadow:     '0 8px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)',
                pointerEvents: 'auto',
              } as React.CSSProperties}
            >
              {/* Cabeçalho do painel */}
              <div
                className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                {activeItem?.icon && React.createElement(activeItem.icon, {
                  className: 'w-4 h-4 flex-shrink-0',
                  style: { color: 'rgba(255,255,255,0.4)' },
                })}
                <h2 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {activeItem?.label}
                </h2>
              </div>

              {/* Conteúdo com scroll */}
              <div className="flex-1 overflow-y-auto overflow-x-auto">
                <div className="p-4">
                  {renderContent()}
                </div>
              </div>
            </div>
          )}
        </div>

        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MODO STANDALONE — layout clássico com sidebar lateral
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Overlay mobile */}
      {isSidebarOpen && showCompactSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          showCompactSidebar ? 'fixed z-50 transition-transform duration-300' : 'relative'
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
              <h2 className="font-bold text-sm">{t('navigation:app.name')}</h2>
              <p className="text-xs text-muted-foreground">{t('navigation:app.tagline')}</p>
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
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  } ${showCompactSidebar ? 'justify-center' : ''}`}
                  title={showCompactSidebar ? item.label : undefined}
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
            onClick={() => setIsSettingsOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors ${showCompactSidebar ? 'justify-center' : ''}`}
            title={showCompactSidebar ? t('navigation:header.settings') : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!showCompactSidebar && <span>{t('navigation:header.settings')}</span>}
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 min-h-[56px] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 flex-shrink-0">
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
                className: 'w-5 h-5 text-muted-foreground flex-shrink-0',
              })
            }
            <h1 className="text-base font-semibold truncate">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h1>
          </div>
          <UserMenu />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
          {renderContent()}
        </div>
      </main>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}

// ─── Botão do nav rail ───────────────────────────────────────────────────────
function NavRailButton({
  icon, label, active, onClick,
}: {
  icon:    React.ReactNode;
  label:   string;
  active:  boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
      style={{
        background: active
          ? 'rgba(59,130,246,0.25)'
          : hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: active
          ? '#60a5fa'
          : hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)',
        border: active
          ? '1px solid rgba(59,130,246,0.3)'
          : '1px solid transparent',
      }}
    >
      {icon}
    </button>
  );
}
