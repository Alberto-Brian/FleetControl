import React from 'react';
import { Badge }  from '@/components/ui/badge';

interface VehicleStatusBadgeProps {
  status: 'active' | 'maintenance' | 'inactive';
}

export default function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  const variants = {
    active: { 
      label: 'Em Operação', 
      className: 'bg-green-100 text-green-700 border-green-200' 
    },
    maintenance: { 
      label: 'Manutenção', 
      className: 'bg-orange-100 text-orange-700 border-orange-200' 
    },
    inactive: { 
      label: 'Inativo', 
      className: 'bg-gray-100 text-gray-700 border-gray-200' 
    },
  };
  
  const variant = variants[status] || variants.inactive;
  
  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}