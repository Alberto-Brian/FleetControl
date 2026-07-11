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
    confirm: "Confirmar Alteração",
    assignTrip: "Atribuir Viagem"
  },

  dialogs: {
    status: {
      title: "Alterar Estado do Motorista",
      description: "Defina o estado contratual de {{name}}",
      onTripDescription: "{{name}} está em viagem. Não é possível alterar o estado.",
      onTripAlertTitle: "Motorista em serviço",
      onTripAlertDescription: "Não é possível alterar o estado contratual enquanto o motorista estiver em viagem.",
      willSetOffline: "Ao definir este estado, a disponibilidade será automaticamente alterada para 'Indisponível'.",
      blockedDescription: "Alteração de estado bloqueada para {{name}}",
      onLeaveAlertTitle: "Motorista de licença",
      onLeaveAlertDescription: "O estado 'De Licença' é gerido automaticamente pelo sistema de férias.",
      auto: "AUTO",
      viaLeaveSystem: "Via sistema de férias"
    },
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
      viaTripSystem: "Via sistema de viagens",
      blockedDescription: "A disponibilidade de {{name}} não pode ser alterada neste momento.",
      inactiveStatusTitle: "Motorista inactivo",
      inactiveStatusDescription: "O motorista está {{status}}. A disponibilidade é automaticamente definida como 'Indisponível'.",
    },
    contact: {
      title: "Actualizar Contactos",
      description: "Actualizar informações de contacto de {{name}}"
    },
    license: {
      title: "Actualizar Carta de Condução",
      description: "Renove ou corrija informações da carta de {{name}}"
    },
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
    required: "Este campo é obrigatório",
    driverHasActiveTrip: "O motorista está em viagem. Não é possível excluir ou alterar o estado."
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
    expiringLicenses: "Cartas a Expirar",
    drivers: 'Motoristas',
    leaves:  'Férias',
    shifts:  'Turnos',
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
  },

   leaves: {
    title: 'Férias',
    description: 'Gestão e agendamento de férias dos motoristas',

    status: {
      scheduled: 'Agendada',
      pending_trip: 'Aguarda viagem',
      active: 'Em curso',
      completed: 'Concluída',
      cancelled: 'Cancelada',
    },

    reasons: {
      annual_leave: 'Férias anuais',
      medical_leave: 'Licença médica',
      personal_leave: 'Licença pessoal',
      other: 'Outro motivo',
    },

    fields: {
      driver: 'Motorista',
      startDate: 'Data de início',
      endDate: 'Data de fim',
      reason: 'Motivo',
      notes: 'Observações',
      cancelledReason: 'Motivo de cancelamento',
    },

    placeholders: {
      selectDriver: 'Seleccionar motorista',
      reason: 'Seleccionar motivo',
      notes: 'Observações opcionais...',
      search: 'Pesquisar por motorista...',
    },

    actions: {
      schedule: 'Agendar férias',
      scheduling: 'A agendar...',
      cancel: 'Cancelar férias',
      confirmCancel: 'Sim, cancelar',
    },

    info: {
      duration: 'Duração: {{days}} dia(s)',
      days: 'dias',
      schedulingNote: 'Nota sobre agendamento',
      schedulingNoteDetail: 'O estado do motorista será actualizado automaticamente na data de início. Se estiver em viagem, as férias aguardam o fim da viagem.',
      pendingTripNote: 'A aguardar fim de viagem para activar',
    },

    sections: {
      upcoming: 'Próximas / Em curso',
      history: 'Histórico',
    },

    filters: {
      all: 'Todos os estados',
    },

    dialogs: {
      new: {
        title: 'Agendar férias',
        description: 'Agendar período de férias para um motorista',
        descriptionFor: 'Agendar férias para {{name}}',
      },
      list: {
        title: 'Férias de {{name}}',
      },
      cancel: {
        title: 'Cancelar férias',
        description: 'Esta acção irá cancelar o período de férias seleccionado.',
        warning: 'Se as férias estiverem activas, o motorista voltará ao estado Disponível.',
      },
    },

    toast: {
      createSuccess: 'Férias agendadas com sucesso',
      createError: 'Erro ao agendar férias',
      cancelSuccess: 'Férias canceladas com sucesso',
      cancelError: 'Erro ao cancelar férias',
    },

    empty: {
      noLeaves: 'Sem férias registadas',
      noLeavesHint: 'Clica em \'Agendar férias\' para criar um período de férias',
      adjustFilters: 'Tenta ajustar os filtros de pesquisa',
    },

    errors: {
      loadError: 'Erro ao carregar férias',
      startDateInPast: 'A data de início não pode ser no passado',
      endBeforeStart: 'A data de fim deve ser posterior à data de início',
      overlapping: 'Este motorista já tem férias agendadas neste período',
      cannotEditNonScheduled: 'Só é possível editar férias ainda agendadas',
      notFound: 'Registo de férias não encontrado',
    },
  },

  tooltips: {
    statusBlockedOnLeave: "Não é possível alterar o estado contratual enquanto o motorista estiver de licença",
    statusBlockedOnTrip: "Não é possível alterar o estado contratual enquanto o motorista estiver em viagem",
    availabilityBlockedOnTrip: "A disponibilidade é gerida automaticamente durante viagens",
    availabilityBlockedOnLeave: "A disponibilidade é definida automaticamente durante licenças"
  },

  shifts: {
    title:           'Gestão de Turnos',
    newShift:        'Novo Turno',
    noShifts:        'Nenhum turno criado',
    searchPlaceholder: 'Pesquisar turnos...',
 
    status: {
      draft:    'Rascunho',
      active:   'Activo',
      archived: 'Arquivado',
    },
 
    filters: {
      all:      'Todos os estados',
      draft:    'Rascunho',
      active:   'Activos',
      archived: 'Arquivados',
    },
 
    stats: {
      total: 'Total',
    },
 
    fields: {
      name:        'Nome do Turno',
      description: 'Descrição',
      startDate:   'Data de Início',
      endDate:     'Data de Fim',
      startTime:   'Hora de Entrada',
      endTime:     'Hora de Saída',
      status:      'Estado',
      notes:       'Observações',
      schedule:    'Horário',
      period:      'Período',
    },
 
    placeholders: {
      name:         'Ex: Turno A — Janeiro 2025',
      description:  'Descrição opcional do turno...',
      notes:        'Observações adicionais...',
      searchDriver: 'Pesquisar motorista para adicionar...',
    },
 
    sections: {
      schedule: 'Período e Horário',
      members:  'Motoristas',
    },
 
    info: {
      member:       'motorista',
      members:      'motoristas',
      leader:       'Líder',
      noMembersYet: 'Nenhum motorista adicionado',
      noLeaderYet:  'Clique na coroa para definir o líder do turno',
    },
 
    actions: {
      create:         'Criar Turno',
      creating:       'A criar...',
      activate:       'Activar',
      archive:        'Arquivar',
      reactivate:     'Reactivar',
      setLeader:      'Definir como líder',
      removeLeader:   'Remover liderança',
    },
 
    dialogs: {
      new: {
        title:       'Novo Turno',
        description: 'Crie um plano de trabalho para os motoristas',
      },
      delete: {
        title:       'Eliminar Turno',
        description: 'Tem a certeza que deseja eliminar o turno "{{name}}"? Esta acção não pode ser desfeita.',
      },
    },
 
    toast: {
      createSuccess: 'Turno criado com sucesso',
      createError:   'Erro ao criar turno',
      updateError:   'Erro ao actualizar turno',
      statusUpdated: 'Estado do turno actualizado',
      deleteSuccess: 'Turno eliminado com sucesso',
      deleteError:   'Erro ao eliminar turno',
    },
 
    errors: {
      loadError:           'Erro ao carregar turnos',
      notFound:            'Turno não encontrado',
      nameRequired:        'O nome do turno é obrigatório',
      datesRequired:       'As datas de início e fim são obrigatórias',
      timesRequired:       'As horas de entrada e saída são obrigatórias',
      endBeforeStart:      'A data de fim não pode ser anterior à data de início',
      onlyOneLeader:       'Um turno só pode ter um líder',
      driverAlreadyInShift: 'Este motorista já está neste turno',
    },
  },

  connectedHint: {
    driverLocation: 'No modo conectado, podes visualizar a localização em tempo real do motorista no mapa e consultar o histórico de percursos.',
    driverActivity: 'No modo conectado, a disponibilidade do motorista sincroniza automaticamente com a plataforma central e fica visível em todos os dispositivos.',
  },

} as const;

export default ptDrivers;