// ========================================
// FILE: src/locales/en/reports.ts
// ========================================

export const enReport = {
  title: 'Reports',
  description: 'Generate detailed fleet reports in PDF',
  subtitle: '{{count}} types available · {{thisMonth}} generated this month',
  
  tabs: {
    reportTypes: 'Report Types',
    history: 'History',
  },

  types: {
    vehicles: {
      title: 'Vehicles Report',
      shortTitle: 'Vehicles',
      description: 'Complete list of vehicles with status and categories',
    },
    drivers: {
      title: 'Drivers Report',
      shortTitle: 'Drivers',
      description: 'List of drivers with trips and statistics',
    },
    trips: {
      title: 'Trips Report',
      shortTitle: 'Trips',
      description: 'Trip history with routes, drivers and distances',
    },
    fuel: {
      title: 'Fuel Report',
      shortTitle: 'Fuel',
      description: 'Fuel consumption and costs per vehicle',
    },
    maintenance: {
      title: 'Maintenance Report',
      shortTitle: 'Maintenances',
      description: 'Performed and scheduled maintenances',
    },
    financial: {
      title: 'Financial Report',
      shortTitle: 'Financial',
      description: 'Consolidated expenses and costs summary',
    },
    general: {
      title: 'General Report',
      shortTitle: 'General',
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
    newReport: 'New Report',
    generatePDF: 'Generate PDF',
    redownload: 'Download again',
    delete: 'Remove',
    generateFirst: 'Generate first report',
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
    delete: {
      title: 'Remove report?',
      description: 'This record will be removed from history. The downloaded PDF file will not be affected.',
      confirm: 'Remove',
    },
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
    totalGenerated: 'Generated Reports',
    thisMonth: 'This Month',
    typesUsed: 'Types Used',
  },
  
  empty: {
    noData: 'No data found for selected period',
    noVehicles: 'No vehicles found for the selected period',
    noReports: 'No reports found',
    adjustFilters: 'Try adjusting the filters',
    noHistory: 'No reports generated yet',
    historyDescription: 'Generated reports will appear here',
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
    deleteSuccess: 'Report removed',
  },

  table: {
    licensePlate: 'License Plate',
    vehicle: 'Vehicle',
    category: 'Category',
    year: 'Year',
    mileage: 'Mileage',
    status: 'Status',
    report: 'Report',
    frequency: 'Frequency',
    generated: 'Generated',
    actions: 'Actions',
    period: 'Period',
    language: 'Language',
    size: 'Size',
    generatedAt: 'Generated at',
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

  filters: {
    period: 'Period',
    categories: 'Categories',
    all: 'All',
  },
  
  categories: {
    all: 'All',
    fleet: 'Fleet',
    financial: 'Financial',
    operational: 'Operational',
  },
  
  datePresets: {
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    last90Days: 'Last 90 Days',
    thisYear: 'This Year',
  },
  
  frequencies: {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Biweekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
  },
  
  fields: {
    period: 'Period',
    category: 'Category',
  },
  
  timesGenerated: '{{count}}x generated',
  
  recentlyGenerated: 'Recently Generated',
  viewAllHistory: 'View all history',
  searchPlaceholder: 'Search reports...',
  
  history: {
    searchPlaceholder: 'Search history...',
  },
};