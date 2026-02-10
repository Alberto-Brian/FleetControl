// ========================================
// FILE: src/locales/pt/expenses.ts
// ========================================
export const ptExpenses = {
  title: 'Gestão de Despesas',
  description: 'Controle financeiro da frota',
  newExpense: 'Nova Despesa',
  noExpenses: 'Nenhuma despesa registada',
  searchPlaceholder: 'Pesquisar por descrição ou fornecedor...',

  tabs: {
    expenses: 'Despesas',
    categories: 'Categorias',
  },

  stats: {
    total: 'Total do Mês',
    paid: 'Despesas Pagas',
    pending: 'Pendentes',
    overdue: 'Em Atraso',
    byCategory: 'Por Categoria',
  },

  status: {
    pending: {
      label: 'Pendente',
      description: 'Aguardando pagamento',
    },
    paid: {
      label: 'Paga',
      description: 'Pagamento realizado',
    },
    overdue: {
      label: 'Em Atraso',
      description: 'Vencimento ultrapassado',
    },
    cancelled: {
      label: 'Cancelada',
      description: 'Despesa cancelada',
    },
  },

  paymentMethods: {
    cash: 'Dinheiro',
    card: 'Cartão',
    transfer: 'Transferência',
    check: 'Cheque',
  },

  categoryTypes: {
    operational: 'Operacional',
    administrative: 'Administrativa',
    extraordinary: 'Extraordinária',
  },

  fields: {
    category: 'Categoria',
    vehicle: 'Veículo',
    driver: 'Motorista',
    description: 'Descrição',
    amount: 'Valor',
    expenseDate: 'Data da Despesa',
    dueDate: 'Data de Vencimento',
    paymentDate: 'Data de Pagamento',
    paymentMethod: 'Método de Pagamento',
    status: 'Estado',
    supplier: 'Fornecedor',
    documentNumber: 'Nº Documento',
    notes: 'Observações',
    categoryName: 'Nome da Categoria',
    categoryDescription: 'Descrição da Categoria',
    categoryType: 'Tipo de Categoria',
    categoryColor: 'Cor',
  },

  placeholders: {
    category: 'Seleccione a categoria',
    vehicle: 'Seleccione o veículo (opcional)',
    driver: 'Seleccione o motorista (opcional)',
    description: 'Ex: Pagamento de seguro anual',
    amount: '0.00',
    supplier: 'Nome do fornecedor',
    documentNumber: 'Ex: FAT-2025-001',
    notes: 'Informações adicionais...',
    categoryName: 'Ex: Combustível, Manutenção',
    categoryDescription: 'Descrição opcional da categoria...',
    paymentMethod: 'Seleccione o método',
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
    markAsPaid: 'Marcar como Paga',
    markingAsPaid: 'A marcar...',
    cancel: 'Cancelar',
    newCategory: 'Nova Categoria',
    activate: 'Activar',
    activating: 'A activar...',
  },

  dialogs: {
    new: {
      title: 'Registar Despesa',
      description: 'Preencha os dados da despesa',
    },
    edit: {
      title: 'Editar Despesa',
      description: 'Actualize os dados da despesa',
    },
    view: {
      title: 'Detalhes da Despesa',
      description: 'Informações completas sobre a despesa',
      expenseInfo: 'Informações da Despesa',
      paymentInfo: 'Informações de Pagamento',
      additionalInfo: 'Informações Adicionais',
    },
    delete: {
      title: 'Eliminar Despesa',
      description: 'Tem a certeza que deseja eliminar a despesa',
      warning: 'Esta acção não pode ser desfeita.',
    },
    markAsPaid: {
      title: 'Marcar como Paga',
      description: 'Registe os dados do pagamento',
    },
    newCategory: {
      title: 'Nova Categoria de Despesa',
      description: 'Crie uma categoria para organizar as despesas',
    },
    editCategory: {
      title: 'Editar Categoria',
      description: 'Actualize os dados da categoria',
    },
    deleteCategory: {
      title: 'Eliminar Categoria',
      description: 'Tem a certeza que deseja eliminar a categoria',
      warning: 'Esta acção não pode ser desfeita.',
    },
  },

  alerts: {
    noCategories: 'Nenhuma categoria disponível',
    noVehicles: 'Nenhum veículo disponível',
    noDrivers: 'Nenhum motorista disponível',
  },

  toast: {
    createSuccess: 'Despesa registada com sucesso',
    createError: 'Erro ao registar despesa',
    updateSuccess: 'Despesa actualizada com sucesso',
    updateError: 'Erro ao actualizar despesa',
    deleteSuccess: 'Despesa eliminada com sucesso',
    deleteError: 'Erro ao eliminar despesa',
    markAsPaidSuccess: 'Despesa marcada como paga',
    markAsPaidError: 'Erro ao marcar como paga',
    categoryCreateSuccess: 'Categoria criada com sucesso',
    categoryCreateError: 'Erro ao criar categoria',
    categoryUpdateSuccess: 'Categoria actualizada com sucesso',
    categoryUpdateError: 'Erro ao actualizar categoria',
    categoryDeleteSuccess: 'Categoria eliminada com sucesso',
    categoryDeleteError: 'Erro ao eliminar categoria',
    categoryRestored: 'Categoria activada com sucesso',
  },

  errors: {
    errorLoading: 'Erro ao carregar despesas',
    errorLoadingCategories: 'Erro ao carregar categorias',
    expenseNotFound: 'Despesa não encontrada',
    categoryNotFound: 'Categoria não encontrada',
    categoryAlreadyExists: "Já existe uma categoria com o nome '{{name}}'",
    categoryHasExpenses: 'Esta categoria possui {{count}} despesa{{plural}} vinculada{{plural}}',
    restoreFailed: 'Erro ao activar categoria',
  },

  warnings: {
    categoryExistsInactive: "A categoria '{{name}}' existe mas está inactiva.",
  },

  validation: {
    categoryRequired: 'A categoria é obrigatória',
    descriptionRequired: 'A descrição é obrigatória',
    amountRequired: 'O valor é obrigatório',
    amountPositive: 'O valor deve ser maior que zero',
    expenseDateRequired: 'A data da despesa é obrigatória',
    paymentMethodRequired: 'O método de pagamento é obrigatório',
    paymentDateRequired: 'A data de pagamento é obrigatória',
    categoryNameRequired: 'O nome da categoria é obrigatório',
  },

  info: {
    paidOn: 'Paga a',
    dueOn: 'Vence a',
    noDueDate: 'Sem data de vencimento',
    noPaymentDate: 'Aguardando pagamento',
    noSupplier: 'Sem fornecedor',
    noDocument: 'Sem documento',
    noNotes: 'Sem observações',
    noVehicle: 'Sem veículo',
    noDriver: 'Sem motorista',
    daysOverdue: '{{days}} dia{{plural}} de atraso',
    totalExpenses: '{{count}} despesa{{plural}}',
    noDescription: 'Sem descrição',
    activeCount: '{{count}} categoria{{plural}} activa{{plural}}',
  },

  filters: {
    all: 'Todos os estados',
    pending: 'Pendentes',
    paid: 'Pagas',
    overdue: 'Em Atraso',
    cancelled: 'Canceladas',
    allCategories: 'Todas as categorias',
  },

  viewModes: {
    compact: 'Compacto',
    normal: 'Normal',
    cards: 'Cartões',
  },

  categories: {
    title: 'Categorias de Despesas',
    newCategory: 'Nova Categoria',
    active: 'Activa',
    inactive: 'Inactiva',
    noDescription: 'Sem descrição',
    stats: {
      total: 'Total',
      operational: 'Operacionais',
      administrative: 'Administrativas',
      extraordinary: 'Extraordinárias',
    },
  },
} as const;

export default ptExpenses;