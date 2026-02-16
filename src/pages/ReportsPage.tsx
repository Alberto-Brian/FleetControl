
// FILE: src/pages/ReportsPage.tsx

import React from 'react';
import { ReportsProvider } from '@/contexts/ReportsContext';
import { ReportsPageContent } from './provider/ReportsPageContent';

export default function ReportsPage() {
  return (
    <ReportsProvider>
      <ReportsPageContent />
    </ReportsProvider>
  );
}
