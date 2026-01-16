import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TripStatusBadgeProps {
  status: 'completed' | 'in_progress' | 'cancelled';
}

export default function TripStatusBadge({ status }: TripStatusBadgeProps) {
  const variants = {
    completed: { 
      label: 'Concluída', 
      icon: CheckCircle2, 
      className: 'bg-green-100 text-green-700 border-green-200' 
    },
    in_progress: { 
      label: 'Em Andamento', 
      icon: Clock, 
      className: 'bg-blue-100 text-blue-700 border-blue-200' 
    },
    cancelled: { 
      label: 'Cancelada', 
      icon: XCircle, 
      className: 'bg-red-100 text-red-700 border-red-200' 
    },
  };
  
  const variant = variants[status] || variants.in_progress;
  const Icon = variant.icon;
  
  return (
    <Badge variant="outline" className={variant.className}>
      <Icon className="w-3 h-3 mr-1" />
      {variant.label}
    </Badge>
  );
}