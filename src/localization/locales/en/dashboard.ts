// ========================================
// FILE: src/i18n/locales/en/dashboard.en.ts
// ========================================

export const enDashboard = {
  title: "Dashboard",
  welcome: "Welcome back",
  lastUpdated: "Last updated",
  refresh: "Refresh",
  
  stats: {
    vehicles: {
      total: "Total Vehicles",
      totalAvailable: "Available for trips",
      active: "Active",
      inactive: "Inactive",
      maintenance: "In Maintenance",
      totalSuffix: "total vehicles",
    },
    drivers: {
      total: "Total Drivers",
      totalAvailable: "Available for trips",
      available: "Available",
      onTrip: "On Trip",
      availableSuffix: "Available for trips",
    },
    trips: {
      total: "Total Trips",
      totalInProgrees: "In progress today",
      active: "In Progress",
      completed: "Completed",
      totalDistance: "Total Distance",
      activeSuffix: "In progress today",
    },
    fuel: {
      total: "Refuelings",
      cost: "Total Cost",
      liters: "Liters",
      avgPrice: "Average Price"
    },
    maintenance: {
      total: "Maintenances",
      pending: "Pending",
      inProgress: "In Progress",
      cost: "Total Cost",
      pendingSuffix: "maintenances",
    },
    expenses: {
      total: "Expenses",
      paid: "Paid",
      pending: "Pending",
      amount: "Total Amount"
    },
    fines: {
      total: "Fines",
      pending: "Pending",
      paid: "Paid",
      overdue: "Overdue",
      amount: "Total Amount"
    },
    alerts: {
      pending: "Pending Alerts",
    }
  },
  
  charts: {
    fuelByMonth: "Fuel by Month",
    expensesByCategory: "Expenses by Category",
    maintenancesByType: "Maintenances by Type",
    tripsByMonth: "Trips by Month",
    vehicleUtilization: "Top 5 Vehicles",
    preventive: "Preventive",
    corrective: "Corrective",
    fuelDescription: "Monthly fuel cost analysis",
    fleetStatus: "Fleet Status",
    fleetDescription: "Current vehicle distribution",
    week: "Week",
    weeklyExpenses: "Weekly Expenses Summary",
    weeklyExpensesDescription: "Comparison between fuel, maintenance and other costs",
    fuel: "Fuel",
    maintenance: "Maintenance",
    other: "Other"
  },
  
  recentActivities: {
    title: "Recent Activities",
    noActivities: "No recent activities",
    viewAll: "View All",
    trip: "Trip",
    newTripStarted: "New Trip Started",
    refueling: "Refueling",
    refuelingDone: "Refueling done",
    maintenance: "Maintenance",
    maintenanceScheduled: "Maintenance Scheduled",
    expense: "Expense",
    fine: "Fine",
    description: "Technical details and real-time status"
  },
  
  alerts: {
    title: "Alerts",
    overdueFines: "{{count}} overdue fine(s)",
    pendingMaintenances: "{{count}} pending maintenance(s)",
    lowFuelVehicles: "{{count}} vehicle(s) with low fuel",
    expiringSoon: "{{count}} document(s) expiring soon",
    actionRequired: "Action required for regularization",
    resolve: "Resolve",
    ignore: "Ignore",
    requiresAttention: "Requires immediate attention",
    viewDetails: "View Details",
    noAlerts: "No alerts at the moment",
    viewHistory: "View Alert History",
  },

  table: {
    type: "Type",
    description: "Description",
    vehicle: "Vehicle",
    date: "Date",
    value: "Value",
  },
  
  errors: {
    loading: "Error loading dashboard data",
  },
  
  quickActions: {
    title: "Quick Actions",
    newTrip: "New Trip",
    newRefueling: "Refueling",
    newMaintenance: "Maintenance",
    newExpense: "Expense"
  }
} as const;

export default enDashboard;