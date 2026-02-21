export const enRoutes = {
  title: 'Routes',
  description: '{{count}} route{{plural}} registered',
  newRoute: 'New Route',
  noRoutes: 'No routes found',
  searchPlaceholder: 'Search by name, origin or destination...',

  stats: {
    total: 'Total',
    active: 'Active',
    inactive: 'Inactive',
  },

  types: {
    regular: 'Regular',
    express: 'Express',
    alternative: 'Alternative',
  },

  fields: {
    name: 'Route Name',
    origin: 'Origin',
    destination: 'Destination',
    distance: 'Distance (km)',
    duration: 'Duration (hours)',
    type: 'Route Type',
    waypoints: 'Waypoints',
    description: 'Description',
    status: 'Status',
  },

  placeholders: {
    name: 'E.g.: Luanda - Benguela',
    origin: 'E.g.: Luanda',
    destination: 'E.g.: Benguela',
    distance: 'E.g.: 650',
    duration: 'E.g.: 8',
    waypoints: 'E.g.: Catumbela, Lobito',
    description: 'Additional information about the route...',
  },

  hints: {
    waypoints: 'Separate multiple points with comma',
  },

  actions: {
    new: 'New Route',
    create: 'Create Route',
    edit: 'Edit',
    delete: 'Delete',
  },

  dialogs: {
    new: {
      title: 'Register Route',
      description: 'Define a pre-established route for trips',
    },
    edit: {
      title: 'Edit Route',
      description: 'Update the selected route data',
    },
    delete: {
      title: 'Delete Route',
      description: 'This action is irreversible. The route will be permanently deleted.',
      warning: 'Trips associated with this route will not be affected.',
    },
  },

  toast: {
    createSuccess: 'Route registered successfully',
    createError: 'Error registering route',
    updateSuccess: 'Route updated successfully',
    updateError: 'Error updating route',
    deleteSuccess: 'Route deleted successfully',
    deleteError: 'Error deleting route',
  },

  errors: {
    errorLoading: 'Error loading routes',
    routeNotFound: 'Route not found',
    routeAlreadyExists: 'A route with this name already exists',
  },

  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
} as const;

export default enRoutes;