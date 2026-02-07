// ========================================
// FILE: src/locales/pt/drivers.ts (COMPLETO)
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
    deleting: "A excluir...",
    confirm: "Confirmar Alteração"
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
      registrationInfo: "Registos",
      quickActions: "Actualizações Rápidas",
      onTripLocked: "Em viagem - Bloqueado",
      changeAvailability: "Alterar estado operacional",
      changeStatus: "Alterar estado contratual",
      updateLicense: "Actualizar informações",
      updateContact: "Actualizar telefone/email",
      onTripInfoTitle: "Motorista em serviço.",
      onTripInfoDescription: "A disponibilidade será actualizada automaticamente quando a viagem for finalizada.",
      fullEditHint: "Para edição completa, utilize o botão \"Editar\" na lista principal"
    },
    delete: {
      title: "Excluir Motorista",
      description: "Tem a certeza que deseja excluir o motorista",
      warning: "Esta acção não pode ser desfeita."
    },
    availability: {
      title: "Alterar Disponibilidade",
      description: "Defina a disponibilidade operacional de {{name}}",
      onTripDescription: "{{name}} está actualmente em viagem. O estado será actualizado automaticamente ao finalizar.",
      onTripAlertTitle: "Motorista em serviço",
      onTripAlertDescription: "Não é possível alterar a disponibilidade manualmente enquanto o motorista estiver em viagem.",
      auto: "Auto",
      viaTripSystem: "Via sistema de viagens"
    },
    contact: {
      title: "Actualizar Contactos",
      description: "Actualizar informações de contacto de {{name}}"
    },
    license: {
      title: "Actualizar Carta de Condução",
      description: "Renove ou corrija informações da carta de {{name}}"
    },
    status: {
      title: "Alterar Estado do Motorista",
      description: "Defina o estado contratual de {{name}}"
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