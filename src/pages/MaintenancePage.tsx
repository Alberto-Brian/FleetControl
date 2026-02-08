// ========================================
// FILE: src/pages/MaintenancePage.tsx (ATUALIZADO - WRAPPER)
// ========================================
import React from 'react';
import { MaintenancesProvider } from '@/contexts/MaintenancesContext';
import MaintenancePageContent from '@/pages/provider/MaintenancePageContent';

export default function MaintenancePage() {
  return (
    <MaintenancesProvider>
      <MaintenancePageContent />
    </MaintenancesProvider>
  );
}