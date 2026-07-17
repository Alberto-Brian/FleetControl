// ========================================
// FILE: src/locales/pt/vehicles.ts (COMPLETO ATUALIZADO)
// ========================================
export const ptVehicles = {
  title: "Frota de Veículos",
  description: "Gerencie e monitore o estado de todos os veículos da organização.",
  
  stats: {
    total: "Total",
    available: "Disponíveis",
    inUse: "Em Uso",
    inMaintenance: "Em Manutenção",
    maintenance: "Manutenção",
    inactive: "Inactivos"
  },

  status: {
    available: {
      label: "Disponível",
      description: "Veículo pronto para uso"
    },
    in_use: {
      label: "Em uso",
      description: "Veículo alocado para uma atividade"
    },
    maintenance: {
      label: "Manutenção",
      description: "Veículo em reparo ou manutenção"
    },
    inactive: {
      label: "Inactivo",
      description: "Veículo temporariamente fora de operação"
    }
  },

  statusChange: {
    title: 'Alterar Status do Veículo',
    currentStatus: 'Status Actual',
    newStatus: 'Novo Status',
    notesLabel: 'Motivo / Observações',
    notesPlaceholder: 'Ex: Veículo enviado para revisão dos 50.000 km. Previsão de retorno: 15/03/2024',
    notesHelper: 'Esta observação será adicionada automaticamente ao histórico do veículo com data e hora',
    notePrefix: 'Status alterado para',
    infoTitle: 'Alteração de Status',
    infoDescription: 'O histórico completo de alterações ficará registado no sistema para auditoria futura.',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    updating: 'Actualizando...',
  },

  fields: {
    licensePlate: "Matrícula",
    brand: "Marca",
    model: "Modelo",
    year: "Ano",
    color: "Cor",
    category: "Categoria",
    mileage: "Quilometragem",
    chassisNumber: "Número do Chassi",
    engineNumber: "Número do Motor",
    fuelTankCapacity: "Capacidade do Tanque",
    tireSize: "M. Pneumática",
    acquisitionDate: "Data de Aquisição",
    acquisitionValue: "Valor de Aquisição",
    notes: "Observações",
    status: "Estado",
    createdAt: "Data de Cadastro",
    updatedAt: "Última Actualização",
    gpsImei: "IMEI / ID do GPS",
    gpsImeiOptional: "(opcional)",
  },

  placeholders: {
    search: "Pesquisar matrícula, marca ou modelo...",
    licensePlate: "LD-00-00-AA",
    brand: "Toyota",
    model: "Hilux",
    color: "Branco",
    chassisNumber: "00000000000000000",
    engineNumber: "0000000000",
    notes: "Informações adicionais sobre o veículo...",
    selectCategory: "Selecione a categoria",
    categoryName: "Ex: Utilitário, Passeio, Carga...",
    categoryDescription: "Ex: Veículos para transporte de carga leve...",
    searchCategory: 'Pesquisar categoria...',
    tireSize: "Ex: 205/55 R16",
    gpsImei: "Ex: 353926070024734",
  },

  actions: {
    view: "Ver Detalhes",
    activate: "Activar",
    activating: "A activar...",
    edit: "Editar",
    delete: "Excluir",
    cancel: "Cancelar",
    save: "Guardar",
    create: "Criar Veículo",
    update: "Actualizar",
    creating: "A criar...",
    updating: "A actualizar...",
    deleting: "A excluir...",
    updateMileage: "Actualizar Km",
    changeStatus: "Alterar Estado",
    editData: "Editar Dados"
  },

  dialogs: {
    new: {
      title: "Novo Veículo",
      description: "Cadastrar um novo veículo na frota"
    },
    edit: {
      title: "Editar Veículo",
      description: "Edição completa de todas as informações do veículo",
      technicalHint: "Estes dados são úteis para",
      technicalHint1: "Identificação única do veículo",
      technicalHint2: "Cálculo de consumo de combustível",
      technicalHint3: "Documentação e seguros",
      valueInCents: "Valor armazenado em centavos",
      notesInfo: "Alterações de status são automaticamente registadas aqui", // ❌
    },
    view: {
      title: "Detalhes do Veículo",
      quickUpdates: "Actualizações Rápidas",
      vehicleData: "Dados do Veículo",
      technicalData: "Dados Técnicos",
      acquisition: "Aquisição",
      registrationInfo: "Registos",
      noNotes: "Sem observações registadas",
      fullEditHint: "Para edição completa, utilize o botão 'Editar' na lista principal",
      syncInfo: "Sincronização & GPS",
      syncStatus: "Estado na nuvem",
      syncedWithApi: "Sincronizado",
      pendingSync: "Não sincronizado",
      gpsDevice: "GPS / IMEI",
      noGps: "Sem GPS",
    },
    delete: {
      title: "Excluir Veículo",
      description: "Tem a certeza que deseja excluir o veículo",
      warning: "Esta acção não pode ser desfeita."
    },
    addGps: {
      title: "Adicionar GPS ao veículo",
      description: "Este veículo já está sincronizado com a API mas não tem um dispositivo GPS configurado. Introduza o IMEI para activar o rastreamento.",
      hint: "O dispositivo será registado no servidor de rastreamento e associado a este veículo.",
      badge: "Adicionar GPS",
      action: "Adicionar GPS",
      tooltip: "Registar dispositivo GPS neste veículo",
      register: "Registar GPS",
      registering: "A registar...",
    },
    sync: {
      title: "Sincronizar veículo com a API",
      description: "Podes sincronizar este veículo com IMEI (activa o rastreamento GPS) ou apenas os dados do veículo. Podes sempre adicionar o IMEI posteriormente.",
      imeiHint: "Se deixares em branco, o veículo é sincronizado sem rastreamento GPS.",
      imeiCreationHint: "Se preenchido, o dispositivo GPS é criado automaticamente no servidor de rastreamento.",
      imeiEditHint: "IMEI do dispositivo GPS instalado neste veículo. Utilizado para rastreamento em tempo real.",
      syncWithGps: "Sincronizar com GPS",
      syncWithoutGps: "Sincronizar sem GPS",
      badgeReadyWithGps: "Pronto para sincronizar (com GPS)",
      badgeNoImei: "Sem IMEI — sincroniza sem GPS",
      badgeNoGps: "Sem GPS",
      tooltipWithGps: "Sincronizar com API (com GPS)",
      tooltipSync: "Sincronizar com API",
    },
    mileage: {
      title: "Actualizar Quilometragem",
      description: "Registar nova leitura do odómetro",
      current: "Quilometragem Actual",
      new: "Nova Quilometragem",
      confirm: "Confirmar Actualização",
      difference: "Diferença"
    },
    status: {
      title: "Alterar Estado do Veículo",
      currentStatus: "Estado Actual",
      newStatus: "Novo Estado",
      reason: "Motivo / Observações",
      reasonPlaceholder: "Ex: Veículo enviado para revisão dos 50.000 km. Previsão de retorno: 15/03/2024",
      reasonHelper: "Esta observação será adicionada automaticamente ao histórico do veículo",
      infoTitle: "Alteração de Estado",
      infoDescription: "O histórico completo de alterações ficará registado no sistema para auditoria futura.",
      auto: "Via sistema de viagens",
      inUseWarning: "Veículo em uso. O estado será actualizado automaticamente quando a viagem for finalizada.",
      inUseBlocked: "Em uso - Bloqueado"
    }
  },

  categories: {
    title: "Categorias de Veículos",
    new: "Nova Categoria",
    edit: "Editar Categoria",
    delete: "Excluir Categoria",
    name: "Nome da Categoria",
    description: "Descrição",
    color: "Cor",
    active: "Activa",
    inactive: "Inactiva",
    noDescription: "Sem descrição definida",
    created: "Categoria criada com sucesso",
    updated: "Categoria actualizada com sucesso",
    deleted: "Categoria excluída com sucesso",
    newDescription: "Crie uma nova categoria para organizar seus veículos",
    editDescription: "Atualize as informações da categoria de veículo",
    deleteDescription: "Tem a certeza que deseja excluir a categoria de veículo",
    namePlaceholder: "Nome da Categoria",
    descriptionPlaceholder: "Descrição da categoria",
    colorHint: "A cor ajuda a identificar visualmente a categoria",
    colorTip: "Escolha cores diferentes para cada categoria para facilitar a identificação visual dos veículos",
    available: 'Categorias disponíveis',
  },

  gps: {
    trackingLabel:        'Rastreamento em tempo real',
    trackingEnabledDesc:  'O veículo aparece no mapa com actualizações em tempo real',
    trackingDisabledDesc: 'O veículo não aparece no mapa. O dispositivo GPS continua activo no Traccar',
    trackingPaused:       'Rastreamento pausado',
    enableTracking:       'Activar rastreamento',
    disableTracking:      'Pausar rastreamento',
  },

  tabs: {
    vehicles: "Veículos",
    categories: "Categorias",
    basic: "Básico",
    technical: "Técnico",
    acquisition: "Aquisição",
    notes: "Observações",
  },

  filters: {
    all: "Todos os estados",
    allCategories: "Todas as categorias",
    status: "Filtrar por estado",
    category: "Filtrar por categoria",
    sync: "Sincronização",
    syncAll: "Todos (sync)",
    synced: "Sincronizados",
    notSynced: "Não sincronizados",
    imei: "GPS / IMEI",
    imeiAll: "Com/sem GPS",
    withImei: "Com GPS (IMEI)",
    withoutImei: "Sem GPS (sem IMEI)",
  },

  viewModes: {
    compact: "Compacto",
    normal: "Normal",
    cards: "Cards"
  },

  table: {
    plate: "Matrícula",
    vehicle: "Veículo",
    category: "Categoria",
    status: "Estado",
    actions: "Acções"
  },

  empty: {
    noVehicles: "Nenhum veículo encontrado",
    noCategories: "Nenhuma categoria encontrada",
    adjustFilters: "Tente ajustar os seus filtros de pesquisa.",
    noData: "Sem dados para mostrar"
  },

  loading: {
    vehicles: "A carregar veículos...",
    categories: "A carregar categorias...",
    syncing: "A sincronizar frota..."
  },

  toast: {
    createSuccess: "Veículo criado com sucesso",
    createError: "Erro ao criar veículo",
    updateSuccess: "Veículo actualizado com sucesso",
    updateError: "Erro ao actualizar veículo",
    deleteSuccess: "Veículo excluído com sucesso",
    syncSuccess: "Veículo sincronizado com a API",
    syncError: "Erro ao sincronizar veículo com a API",
    addGpsSuccess: "GPS registado com sucesso no veículo",
    addGpsError: "Erro ao registar o GPS no veículo",
    categoryRestored: "Categoria activada com sucesso!",
    deleteError: "Erro ao excluir veículo",
    mileageUpdateSuccess: "Quilometragem actualizada com sucesso",
    mileageUpdateError: "Erro ao actualizar quilometragem",
    statusUpdateSuccess: "Estado actualizado com sucesso",
    statusUpdateError: "Erro ao actualizar estado",
    categoryCreateSuccess: "Categoria criada com sucesso",
    categoryCreateError: "Erro ao criar categoria",
    categoryUpdateSuccess: "Categoria actualizada com sucesso",
    categoryUpdateError: "Erro ao actualizar categoria",
    categoryDeleteSuccess: "Categoria excluída com sucesso",
    categoryDeleteError: "Erro ao excluir categoria",
    gpsRemoved: "Dispositivo GPS removido do veículo",
    gpsRemoveError: "Erro ao remover dispositivo GPS",
    trackingEnabled: "Rastreamento activado",
    trackingDisabled: "Rastreamento pausado",
    trackingError: "Erro ao actualizar rastreamento"
  },

  errors: {
    errorLoading: "Erro ao carregar veículos",
    errorLoadingCategories: "Erro ao carregar categorias",
    vehicleNotFound: "Veículo não encontrado",
    vehicleAlreadyExists: "Este veículo já existe",
    vehicleWithSamePlate: "Já existe um veículo com a matrícula {{plate}}",
    vehicleInUse: "O veículo com a matrícula {{plate}} está em uso, não pode ser alterado!!",
    categoryNotFound: "Categoria não encontrada",
    categoryHasVehicles: "Não é possível excluir: categoria vinculada a {{count}} veículo(s)",
    categoryAlreadyExists: "Já existe uma categoria com o nome {{name}}",
    mileageLessThanCurrent: "A nova quilometragem não pode ser menor que a actual",
    mileageDifferenceTooBig: "Diferença muito grande na quilometragem. Verifique o valor",
    restoreFailed: "Erro ao activar categoria",
    noCategoriesFound: 'Nenhuma categoria encontrada',
    imeiRequiresConnected: "O IMEI requer modo conectado — active a licença conectada primeiro",
    imeiAlreadyExists: "Já existe um dispositivo com este IMEI registado",
    traccarUnavailable: "Servidor de rastreamento inacessível. Verifique a ligação e tente novamente",
    traccarError: "Erro ao registar o dispositivo de rastreamento. Tente novamente",
  },

  warnings: {
    noAvailableVehicles: "Sem veículos disponíveis",
    categoryExistsInactive: "A categoria '{{name}}' existe mas está inactiva. Deseja activá-la?"
  },

  connectedHint: {
    viewGps:    'No modo conectado, este veículo aparece no mapa em tempo real com posição, velocidade e histórico de percursos.',
    statusSync: 'No modo conectado, as alterações de status sincronizam automaticamente com a plataforma central e ficam visíveis em todos os dispositivos.',
  }
} as const;