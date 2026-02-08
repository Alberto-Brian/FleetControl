// src/pages/FuelPage.tsx
import React from 'react';
import { RefuelingsProvider } from '@/contexts/RefuelingsContext';
import FuelPageContent from '@/pages/provider/FuelPageContent';

export default function FuelPage() {
  return (
    <RefuelingsProvider>
      <FuelPageContent />
    </RefuelingsProvider>
  );
}