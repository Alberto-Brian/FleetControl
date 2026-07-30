// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/pages/HomePage.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import {
  Truck, Fuel, Wrench, Users, MapPin, Route as RouteIcon, DollarSign,
  FileText, Home, Settings, Menu, AlertTriangle,
  ChevronLeft, ChevronRight, HelpCircle, Bell,
  LogIn, LogOut, Gauge, Zap, ZapOff, Play, Square, CheckCheck,
} from 'lucide-react';
import { Button }      from '@/components/ui/button';
import { ScrollArea }  from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth }     from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import UserMenu         from '@/components/UserMenu';
import SettingsDialog   from '@/components/SettingsDialog';
import { useTracking }  from '@/contexts/TrackingContext';
import type { GeofenceAlert } from '@/contexts/TrackingContext';
import { getDeviceDisplayName } from '@/helpers/tracking-helpers';
import { useLicense }          from '@/hooks/useLicense';
import { useLayoutSettings }   from '@/hooks/useLayoutSettings';
import { useLayoutPadding }    from '@/hooks/useLayoutPadding';
import { TrackingPageContent } from '@/pages/provider/TrackingPageContent';
import { DashboardProvider } from '@/contexts/DashboardContext';

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
import HelpPage        from '@/pages/HelpPage';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// ─── larguras do nav rail em modo connected ───────────────────────────────────
const NAV_RAIL_COLLAPSED_W = 56;  // ícones apenas
const NAV_RAIL_EXPANDED_W  = 180; // ícones + etiquetas

