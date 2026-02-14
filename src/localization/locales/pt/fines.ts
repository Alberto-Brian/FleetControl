// ========================================
// FILE: src/i18n/locales/pt/fines.ts
// ========================================

export const ptFines = {
  title: "Multas de Trânsito",
  description: "Gestão de multas e infrações",
  newFine: "Nova Multa",
  noFines: "Nenhuma multa registada",
  searchPlaceholder: "Pesquisar por nº auto, veículo ou infração...",
  
  fields: {
    fineNumber: "Nº do Auto",
    fineDate: "Data da Infração",
    infractionType: "Tipo de Infração",
    description: "Descrição",
    location: "Local",
    fineAmount: "Valor da Multa",
    dueDate: "Data de Vencimento",
    paymentDate: "Data de Pagamento",
    status: "Estado",
    points: "Pontos",
    authority: "Autoridade",
    notes: "Observações",
    vehicle: "Veículo",
    driver: "Motorista"
  },
  
  status: {
    pending: { label: "Pendente", description: "Multa não paga" },
    paid: { label: "Paga", description: "Multa paga" },
    contested: { label: "Contestada", description: "Em recurso" },
    cancelled: { label: "Cancelada", description: "Multa cancelada" }
  },
  
  infractionTypes: {
    speeding: "Excesso de Velocidade",
    parking: "Estacionamento Proibido",
    phone: "Uso de Telemóvel",
    overtaking: "Ultrapassagem Indevida",
    redLight: "Sinal Vermelho",
    documents: "Falta de Documentos",
    other: "Outro"
  },
  
  stats: {
    total: "Total em Multas",
    pending: "Pendentes",
    paid: "Total Pago",
    overdue: "Vencidas"
  },
  
  filters: {
    all: "Todas",
    pending: "Pendentes",
    paid: "Pagas",
    contested: "Contestadas",
    overdue: "Vencidas"
  },
  
  actions: {
    actions: "Acções",
    close: "Fechar", 
    view: "Ver Detalhes",
    edit: "Editar",
    delete: "Eliminar",
    markAsPaid: "Marcar como Paga",
    contest: "Contestar",
    cancel: "Cancelar",
    pay: "Pagar",
    register: "Registar"
  },
  
  dialogs: {
    new: {
      title: "Registar Nova Multa",
      description: "Preencha os dados da multa de trânsito"
    },
    view: {
      title: "Detalhes da Multa",
      description: "Informações completas da multa"
    },
    edit: {
      title: "Editar Multa",
      description: "Atualize os dados da multa"
    },
    markAsPaid: {
      title: "Marcar como Paga",
      description: "Confirme o pagamento da multa"
    },
    contest: {
      title: "Contestar Multa",
      description: "Registe o recurso da multa"
    },
    delete: {
      title: "Eliminar Multa",
      warning: "Tem certeza que deseja eliminar esta multa?"
    }
  },
  
  placeholders: {
    fineNumber: "Ex: AUTO-2024-001",
    infractionType: "Selecione o tipo de infração",
    description: "Descreva a infração detalhadamente...",
    location: "Ex: Avenida 4 de Fevereiro",
    fineAmount: "Ex: 15000",
    points: "Ex: 2",
    authority: "Ex: Polícia Nacional de Trânsito",
    notes: "Informações adicionais...",
    selectVehicle: "Selecione o veículo",
    selectDriver: "Selecione o motorista"
  },
  
  alerts: {
    overdue: "Multa vencida há {{days}} dia(s)",
    dueSoon: "Vence em {{days}} dia(s)",
    noVehicleSelected: "Selecione um veículo",
    noPaymentDate: "Informe a data de pagamento"
  },
  
  toast: {
    createSuccess: "Multa registada com sucesso",
    createError: "Erro ao registar multa",
    updateSuccess: "Multa atualizada com sucesso",
    updateError: "Erro ao atualizar multa",
    deleteSuccess: "Multa eliminada com sucesso",
    deleteError: "Erro ao eliminar multa",
    markAsPaidSuccess: "Multa marcada como paga",
    markAsPaidError: "Erro ao marcar multa como paga",
    contestSuccess: "Multa contestada com sucesso",
    contestError: "Erro ao contestar multa"
  },
  
  info: {
    totalPoints: "Total de {{points}} pontos",
    dueIn: "Vence em {{days}} dias",
    overdueBy: "Vencida há {{days}} dias",
    paidOn: "Paga em {{date}}",
    unknownDriver: "Motorista desconhecido",
     markAsPaidInfo: "Ao confirmar, a multa será marcada como paga e o status será atualizado automaticamente."
  }
} as const;

export default ptFines;
