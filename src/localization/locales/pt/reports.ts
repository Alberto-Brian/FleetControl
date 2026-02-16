// ========================================
// FILE: src/locales/pt/reports.ts
// ========================================

export const ptReport = {
  title: 'Relatórios',
  description: 'Gere relatórios detalhados da sua frota em PDF',
  
  // Tipos de relatórios
  types: {
    vehicles: {
      title: 'Relatório de Veículos',
      description: 'Listagem completa de veículos com status e categorias',
    },
    trips: {
      title: 'Relatório de Viagens',
      description: 'Histórico de viagens com rotas, motoristas e distâncias',
    },
    fuel: {
      title: 'Relatório de Combustível',
      description: 'Consumo e custos de combustível por veículo',
    },
    maintenance: {
      title: 'Relatório de Manutenções',
      description: 'Manutenções realizadas e agendadas',
    },
    financial: {
      title: 'Relatório Financeiro',
      description: 'Resumo de despesas e custos consolidados',
    },
    general: {
      title: 'Relatório Geral',
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
  },
  
  // Empty states
  empty: {
    noData: 'Nenhum dado encontrado para o período selecionado',
    adjustFilters: 'Tente ajustar o período ou selecionar outro relatório',
    noVehicles: 'Nenhum veículo encontrado no período selecionado',
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
  },

  table: {
    licensePlate: 'Matrícula',
    vehicle: 'Veículo',
    category: 'Categoria',
    year: 'Ano',
    mileage: 'Quilometragem',
    status: 'Status',
  },
  
  generatedAt: 'Gerado em',
  summary: 'Resumo',
  vehicleList: 'Lista de Veículos',
  
  pagination: {
    page: 'Página',
    of: 'de',
  },
  
  status: {
    available: 'Disponível',
    inUse: 'Em Uso',
    maintenance: 'Manutenção',
    inactive: 'Inativo',
  },
};