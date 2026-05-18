// ========================================
// FILE: src/components/tracking/TrackingToolbar.tsx
// ========================================
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PanelLeft,
  PanelLeftClose,
  RefreshCw,
  RotateCcw,
  WifiOff,
  History,
  Clock,
  Filter,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  isConnected:     boolean;
  isSidebarOpen:   boolean;
  onToggleSidebar: () => void;
  onRefresh:       () => void;
  onSyncDevices?:  () => void;
  totalDevices:    number;
  onlineDevices:   number;
  offlineDevices:  number;
  showingHistory:  boolean;
  onExitHistory:   () => void;
  onFilterStatus?: (status: 'all' | 'online' | 'offline') => void;
  isLoading?:      boolean;
  lastUpdate?:     Date | null;
}

export function TrackingToolbar({
  isConnected,
  isSidebarOpen,
  onToggleSidebar,
  onRefresh,
  onSyncDevices,
  totalDevices,
  onlineDevices,
  offlineDevices,
  showingHistory,
  onExitHistory,
  onFilterStatus,
  isLoading = false,
  lastUpdate,
}: Props) {
  const { t } = useTranslation('tracking');
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center gap-2 pointer-events-none">
      
      {/* === GRUPO ESQUERDO: Controles === */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-background/80 backdrop-blur-md rounded-xl border border-border/50 p-1 shadow-lg">
        
        {/* Toggle Sidebar com ícone dinâmico */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? t('toolbar.closeSidebar') : t('toolbar.openSidebar')}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </Button>

        <div className="w-px h-5 bg-border" />

        {/* Refresh (recarrega lista local) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted"
          onClick={onRefresh}
          disabled={isLoading}
          title={t('toolbar.refresh')}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>

        {/* Sync Devices — vai ao Traccar buscar novos trackers */}
        {onSyncDevices && isConnected && (
          <>
            <div className="w-px h-5 bg-border" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={onSyncDevices}
              disabled={isLoading}
              title="Sincronizar dispositivos Traccar"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Filtro de status (dropdown simples) */}
        {onFilterStatus && (
          <>
            <div className="w-px h-5 bg-border" />
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs hover:bg-muted gap-1"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="w-3.5 h-3.5" />
                <ChevronDown className="w-3 h-3" />
              </Button>
              
              {filterOpen && (
                <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-xl p-1 min-w-[120px]">
                  {(['all', 'online', 'offline'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        onFilterStatus(status);
                        setFilterOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors"
                    >
                      {status === 'all' && t('sidebar.allDevices')}
                      {status === 'online' && `🟢 ${t('sidebar.online')}`}
                      {status === 'offline' && `⚫ ${t('sidebar.offline')}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* === CENTRO: Status & Métricas === */}
      <div className="flex-1 flex justify-center pointer-events-auto">
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md rounded-xl border border-border/50 p-1.5 shadow-lg">
          
          {/* Conexão Traccar - mais visual */}
          <Badge
            variant="secondary"
            className={`px-3 py-1.5 text-xs font-semibold gap-1.5 border-0 ${
              isConnected
                ? 'bg-green-500/15 text-green-700 hover:bg-green-500/20'
                : 'bg-red-500/15 text-red-700 hover:bg-red-500/20'
            }`}
          >
            <span className={`relative flex h-2 w-2 ${isConnected ? '' : 'hidden'}`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            {!isConnected && <WifiOff className="w-3 h-3" />}
            {isConnected ? t('toolbar.realtime') : t('toolbar.offline')}
          </Badge>

          <div className="w-px h-4 bg-border" />

          {/* Contadores separados - mais informativo */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700">
                {onlineDevices} {t('sidebar.online')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="text-xs text-muted-foreground">
                {offlineDevices} {t('sidebar.offline')}
              </span>
            </div>
            <div className="text-xs text-muted-foreground border-l border-border pl-2">
              {totalDevices} {t('sidebar.devices')}
            </div>
          </div>

          {/* Última atualização */}
          {lastUpdate && (
            <>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground px-1">
                <Clock className="w-3 h-3" />
                {formatLastUpdate(lastUpdate)}
              </div>
            </>
          )}

          {/* Botão sair do histórico */}
          {showingHistory && (
            <>
              <div className="w-px h-4 bg-border" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-0"
                onClick={onExitHistory}
              >
                <History className="w-3.5 h-3.5 mr-1.5" />
                {t('toolbar.exitHistory')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* === DIREITA: Espaçador ou ações extras === */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        {/* Layer toggle (opcional - para alternar camadas do mapa) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur-md border border-border/50 shadow-lg hover:bg-muted"
          title={t('toolbar.layers')}
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Helper para formatar tempo relativo
function formatLastUpdate(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}