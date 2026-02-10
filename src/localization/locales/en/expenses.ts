// ========================================
// FILE: src/locales/en/expenses.ts
// ========================================
export const enExpenses = {
  title: 'Expense Management',
  description: 'Fleet financial control',
  newExpense: 'New Expense',
  noExpenses: 'No expense records found',
  searchPlaceholder: 'Search by description or supplier...',

  tabs: {
    expenses: 'Expenses',
    categories: 'Categories',
  },

  stats: {
    total: 'Monthly Total',
    paid: 'Paid Expenses',
    pending: 'Pending',
    overdue: 'Overdue',
    byCategory: 'By Category',
  },

  status: {
    pending: {
      label: 'Pending',
      description: 'Awaiting payment',
    },
    paid: {
      label: 'Paid',
      description: 'Payment completed',
    },
    overdue: {
      label: 'Overdue',
      description: 'Past due date',
    },
    cancelled: {
      label: 'Cancelled',
      description: 'Expense cancelled',
    },
  },

  paymentMethods: {
    cash: 'Cash',
    card: 'Card',
    transfer: 'Transfer',
    check: 'Check',
  },

  categoryTypes: {
    operational: 'Operational',
    administrative: 'Administrative',
    extraordinary: 'Extraordinary',
  },

  fields: {
    category: 'Category',
    vehicle: 'Vehicle',
    driver: 'Driver',
    description: 'Description',
    amount: 'Amount',
    expenseDate: 'Expense Date',
    dueDate: 'Due Date',
    paymentDate: 'Payment Date',
    paymentMethod: 'Payment Method',
    status: 'Status',
    supplier: 'Supplier',
    documentNumber: 'Document Number',
    notes: 'Notes',
    categoryName: 'Category Name',
    categoryDescription: 'Category Description',
    categoryType: 'Category Type',
    categoryColor: 'Color',
  },

  placeholders: {
    category: 'Select category',
    vehicle: 'Select vehicle (optional)',
    driver: 'Select driver (optional)',
    description: 'E.g.: Annual insurance payment',
    amount: '0.00',
    supplier: 'Supplier name',
    documentNumber: 'E.g.: INV-2025-001',
    notes: 'Additional information...',
    categoryName: 'E.g.: Fuel, Maintenance',
    categoryDescription: 'Optional category description...',
    paymentMethod: 'Select method',
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
    markAsPaid: 'Mark as Paid',
    markingAsPaid: 'Marking...',
    cancel: 'Cancel',
    newCategory: 'New Category',
    activate: 'Activate',
    activating: 'Activating...',
  },

  dialogs: {
    new: {
      title: 'Register Expense',
      description: 'Fill in the expense details',
    },
    edit: {
      title: 'Edit Expense',
      description: 'Update the expense details',
    },
    view: {
      title: 'Expense Details',
      description: 'Complete information about the expense',
      expenseInfo: 'Expense Information',
      paymentInfo: 'Payment Information',
      additionalInfo: 'Additional Information',
    },
    delete: {
      title: 'Delete Expense',
      description: 'Are you sure you want to delete the expense',
      warning: 'This action cannot be undone.',
    },
    markAsPaid: {
      title: 'Mark as Paid',
      description: 'Register payment details',
    },
    newCategory: {
      title: 'New Expense Category',
      description: 'Create a category to organize expenses',
    },
    editCategory: {
      title: 'Edit Category',
      description: 'Update category details',
    },
    deleteCategory: {
      title: 'Delete Category',
      description: 'Are you sure you want to delete the category',
      warning: 'This action cannot be undone.',
    },
  },

  alerts: {
    noCategories: 'No categories available',
    noVehicles: 'No vehicles available',
    noDrivers: 'No drivers available',
  },

  toast: {
    createSuccess: 'Expense registered successfully',
    createError: 'Error registering expense',
    updateSuccess: 'Expense updated successfully',
    updateError: 'Error updating expense',
    deleteSuccess: 'Expense deleted successfully',
    deleteError: 'Error deleting expense',
    markAsPaidSuccess: 'Expense marked as paid',
    markAsPaidError: 'Error marking as paid',
    categoryCreateSuccess: 'Category created successfully',
    categoryCreateError: 'Error creating category',
    categoryUpdateSuccess: 'Category updated successfully',
    categoryUpdateError: 'Error updating category',
    categoryDeleteSuccess: 'Category deleted successfully',
    categoryDeleteError: 'Error deleting category',
    categoryRestored: 'Category activated successfully',
  },

  errors: {
    errorLoading: 'Error loading expenses',
    errorLoadingCategories: 'Error loading categories',
    expenseNotFound: 'Expense not found',
    categoryNotFound: 'Category not found',
    categoryAlreadyExists: "Category with name '{{name}}' already exists",
    categoryHasExpenses: 'This category has {{count}} linked expense{{plural}}',
    restoreFailed: 'Error activating category',
  },

  warnings: {
    categoryExistsInactive: "Category '{{name}}' exists but is inactive.",
  },

  validation: {
    categoryRequired: 'Category is required',
    descriptionRequired: 'Description is required',
    amountRequired: 'Amount is required',
    amountPositive: 'Amount must be greater than zero',
    expenseDateRequired: 'Expense date is required',
    paymentMethodRequired: 'Payment method is required',
    paymentDateRequired: 'Payment date is required',
    categoryNameRequired: 'Category name is required',
  },

  info: {
    paidOn: 'Paid on',
    dueOn: 'Due on',
    noDueDate: 'No due date',
    noPaymentDate: 'Awaiting payment',
    noSupplier: 'No supplier',
    noDocument: 'No document',
    noNotes: 'No notes',
    noVehicle: 'No vehicle',
    noDriver: 'No driver',
    daysOverdue: '{{days}} day{{plural}} overdue',
    totalExpenses: '{{count}} expense{{plural}}',
    noDescription: 'No description',
    activeCount: '{{count}} active categor{{plural}}',
  },

  filters: {
    all: 'All statuses',
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
    allCategories: 'All categories',
  },

  viewModes: {
    compact: 'Compact',
    normal: 'Normal',
    cards: 'Cards',
  },

  categories: {
    title: 'Expense Categories',
    newCategory: 'New Category',
    active: 'Active',
    inactive: 'Inactive',
    noDescription: 'No description',
    stats: {
      total: 'Total',
      operational: 'Operational',
      administrative: 'Administrative',
      extraordinary: 'Extraordinary',
    },
  },
} as const;

export default enExpenses;