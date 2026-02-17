// ========================================
// FILE: src/locales/pt/reports.ts
// ========================================

export const ptReport = {
  title: 'Relatórios',
  description: 'Gere relatórios detalhados da sua frota em PDF',
  subtitle: '{{count}} tipos disponíveis · {{thisMonth}} gerados este mês',
  
  // Tipos de relatórios
  types: {
    vehicles: {
      title: 'Relatório de Veículos',
      shortTitle: 'Veículos',
      description: 'Listagem completa de veículos com status e categorias',
    },
    drivers: {
      title: 'Relatório de Motoristas',
      shortTitle: 'Motoristas',
      description: 'Listagem de motoristas com viagens e estatísticas',
    },
    trips: {
      title: 'Relatório de Viagens',
      shortTitle: 'Viagens',
      description: 'Histórico de viagens com rotas, motoristas e distâncias',
    },
    fuel: {
      title: 'Relatório de Combustível',
      shortTitle: 'Combustível',
      description: 'Consumo e custos de combustível por veículo',
    },
    maintenance: {
      title: 'Relatório de Manutenções',
      shortTitle: 'Manutenções',
      description: 'Manutenções realizadas e agendadas',
    },
    financial: {
      title: 'Relatório Financeiro',
      shortTitle: 'Financeiro',
      description: 'Resumo de despesas e custos consolidados',
    },
    general: {
      title: 'Relatório Geral',
      shortTitle: 'Geral',
      description: 'Resumo executivo de todas as operações',
    },
  },
  
  // Ações
  actions: {
    generate: 'Gerar PDF',
    preview: 'Visualizar',
    print: 'Imprimir',
    download: 'Baixar',
    selectPeriod: 'Selecionar Período',
    close: 'Fechar',
    cancel: 'Cancelar',
    newReport: 'Novo Relatório',
    generatePDF: 'Gerar PDF',
    redownload: 'Baixar novamente',
    delete: 'Remover',
    generateFirst: 'Gerar primeiro relatório',
  },
  
  // Date range
  dateRange: {
    title: 'Período do Relatório',
    from: 'De',
    to: 'Até',
    period: 'Período',
    presets: {
      today: 'Hoje',
      thisWeek: 'Esta Semana',
      thisMonth: 'Este Mês',
      lastMonth: 'Último Mês',
      thisYear: 'Este Ano',
      last30Days: 'Últimos 30 Dias',
      last90Days: 'Últimos 90 Dias',
      custom: 'Personalizado',
    },
  },
  
  // Dialog
  dialog: {
    title: 'Gerar Relatório',
    selectReport: 'Selecione o tipo de relatório',
    selectDateRange: 'Selecione o período',
    generating: 'Gerando relatório...',
    success: 'Relatório gerado com sucesso!',
    error: 'Erro ao gerar relatório',
    delete: {
      title: 'Remover relatório?',
      description: 'Este registo será removido do histórico. O arquivo PDF já descarregado não será afectado.',
      confirm: 'Remover',
    },
  },
  
  // Mensagens
  messages: {
    noReports: 'Nenhum relatório disponível',
    selectDateRange: 'Por favor, selecione um período',
    invalidDateRange: 'Período inválido',
    maxRangeExceeded: 'Período máximo de 365 dias',
    generating: 'Gerando relatório, aguarde...',
    generatedSuccess: 'Relatório gerado com sucesso',
    generatedError: 'Erro ao gerar relatório',
  },
  
  // Estatísticas nos relatórios
  stats: {
    total: 'Total',
    available: 'Disponíveis',
    inUse: 'Em Uso',
    maintenance: 'Em Manutenção',
    inactive: 'Inativos',
    completed: 'Concluídas',
    inProgress: 'Em Andamento',
    cancelled: 'Canceladas',
    pending: 'Pendentes',
    totalDistance: 'Distância Total',
    totalCost: 'Custo Total',
    avgDistance: 'Distância Média',
    preventive: 'Preventivas',
    corrective: 'Corretivas',
    totalVehicles: 'Total de Veículos',
    totalMileage: 'Quilometragem Total',
    totalGenerated: 'Relatórios Gerados',
    thisMonth: 'Este Mês',
    typesUsed: 'Tipos Usados',
  },
  
  // Empty states
  empty: {
    noData: 'Nenhum dado encontrado para o período selecionado',
    noVehicles: 'Nenhum veículo encontrado no período selecionado',
    noReports: 'Nenhum relatório encontrado',
    adjustFilters: 'Tente ajustar os filtros',
    noHistory: 'Nenhum relatório gerado ainda',
    historyDescription: 'Os relatórios gerados aparecerão aqui',
  },
  
  // Erros
  errors: {
    loading: 'Erro ao carregar dados do relatório',
    generating: 'Erro ao gerar PDF',
    invalidDate: 'Data inválida',
    startAfterEnd: 'Data de início deve ser anterior à data final',
    maxRange: 'Período máximo de 365 dias excedido',
  },
  
  // Toast messages
  toast: {
    generating: 'Gerando relatório...',
    success: 'Relatório gerado com sucesso',
    error: 'Erro ao gerar relatório',
    downloading: 'Baixando relatório...',
    printing: 'Preparando impressão...',
    deleteSuccess: 'Relatório removido',
  },

  table: {
    licensePlate: 'Matrícula',
    vehicle: 'Veículo',
    category: 'Categoria',
    year: 'Ano',
    mileage: 'Quilometragem',
    status: 'Status',
    report: 'Relatório',
    frequency: 'Frequência',
    generated: 'Gerados',
    actions: 'Ações',
    period: 'Período',
    language: 'Idioma',
    size: 'Tamanho',
    generatedAt: 'Gerado em'
  },
  
  generatedAt: 'Gerado em',
  summary: 'Resumo',
  vehicleList: 'Lista de Veículos',
  
  pagination: {
    page: 'Página',
    of: 'de',
  },

  tabs: {
    reportTypes: 'Tipos de Relatório',
    history: 'Histórico',
  },
  
  status: {
    available: 'Disponível',
    inUse: 'Em Uso',
    maintenance: 'Manutenção',
    inactive: 'Inativo',
  },

  filters: {
    period: 'Período',
    categories: 'Categorias',
    all: 'Todos',
  },

  categories: {
    all: 'Todos',
    fleet: 'Frota',
    financial: 'Financeiro',
    operational: 'Operacional',
  },
  
  datePresets: {
    today: 'Hoje',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mês',
    lastMonth: 'Mês Passado',
    last90Days: 'Últimos 90 Dias',
    thisYear: 'Este Ano',
  },
  
  frequencies: {
    daily: 'Diário',
    weekly: 'Semanal',
    biweekly: 'Quinzenal',
    monthly: 'Mensal',
    quarterly: 'Trimestral',
  },

  fields: {
    period: 'Período',
    category: 'Categoria',
  },

  timesGenerated: '{{count}}x gerado',
  
  recentlyGenerated: 'Gerados Recentemente',
  viewAllHistory: 'Ver todo o histórico',
  searchPlaceholder: 'Buscar relatórios...',
  
  history: {
    searchPlaceholder: 'Buscar no histórico...',
  },
};