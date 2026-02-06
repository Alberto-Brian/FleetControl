// ========================================
// FILE: src/locales/pt/drivers.ts
// ========================================
export const ptDrivers = {
  title: "Gestão de Motoristas",
  description: "Gerir motoristas e informações de licenças",
  newDriver: "Novo Motorista",
  noDrivers: "Nenhum motorista registado",
  searchPlaceholder: "Pesquisar por nome ou número de carta...",
  
  stats: {
    total: "Total",
    active: "Activos",
    onTrip: "Em Viagem",
    available: "Disponíveis"
  },

  status: {
    active: {
      label: "Activo",
      description: "Motorista activo no sistema"
    },
    on_leave: {
      label: "De Licença",
      description: "Motorista em período de licença"
    },
    terminated: {
      label: "Desligado",
      description: "Motorista desligado da empresa"
    }
  },

  availability: {
    available: {
      label: "Disponível",
      description: "Pronto para novas viagens"
    },
    on_trip: {
      label: "Em Viagem",
      description: "Actualmente em serviço"
    },
    offline: {
      label: "Indisponível",
      description: "Fora de serviço"
    }
  },

  fields: {
    name: "Nome Completo",
    taxId: "NIF",
    idNumber: "Nº do BI/Passaporte",
    birthDate: "Data de Nascimento",
    phone: "Telefone",
    email: "E-mail",
    address: "Morada",
    city: "Cidade",
    state: "Província",
    postalCode: "Código Postal",
    licenseNumber: "Nº da Carta de Condução",
    licenseCategory: "Categoria da Carta",
    licenseExpiryDate: "Validade da Carta",
    hireDate: "Data de Admissão",
    status: "Estado",
    availability: "Disponibilidade",
    photo: "Fotografia",
    notes: "Observações"
  },

  placeholders: {
    name: "Ex: João Manuel Silva",
    taxId: "000000000",
    idNumber: "000000000LA000",
    phone: "+244 900 000 000",
    email: "joao.silva@exemplo.com",
    address: "Rua, Nº, Bairro",
    city: "Luanda",
    state: "Luanda",
    postalCode: "0000",
    licenseNumber: "00000000",
    licenseCategory: "B",
    notes: "Informações adicionais sobre o motorista..."
  },

  actions: {
    view: "Ver Detalhes",
    edit: "Editar",
    delete: "Excluir",
    cancel: "Cancelar",
    save: "Guardar",
    create: "Criar Motorista",
    update: "Actualizar",
    creating: "A criar...",
    updating: "A actualizar...",
    deleting: "A excluir..."
  },

  dialogs: {
    new: {
      title: "Novo Motorista",
      description: "Cadastrar um novo motorista no sistema"
    },
    edit: {
      title: "Editar Motorista",
      description: "Actualizar informações do motorista"
    },
    view: {
      title: "Detalhes do Motorista",
      personalInfo: "Informações Pessoais",
      contactInfo: "Contactos",
      licenseInfo: "Informação da Carta",
      employmentInfo: "Informações Profissionais",
      additionalInfo: "Informações Adicionais",
      registrationInfo: "Registos"
    },
    delete: {
      title: "Excluir Motorista",
      description: "Tem a certeza que deseja excluir o motorista",
      warning: "Esta acção não pode ser desfeita."
    }
  },

  alerts: {
    licenseExpired: "Carta de condução EXPIRADA!",
    licenseExpiring: "Carta expira em breve",
    licenseExpiringSoon: "A carta expira em {{days}} dias",
    updateLicense: "Renovar carta de condução"
  },

  toast: {
    createSuccess: "Motorista criado com sucesso",
    createError: "Erro ao criar motorista",
    updateSuccess: "Motorista actualizado com sucesso",
    updateError: "Erro ao actualizar motorista",
    deleteSuccess: "Motorista excluído com sucesso",
    deleteError: "Erro ao excluir motorista"
  },

  errors: {
    errorLoading: "Erro ao carregar motoristas",
    driverWithSameLicenseAlreadyExists: "Já existe um motorista com a carta de condução {{license}}",
    driverWithSameTaxIdAlreadyExists: "Já existe um motorista com o NIF {{taxId}}",
    licenseExpired: "A carta de condução está expirada",
    invalidEmail: "Endereço de e-mail inválido",
    invalidPhone: "Número de telefone inválido",
    required: "Este campo é obrigatório"
  },

  validation: {
    nameRequired: "O nome é obrigatório",
    licenseNumberRequired: "O número da carta é obrigatório",
    licenseCategoryRequired: "A categoria da carta é obrigatória",
    licenseExpiryRequired: "A validade da carta é obrigatória",
    emailInvalid: "E-mail inválido",
    phoneInvalid: "Telefone inválido"
  },

  tabs: {
    all: "Todos",
    active: "Activos",
    onLeave: "De Licença",
    expiringLicenses: "Cartas a Expirar"
  },

  filters: {
    all: "Todos os estados",
    active: "Activos",
    on_leave: "De Licença",
    terminated: "Desligados",
    available: "Disponíveis",
    on_trip: "Em Viagem",
    offline: "Indisponíveis"
  },

  categories: {
    A: "Motociclos",
    B: "Ligeiros",
    C: "Pesados",
    D: "Passageiros",
    E: "Reboque"
  },

  info: {
    admittedOn: "Admitido a",
    validUntil: "Válida até",
    registeredOn: "Registado a",
    lastUpdate: "Última actualização",
    noNotes: "Sem observações registadas"
  }
} as const;

// ========================================
// FILE: src/locales/en/drivers.ts
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
    deleting: "Deleting..."
  },

  dialogs: {
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
      registrationInfo: "Registration Records"
    },
    delete: {
      title: "Delete Driver",
      description: "Are you sure you want to delete the driver",
      warning: "This action cannot be undone."
    }
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
    required: "This field is required"
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
    expiringLicenses: "Expiring Licenses"
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
  }
} as const;

export const resources = {
  pt: {
    drivers: ptDrivers
  },
  en: {
    drivers: enDrivers
  }
} as const;

// Tipo para autocompletar as chaves de tradução
export type DriversTranslations = typeof ptDrivers;