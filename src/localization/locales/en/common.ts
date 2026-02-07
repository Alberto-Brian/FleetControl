// ========================================
// FILE: src/locales/en/common.ts (ou adicionar ao existente)
// ========================================
export const enCommon = {
  close: "Close",
  cancel: "Cancel",
  save: "Save",
  select: "Select",
  route: "Route",
  manual: "Manual",
  loading: "Loading",
  noResults: "No results found",
  noData: "No data available",
  confirmDelete: {
    titleDestructive: "Confirm Deletion",
    titleWarning: "Attention",
    description: "Are you sure you want to perform this action?",
    descriptionWithItem: "Are you sure you want to delete \"{{itemName}}\"?",
    warning: "This action cannot be undone."
  },
  actions: {
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    processing: "Processing..."
  }
} as const;