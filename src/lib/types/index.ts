// Types for all database models

export interface Block {
  id: string;
  name: string;
  letter: string;
  description?: string;
  totalSpaces: number;
  occupiedSpaces: number;
  createdAt: string;
  updatedAt: string;
}

export interface Space {
  id: string;
  blockId: string;
  type: 'Contentor' | 'Bancada' | 'Casota';
  number: string;
  size: string;
  status: 'Ocupado' | 'Disponível' | 'Manutenção';
  isFixed: boolean;
  paymentType: 'Semanal' | 'Diário';
  price: number;
  sellerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'Ativo' | 'Pendente' | 'Atrasado' | 'Inativo';
  totalDebt: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  sellerId: string;
  spaceId: string;
  amount: number;
  status: 'Pago' | 'Pendente' | 'Atrasado';
  method?: 'Dinheiro' | 'Transferência' | 'Multicaixa';
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'Receita' | 'Despesa';
  category: string;
  description: string;
  amount: number;
  status: 'Confirmado' | 'Pendente' | 'Pago' | 'Cancelado';
  method?: 'Dinheiro' | 'Transferência' | 'Multicaixa';
  paymentId?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  type: 'weekly' | 'monthly' | 'block' | 'payment_type';
  period: string;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  occupancyRate: number;
  activeSpaces: number;
  data?: string; // JSON string
  generatedAt: string;
  createdAt: string;
}

// Existing Client type
export interface Client {
  id: string;
  name: string;
  email: string;
}