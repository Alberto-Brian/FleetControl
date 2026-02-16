
// FILE: src/components/reports/ReportCard.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ReportType } from '@/lib/pdf/pdf-generator-react';
import { LucideIcon } from 'lucide-react';

interface ReportCardProps {
  type: ReportType;
  icon: LucideIcon;
  onGenerate: (type: ReportType) => void;
}

export function ReportCard({ type, icon: Icon, onGenerate }: ReportCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="mt-4">{t(`reports:types.${type}.title`)}</CardTitle>
        <CardDescription>{t(`reports:types.${type}.description`)}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full" 
          onClick={() => onGenerate(type)}
        >
          <Download className="w-4 h-4 mr-2" />
          {t('reports:actions.generate')}
        </Button>
      </CardContent>
    </Card>
  );
}