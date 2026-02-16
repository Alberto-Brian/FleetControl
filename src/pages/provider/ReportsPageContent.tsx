
// FILE: src/pages/provider/ReportsPageContent.tsx

import React, { useState } from 'react';
import { ReportCard } from '@/components/reports/ReportCard';
import { GenerateReportDialog } from '@/components/reports/GenerateReportDialog';
import { useTranslation } from 'react-i18next';
import { Truck, MapPin, Fuel, Wrench, DollarSign, FileText } from 'lucide-react';
import type { ReportType } from '@/lib/pdf/pdf-generator-react';

export function ReportsPageContent() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);

  const reports = [
    { type: 'vehicles' as ReportType, icon: Truck },
    { type: 'trips' as ReportType, icon: MapPin },
    { type: 'fuel' as ReportType, icon: Fuel },
    { type: 'maintenance' as ReportType, icon: Wrench },
    { type: 'financial' as ReportType, icon: DollarSign },
    { type: 'general' as ReportType, icon: FileText },
  ];

  const handleGenerate = (type: ReportType) => {
    setSelectedReport(type);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('reports:title')}</h2>
        <p className="text-muted-foreground mt-2">{t('reports:description')}</p>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <ReportCard
            key={report.type}
            type={report.type}
            icon={report.icon}
            onGenerate={handleGenerate}
          />
        ))}
      </div>

      {/* Generate Dialog */}
      <GenerateReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reportType={selectedReport}
      />
    </div>
  );
}