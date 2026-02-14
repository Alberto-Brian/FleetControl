// ========================================
// FILE: src/locales/pt/common.ts (ou adicionar ao existente)
// ========================================
export const ptCommon = {
    preview: "Pré-visualização",
    tip: "Dica",
    optional: "opcional",
    loading: "Carregando...",
    characters: "caracteres",
    info: "Informação",
    export: "Exportar",
    today: "Hoje",

    pagination: {
    showing: "Mostrando {{start}} a {{end}} de {{total}} registos",
    itemsPerPage: "Itens por página",
    page: "Página",
    of: "de",
    first: "Primeira",
    previous: "Anterior",
    next: "Próxima",
    last: "Última"
    },

    colors: {
    blue: "Azul",
    green: "Verde",
    amber: "Âmbar",
    red: "Vermelho",
    purple: "Roxo",
    pink: "Rosa",
    cyan: "Ciano",
    orange: "Laranja",
    },

    status: {
      active: "Activo",
      inactive: "Inactivo",
      none: "Nenhum"
    },
  confirmDelete: {
      title: "Tem certeza?",
      default: "Esta acção não pode ser desfeita. Este registo será marcado como excluído.",
      defaultWithItem: 'Esta acção não pode ser desfeita. O registo "{{itemName}}" será marcado como excluído.'
  },
  actions: {
      actions: "Acções",
      close: "Fechar",
      cancel: "Cancelar",
      delete: "Excluir",
      deleting: "Excluindo...",
      edit: "Editar",
      editing: "Editando...",
      selected: "Selecionado",
      clickToSelect: "Clique para selecionar",
      yes: "Sim",
      no: "Não"
  },
  warnigns: {
      licensePlateRequired: "Por favor, insira uma placa de veículo",
      categoryRequired: "Por favor, selecione uma categoria",
  },
  errors: {
      errorLoading: "Erro ao carregar",
      errorLoadingCategories: "Erro ao carregar categorias",
      notFound:{
          vehicle: "Veículo não encontrado",
          vehicleCategory: "Categoria de veículo não encontrada",
          expenseCategory: "Categoria de despesa não encontrada",
      }
  },
  viewModes: {
  compact: 'Compacto',
  normal: 'Lista', 
  cards: 'Cards'
}
} as const;