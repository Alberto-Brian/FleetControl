// ========================================
// FILE: src/locales/en/vehicles.ts (COMPLETO ATUALIZADO)
// ========================================
export const enVehicles = {
  title: "Vehicle Fleet",
  description: "Manage and monitor the status of all organization vehicles.",
  
  stats: {
    total: "Total",
    available: "Available",
    inUse: "In Use",
    maintenance: "Maintenance",
    inactive: "Inactive"
  },

  status: {
    available: {
      label: "Available",
      description: "Vehicle ready for use"
    },
    in_use: {
      label: "In use",
      description: "Vehicle assigned to an activity"
    },
    maintenance: {
      label: "Maintenance",
      description: "Vehicle under repair or maintenance"
    },
    inactive: {
      label: "Inactive",
      description: "Vehicle temporarily out of operation"
    }
  },

  fields: {
    licensePlate: "License Plate",
    brand: "Brand",
    model: "Model",
    year: "Year",
    color: "Color",
    category: "Category",
    mileage: "Mileage",
    chassisNumber: "Chassis Number",
    engineNumber: "Engine Number",
    fuelTankCapacity: "Fuel Tank Capacity",
    acquisitionDate: "Acquisition Date",
    acquisitionValue: "Acquisition Value",
    notes: "Notes",
    status: "Status",
    createdAt: "Registration Date",
    updatedAt: "Last Update"
  },

  placeholders: {
    search: "Search by license plate, brand or model...",
    licensePlate: "LD-00-00-AA",
    brand: "Toyota",
    model: "Hilux",
    color: "White",
    chassisNumber: "00000000000000000",
    engineNumber: "0000000000",
    notes: "Additional information about the vehicle..."
  },

  actions: {
    view: "View Details",
    activate: "Activate",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    create: "Create Vehicle",
    update: "Update",
    activating: "Activating...",
    creating: "Creating...",
    updating: "Updating...",
    deleting: "Deleting...",
    updateMileage: "Update Mileage",
    changeStatus: "Change Status",
    editData: "Edit Data"
  },

  dialogs: {
    new: {
      title: "New Vehicle",
      description: "Register a new vehicle in the fleet"
    },
    edit: {
      title: "Edit Vehicle",
      description: "Complete editing of all vehicle information"
    },
    view: {
      title: "Vehicle Details",
      quickUpdates: "Quick Updates",
      vehicleData: "Vehicle Data",
      technicalData: "Technical Data",
      acquisition: "Acquisition",
      registrationInfo: "Records",
      noNotes: "No notes registered",
      fullEditHint: "For complete editing, use the 'Edit' button in the main list"
    },
    delete: {
      title: "Delete Vehicle",
      description: "Are you sure you want to delete the vehicle",
      warning: "This action cannot be undone."
    },
    mileage: {
      title: "Update Mileage",
      description: "Record new odometer reading",
      current: "Current Mileage",
      new: "New Mileage",
      confirm: "Confirm Update"
    },
    status: {
      title: "Change Vehicle Status",
      currentStatus: "Current Status",
      newStatus: "New Status",
      reason: "Reason / Notes",
      reasonPlaceholder: "E.g.: Vehicle sent for 50,000 km service. Expected return: 03/15/2024",
      reasonHelper: "This note will be automatically added to the vehicle history",
      infoTitle: "Status Change",
      infoDescription: "Complete change history will be recorded in the system for future audit.",
      auto: "Via trip system",
      inUseWarning: "Vehicle in use. Status will be updated automatically when the trip is completed.",
      inUseBlocked: "In use - Blocked"
    }
  },

  categories: {
    title: "Vehicle Categories",
    new: "New Category",
    edit: "Edit Category",
    delete: "Delete Category",
    name: "Category Name",
    description: "Description",
    color: "Color",
    active: "Active",
    inactive: "Inactive",
    noDescription: "No description defined",
    created: "Category created successfully",
    updated: "Category updated successfully",
    deleted: "Category deleted successfully"
  },

  tabs: {
    vehicles: "Vehicles",
    categories: "Categories"
  },

  filters: {
    all: "All statuses",
    allCategories: "All categories",
    status: "Filter by status",
    category: "Filter by category"
  },

  viewModes: {
    compact: "Compact",
    normal: "Normal",
    cards: "Cards"
  },

  table: {
    plate: "License Plate",
    vehicle: "Vehicle",
    category: "Category",
    status: "Status",
    actions: "Actions"
  },

  empty: {
    noVehicles: "No vehicles found",
    noCategories: "No categories found",
    adjustFilters: "Try adjusting your search filters.",
    noData: "No data to display"
  },

  loading: {
    vehicles: "Loading vehicles...",
    categories: "Loading categories...",
    syncing: "Syncing fleet..."
  },

  toast: {
    createSuccess: "Vehicle created successfully",
    createError: "Error creating vehicle",
    updateSuccess: "Vehicle updated successfully",
    categoryRestored: "Category activated successfully!",
    updateError: "Error updating vehicle",
    deleteSuccess: "Vehicle deleted successfully",
    deleteError: "Error deleting vehicle",
    mileageUpdateSuccess: "Mileage updated successfully",
    mileageUpdateError: "Error updating mileage",
    statusUpdateSuccess: "Status updated successfully",
    statusUpdateError: "Error updating status",
    categoryCreateSuccess: "Category created successfully",
    categoryCreateError: "Error creating category",
    categoryUpdateSuccess: "Category updated successfully",
    categoryUpdateError: "Error updating category",
    categoryDeleteSuccess: "Category deleted successfully",
    categoryDeleteError: "Error deleting category"
  },

  errors: {
    errorLoading: "Error loading vehicles",
    errorLoadingCategories: "Error loading categories",
    vehicleNotFound: "Vehicle not found",
    vehicleAlreadyExists: "This vehicle already exists",
    vehicleWithSamePlate: "A vehicle with license plate {{plate}} already exists",
    categoryNotFound: "Category not found",
    categoryHasVehicles: "Cannot delete: category linked to {{count}} vehicle(s)",
    categoryAlreadyExists: "A category with the name {{name}} already exists",
    mileageLessThanCurrent: "New mileage cannot be less than current",
    mileageDifferenceTooBig: "Mileage difference too large. Please verify the value",
    restoreFailed: "Error activating category"
  },

  warnings: {
    noAvailableVehicles: "No available vehicles",
    categoryExistsInactive: "Category '{{name}}' exists but is inactive. Do you want to activate it?"
  }
} as const;