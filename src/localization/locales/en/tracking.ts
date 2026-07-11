// ========================================
// FILE: src/locales/en/tracking.ts
// ========================================

export const enTracking = {
  title: "Real-Time Tracking",
  sidebar: {
    search: "Search device...",
    devices: "devices",
    device: "device",
    online: "online",
    offline: "offline",
    allDevices: "All",
  },
  toolbar: {
    realtime:       "Real-time",
    offline:        "Offline",
    toggleSidebar:  "Toggle panel",
    refresh:        "Refresh",
    closeSidebar:   "Close panel",
    openSidebar:    "Open panel",
    exitHistory:    "Exit history",
    settings:       "Settings",
    totalSuffix:    "dev.",
    zoomIn:         "Zoom in",
    zoomOut:        "Zoom out",
    layers:         "Layers",
    layersTitle:    "Map layer",
    layerOSM:        "Street map",
    layerSatellite:  "Satellite",
    layerHybrid:     "Hybrid",
    layerTerrain:    "Terrain",
    layerCarto:      "Carto (clean)",
    fitAll:          "Fit all devices",
    followActive:    "Following...",
    stopFollow:      "Stop following",
  },
  device: {
    speed: "Speed",
    course: "Course",
    lastUpdate: "Last update",
    noPosition: "No position available",
    history24h: "View last 24h history",
  },
  map: {
    noDevices: "No devices found",
  },
  errors: {
    noToken: "Not authenticated — activate license first",
    loadFailed: "Failed to load tracking data",
  },
  geofences: {
    panelTitle:            'Geofencing Zones',
    drawCircle:            'Circle',
    drawPolygon:           'Polygon',
    empty:                 'No zones defined. Draw a zone on the map.',
    createTitle:           'New Zone',
    editTitle:             'Edit Zone',
    nameLabel:             'Zone name',
    namePlaceholder:       'e.g. Main Warehouse',
    nameRequired:          'Name is required.',
    speedLimitLabel:       'Speed limit (optional)',
    speedLimitPlaceholder: 'e.g. 80',
    speedLimitBadge:       'Limit: {{speed}}',
    save:                  'Save',
    create:                'Create',
    cancel:                'Cancel',
    deleteConfirm:         'Delete zone "{{name}}"?',
    saveError:             'Error saving the zone.',
  },
} as const;

export type EnTracking = typeof enTracking;