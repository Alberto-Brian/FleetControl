export const ptRoutes = {
  title: 'Rotas',
  description: '{{count}} rota{{plural}} cadastrada{{plural}}',
  newRoute: 'Nova Rota',
  noRoutes: 'Nenhuma rota encontrada',
  searchPlaceholder: 'Pesquisar por nome, origem ou destino...',

  stats: {
    total: 'Total',
    active: 'Activas',
    inactive: 'Inactivas',
  },

  types: {
    regular: 'Regular',
    express: 'Expressa',
    alternative: 'Alternativa',
  },

  fields: {
    name: 'Nome da Rota',
    origin: 'Origem',
    destination: 'Destino',
    distance: 'Distância (km)',
    duration: 'Duração (horas)',
    type: 'Tipo de Rota',
    waypoints: 'Pontos de Passagem',
    description: 'Descrição',
    status: 'Estado',
  },

  placeholders: {
    name: 'Ex: Luanda - Benguela',
    origin: 'Ex: Luanda',
    destination: 'Ex: Benguela',
    distance: 'Ex: 650',
    duration: 'Ex: 8',
    waypoints: 'Ex: Catumbela, Lobito',
    description: 'Informações adicionais sobre a rota...',
  },

  hints: {
    waypoints: 'Separe múltiplos pontos por vírgula',
  },

  actions: {
    new: 'Nova Rota',
    create: 'Criar Rota',
    edit: 'Editar',
    delete: 'Eliminar',
  },

  dialogs: {
    new: {
      title: 'Registar Rota',
      description: 'Defina um percurso pré-estabelecido para viagens',
    },
    edit: {
      title: 'Editar Rota',
      description: 'Altere os dados da rota seleccionada',
    },
    delete: {
      title: 'Eliminar Rota',
      description: 'Esta acção é irreversível. A rota será permanentemente eliminada.',
      warning: 'As viagens associadas a esta rota não serão afectadas.',
    },
  },

  toast: {
    createSuccess: 'Rota registada com sucesso',
    createError: 'Erro ao registar rota',
    updateSuccess: 'Rota actualizada com sucesso',
    updateError: 'Erro ao actualizar rota',
    deleteSuccess: 'Rota eliminada com sucesso',
    deleteError: 'Erro ao eliminar rota',
  },

  errors: {
    errorLoading: 'Erro ao carregar rotas',
    routeNotFound: 'Rota não encontrada',
    routeAlreadyExists: 'Já existe uma rota com este nome',
  },

  status: {
    active: 'Activa',
    inactive: 'Inactiva',
  },
} as const;

export default ptRoutes;