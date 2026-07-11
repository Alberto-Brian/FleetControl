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
    realtime:       "Tempo real",
    offline:        "Offline",
    toggleSidebar:  "Alternar painel",
    refresh:        "Actualizar",
    closeSidebar:   "Fechar painel",
    openSidebar:    "Abrir painel",
    exitHistory:    "Sair do histórico",
    settings:       "Definições",
    totalSuffix:    "disp.",
    zoomIn:         "Ampliar",
    zoomOut:        "Reduzir",
    layers:         "Camadas",
    layersTitle:    "Camada do mapa",
    layerOSM:        "Mapa de ruas",
    layerSatellite:  "Satélite",
    layerHybrid:     "Híbrido",
    layerTerrain:    "Terreno",
    layerCarto:      "Carto (limpo)",
    fitAll:          "Ver todos os dispositivos",
    followActive:    "A seguir...",
    stopFollow:      "Parar seguimento",
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
  geofences: {
    panelTitle:            'Zonas de Geofencing',
    drawCircle:            'Círculo',
    drawPolygon:           'Polígono',
    empty:                 'Nenhuma zona definida. Desenha uma zona no mapa.',
    createTitle:           'Nova Zona',
    editTitle:             'Editar Zona',
    nameLabel:             'Nome da zona',
    namePlaceholder:       'ex: Armazém Central',
    nameRequired:          'O nome é obrigatório.',
    speedLimitLabel:       'Limite de velocidade (opcional)',
    speedLimitPlaceholder: 'ex: 80',
    speedLimitBadge:       'Limite: {{speed}}',
    save:                  'Guardar',
    create:                'Criar',
    cancel:                'Cancelar',
    deleteConfirm:         'Apagar a zona "{{name}}"?',
    saveError:             'Erro ao guardar a zona.',
  },
  alerts: {
    panelTitle: 'Alertas',
    readAll:    'Marcar todos',
    empty:      'Sem alertas recentes.',
    enter:      'Entrou',
    exit:       'Saiu',
    speed:      'Velocidade',
  },
} as const;

export type PtTracking = typeof ptTracking;