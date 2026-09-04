// ========================================
// FILE: src/localization/locales/en/powersync-status.ts
// ========================================

export const enPowersyncStatus = {
  title: 'PowerSync Status',
  subtitle: 'Diagnostics for the background sync with the server',

  status: {
    title: 'Connection',
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting…',
    hasSynced: 'First sync',
    hasSyncedYes: 'Done',
    hasSyncedNo: 'Not yet',
    lastSyncedAt: 'Last synced at',
    never: 'Never',
    uploading: 'Uploading changes…',
    downloading: 'Downloading data…',
    idle: 'Idle',
    uploadError: 'Upload error',
    downloadError: 'Download error',
  },

  counts: {
    title: 'Locally synced data',
    table: 'Table',
    rows: 'Rows',
    tables: {
      vehicles: 'Vehicles',
      drivers: 'Drivers',
      trips: 'Trips',
      fuel: 'Fuel',
      maintenance: 'Maintenance',
      expenses: 'Expenses',
      categories: 'Categories',
    },
  },

  preview: {
    title: 'Vehicles (sample)',
    empty: 'No vehicles synced yet.',
    licensePlate: 'Plate',
    brandModel: 'Brand / Model',
    vehicleStatus: 'Status',
    tracking: 'Tracking',
    trackingOn: 'On',
    trackingOff: 'Off',
  },

  refresh: 'Refresh now',
  autoRefreshNote: 'Refreshes automatically every 5 seconds.',
  noSessionNote: 'No active PowerSync session — log in to the app to start syncing.',
};
