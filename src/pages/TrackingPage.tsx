// ========================================
// FILE: src/pages/TrackingPage.tsx
// ========================================
import React from 'react';
// import { TrackingProvider } from '@/contexts/TrackingContext';
import { TrackingPageContent } from '@/pages/provider/TrackingPageContent';

export default function TrackingPage() {
  return (
    // <TrackingProvider>
      <TrackingPageContent />
    // </TrackingProvider>
  );
}