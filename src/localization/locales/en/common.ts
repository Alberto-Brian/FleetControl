// ========================================
// FILE: src/locales/en/common.ts (ou adicionar ao existente)

import { Edit } from "lucide-react";

// ========================================
export const enCommon = {
    pagination: {
    showing: "Showing {{start}} to {{end}} of {{total}} records",
    itemsPerPage: "Items per page",
    page: "Page",
    of: "of",
    first: "First",
    previous: "Previous",
    next: "Next",
    last: "Last"
    },
    status: {
      active: "Active",
      inactive: "Inactive",
      none: "None"
    },
    confirmDelete: {
        title: "Are you sure?",
        default: "This action cannot be undone. This record will be marked as deleted.",
        defaultWithItem: 'This action cannot be undone. The record "{{itemName}}" will be marked as deleted.'
    },
    actions: {
        cancel: "Cancel",
        delete: "Delete",
        deleting: "Deleting...",
        edit: "Edit",
        editing: "Editing...",
        selected: "Selected",
        clickToSelect: "Click to select",
        yes: "Yes",
        no: "No"
    },
    warnigns: {
        categoryRequired: "Please select a category",
        licensePlateRequired: "Please enter a vehicle license plate",
    },
    errors: {
        errorLoading: "Error loading",
        errorLoadingCategories: "Error loading categories",
        notFound:{
            vehicle: "Vehicle not found",
            vehicleCategory: "Vehicle category not found"
        }
    },

  viewModes: {
  compact: 'Compact',
  normal: 'Normal', 
  cards: 'Cards'
}
} as const;