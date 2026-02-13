// ========================================
// FILE: src/pages/FinesPage.tsx (ATUALIZADO COM PROVIDER)
// ========================================
import React from 'react';
import { FinesProvider } from '@/contexts/FinesContext';
import FinesPageContent from '@/pages/provider/FinesPageContent';

export default function FinesPage() {
  return (
    <FinesProvider>
      <FinesPageContent />
    </FinesProvider>
  );
}