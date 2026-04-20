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
    realtime: "Real-time",
    offline: "Offline",
    toggleSidebar: "Toggle panel",
    refresh: "Refresh",
    closeSidebar: "Close panel",
    openSidebar: "Open panel",
    exitHistory: "Exit history",
    layers: "Layers",
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
} as const;

export type EnTracking = typeof enTracking;