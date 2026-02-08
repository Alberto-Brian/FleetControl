// ========================================
// FILE: src/locales/en/drivers.ts (COMPLETO)
// ========================================
export const enDrivers = {
  title: "Driver Management",
  description: "Manage drivers and license information",
  newDriver: "New Driver",
  noDrivers: "No drivers registered",
  searchPlaceholder: "Search by name or license number...",
  
  stats: {
    total: "Total",
    active: "Active",
    onTrip: "On Trip",
    available: "Available"
  },

  status: {
    active: {
      label: "Active",
      description: "Active driver in the system"
    },
    on_leave: {
      label: "On Leave",
      description: "Driver on leave period"
    },
    terminated: {
      label: "Terminated",
      description: "Driver terminated from company"
    }
  },

  availability: {
    available: {
      label: "Available",
      description: "Ready for new trips"
    },
    on_trip: {
      label: "On Trip",
      description: "Currently in service"
    },
    offline: {
      label: "Offline",
      description: "Out of service"
    }
  },

  fields: {
    name: "Full Name",
    taxId: "Tax ID",
    idNumber: "ID/Passport Number",
    birthDate: "Birth Date",
    phone: "Phone",
    email: "Email",
    address: "Address",
    city: "City",
    state: "State/Province",
    postalCode: "Postal Code",
    licenseNumber: "License Number",
    licenseCategory: "License Category",
    licenseExpiryDate: "License Expiry Date",
    hireDate: "Hire Date",
    status: "Status",
    availability: "Availability",
    photo: "Photo",
    notes: "Notes"
  },

  placeholders: {
    name: "E.g.: John Smith",
    taxId: "000000000",
    idNumber: "000000000LA000",
    phone: "+244 900 000 000",
    email: "john.smith@example.com",
    address: "Street, Number, District",
    city: "Luanda",
    state: "Luanda",
    postalCode: "0000",
    licenseNumber: "00000000",
    licenseCategory: "B",
    notes: "Additional information about the driver..."
  },

  actions: {
    view: "View Details",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    create: "Create Driver",
    update: "Update",
    creating: "Creating...",
    updating: "Updating...",
    deleting: "Deleting...",
    confirm: "Confirm Change"
  },

  dialogs: {
     status: {
      title: "Change Driver Status",
      description: "Set contractual status for {{name}}",
      onTripDescription: "{{name}} is on a trip. Cannot change status.",
      onTripAlertTitle: "Driver in service",
      onTripAlertDescription: "Cannot change contractual status while driver is on a trip.",
      willSetOffline: "Setting this status will automatically change availability to 'Offline'."
    },
    new: {
      title: "New Driver",
      description: "Register a new driver in the system"
    },
    edit: {
      title: "Edit Driver",
      description: "Update driver information"
    },
    view: {
      title: "Driver Details",
      personalInfo: "Personal Information",
      contactInfo: "Contact Information",
      licenseInfo: "License Information",
      employmentInfo: "Employment Information",
      additionalInfo: "Additional Information",
      registrationInfo: "Registration Records",
      quickActions: "Quick Updates",
      onTripLocked: "On trip - Locked",
      changeAvailability: "Change operational status",
      changeStatus: "Change contractual status",
      updateLicense: "Update information",
      updateContact: "Update phone/email",
      onTripInfoTitle: "Driver in service.",
      onTripInfoDescription: "Availability will be updated automatically when the trip is completed.",
      fullEditHint: "For full editing, use the \"Edit\" button in the main list"
    },
    delete: {
      title: "Delete Driver",
      description: "Are you sure you want to delete the driver",
      warning: "This action cannot be undone."
    },
    availability: {
      title: "Change Availability",
      description: "Set operational availability for {{name}}",
      onTripDescription: "{{name}} is currently on a trip. Status will be updated automatically upon completion.",
      onTripAlertTitle: "Driver in service",
      onTripAlertDescription: "Cannot change availability manually while driver is on a trip.",
      auto: "Auto",
      viaTripSystem: "Via trip system",
      inactiveStatusTitle: "Inactive driver",
      inactiveStatusDescription: "Driver is {{status}}. Availability is automatically set to 'Offline'.",
      blockedDescription: "{{name}}'s availability cannot be changed at this time."
    },
    contact: {
      title: "Update Contacts",
      description: "Update contact information for {{name}}"
    },
    license: {
      title: "Update Driver's License",
      description: "Renew or correct license information for {{name}}"
    },
  },

  alerts: {
    licenseExpired: "Driver's license EXPIRED!",
    licenseExpiring: "License expiring soon",
    licenseExpiringSoon: "License expires in {{days}} days",
    updateLicense: "Renew driver's license"
  },

  toast: {
    createSuccess: "Driver created successfully",
    createError: "Error creating driver",
    updateSuccess: "Driver updated successfully",
    updateError: "Error updating driver",
    deleteSuccess: "Driver deleted successfully",
    deleteError: "Error deleting driver"
  },

  errors: {
    errorLoading: "Error loading drivers",
    driverWithSameLicenseAlreadyExists: "A driver with license {{license}} already exists",
    driverWithSameTaxIdAlreadyExists: "A driver with tax ID {{taxId}} already exists",
    licenseExpired: "Driver's license is expired",
    invalidEmail: "Invalid email address",
    invalidPhone: "Invalid phone number",
    required: "This field is required"
  },

  validation: {
    nameRequired: "Name is required",
    licenseNumberRequired: "License number is required",
    licenseCategoryRequired: "License category is required",
    licenseExpiryRequired: "License expiry date is required",
    emailInvalid: "Invalid email",
    phoneInvalid: "Invalid phone"
  },

  tabs: {
    all: "All",
    active: "Active",
    onLeave: "On Leave",
    expiringLicenses: "Expiring Licenses"
  },

  filters: {
    all: "All statuses",
    active: "Active",
    on_leave: "On Leave",
    terminated: "Terminated",
    available: "Available",
    on_trip: "On Trip",
    offline: "Offline"
  },

  categories: {
    A: "Motorcycles",
    B: "Light Vehicles",
    C: "Heavy Vehicles",
    D: "Passengers",
    E: "Trailer"
  },

  info: {
    admittedOn: "Hired on",
    validUntil: "Valid until",
    registeredOn: "Registered on",
    lastUpdate: "Last update",
    noNotes: "No notes registered"
  }
} as const;