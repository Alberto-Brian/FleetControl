// ========================================
// FILE: src/pages/DriversPage.tsx
// ========================================
import React from 'react';
import { DriversProvider } from '@/contexts/DriversContext';
import DriversPageContent from '@/pages/provider/DriversPageContent';

export default function DriversPage() {
  return (
    <DriversProvider>
      <DriversPageContent />
    </DriversProvider>
  );
}