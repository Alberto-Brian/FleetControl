// ========================================
// FILE: src/i18n/locales/pt/dashboard.pt.ts
// ========================================

export const ptDashboard = {
  title: "Dashboard",
  welcome: "Bem-vindo de volta",
  lastUpdated: "Última actualização",
  refresh: "Actualizar",
  
  stats: {
    vehicles: {
      total: "Total de Veículos",
      totalAvailable: "Disponíveis para viagem",
      active: "Activos",
      inactive: "Inactivos",
      maintenance: "Em Manutenção",
      totalSuffix: "veículos totais",
    },
    drivers: {
      total: "Total de Motoristas",
      totalAvailable: "Disponíveis para viagem",
      available: "Disponíveis",
      onTrip: "Em Viagem",
      availableSuffix: "Disponíveis para viagens",
    },
    trips: {
      total: "Total de Viagens",
      totalInProgrees: "Em andamento hoje",
      active: "Em Andamento",
      completed: "Concluídas",
      totalDistance: "Distância Total",
      activeSuffix: "Em andamento hoje",
    },
    fuel: {
      total: "Abastecimentos",
      cost: "Custo Total",
      liters: "Litros",
      avgPrice: "Preço Médio"
    },
    maintenance: {
      total: "Manutenções",
      pending: "Pendentes",
      inProgress: "Em Andamento",
      cost: "Custo Total",
      pendingSuffix: "manutenções",
    },
    expenses: {
      total: "Despesas",
      paid: "Pagas",
      pending: "Pendentes",
      amount: "Valor Total"
    },
    fines: {
      total: "Multas",
      pending: "Pendentes",
      paid: "Pagas",
      overdue: "Vencidas",
      amount: "Valor Total"
    },

    alerts: {
      pending: "Alertas Pendentes",
    }
  },
  
  charts: {
    fuelByMonth: "Combustível por Mês",
    expensesByCategory: "Despesas por Categoria",
    maintenancesByType: "Manutenções por Tipo",
    tripsByMonth: "Viagens por Mês",
    vehicleUtilization: "Top 5 Veículos",
    preventive: "Preventiva",
    corrective: "Corretiva",
    fuelDescription: "Análise mensal de gastos com combustível (Kz)",
    fleetStatus: "Status da Frota",
    fleetDescription: "Distribuição atual dos veículos",
    week: "Sem",
    weeklyExpenses: "Resumo de Despesas Semanais",
    weeklyExpensesDescription: "Comparativo entre combustível, manutenção e outros custos",
    fuel: "Combustível",
    maintenance: "Manutenção",
    other: "Outros",
  },
  
  recentActivities: {
    title: "Atividades Recentes",
    noActivities: "Nenhuma atividade recente",
    viewAll: "Ver Todas",
    trip: "Viagem",
    newTripStarted: "Nova Viagem iniciada",
    refueling: "Abastecimento",
    refuelingDone: "Abastecimento realizado",
    maintenance: "Manutenção",
    maintenanceScheduled: "Manutenção agendada",
    expense: "Despesa",
    fine: "Multa",
    description: "Detalhes técnicos e status em tempo real",
  },
  
  alerts: {
    title: "Alertas",
    overdueFines: "{{count}} multa(s) vencida(s)",
    pendingMaintenances: "{{count}} manutenção(ões) pendente(s)",
    lowFuelVehicles: "{{count}} veículo(s) com combustível baixo",
    expiringSoon: "{{count}} documento(s) vence(m) em breve",
    actionRequired: "Ação necessária para regularização",
    resolve: "Resolver",
    ignore: "Ignorar",
    requiresAttention: "Requer atenção imediata",
    viewDetails: "Ver Detalhes",
    noAlerts: "Nenhum alerta no momento",
    viewHistory: "Ver Histórico de Alertas",
  },

  table: {
    type: "Tipo",
    description: "Descrição",
    vehicle: "Veículo",
    date: "Data",
    value: "Valor",
  },
  
  errors: {
    loading: "Erro ao carregar dados do dashboard",
  },
  
  quickActions: {
    title: "Ações Rápidas",
    newTrip: "Nova Viagem",
    newRefueling: "Abastecimento",
    newMaintenance: "Manutenção",
    newExpense: "Despesa"
  }
} as const;

export default ptDashboard;