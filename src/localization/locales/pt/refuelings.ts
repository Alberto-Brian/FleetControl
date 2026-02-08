// ========================================
// FILE: src/locales/pt/refuelings.ts
// ========================================
export const ptRefuelings = {
  title: 'Gestão de Abastecimentos',
  description: 'Gerir abastecimentos da frota',
  newRefueling: 'Novo Abastecimento',
  noRefuelings: 'Nenhum abastecimento registado',
  searchPlaceholder: 'Pesquisar por veículo...',

  table: {
  date: 'Data',
  vehicle: 'Veículo',
  station: 'Posto',
  liters: 'Litros',
  price: 'Preço/L',
  total: 'Total',
  actions: 'Ações'
  },

  tabs: {
    refuelings: 'Abastecimentos',
    stations: 'Postos de Combustível',
  },

  stats: {
    total: 'Total',
    totalSpent: 'Gasto Total',
    totalLiters: 'Total de Litros',
    averagePrice: 'Preço Médio/L',
    refuelings: 'Abastecimentos',
    activeStations: 'Postos Activos',
  },

  fuelTypes: {
    gasoline: 'Gasolina',
    diesel: 'Gasóleo',
    ethanol: 'Etanol',
    cng: 'GNV',
    electric: 'Elétrico',
    hybrid: 'Híbrido',
  },

  fields: {
    vehicle: 'Veículo',
    driver: 'Motorista',
    station: 'Posto de Combustível',
    fuelType: 'Tipo de Combustível',
    refuelingDate: 'Data de Abastecimento',
    liters: 'Litros',
    pricePerLiter: 'Preço por Litro',
    totalCost: 'Custo Total',
    mileage: 'Quilometragem',
    fullTank: 'Tanque Cheio',
    invoiceNumber: 'Nº Fatura/Recibo',
    notes: 'Observações',
    stationName: 'Nome do Posto',
    brand: 'Marca',
    phone: 'Telefone',
    address: 'Endereço',
    city: 'Cidade',
    fuelTypesAvailable: 'Tipos de Combustível',
    convenienceStore: 'Loja de Conveniência',
    carWash: 'Lavagem de Carros',
    trip: "Viagem",
    currentMileage: "Km actual",
    selectedTrip: "Viagem selecionada"
  },

  placeholders: {
    vehicle: 'Seleccione o veículo',
    driver: 'Seleccione o motorista (opcional)',
    station: 'Seleccione o posto (opcional)',
    fuelType: 'Seleccione o combustível',
    liters: 'Ex: 50.5',
    pricePerLiter: 'Ex: 250.00',
    mileage: 'Ex: 45000',
    invoiceNumber: 'Ex: FAT-2025-001',
    notes: 'Observações adicionais...',
    stationName: 'Ex: Posto Talatona',
    brand: 'Ex: Sonangol, Puma',
    phone: 'Ex: 923 456 789',
    address: 'Ex: Rua Principal, nº 100',
    city: 'Ex: Luanda',
    fuelTypes: 'Ex: Gasolina, Gasóleo, GPL',
    stationNotes: 'Informações adicionais sobre o posto...',
    trip: "Selecione uma viagem",
    selectVehicleFirst: "Selecione um veículo primeiro",
    selectTripFirst: "Selecione uma viagem primeiro",
    selectVehicle: "Selecione um veículo",
    selectTrip: "Selecione uma viagem",
    selectDriver: "Selecione um motorista",
    selectStation: "Selecione um posto",
    addNotes: "Adicione notas...",
  },

  actions: {
    view: 'Ver Detalhes',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    create: 'Criar',
    update: 'Actualizar',
    creating: 'A criar...',
    updating: 'A actualizar...',
    deleting: 'A eliminar...',
    register: 'Registar Abastecimento',
    newStation: 'Novo Posto',
    activate: 'Activar',
    activating: 'A activar...',
  },

  dialogs: {
    new: {
      title: 'Registar Abastecimento',
      description: 'Preencha os dados do abastecimento realizado',
    },
    edit: {
      title: 'Editar Abastecimento',
      description: 'Actualize os dados do abastecimento',
    },
    view: {
      title: 'Detalhes do Abastecimento',
      description: 'Informações completas sobre o abastecimento',
      vehicleInfo: 'Informações do Veículo',
      refuelingInfo: 'Informações do Abastecimento',
      costs: 'Custos',
      additionalInfo: 'Informações Adicionais',
    },
    delete: {
      title: 'Eliminar Abastecimento',
      description: 'Tem a certeza que deseja eliminar o abastecimento',
      warning: 'Esta acção não pode ser desfeita.',
    },
    newStation: {
      title: 'Registar Posto de Combustível',
      description: 'Preencha os dados do posto de combustível',
    },
    editStation: {
      title: 'Editar Posto',
      description: 'Actualize os dados do posto',
    },
    deleteStation: {
      title: 'Eliminar Posto',
      description: 'Tem a certeza que deseja eliminar o posto',
      warning: 'Esta acção não pode ser desfeita.',
    },
  },

  alerts: {
    noVehicles: 'Nenhum veículo disponível',
    noDrivers: 'Nenhum motorista disponível',
    noStations: 'Nenhum posto disponível',
    noTripsForVehicle: "Nenhuma viagem ativa para este veículo"
  },

  toast: {
    createSuccess: 'Abastecimento registado com sucesso',
    createError: 'Erro ao registar abastecimento',
    updateSuccess: 'Abastecimento actualizado com sucesso',
    updateError: 'Erro ao actualizar abastecimento',
    deleteSuccess: 'Abastecimento eliminado com sucesso',
    deleteError: 'Erro ao eliminar abastecimento',
    stationCreateSuccess: 'Posto registado com sucesso',
    stationCreateError: 'Erro ao registar posto',
    stationUpdateSuccess: 'Posto actualizado com sucesso',
    stationUpdateError: 'Erro ao actualizar posto',
    stationDeleteSuccess: 'Posto eliminado com sucesso',
    stationDeleteError: 'Erro ao eliminar posto',
    stationRestored: 'Posto activado com sucesso',
  },

  errors: {
    errorLoading: 'Erro ao carregar abastecimentos',
    errorLoadingStations: 'Erro ao carregar postos',
    refuelingNotFound: 'Abastecimento não encontrado',
    stationNotFound: 'Posto não encontrado',
    stationAlreadyExists: "Já existe um posto com o nome '{{name}}'",
    stationHasRefuelings: 'Este posto possui {{count}} abastecimento{{plural}} vinculado{{plural}}',
    restoreFailed: 'Erro ao activar posto',
  },

  warnings: {
    stationExistsInactive: "O posto '{{name}}' existe mas está inactivo.",
  },

  validation: {
    vehicleRequired: 'O veículo é obrigatório',
    fuelTypeRequired: 'O tipo de combustível é obrigatório',
    litersRequired: 'A quantidade de litros é obrigatória',
    litersPositive: 'A quantidade de litros deve ser maior que zero',
    priceRequired: 'O preço por litro é obrigatório',
    pricePositive: 'O preço deve ser maior que zero',
    mileageRequired: 'A quilometragem é obrigatória',
    mileagePositive: 'A quilometragem deve ser maior que zero',
    stationNameRequired: 'O nome do posto é obrigatório',
  },

  info: {
    refueledOn: 'Abastecido a',
    noStation: 'Sem posto',
    noDriver: 'Sem motorista',
    noNotes: 'Sem observações',
    fullTank: 'Tanque Cheio',
    partialRefueling: 'Abastecimento Parcial',
    summary: 'Resumo do Abastecimento',
    calculation: '{{liters}}L × {{price}} Kz',
    activeCount: '{{count}} posto{{plural}} activo{{plural}}',
    totalRefuelings: '{{count}} abastecimento{{plural}}',
    noDescription: 'Sem descrição',
    services: 'Serviços Adicionais',
    autoFilled: "Auto",
    fromTrip: "Da viagem",
    auto: "Auto",
    driverLinkedToTrip: "Motorista vinculado à viagem: {{driver}}"
  },

  filters: {
    all: 'Todos',
    fullTank: 'Tanque Cheio',
    partial: 'Parcial',
  },

  viewModes: {
    compact: 'Compacto',
    normal: 'Normal',
    cards: 'Cartões',
  },

  stations: {
    title: 'Postos de Combustível',
    newStation: 'Novo Posto',
    noStations: 'Nenhum posto registado',
    active: 'Activo',
    inactive: 'Inactivo',
    stats: {
      total: 'Total',
      active: 'Activos',
      inactive: 'Inactivos',
    },
  },
  sections: {
    identification: "Identificação",
    location: "Localização",
    quantities: "Quantidades",
    details: "Detalhes",
    basicInfo: "Informações Básicas",
  }
} as const;

export default ptRefuelings;