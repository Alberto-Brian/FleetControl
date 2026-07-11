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
    confirm: "Confirm Change",
    assignTrip: "Assign Trip"
  },

  dialogs: {
     status: {
    title: "Change Driver Status",
    description: "Set contractual status for {{name}}",
    onTripDescription: "{{name}} is on a trip. Cannot change status.",
    onTripAlertTitle: "Driver in service",
    onTripAlertDescription: "Cannot change contractual status while driver is on a trip.",
    willSetOffline: "Setting this status will automatically change availability to 'Offline'.",
    blockedDescription: "Status change blocked for {{name}}",
    onLeaveAlertTitle: "Driver on leave",
    onLeaveAlertDescription: "The 'On Leave' status is managed automatically by the leave system.",
    auto: "AUTO",
    viaLeaveSystem: "Via leave system"
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
      fullEditHint: "For full editing, use the \"Edit\" button in the main list",
      onLeaveLocked: "On Leave - Locked",
      onLeaveInfoTitle: "Driver on leave.",
      onLeaveInfoDescription: "The contractual status is managed automatically by the leave system."
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
    required: "This field is required",
    driverHasActiveTrip: "Driver is on a trip. Cannot delete or update status."
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
    expiringLicenses: "Expiring Licenses",
    drivers: 'Drivers',
    leaves:  'Leaves',
    shifts:  'Shifts',
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
  },
  leaves: {
    title: 'Leaves',
    description: 'Management and scheduling of driver leaves',

    status: {
      scheduled: 'Scheduled',
      pending_trip: 'Pending trip',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },

    reasons: {
      annual_leave: 'Annual leave',
      medical_leave: 'Medical leave',
      personal_leave: 'Personal leave',
      other: 'Other reason',
    },

    fields: {
      driver: 'Driver',
      startDate: 'Start date',
      endDate: 'End date',
      reason: 'Reason',
      notes: 'Notes',
      cancelledReason: 'Cancellation reason',
    },

    placeholders: {
      selectDriver: 'Select driver',
      reason: 'Select reason',
      notes: 'Optional notes...',
      search: 'Search by driver...',
    },

    actions: {
      schedule: 'Schedule leave',
      scheduling: 'Scheduling...',
      cancel: 'Cancel leave',
      confirmCancel: 'Yes, cancel',
    },

    info: {
      duration: 'Duration: {{days}} day(s)',
      days: 'days',
      schedulingNote: 'Scheduling note',
      schedulingNoteDetail: 'The driver status will be updated automatically on the start date. If on a trip, the leave will wait for the trip to end.',
      pendingTripNote: 'Waiting for trip to end to activate',
    },

    sections: {
      upcoming: 'Upcoming / Active',
      history: 'History',
    },

    filters: {
      all: 'All statuses',
    },

    dialogs: {
      new: {
        title: 'Schedule leave',
        description: 'Schedule a leave period for a driver',
        descriptionFor: 'Schedule leave for {{name}}',
      },
      list: {
        title: '{{name}}\'s Leaves',
      },
      cancel: {
        title: 'Cancel leave',
        description: 'This action will cancel the selected leave period.',
        warning: 'If the leave is active, the driver will return to Available status.',
      },
    },

    toast: {
      createSuccess: 'Leave scheduled successfully',
      createError: 'Error scheduling leave',
      cancelSuccess: 'Leave cancelled successfully',
      cancelError: 'Error cancelling leave',
    },

    empty: {
      noLeaves: 'No leaves registered',
      noLeavesHint: 'Click \'Schedule leave\' to create a leave period',
      adjustFilters: 'Try adjusting the search filters',
    },

    errors: {
      loadError: 'Error loading leaves',
      startDateInPast: 'Start date cannot be in the past',
      endBeforeStart: 'End date must be after start date',
      overlapping: 'This driver already has leave scheduled for this period',
      cannotEditNonScheduled: 'Only scheduled leaves can be edited',
      notFound: 'Leave record not found',
    },
  },

  tooltips: {
    statusBlockedOnLeave: "Cannot change contractual status while driver is on leave",
    statusBlockedOnTrip: "Cannot change contractual status while driver is on trip",
    availabilityBlockedOnTrip: "Availability is managed automatically during trips",
    availabilityBlockedOnLeave: "Availability is set automatically during leaves"
  },

   shifts: {
    title:           'Shift Management',
    newShift:        'New Shift',
    noShifts:        'No shifts created',
    searchPlaceholder: 'Search shifts...',
 
    status: {
      draft:    'Draft',
      active:   'Active',
      archived: 'Archived',
    },
 
    filters: {
      all:      'All statuses',
      draft:    'Draft',
      active:   'Active',
      archived: 'Archived',
    },
 
    stats: {
      total: 'Total',
    },
 
    fields: {
      name:        'Shift Name',
      description: 'Description',
      startDate:   'Start Date',
      endDate:     'End Date',
      startTime:   'Start Time',
      endTime:     'End Time',
      status:      'Status',
      notes:       'Notes',
      schedule:    'Schedule',
      period:      'Period',
    },
 
    placeholders: {
      name:         'E.g.: Shift A — January 2025',
      description:  'Optional shift description...',
      notes:        'Additional notes...',
      searchDriver: 'Search driver to add...',
    },
 
    sections: {
      schedule: 'Period & Schedule',
      members:  'Drivers',
    },
 
    info: {
      member:       'driver',
      members:      'drivers',
      leader:       'Leader',
      noMembersYet: 'No drivers added yet',
      noLeaderYet:  'Click the crown to set the shift leader',
    },
 
    actions: {
      create:        'Create Shift',
      creating:      'Creating...',
      activate:      'Activate',
      archive:       'Archive',
      reactivate:    'Reactivate',
      setLeader:     'Set as leader',
      removeLeader:  'Remove leadership',
    },
 
    dialogs: {
      new: {
        title:       'New Shift',
        description: 'Create a work schedule for drivers',
      },
      delete: {
        title:       'Delete Shift',
        description: 'Are you sure you want to delete the shift "{{name}}"? This action cannot be undone.',
      },
    },
 
    toast: {
      createSuccess: 'Shift created successfully',
      createError:   'Error creating shift',
      updateError:   'Error updating shift',
      statusUpdated: 'Shift status updated',
      deleteSuccess: 'Shift deleted successfully',
      deleteError:   'Error deleting shift',
    },
 
    errors: {
      loadError:           'Error loading shifts',
      notFound:            'Shift not found',
      nameRequired:        'Shift name is required',
      datesRequired:       'Start and end dates are required',
      timesRequired:       'Start and end times are required',
      endBeforeStart:      'End date cannot be before start date',
      onlyOneLeader:       'A shift can only have one leader',
      driverAlreadyInShift: 'This driver is already in this shift',
    },
  },

  connectedHint: {
    driverLocation: 'In connected mode, you can view the driver\'s real-time location on the live map and consult their full route history.',
    driverActivity: 'In connected mode, driver availability syncs automatically with the central platform and is visible across all devices.',
  },
} as const;

export default enDrivers;