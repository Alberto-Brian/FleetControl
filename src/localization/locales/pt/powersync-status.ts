// ========================================
// FILE: src/localization/locales/pt/powersync-status.ts
// ========================================

export const ptPowersyncStatus = {
  title: 'Estado do PowerSync',
  subtitle: 'Diagnóstico da sincronização em segundo plano com o servidor',

  status: {
    title: 'Ligação',
    connected: 'Ligado',
    disconnected: 'Desligado',
    connecting: 'A ligar…',
    hasSynced: 'Primeira sincronização',
    hasSyncedYes: 'Concluída',
    hasSyncedNo: 'Ainda não',
    lastSyncedAt: 'Última sincronização',
    never: 'Nunca',
    uploading: 'A enviar alterações…',
    downloading: 'A receber dados…',
    idle: 'Em repouso',
    uploadError: 'Erro no envio',
    downloadError: 'Erro na recepção',
  },

  counts: {
    title: 'Dados sincronizados localmente',
    table: 'Tabela',
    rows: 'Linhas',
    tables: {
      vehicles: 'Veículos',
      drivers: 'Motoristas',
      trips: 'Viagens',
      fuel: 'Abastecimentos',
      maintenance: 'Manutenções',
      expenses: 'Despesas',
      categories: 'Categorias',
    },
  },

  preview: {
    title: 'Veículos (amostra)',
    empty: 'Sem veículos sincronizados ainda.',
    licensePlate: 'Matrícula',
    brandModel: 'Marca / Modelo',
    vehicleStatus: 'Estado',
    tracking: 'Rastreamento',
    trackingOn: 'Activo',
    trackingOff: 'Inactivo',
  },

  refresh: 'Actualizar agora',
  autoRefreshNote: 'Actualiza automaticamente a cada 5 segundos.',
  noSessionNote: 'Sem sessão PowerSync activa — inicie sessão na aplicação para começar a sincronizar.',
};
