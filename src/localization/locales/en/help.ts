// ========================================
// FILE: src/locales/en/help.ts
// ========================================
export const enHelp = {
  search: { placeholder: 'Search help...' },
  noResults: 'No results for',
  connectedOnly: 'Connected mode only',
  footer: 'FleetControl · AKM Systems',

  sections: [
    {
      id: 'intro',
      title: 'Introduction to FleetControl',
      content: [
        { type: 'text', text: 'FleetControl is a fleet management system that lets you monitor vehicles, drivers, trips, fuel, maintenance, expenses and fines.' },
        { type: 'text', text: 'There are two operating modes:' },
        { type: 'list', items: [
          'Standalone mode — works completely offline. All data is stored locally on the computer.',
          'Connected mode — connects to the FleetControl server and the real-time GPS tracking module via Traccar.',
        ]},
        { type: 'tip', text: 'The operating mode is determined by the type of license activated. You can see your current mode in Settings › License.' },
      ],
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      content: [
        { type: 'text', text: 'The Dashboard shows a summary of the current fleet status with key metrics and quick access to the main sections.' },
        { type: 'list', items: [
          'Summary of active vehicles, under maintenance and out of service',
          'Recent trips and fuel statistics',
          'Pending maintenance alerts',
          'Shortcuts to the most used sections',
        ]},
        { type: 'tip', text: 'Click on summary cards to navigate directly to the corresponding section.' },
      ],
    },
    {
      id: 'vehicles',
      title: 'Vehicles',
      content: [
        { type: 'text', text: 'Manage your entire fleet: register, edit and view the full history of each vehicle.' },
        { type: 'list', items: [
          'Full registration: plate, make, model, year, colour, category',
          'Chassis number and current status (active, under maintenance, inactive)',
          'Trip, fuel and maintenance history per vehicle',
          'GPS tracking device assignment (connected mode)',
        ]},
        { type: 'steps', steps: [
          'Click "+ New Vehicle" in the upper right corner',
          'Fill in required fields: plate, make, model',
          'Select category and initial status',
          'Save the record',
        ]},
        { type: 'tip', text: 'You can filter and sort the list by status, category or plate. Click any column header to sort.' },
        {
          type: 'list' as const,
          items: [
            'Register GPS: links the physical device IMEI to the vehicle — automatically creates the device on the Traccar server',
            'Remove GPS: unlinks the device from the vehicle in the local database and API. The device remains in Traccar',
            'Pause tracking: the vehicle stops appearing on the map but keeps the GPS linked — can be re-enabled at any time',
            'Resume tracking: the vehicle reappears on the map with real-time updates',
          ],
        },
        {
          type: 'tip' as const,
          content: 'To permanently disable or delete a device on the Traccar server, use the web module (coming soon).',
        },
      ],
    },
    {
      id: 'drivers',
      title: 'Drivers',
      content: [
        { type: 'text', text: 'Each driver has two independent states: a contractual status and an operational availability. It is important to understand which you can change manually and which the system manages automatically.' },
        { type: 'text', text: 'Contractual Status — defines the employment relationship between the driver and the company:' },
        { type: 'table',
          headers: ['Status', 'Meaning', 'Set by'],
          rows: [
            ['Active', 'Driver currently employed by the company', 'User'],
            ['On Leave', 'Temporary absence: holiday, sick leave, etc.', 'Automatic (Leaves module) or user'],
            ['Terminated', 'Employment ended — driver permanently inactive', 'User'],
          ],
        },
        { type: 'warning', text: 'The contractual status cannot be changed while the driver has an active trip. Complete the trip first.' },
        { type: 'text', text: 'Operational Availability — indicates whether the driver is ready to be assigned to a trip:' },
        { type: 'table',
          headers: ['Availability', 'Meaning', 'Set by'],
          rows: [
            ['Available', 'Ready to be assigned to a trip', 'User or automatic (when a trip or leave ends)'],
            ['On Trip', 'Driving — assigned to an active trip', 'Automatic (Trips module)'],
            ['Offline', 'Temporarily unavailable for another reason', 'User or automatic (when a leave starts)'],
          ],
        },
        { type: 'tip', text: 'When creating a trip, only drivers with "Available" operational availability and "Active" contractual status appear for selection.' },
        { type: 'text', text: 'Automation rules:' },
        { type: 'list', items: [
          'When a trip starts → availability changes to "On Trip" automatically',
          'When the trip ends → availability returns to "Available" automatically',
          'When a leave is activated → availability changes to "Offline" automatically',
          'When the leave ends → availability returns to "Available" automatically',
          'Availability cannot be changed manually while the driver is On Trip',
        ]},
      ],
    },
    {
      id: 'trips',
      title: 'Trips',
      content: [
        { type: 'text', text: 'Register and track all fleet trips: origin, destination, vehicle, driver, kilometres and costs.' },
        { type: 'list', items: [
          'Assigned vehicle and driver',
          'Origin, destination and trip purpose',
          'Departure and arrival date/time',
          'Kilometres travelled (start and end odometer)',
          'Additional notes',
        ]},
        { type: 'steps', steps: [
          'Click "+ New Trip"',
          'Select the vehicle and available driver',
          'Set origin, destination and departure date',
          'Enter the starting odometer reading',
          'On completion, update with arrival date and final odometer',
        ]},
        { type: 'tip', text: 'In connected mode, trips can be correlated with GPS routes recorded automatically by Traccar.' },
      ],
    },
    {
      id: 'fuel',
      title: 'Fuel',
      content: [
        { type: 'text', text: 'Record all fleet fuel fill-ups to track consumption and costs.' },
        { type: 'list', items: [
          'Vehicle, date and location of fill-up',
          'Litres filled, price per litre and total cost',
          'Odometer reading at the time of fill-up',
          'Fuel type (diesel, petrol, LPG, etc.)',
          'Automatic average consumption calculation (km/L)',
        ]},
        { type: 'tip', text: 'Always record the odometer at each fill-up so the system can accurately calculate average consumption.' },
      ],
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      content: [
        { type: 'text', text: 'Manage preventive and corrective maintenance for all fleet vehicles.' },
        { type: 'list', items: [
          'Type: preventive, corrective',
          'Description of work carried out, diagnosis and solution',
          'Supplier/workshop, entry date and exit date',
          'Vehicle kilometres at the time of entry into maintenance and next scheduled maintenance (km)',
          'Parts cost, labour cost and total',
          'Priority: low, normal, high, urgent',
          'Work order number (optional)',
        ]},
        { type: 'warning', text: 'When a vehicle enters maintenance, its status changes automatically. Mark the maintenance as completed when work finishes to return the vehicle to service.' },
        { type: 'tip', text: 'Set the next maintenance kilometre when creating or completing a record. The system automatically alerts you at the top of this page when the vehicle approaches that value. Configure the alert threshold in Settings › Operations.' },
      ],
    },
    {
      id: 'expenses',
      title: 'Expenses',
      content: [
        { type: 'text', text: 'Record all fleet operating expenses, per vehicle or in general.' },
        { type: 'list', items: [
          'Expense category (tolls, wash, insurance, inspection, etc.)',
          'Associated vehicle — optional for general fleet expenses',
          'Date, description and amount',
          'Expense reports by period, vehicle or category',
        ]},
        { type: 'tip', text: 'Create custom categories to better organise expenses specific to your operation.' },
      ],
    },
    {
      id: 'fines',
      title: 'Fines',
      content: [
        { type: 'text', text: 'Register and track traffic fines associated with fleet vehicles.' },
        { type: 'list', items: [
          'Vehicle and driver associated with the infraction',
          'Date, location and type of infraction',
          'Fine amount and payment deadline',
          'Payment status: pending, paid, contested',
        ]},
        { type: 'tip', text: 'Set who is responsible for payment (company or driver) when registering or editing a fine. This field appears in the record details to simplify cost allocation.' },
      ],
    },
    {
      id: 'reports',
      title: 'Reports',
      content: [
        { type: 'text', text: 'Generate detailed reports for all system modules, exportable as PDF.' },
        { type: 'list', items: [
          'Trip report by period, vehicle or driver',
          'Fuel consumption and costs per vehicle',
          'Maintenance history and associated costs',
          'Expense report by category or period',
          'Fleet general summary',
        ]},
        { type: 'text', text: 'Customise the PDF header (company logo, name and contacts) in Settings › PDF Reports.' },
        { type: 'tip', text: 'In historical mode you can generate reports from old databases without affecting current data. See the "Databases" section to learn how to activate this mode.' },
      ],
    },
    {
      id: 'tracking',
      title: 'GPS Tracking',
      connectedOnly: true,
      content: [
        { type: 'text', text: 'The GPS tracking module (available only in connected mode) allows real-time monitoring of all GPS-equipped vehicles via the Traccar server.' },
        { type: 'list', items: [
          'Real-time map with all device positions',
          'Speed, heading and last update for each vehicle',
          'Route history by device and period',
          'Geofencing zones with entry/exit alerts',
          'Speeding and ignition status alerts',
          'Map layers: streets, satellite, hybrid, terrain',
        ]},
        { type: 'text', text: 'Geofencing Zones — Define geographic areas on the map to receive alerts when a vehicle enters or exits those zones:' },
        { type: 'steps', steps: [
          'Go to the "Zones" tab in the map sidebar',
          'Click "Circle" or "Polygon" and draw the zone directly on the map',
          'Give the zone a name and set a speed limit (optional)',
          'Save — the zone is synced with the Traccar server',
          'Enable entry/exit notifications in Map Settings',
        ]},
        { type: 'tip', text: 'Use the "Fit all devices" button in the toolbar to centre the map on the entire fleet at once.' },
        {
          type: 'list' as const,
          items: [
            'The map only shows vehicles with an active GPS and tracking enabled',
            'Vehicles with paused tracking appear in the sidebar list with a "Tracking paused" badge but have no marker on the map',
            'The "GPS Devices" panel (toolbar button, visible in connected mode) lists all Traccar devices in the organization, even those not linked to vehicles',
            'After a backup restore, the app automatically checks IMEIs and warns when any have no match in Traccar',
          ],
        },
      ],
    },
    {
      id: 'notifications',
      title: 'GPS Notifications',
      connectedOnly: true,
      content: [
        { type: 'text', text: 'FleetControl uses two types of notification for GPS alerts:' },
        { type: 'list', items: [
          'Internal notifications (toast) — appear inside the app when it is in focus',
          'Native OS notifications — appear in the operating system when the app is minimised or in the background',
        ]},
        { type: 'table',
          headers: ['App state', 'Notification type'],
          rows: [
            ['In focus (active window)', 'Internal toast notification in the corner of the screen'],
            ['Minimised or in background', 'Native operating system notification'],
          ],
        },
        { type: 'tip', text: 'You can enable/disable native notifications in Settings › GPS Alerts. Each event type can be configured individually.' },
      ],
    },
    {
      id: 'databases',
      title: 'Databases (Historical Mode)',
      content: [
        { type: 'text', text: 'The system automatically saves database backups. The "Databases" tab in Settings lets you temporarily activate an old database to browse historical records and generate reports.' },
        { type: 'text', text: 'When you activate a historical database:' },
        { type: 'list', items: [
          'An amber banner appears at the top of every page indicating historical mode is active',
          'All listings (vehicles, trips, drivers, etc.) show data from that database',
          'You can generate reports from the historical data normally',
          'Adding, editing or deleting data is not possible — read-only mode',
        ]},
        { type: 'steps', steps: [
          'Go to Settings › Databases',
          'Click a database in the list to expand its details',
          'Click "Activate" to enter historical mode',
          'Navigate to any section or Reports to browse the historical data',
          'Click "Deactivate" on the amber banner at the top to return to the current database',
        ]},
        { type: 'warning', text: 'In historical mode, data cannot be modified. Deactivate historical mode to resume normal operation.' },
      ],
    },
    {
      id: 'license',
      title: 'License & Activation',
      content: [
        { type: 'text', text: 'FleetControl is activated with a license key provided by AKM Systems. There are two types:' },
        { type: 'table',
          headers: ['Type', 'Features'],
          rows: [
            ['Standalone', 'Offline mode, local data, no server required'],
            ['Connected', 'Server, real-time GPS tracking, multi-user'],
          ],
        },
        { type: 'steps', steps: [
          'Go to Settings › License',
          'Enter the license key provided',
          'Click "Activate"',
          'The system becomes operational in the mode corresponding to the license type',
        ]},
        { type: 'warning', text: 'Keep your license key in a safe place. If lost, contact AKM Systems for assistance.' },
        { type: 'tip', text: 'The connected key (LK-) is linked to your organisation on the server. You can use the same key to activate FleetControl on another computer.' },
      ],
    },
    {
      id: 'settings',
      title: 'Settings — Overview',
      content: [
        { type: 'text', text: 'Access Settings via the gear button in the lower left corner (standalone mode) or upper right of the panel (connected mode).' },
        { type: 'table',
          headers: ['Tab', 'What you configure'],
          rows: [
            ['Appearance', 'Theme (light/dark), text size, layout spacing'],
            ['Language', 'Interface language (Portuguese / English)'],
            ['Company', 'Company name, logo and details for reports'],
            ['PDF Reports', 'Header, footer and PDF export format'],
            ['GPS Alerts', 'Which GPS events generate alerts and minimum intervals between notifications'],
            ['Backups', 'Location and frequency of automatic database backups'],
            ['Databases', 'List and activate historical databases for read-only browsing'],
            ['Server', 'FleetControl server connection settings (connected mode)'],
            ['License', 'Active license info, operating mode and expiry'],
          ],
        },
      ],
    },
  ],
} as const;
