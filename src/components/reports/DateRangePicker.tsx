
// FILE: src/components/reports/DateRangePicker.tsx

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { DateRange } from '@/helpers/report-helpers';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSelect = (range: any) => {
    if (range?.from && range?.to) {
      onChange({
        start: format(range.from, 'yyyy-MM-dd'),
        end: format(range.to, 'yyyy-MM-dd'),
      });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.start && value.end ? (
            <>
              {format(new Date(value.start), 'dd MMM yyyy', { locale: pt })} -{' '}
              {format(new Date(value.end), 'dd MMM yyyy', { locale: pt })}
            </>
          ) : (
            <span>{t('reports:dateRange.selectPeriod')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{
            from: new Date(value.start),
            to: new Date(value.end),
          }}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={pt}
        />
      </PopoverContent>
    </Popover>
  );
}