export default function HomePage() {
  const { t }    = useTranslation();
  const { user, logout } = useAuth();
  const { license } = useLicense();
  const [activeSection,      setActiveSection]      = useState('dashboard');
  const [isSidebarOpen,      setIsSidebarOpen]      = useState(true);
  const [windowWidth,        setWindowWidth]        = useState(window.innerWidth);
  const [glassPreviewActive, setGlassPreviewActive] = useState(false);

  const isConnected     = license?.mode === 'connected';
  const isMobileOverlay = windowWidth < 640;

  const { state: trackingState, dispatch: trackingDispatch } = useTracking();
  const unreadAlerts = trackingState.unreadAlerts;
  const alerts       = trackingState.alerts;

  const { sidebarCollapsed, setSidebarCollapsed, toggleSidebarCollapsed, navAutoCollapse } = useLayoutSettings();
  const isCompact = isMobileOverlay || sidebarCollapsed;
  const { hasPadding } = useLayoutPadding();

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
    const start = () => setGlassPreviewActive(true);
    const end   = () => setGlassPreviewActive(false);
    window.addEventListener('glassPreviewStart', start);
    window.addEventListener('glassPreviewEnd',   end);
    return () => {
      window.removeEventListener('glassPreviewStart', start);
      window.removeEventListener('glassPreviewEnd',   end);
    };
  }, []);

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
      case 'dashboard':   return <DashboardPage onNavigate={setActiveSection} />;
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
      case 'help':        return <HelpPage />;
      case 'settings':    return <SettingsDialog />;
      default:            return <DashboardPage onNavigate={setActiveSection} />;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MODO MAPA (connected) — mapa é o fundo de todo o sistema
  // ─────────────────────────────────────────────────────────────────────────────
  if (isConnected) {
    const activeItem  = menuItems.find(m => m.id === activeSection)
      ?? (activeSection === 'settings' ? { id: 'settings', icon: Settings, label: t('navigation:header.settings') } : undefined)
      ?? (activeSection === 'help'     ? { id: 'help',     icon: HelpCircle, label: t('navigation:menu.help') }     : undefined);
    // Espelha o standalone: expandido = ícones + texto, colapsado = ícones apenas
    const navRailW    = sidebarCollapsed ? NAV_RAIL_COLLAPSED_W : NAV_RAIL_EXPANDED_W;

    return (
      <DashboardProvider>
      <div className="relative h-full overflow-hidden">

        {/* ── 1. Mapa como fundo absoluto ── */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <TrackingPageContent
            showControls={activeSection === 'tracking'}
            leftOffset={navRailW}
            onOpenSettings={() => setActiveSection('settings')}
          />
        </div>

        {/* ── 2. Camada de UI ── */}
        <div className="relative h-full" style={{ zIndex: 10, pointerEvents: 'none' }}>

          {/* Nav Rail — fixed: cobre a parte esquerda da barra de drag visualmente */}
          <aside
            className="fixed left-0 top-0 bottom-0 flex flex-col py-3 overflow-hidden"
            style={{
              width:         navRailW,
              transition:    'width 200ms ease-in-out',
              background:    'var(--ui-nav-bg)',
              boxShadow:     '3px 0 24px rgba(0,0,0,0.35)',
              zIndex:        1000,
              pointerEvents: 'auto',
            }}
            onMouseEnter={navAutoCollapse ? () => setSidebarCollapsed(false) : undefined}
            onMouseLeave={navAutoCollapse ? () => setSidebarCollapsed(true)  : undefined}
          >
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 mb-3 px-3 gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--nav-logo-bg)' }}
              >
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div
                style={{
                  opacity:    sidebarCollapsed ? 0 : 1,
                  maxWidth:   sidebarCollapsed ? 0 : 200,
                  overflow:   'hidden',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 180ms ease, max-width 200ms ease-in-out',
                }}
              >
                <p className="text-sm font-bold text-white whitespace-nowrap">{t('navigation:app.name')}</p>
                <p className="text-[10px] whitespace-nowrap" style={{ color: 'var(--ui-t40)' }}>{t('navigation:app.tagline')}</p>
              </div>
            </div>

            {/* Nav items — ícones sempre visíveis; texto anima com opacity */}
            <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto px-2">
              {menuItems.map(item => {
                const Icon     = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <NavRailButton
                    key={item.id}
                    icon={<Icon className="w-[18px] h-[18px]" />}
                    label={item.label}
                    active={isActive}
                    collapsed={sidebarCollapsed}
                    onClick={() => setActiveSection(item.id)}
                  />
                );
              })}
            </div>

            {/* Definições + Toggle no fundo — mesmo padrão do standalone */}
            <button
              onClick={() => setActiveSection('settings')}
              title={sidebarCollapsed ? t('navigation:header.settings') : undefined}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t75)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t40)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              className="flex items-center gap-2.5 rounded-lg flex-shrink-0 transition-colors mx-2 w-[calc(100%-1rem)] px-2.5 py-2.5"
              style={{ color: 'var(--ui-t40)', background: 'transparent' }}
            >
              <Settings className="w-[16px] h-[16px] flex-shrink-0" />
              <span
                className="text-sm font-medium"
                style={{
                  opacity:    sidebarCollapsed ? 0 : 1,
                  maxWidth:   sidebarCollapsed ? 0 : 200,
                  overflow:   'hidden',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 180ms ease, max-width 200ms ease-in-out',
                }}
              >
                {t('navigation:header.settings')}
              </span>
            </button>
            {!navAutoCollapse && (
              <NavRailToggle
                collapsed={sidebarCollapsed}
                onClick={toggleSidebarCollapsed}
                t={t}
              />
            )}
          </aside>

          {/* Painel de conteúdo flutuante (secções que não são rastreamento) */}
          {activeSection !== 'tracking' && (
            <div
              className="absolute flex flex-col overflow-hidden"
              style={{
                top:           hasPadding ? 8 : 0,
                bottom:        hasPadding ? 8 : 0,
                left:          hasPadding ? navRailW + 6 : navRailW,
                right:         hasPadding ? 8 : 0,
                background:    ((activeSection === 'settings' || activeSection === 'help') && !glassPreviewActive) ? 'hsl(var(--card))' : 'var(--glass-bg)',
                backdropFilter: ((activeSection === 'settings' || activeSection === 'help') && !glassPreviewActive) ? 'none' : 'var(--glass-filter)',
                WebkitBackdropFilter: ((activeSection === 'settings' || activeSection === 'help') && !glassPreviewActive) ? 'none' : 'var(--glass-filter)',
                borderRadius:  hasPadding ? 14 : 0,
                border:        hasPadding ? '1px solid var(--ui-b07)' : 'none',
                boxShadow:     hasPadding ? '0 8px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)' : 'none',
                pointerEvents: 'auto',
              } as React.CSSProperties}
            >
              {/* Cabeçalho do painel */}
              <div
                className="flex items-center gap-2.5 px-4 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--ui-b06)', minHeight: 44 }}
              >
                {/* Ícone + título da secção */}
                {activeItem?.icon && React.createElement(activeItem.icon, {
                  className: 'w-4 h-4 flex-shrink-0',
                  style: { color: 'var(--ui-t40)' },
                })}
                <h2 className="text-sm font-semibold" style={{ color: 'var(--ui-t85)' }}>
                  {activeItem?.label}
                </h2>

                {/* Idioma + Ajuda + Definições + perfil — lado direito */}
                <div className="ml-auto flex items-center gap-1">
                  <LanguageSwitcher size="sm" />
                  <button
                    title={t('navigation:menu.help')}
                    onClick={() => setActiveSection('help')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'var(--ui-t40)', background: 'transparent' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b08)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t85)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t40)'; }}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  <AlertBellPopover
                    alerts={alerts}
                    unreadAlerts={unreadAlerts}
                    onAcknowledge={id => trackingDispatch({ type: 'ALERT_ACKNOWLEDGED', payload: id })}
                    onAcknowledgeAll={() => alerts.filter(a => !a.acknowledged).forEach(a => trackingDispatch({ type: 'ALERT_ACKNOWLEDGED', payload: a.id }))}
                    trigger={
                      <button
                        title={t('navigation:menu.alerts')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors relative"
                        style={{ color: 'var(--ui-t40)', background: 'transparent' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b08)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t85)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t40)'; }}
                      >
                        <Bell className="w-4 h-4" />
                        {unreadAlerts > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />}
                      </button>
                    }
                  />
                  <button
                    title={t('navigation:header.settings')}
                    onClick={() => setActiveSection('settings')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'var(--ui-t40)', background: 'transparent' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b08)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t85)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t40)'; }}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <UserMenu compact />
                </div>
              </div>

              {/* Conteúdo com scroll (HelpPage e SettingsDialog têm layout próprio — sem wrapper scrollável) */}
              {(activeSection === 'help' || activeSection === 'settings') ? (
                <div className="flex-1 overflow-hidden">{renderContent()}</div>
              ) : (
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  <div className={hasPadding ? 'p-4' : 'p-2'}>{renderContent()}</div>
                </div>
              )}
            </div>
          )}
        </div>


      </div>
      </DashboardProvider>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MODO STANDALONE — layout clássico com sidebar lateral
  // ─────────────────────────────────────────────────────────────────────────────
  // Largura efectiva da sidebar (afecta o marginLeft do conteúdo)
  const sidebarW = isCompact ? 56 : 220;

  return (
    <DashboardProvider>
    <div className="flex h-full bg-background overflow-hidden">
      {/* Overlay mobile */}
      {isSidebarOpen && isMobileOverlay && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed: cobre o topo (barra drag) na parte esquerda */}
      <aside
        style={{
          position:   'fixed',
          left:       0,
          top:        0,
          bottom:     0,
          width:      sidebarW,
          transition: 'width 200ms ease-in-out, transform 200ms ease-in-out',
          zIndex:     50,
        }}
        className={[
          isMobileOverlay
            ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full')
            : 'translate-x-0',
          'bg-muted/30 backdrop-blur-xl border-r border-border flex flex-col py-4 overflow-hidden',
        ].join(' ')}
        onMouseEnter={navAutoCollapse && !isMobileOverlay ? () => setSidebarCollapsed(false) : undefined}
        onMouseLeave={navAutoCollapse && !isMobileOverlay ? () => setSidebarCollapsed(true)  : undefined}
      >
        {/* Logo */}
        <div className="mb-5 flex flex-col items-center px-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
            <Truck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div
            className="text-center overflow-hidden"
            style={{
              opacity:    isCompact ? 0 : 1,
              maxHeight:  isCompact ? 0 : 60,
              marginTop:  isCompact ? 0 : 8,
              overflow:   'hidden',
              transition: 'opacity 180ms ease, max-height 200ms ease-in-out, margin-top 200ms ease-in-out',
            }}
          >
            <h2 className="font-bold text-sm whitespace-nowrap">{t('navigation:app.name')}</h2>
            <p className="text-xs text-muted-foreground whitespace-nowrap">{t('navigation:app.tagline')}</p>
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <nav className="space-y-0.5 pb-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    if (isMobileOverlay) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
                  }`}
                  title={isCompact ? item.label : undefined}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span
                    style={{
                      opacity:    isCompact ? 0 : 1,
                      maxWidth:   isCompact ? 0 : 200,
                      overflow:   'hidden',
                      whiteSpace: 'nowrap',
                      transition: 'opacity 180ms ease, max-width 200ms ease-in-out',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="px-2 mt-auto pt-3 space-y-0.5">
          <button
            onClick={() => setActiveSection('settings')}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors"
            title={isCompact ? t('navigation:header.settings') : undefined}
          >
            <Settings className="w-[18px] h-[18px] flex-shrink-0" />
            <span
              style={{
                opacity:    isCompact ? 0 : 1,
                maxWidth:   isCompact ? 0 : 200,
                overflow:   'hidden',
                whiteSpace: 'nowrap',
                transition: 'opacity 180ms ease, max-width 200ms ease-in-out',
              }}
            >
              {t('navigation:header.settings')}
            </span>
          </button>

          {/* Toggle colapsar/expandir — só em desktop e sem auto-collapse */}
          {!isMobileOverlay && !navAutoCollapse && (
            <button
              onClick={toggleSidebarCollapsed}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-muted text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              title={sidebarCollapsed ? t('navigation:sidebar.expand') : t('navigation:sidebar.collapse')}
            >
              {sidebarCollapsed
                ? <ChevronRight className="w-4 h-4 flex-shrink-0" />
                : <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              }
              <span
                style={{
                  opacity:    isCompact ? 0 : 1,
                  maxWidth:   isCompact ? 0 : 200,
                  overflow:   'hidden',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 180ms ease, max-width 200ms ease-in-out',
                }}
              >
                {t('navigation:sidebar.collapse')}
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Conteúdo principal — margem esquerda compensa a sidebar fixed */}
      <main
        className="flex-1 flex flex-col overflow-hidden min-w-0"
        style={{
          marginLeft: isMobileOverlay ? 0 : sidebarW,
          transition: 'margin-left 200ms ease-in-out',
        }}
      >
        <header className="h-14 min-h-[56px] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {(isMobileOverlay || !isSidebarOpen) && (
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
          <div className="flex items-center gap-1">
            <LanguageSwitcher size="md" />
            <button
              title={t('navigation:menu.help')}
              onClick={() => setActiveSection('help')}
              className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>
            {isConnected && (
              <AlertBellPopover
                alerts={alerts}
                unreadAlerts={unreadAlerts}
                onAcknowledge={id => trackingDispatch({ type: 'ALERT_ACKNOWLEDGED', payload: id })}
                onAcknowledgeAll={() => alerts.filter(a => !a.acknowledged).forEach(a => trackingDispatch({ type: 'ALERT_ACKNOWLEDGED', payload: a.id }))}
                trigger={
                  <button
                    title={t('navigation:menu.alerts')}
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors relative"
                  >
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadAlerts > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />}
                  </button>
                }
              />
            )}
            <UserMenu />
          </div>
        </header>

        <div className={`flex-1 min-h-0 overflow-hidden ${(activeSection === 'tracking' || activeSection === 'help' || activeSection === 'settings') ? '' : hasPadding ? 'overflow-y-auto p-4 md:p-6' : 'overflow-y-auto p-2'}`}>
          {renderContent()}
        </div>
      </main>


    </div>
    </DashboardProvider>
  );
}

// ─── Alertas Bell Popover ────────────────────────────────────────────────────
const ALERT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  geofenceEnter:  { icon: LogIn,    color: '#22c55e' },
  geofenceExit:   { icon: LogOut,   color: '#f59e0b' },
  speedLimit:     { icon: Gauge,    color: '#ef4444' },
  ignitionOn:     { icon: Zap,      color: '#10b981' },
  ignitionOff:    { icon: ZapOff,   color: '#6b7280' },
  deviceMoving:   { icon: Play,     color: '#3b82f6' },
  deviceStopped:  { icon: Square,   color: '#8b5cf6' },
};

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  <  1) return 'agora';
  if (mins  < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

function formatAlertDatetime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function AlertDetailPopover({
  alert, devName, label, meta, onAcknowledge, t,
}: {
  alert:        GeofenceAlert;
  devName:      string;
  label:        string;
  meta:         { icon: React.ElementType; color: string };
  onAcknowledge: (id: string) => void;
  t:            (key: string) => string;
}) {
  const Icon = meta.icon;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-b-0 transition-colors cursor-pointer select-none ${
            alert.acknowledged ? 'opacity-50 hover:bg-muted/10' : 'hover:bg-muted/30'
          }`}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: `${meta.color}1a` }}
          >
            <Icon className="w-4 h-4" style={{ color: meta.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold leading-snug truncate">
              <span style={{ color: meta.color }}>{label}</span>
              {' · '}
              <span className="text-foreground">{devName}</span>
            </p>
            {(alert.geofenceName || alert.speed != null) && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {alert.geofenceName ?? devName}
                {alert.speed != null && ` · ${Math.round(alert.speed)} km/h`}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{relativeTime(alert.createdAt)}</p>
          </div>
          {!alert.acknowledged && (
            <button
              onClick={e => { e.stopPropagation(); onAcknowledge(alert.id); }}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              title={t('tracking:alertDetail.markRead')}
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={4}
        className="p-0 w-[260px] shadow-lg border border-border rounded-xl overflow-hidden"
      >
        {/* Cabeçalho do detalhe */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/60"
          style={{ background: `${meta.color}0d` }}
        >
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: `${meta.color}22` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: meta.color }}>{label}</span>
          {!alert.acknowledged && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
          )}
        </div>

        {/* Campos de detalhe */}
        <div className="px-3 py-2.5 space-y-2">
          <AlertDetailRow label={t('tracking:alertDetail.device')} value={devName} />
          {alert.geofenceName && (
            <AlertDetailRow label={t('tracking:alertDetail.zone')} value={alert.geofenceName} />
          )}
          {alert.speed != null && (
            <AlertDetailRow label={t('tracking:alertDetail.speedDetected')} value={`${Math.round(alert.speed)} km/h`} />
          )}
          {alert.speedLimit != null && (
            <AlertDetailRow label={t('tracking:alertDetail.speedLimit')} value={`${alert.speedLimit} km/h`} />
          )}
          {alert.latitude != null && alert.longitude != null && (
            <AlertDetailRow
              label={t('tracking:alertDetail.location')}
              value={`${alert.latitude.toFixed(5)}, ${alert.longitude.toFixed(5)}`}
              mono
            />
          )}
          <AlertDetailRow label={t('tracking:alertDetail.datetime')} value={formatAlertDatetime(alert.createdAt)} />
        </div>

        {/* Acção */}
        {!alert.acknowledged && (
          <div className="px-3 pb-2.5">
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="w-full flex items-center justify-center gap-1.5 h-7 rounded-lg text-[11px] font-medium bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {t('tracking:alertDetail.markRead')}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function AlertDetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 leading-none mb-0.5">{label}</p>
      <p className={`text-[11px] text-foreground leading-snug ${mono ? 'font-mono text-[10px]' : 'font-medium'}`}>{value}</p>
    </div>
  );
}

function AlertBellPopover({
  alerts, unreadAlerts, onAcknowledge, onAcknowledgeAll, trigger,
}: {
  alerts:            GeofenceAlert[];
  unreadAlerts:      number;
  onAcknowledge:     (id: string) => void;
  onAcknowledgeAll:  () => void;
  trigger:           React.ReactNode;
}) {
  const { t } = useTranslation(['tracking', 'navigation']);
  const { state } = useTracking();

  const EVENT_LABELS: Record<string, string> = {
    geofenceEnter: t('tracking:alertDetail.events.geofenceEnter'),
    geofenceExit:  t('tracking:alertDetail.events.geofenceExit'),
    speedLimit:    t('tracking:alertDetail.events.speedLimit'),
    ignitionOn:    t('tracking:alertDetail.events.ignitionOn'),
    ignitionOff:   t('tracking:alertDetail.events.ignitionOff'),
    deviceMoving:  t('tracking:alertDetail.events.deviceMoving'),
    deviceStopped: t('tracking:alertDetail.events.deviceStopped'),
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="p-0 w-[360px] shadow-xl border border-border rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{t('navigation:menu.alerts')}</span>
            {unreadAlerts > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground">
                {unreadAlerts > 99 ? '99+' : unreadAlerts}
              </span>
            )}
          </div>
          {unreadAlerts > 0 && (
            <button
              onClick={onAcknowledgeAll}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {t('tracking:alerts.readAll')}
            </button>
          )}
        </div>

        {/* Lista com scroll */}
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <Bell className="w-8 h-8 opacity-20" />
            <p className="text-xs">{t('tracking:alerts.empty')}</p>
          </div>
        ) : (
          <ScrollArea style={{ height: 'min(440px, 68vh)' }}>
            {alerts.slice(0, 100).map(alert => {
              const meta    = ALERT_ICONS[alert.eventType] ?? ALERT_ICONS.geofenceEnter;
              const device  = state.devices.find(d => d.traccar_id === alert.deviceId);
              const devName = getDeviceDisplayName(device, alert.deviceId);
              const label   = EVENT_LABELS[alert.eventType] ?? alert.eventType;
              return (
                <AlertDetailPopover
                  key={alert.id}
                  alert={alert}
                  devName={devName}
                  label={label}
                  meta={meta}
                  onAcknowledge={onAcknowledge}
                  t={t as (key: string) => string}
                />
              );
            })}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Botão do nav rail ───────────────────────────────────────────────────────
function NavRailButton({
  icon, label, active, collapsed, onClick,
}: {
  icon:      React.ReactNode;
  label:     string;
  active:    boolean;
  collapsed: boolean;
  onClick:   () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2.5 rounded-lg transition-colors flex-shrink-0 w-full px-2.5 py-2.5 min-h-[40px]"
      style={{
        background: active
          ? 'var(--nav-active-bg)'
          : hovered ? 'var(--ui-b08)' : 'transparent',
        color: active
          ? 'var(--nav-active-color)'
          : hovered ? 'var(--ui-t75)' : 'var(--ui-t40)',
        border: active
          ? '1px solid var(--nav-active-border)'
          : '1px solid transparent',
      }}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span
        className="text-sm font-medium"
        style={{
          opacity:    collapsed ? 0 : 1,
          maxWidth:   collapsed ? 0 : 200,
          overflow:   'hidden',
          whiteSpace: 'nowrap',
          transition: 'opacity 180ms ease, max-width 200ms ease-in-out',
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ─── Toggle do nav rail (modo conectado) ─────────────────────────────────────
function NavRailToggle({
  collapsed, onClick, t,
}: {
  collapsed: boolean;
  onClick:   () => void;
  t:         (key: string) => string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={collapsed ? t('navigation:sidebar.expand') : t('navigation:sidebar.collapse')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2.5 rounded-lg flex-shrink-0 mt-1 transition-colors mx-2 w-[calc(100%-1rem)] px-2.5 py-2"
      style={{
        color:      hovered ? 'var(--ui-t75)' : 'var(--ui-t35)',
        background: hovered ? 'var(--ui-b08)' : 'transparent',
      }}
    >
      {collapsed
        ? <ChevronRight className="w-4 h-4 flex-shrink-0" />
        : <ChevronLeft  className="w-4 h-4 flex-shrink-0" />
      }
      <span
        className="text-xs font-medium"
        style={{
          opacity:    collapsed ? 0 : 1,
          maxWidth:   collapsed ? 0 : 200,
          overflow:   'hidden',
          whiteSpace: 'nowrap',
          transition: 'opacity 180ms ease, max-width 200ms ease-in-out',
        }}
      >
        {t('navigation:sidebar.collapse')}
      </span>
    </button>
  );
}
