// src/pages/ExpensesPage.tsx
import React from 'react';
import { ExpensesProvider } from '@/contexts/ExpensesContext';
import ExpensesPageContent from '@/pages/provider/ExpensesPageContent';

export default function ExpensesPage() {
  return (
    <ExpensesProvider>
      <ExpensesPageContent />
    </ExpensesProvider>
  );
}