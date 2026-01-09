import React from 'react';
import { Users } from 'lucide-react';

interface Payment {
  seller: string;
  block: string;
  space: string;
  status: 'Pago' | 'Pendente' | 'Atrasado';
  amount: number;
  date: string;
}

interface PaymentRowProps {
  payment: Payment;
}

export default function PaymentRow({ payment }: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors border-b border-border last:border-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{payment.seller}</p>
          <p className="text-sm text-muted-foreground">
            Bloco {payment.block} • {payment.space}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="font-semibold">{payment.amount.toLocaleString()} AOA</p>
          <p className="text-xs text-muted-foreground">{payment.date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          payment.status === 'Pago' ? 'bg-green-500/10 text-green-600' :
          payment.status === 'Pendente' ? 'bg-yellow-500/10 text-yellow-600' :
          'bg-red-500/10 text-red-600'
        }`}>
          {payment.status}
        </span>
      </div>
    </div>
  );
}