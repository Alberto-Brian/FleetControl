// ========================================
// FILE: src/locales/en/reports.ts
// ========================================

export const enReport = {
  title: 'Reports',
  description: 'Generate detailed fleet reports in PDF',
  
  types: {
    vehicles: {
      title: 'Vehicles Report',
      description: 'Complete list of vehicles with status and categories',
    },
    trips: {
      title: 'Trips Report',
      description: 'Trip history with routes, drivers and distances',
    },
    fuel: {
      title: 'Fuel Report',
      description: 'Fuel consumption and costs per vehicle',
    },
    maintenance: {
      title: 'Maintenance Report',
      description: 'Performed and scheduled maintenances',
    },
    financial: {
      title: 'Financial Report',
      description: 'Consolidated expenses and costs summary',
    },
    general: {
      title: 'General Report',
      description: 'Executive summary of all operations',
    },
  },
  
  actions: {
    generate: 'Generate PDF',
    preview: 'Preview',
    print: 'Print',
    download: 'Download',
    selectPeriod: 'Select Period',
    close: 'Close',
    cancel: 'Cancel',
  },
  
  dateRange: {
    title: 'Report Period',
    from: 'From',
    to: 'To',
    period: 'Period',
    presets: {
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      thisYear: 'This Year',
      last30Days: 'Last 30 Days',
      last90Days: 'Last 90 Days',
      custom: 'Custom',
    },
  },
  
  dialog: {
    title: 'Generate Report',
    selectReport: 'Select report type',
    selectDateRange: 'Select period',
    generating: 'Generating report...',
    success: 'Report generated successfully!',
    error: 'Error generating report',
  },
  
  messages: {
    noReports: 'No reports available',
    selectDateRange: 'Please select a period',
    invalidDateRange: 'Invalid period',
    maxRangeExceeded: 'Maximum period of 365 days',
    generating: 'Generating report, please wait...',
    generatedSuccess: 'Report generated successfully',
    generatedError: 'Error generating report',
  },
  
  stats: {
    total: 'Total',
    available: 'Available',
    inUse: 'In Use',
    maintenance: 'In Maintenance',
    inactive: 'Inactive',
    completed: 'Completed',
    inProgress: 'In Progress',
    cancelled: 'Cancelled',
    pending: 'Pending',
    totalDistance: 'Total Distance',
    totalCost: 'Total Cost',
    avgDistance: 'Average Distance',
    preventive: 'Preventive',
    corrective: 'Corrective',
    totalVehicles: 'Total Vehicles',
    totalMileage: 'Total Mileage',
  },
  
  empty: {
    noData: 'No data found for selected period',
    adjustFilters: 'Try adjusting the period or selecting another report',
    noVehicles: 'No vehicles found for the selected period',
  },
  
  errors: {
    loading: 'Error loading report data',
    generating: 'Error generating PDF',
    invalidDate: 'Invalid date',
    startAfterEnd: 'Start date must be before end date',
    maxRange: 'Maximum period of 365 days exceeded',
  },
  
  toast: {
    generating: 'Generating report...',
    success: 'Report generated successfully',
    error: 'Error generating report',
    downloading: 'Downloading report...',
    printing: 'Preparing to print...',
  },

  table: {
    licensePlate: 'License Plate',
    vehicle: 'Vehicle',
    category: 'Category',
    year: 'Year',
    mileage: 'Mileage',
    status: 'Status',
  },
  
  generatedAt: 'Generated at',
  summary: 'Summary',
  vehicleList: 'Vehicle List',

  pagination: {
    page: 'Page',
    of: 'of',
  },
  
  status: {
    available: 'Available',
    inUse: 'In Use',
    maintenance: 'Maintenance',
    inactive: 'Inactive',
  },
};