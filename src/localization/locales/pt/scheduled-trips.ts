// ========================================
// FILE: src/locales/pt/scheduled-trips.ts
// ========================================
export const ptScheduledTrips = {
  tabs: {
    scheduledTrips: "Viagens"
  },
  
  status: {
    scheduled: "Agendada",
    pending_leave: "Aguarda Regresso",
    launched: "Em Curso",
    cancelled: "Cancelada"
  },

  filters: {
    all: 'Todas as viagens',
    scheduled: "Agendadas",
    pending_leave: "Aguarda Regresso",
    launched: "Em Andamento",
    cancelled: "Canceladas"
  },

  fields: {
    driver: "Motorista",
    vehicle: "Veículo",
    scheduledDate: "Data de Início",
    route: "Rota",
    origin: "Origem",
    destination: "Destino",
    purpose: "Propósito",
    notes: "Notas"
  },

  purposes: {
    none: "Não especificado",
    business: "Negócios",
    maintenance_transport: "Transporte para manutenção",
    airport_transfer: "Transfer aeroporto",
    client_visit: "Visita a cliente",
    delivery: "Entrega",
    other: "Outro"
  },

  placeholders: {
    selectDriver: "Seleccionar motorista...",
    searchDriver: "Pesquisar motorista...",
    selectVehicle: "Seleccionar veículo...",
    searchVehicle: "Pesquisar matrícula...",
    selectRoute: "Seleccionar rota...",
    noRoute: "Sem rota predefinida",
    origin: "Ex: Luanda",
    destination: "Ex: Benguela",
    purpose: "Seleccionar propósito...",
    notes: "Observações adicionais..."
  },

  info: {
    launchesToday: "A viagem será iniciada automaticamente hoje.",
    daysUntil: "A viagem inicia em {{days}} dia(s).",
    schedulingNote: "Nota sobre o agendamento",
    schedulingNoteDetail: "A viagem será iniciada automaticamente na data indicada. Se o motorista estiver de licença, aguardará o regresso. Se o veículo estiver indisponível, a viagem será cancelada automaticamente.",
    launchedAt: "Iniciada em",
    days: "dias",
  },

  badges: {
    today: "Hoje",
    tomorrow: "Amanhã",
    awaitingReturn: "Aguarda regresso de férias"
  },

  actions: {
    new: "Agendar Viagem",
    schedule: "Agendar Viagem",
    scheduling: "A agendar...",
    confirmCancel: "Confirmar cancelamento"
  },

  toast: {
    createSuccess: "Viagem agendada com sucesso.",
    createError: "Erro ao agendar viagem.",
    cancelSuccess: "Viagem cancelada.",
    cancelError: "Erro ao cancelar viagem."
  },

  errors: {
    loadError: "Erro ao carregar viagens agendadas.",
    dateInPast: "A data não pode ser no passado.",
    driverConflict: "Este motorista já tem uma viagem agendada para esta data.",
    vehicleConflict: "Este veículo já tem uma viagem agendada para esta data.",
    notFound: "Viagem não encontrada.",
    cannotEditNonScheduled: "Só é possível editar viagens no estado 'Agendada'."
  },

  warnings: {
    noVehiclesAvailable: "Todos os veículos estão em uso ou em manutenção."
  },

  dialogs: {
    new: {
      title: "Agendar Viagem",
      description: "Preencha os dados para agendar a viagem. Será iniciada automaticamente na data indicada.",
      descriptionFor: "Agendar viagem para {{name}}."
    },
    cancel: {
      title: "Cancelar viagem agendada?",
      description: "A viagem não será iniciada. Esta acção não pode ser revertida.",
      reasonPlaceholder: "Motivo do cancelamento (opcional)"
    }
  },

  searchPlaceholder: "Pesquisar viagens...",
  description: "Gestão de viagens agendadas",
  
  empty: {
    title: "Nenhuma viagem agendada",
    description: 'Clique em "Agendar Viagem" para criar a primeira.'
  }
} as const;

export default ptScheduledTrips;