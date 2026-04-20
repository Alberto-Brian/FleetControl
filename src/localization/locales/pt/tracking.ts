// ========================================
// FILE: src/locales/pt/tracking.ts
// ========================================

export const ptTracking = {
  title: "Rastreamento em Tempo Real",
  sidebar: {
    search: "Procurar dispositivo...",
    devices: "dispositivos",
    device: "dispositivo",      // singular
    online: "online",
    offline: "offline",         // ⬅️ NOVO
    allDevices: "Todos",        // ⬅️ NOVO
  },
  toolbar: {
    realtime: "Tempo real",
    offline: "Offline",
    toggleSidebar: "Alternar painel",
    refresh: "Actualizar",
    closeSidebar: "Fechar painel",    // ⬅️ NOVO
    openSidebar: "Abrir painel",      // ⬅️ NOVO
    exitHistory: "Sair do histórico", // ⬅️ NOVO
    layers: "Camadas",                // ⬅️ NOVO
  },
  device: {
    speed: "Velocidade",
    course: "Rumo",
    lastUpdate: "Última actualização",
    noPosition: "Sem posição disponível",
    history24h: "Ver historial das últimas 24h",
  },
  map: {
    noDevices: "Nenhum dispositivo encontrado",
  },
  errors: {
    noToken: "Sem autenticação — activa a licença primeiro",
    loadFailed: "Erro ao carregar dados de rastreamento",
  },
} as const;

export type PtTracking = typeof ptTracking;