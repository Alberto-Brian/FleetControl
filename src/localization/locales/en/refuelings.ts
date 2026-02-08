// ========================================
// FILE: src/locales/en/refuelings.ts
// ========================================
export const enRefuelings = {
  title: 'Refueling Management',
  description: 'Manage fleet refuelings',
  newRefueling: 'New Refueling',
  noRefuelings: 'No refueling records found',
  searchPlaceholder: 'Search by vehicle...',

  table: {
  date: 'Date',
  vehicle: 'Vehicle',
  station: 'Station',
  liters: 'Liters',
  price: 'Price/L',
  total: 'Total',
  actions: 'Actions'
  },

  tabs: {
    refuelings: 'Refuelings',
    stations: 'Fuel Stations',
  },

  stats: {
    total: 'Total',
    totalSpent: 'Total Spent',
    totalLiters: 'Total Liters',
    averagePrice: 'Average Price/L',
    refuelings: 'Refuelings',
    activeStations: 'Active Stations',
  },

  fuelTypes: {
    gasoline: 'Gasoline',
    diesel: 'Diesel',
    ethanol: 'Ethanol',
    cng: 'CNG',
    electric: 'Electric',
    hybrid: 'Hybrid',
  },

  fields: {
    vehicle: 'Vehicle',
    driver: 'Driver',
    station: 'Fuel Station',
    fuelType: 'Fuel Type',
    refuelingDate: 'Refueling Date',
    liters: 'Liters',
    pricePerLiter: 'Price per Liter',
    totalCost: 'Total Cost',
    mileage: 'Mileage',
    fullTank: 'Full Tank',
    invoiceNumber: 'Invoice Number',
    notes: 'Notes',
    stationName: 'Station Name',
    brand: 'Brand',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    fuelTypesAvailable: 'Fuel Types Available',
    convenienceStore: 'Convenience Store',
    carWash: 'Car Wash',
    trip: "Trip",
    currentMileage: "Current Mileage"
  },

  placeholders: {
    vehicle: 'Select vehicle',
    driver: 'Select driver (optional)',
    station: 'Select station (optional)',
    fuelType: 'Select fuel type',
    liters: 'E.g.: 50.5',
    pricePerLiter: 'E.g.: 250.00',
    mileage: 'E.g.: 45000',
    invoiceNumber: 'E.g.: INV-2025-001',
    notes: 'Additional notes...',
    stationName: 'E.g.: Downtown Station',
    brand: 'E.g.: Shell, BP',
    phone: 'E.g.: 923 456 789',
    address: 'E.g.: Main Street, 100',
    city: 'E.g.: Luanda',
    fuelTypes: 'E.g.: Gasoline, Diesel, LPG',
    stationNotes: 'Additional information about the station...',
    trip: "Select a trip",
    selectVehicleFirst: "Select a vehicle first",
    selectTripFirst: "Select a trip first",
    selectVehicle: "Select a vehicle",
    selectTrip: "Select a trip",
    selectDriver: "Select a driver",
    selectStation: "Select a station",
    addNotes: "Add notes...",
    selectedTrip: "Selected trip"
  },

  actions: {
    view: 'View Details',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    create: 'Create',
    update: 'Update',
    creating: 'Creating...',
    updating: 'Updating...',
    deleting: 'Deleting...',
    register: 'Register Refueling',
    newStation: 'New Station',
    activate: 'Activate',
    activating: 'Activating...',
  },

  dialogs: {
    new: {
      title: 'Register Refueling',
      description: 'Fill in the refueling details',
    },
    edit: {
      title: 'Edit Refueling',
      description: 'Update the refueling details',
    },
    view: {
      title: 'Refueling Details',
      description: 'Complete information about the refueling',
      vehicleInfo: 'Vehicle Information',
      refuelingInfo: 'Refueling Information',
      costs: 'Costs',
      additionalInfo: 'Additional Information',
    },
    delete: {
      title: 'Delete Refueling',
      description: 'Are you sure you want to delete the refueling',
      warning: 'This action cannot be undone.',
    },
    newStation: {
      title: 'Register Fuel Station',
      description: 'Fill in the fuel station details',
    },
    editStation: {
      title: 'Edit Station',
      description: 'Update the station details',
    },
    deleteStation: {
      title: 'Delete Station',
      description: 'Are you sure you want to delete the station',
      warning: 'This action cannot be undone.',
    },
  },

  alerts: {
    noVehicles: 'No vehicles available',
    noDrivers: 'No drivers available',
    noStations: 'No stations available',
    noTripsForVehicle: "No active trips for this vehicle",
  },

  toast: {
    createSuccess: 'Refueling registered successfully',
    createError: 'Error registering refueling',
    updateSuccess: 'Refueling updated successfully',
    updateError: 'Error updating refueling',
    deleteSuccess: 'Refueling deleted successfully',
    deleteError: 'Error deleting refueling',
    stationCreateSuccess: 'Station registered successfully',
    stationCreateError: 'Error registering station',
    stationUpdateSuccess: 'Station updated successfully',
    stationUpdateError: 'Error updating station',
    stationDeleteSuccess: 'Station deleted successfully',
    stationDeleteError: 'Error deleting station',
    stationRestored: 'Station activated successfully',
  },

  errors: {
    errorLoading: 'Error loading refuelings',
    errorLoadingStations: 'Error loading stations',
    refuelingNotFound: 'Refueling not found',
    stationNotFound: 'Station not found',
    stationAlreadyExists: "Station with name '{{name}}' already exists",
    stationHasRefuelings: 'This station has {{count}} linked refueling{{plural}}',
    restoreFailed: 'Error activating station',
  },

  warnings: {
    stationExistsInactive: "Station '{{name}}' exists but is inactive.",
  },

  validation: {
    vehicleRequired: 'Vehicle is required',
    fuelTypeRequired: 'Fuel type is required',
    litersRequired: 'Liters quantity is required',
    litersPositive: 'Liters must be greater than zero',
    priceRequired: 'Price per liter is required',
    pricePositive: 'Price must be greater than zero',
    mileageRequired: 'Mileage is required',
    mileagePositive: 'Mileage must be greater than zero',
    stationNameRequired: 'Station name is required',
  },

  info: {
    refueledOn: 'Refueled on',
    noStation: 'No station',
    noDriver: 'No driver',
    noNotes: 'No notes',
    fullTank: 'Full Tank',
    partialRefueling: 'Partial Refueling',
    summary: 'Refueling Summary',
    calculation: '{{liters}}L × {{price}}',
    activeCount: '{{count}} active station{{plural}}',
    totalRefuelings: '{{count}} refueling{{plural}}',
    noDescription: 'No description',
    services: 'Additional Services',
    autoFilled: "Auto",
    fromTrip: "From Trip",
    auto: "Auto",
    driverLinkedToTrip: "Driver linked to trip: {{driver}}"
  },

  filters: {
    all: 'All',
    fullTank: 'Full Tank',
    partial: 'Partial',
  },

  viewModes: {
    compact: 'Compact',
    normal: 'Normal',
    cards: 'Cards',
  },

  stations: {
    title: 'Fuel Stations',
    newStation: 'New Station',
    noStations: 'No stations registered',
    active: 'Active',
    inactive: 'Inactive',
    stats: {
      total: 'Total',
      active: 'Active',
      inactive: 'Inactive',
    },
  },

  sections: {
    identification: "Identification",
    location: "Location",
    quantities: "Quantities",
    details: "Details",
    basicInfo: "Basic Information",
  }
} as const;

export default enRefuelings;