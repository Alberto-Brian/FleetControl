
// FILE: src/components/reports/GenerateReportDialog.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from './DateRangePicker';
import { useTranslation } from 'react-i18next';
import { useReports } from '@/contexts/ReportsContext';
import { generateReport, getPresetDateRanges, validateDateRange } from '@/helpers/report-helpers';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Download, Eye, Printer, Calendar as CalendarIcon } from 'lucide-react';
import type { ReportType } from '@/lib/pdf/pdf-generator-react';
import type { DateRange } from '@/lib/types/reports'
interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportType | null;
}

export function GenerateReportDialog({ open, onOpenChange, reportType }: GenerateReportDialogProps) {
  const { t } = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();
  const { state, setDateRange, setGenerating, setError } = useReports();
  const [selectedPreset, setSelectedPreset] = useState<string>('thisMonth');

  const presets = getPresetDateRanges();

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      setDateRange(presets[preset as keyof typeof presets]);
    }
  };

  const handleGenerate = async (action: 'download' | 'preview' | 'print') => {
    if (!reportType) return;

    try {
      validateDateRange(state.dateRange);
      setGenerating(true);
      
      await generateReport(reportType, state.dateRange, action);
      
      showSuccess(t('reports:toast.success'));
      onOpenChange(false);
    } catch (error: any) {
      handleError(error, t('reports:toast.error'));
      setError(error.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!reportType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {t('reports:dialog.title')} - {t(`reports:types.${reportType}.title`)}
          </DialogTitle>
          <DialogDescription>
            {t(`reports:types.${reportType}.description`)}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedPreset} onValueChange={handlePresetChange} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">{t('reports:dateRange.presets.today')}</TabsTrigger>
            <TabsTrigger value="thisMonth">{t('reports:dateRange.presets.thisMonth')}</TabsTrigger>
            <TabsTrigger value="last30Days">{t('reports:dateRange.presets.last30Days')}</TabsTrigger>
            <TabsTrigger value="custom">{t('reports:dateRange.presets.custom')}</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPreset} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('reports:dateRange.title')}</label>
              <DateRangePicker value={state.dateRange} onChange={setDateRange} />
            </div>

            {state.error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                {state.error}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleGenerate('preview')}
            disabled={state.isGenerating}
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('reports:actions.preview')}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleGenerate('print')}
            disabled={state.isGenerating}
          >
            <Printer className="w-4 h-4 mr-2" />
            {t('reports:actions.print')}
          </Button>
          <Button onClick={() => handleGenerate('download')} disabled={state.isGenerating}>
            <Download className="w-4 h-4 mr-2" />
            {state.isGenerating ? t('reports:dialog.generating') : t('reports:actions.download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}