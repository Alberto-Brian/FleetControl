// ========================================
// FILE: src/pages/TripsPage.tsx (ATUALIZADO)
// ========================================
import React from 'react';
import { TripsProvider } from '@/contexts/TripsContext';
import TripsPageContent from '@/pages/provider/TripsPageContent';

export default function TripsPage() {
  return (
    <TripsProvider>
      <TripsPageContent />
    </TripsProvider>
  );
}