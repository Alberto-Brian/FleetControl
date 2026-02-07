// ========================================
// FILE: src/pages/VehiclesPage.tsx
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