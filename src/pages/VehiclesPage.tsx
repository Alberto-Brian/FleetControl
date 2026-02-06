// ========================================
// FILE: src/pages/VehiclesPage.tsx (ou onde renderiza a rota)
// ========================================
import React from 'react';
import { VehiclesProvider } from '@/contexts/VehiclesContext';
import VehiclesPageContent from '@/pages/provider/VehiclesPageContent';

export default function VehiclesPage() {
  return (
    <VehiclesProvider>
      <VehiclesPageContent />
    </VehiclesProvider>
  );
}