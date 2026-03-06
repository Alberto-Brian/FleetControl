// ========================================
// FILE: src/locales/en/scheduled-trips.ts
// ========================================
export const enScheduledTrips = {
  tabs: {
    scheduledTrips: "Trips"
  },
  
  status: {
    scheduled: "Scheduled",
    pending_leave: "Awaiting Return",
    launched: "In Progress",
    cancelled: "Cancelled"
  },

  filters: {
    all: 'All trips',
    scheduled: "Scheduled",
    pending_leave: "Awaiting Return",
    launched: "In Progress",
    cancelled: "Cancelled"
  },

  fields: {
    driver: "Driver",
    vehicle: "Vehicle",
    scheduledDate: "Start Date",
    route: "Route",
    origin: "Origin",
    destination: "Destination",
    purpose: "Purpose",
    notes: "Notes"
  },

  purposes: {
    none: "Not specified",
    business: "Business",
    maintenance_transport: "Maintenance transport",
    airport_transfer: "Airport transfer",
    client_visit: "Client visit",
    delivery: "Delivery",
    other: "Other"
  },

  placeholders: {
    selectDriver: "Select driver...",
    searchDriver: "Search driver...",
    selectVehicle: "Select vehicle...",
    searchVehicle: "Search license plate...",
    selectRoute: "Select route...",
    noRoute: "No predefined route",
    origin: "Ex: New York",
    destination: "Ex: Boston",
    purpose: "Select purpose...",
    notes: "Additional notes..."
  },

  info: {
    launchesToday: "The trip will start automatically today.",
    daysUntil: "The trip starts in {{days}} day(s).",
    schedulingNote: "Scheduling note",
    schedulingNoteDetail: "The trip will start automatically on the indicated date. If the driver is on leave, it will wait for their return. If the vehicle is unavailable, the trip will be automatically cancelled.",
    launchedAt: "Launched at",
    days: "days"
  },

  badges: {
    today: "Today",
    tomorrow: "Tomorrow",
    awaitingReturn: "Awaiting leave return"
  },

  actions: {
    new: "Schedule Trip",
    schedule: "Schedule Trip",
    scheduling: "Scheduling...",
    confirmCancel: "Confirm cancellation"
  },

  toast: {
    createSuccess: "Trip scheduled successfully.",
    createError: "Error scheduling trip.",
    cancelSuccess: "Trip cancelled.",
    cancelError: "Error cancelling trip."
  },

  errors: {
    loadError: "Error loading scheduled trips.",
    dateInPast: "Date cannot be in the past.",
    driverConflict: "This driver already has a trip scheduled for this date.",
    vehicleConflict: "This vehicle already has a trip scheduled for this date.",
    notFound: "Trip not found.",
    cannotEditNonScheduled: "Only trips with 'Scheduled' status can be edited."
  },

  warnings: {
    noVehiclesAvailable: "All vehicles are in use or under maintenance."
  },

  dialogs: {
    new: {
      title: "Schedule Trip",
      description: "Fill in the data to schedule the trip. It will start automatically on the indicated date.",
      descriptionFor: "Schedule trip for {{name}}."
    },
    cancel: {
      title: "Cancel scheduled trip?",
      description: "The trip will not be started. This action cannot be undone.",
      reasonPlaceholder: "Cancellation reason (optional)"
    }
  },

  searchPlaceholder: "Search trips...",
  description: "Scheduled trip management",
  
  empty: {
    title: "No scheduled trips",
    description: 'Click "Schedule Trip" to create the first one.'
  }
} as const;

export default enScheduledTrips;