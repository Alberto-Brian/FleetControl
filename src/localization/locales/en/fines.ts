
// ========================================
// FILE: src/i18n/locales/en/fines.ts
// ========================================

export const enFines = {
  title: "Traffic Fines",
  description: "Fines and violations management",
  newFine: "New Fine",
  noFines: "No fines registered",
  searchPlaceholder: "Search by ticket #, vehicle or violation...",
  
  fields: {
    fineNumber: "Ticket Number",
    fineDate: "Violation Date",
    infractionType: "Violation Type",
    description: "Description",
    location: "Location",
    fineAmount: "Fine Amount",
    dueDate: "Due Date",
    paymentDate: "Payment Date",
    status: "Status",
    points: "Points",
    authority: "Authority",
    notes: "Notes",
    vehicle: "Vehicle",
    driver: "Driver"
  },
  
  status: {
    pending: { label: "Pending", description: "Unpaid fine" },
    paid: { label: "Paid", description: "Fine paid" },
    contested: { label: "Contested", description: "Under appeal" },
    cancelled: { label: "Cancelled", description: "Fine cancelled" }
  },
  
  infractionTypes: {
    speeding: "Speeding",
    parking: "Illegal Parking",
    phone: "Mobile Phone Use",
    overtaking: "Illegal Overtaking",
    redLight: "Red Light",
    documents: "Missing Documents",
    other: "Other"
  },
  
  stats: {
    total: "Total Fines",
    pending: "Pending",
    paid: "Total Paid",
    overdue: "Overdue"
  },
  
  filters: {
    all: "All",
    pending: "Pending",
    paid: "Paid",
    contested: "Contested",
    overdue: "Overdue"
  },
  
  actions: {
    actions: "Actions",
    close: "Close",
    view: "View Details",
    edit: "Edit",
    delete: "Delete",
    markAsPaid: "Mark as Paid",
    contest: "Contest",
    cancel: "Cancel",
    pay: "Pay",
    register: "Register"
  },
  
  dialogs: {
    new: {
      title: "Register New Fine",
      description: "Fill in the traffic fine details"
    },
    view: {
      title: "Fine Details",
      description: "Complete fine information"
    },
    edit: {
      title: "Edit Fine",
      description: "Update fine details"
    },
    markAsPaid: {
      title: "Mark as Paid",
      description: "Confirm fine payment"
    },
    contest: {
      title: "Contest Fine",
      description: "Register fine appeal"
    },
    delete: {
      title: "Delete Fine",
      warning: "Are you sure you want to delete this fine?"
    }
  },
  
  placeholders: {
    fineNumber: "Ex: TICKET-2024-001",
    infractionType: "Select violation type",
    description: "Describe the violation in detail...",
    location: "Ex: Main Street",
    fineAmount: "Ex: 150",
    points: "Ex: 2",
    authority: "Ex: Traffic Police",
    notes: "Additional information...",
    selectVehicle: "Select vehicle",
    selectDriver: "Select driver"
  },
  
  alerts: {
    overdue: "Fine overdue by {{days}} day(s)",
    dueSoon: "Due in {{days}} day(s)",
    noVehicleSelected: "Select a vehicle",
    noPaymentDate: "Enter payment date"
  },
  
  toast: {
    createSuccess: "Fine registered successfully",
    createError: "Error registering fine",
    updateSuccess: "Fine updated successfully",
    updateError: "Error updating fine",
    deleteSuccess: "Fine deleted successfully",
    deleteError: "Error deleting fine",
    markAsPaidSuccess: "Fine marked as paid",
    markAsPaidError: "Error marking fine as paid",
    contestSuccess: "Fine contested successfully",
    contestError: "Error contesting fine"
  },
  
  info: {
    totalPoints: "Total of {{points}} points",
    dueIn: "Due in {{days}} days",
    overdueBy: "Overdue by {{days}} days",
    paidOn: "Paid on {{date}}",
    unknownDriver: "Unknown driver"
  }
} as const;

export default enFines;