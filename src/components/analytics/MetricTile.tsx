import React, { useRef, useState, useEffect } from 'react';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';

export function MetricTile({
  label,
  value,
  icon: Icon,
  colorClass,
  rawValue,
  suffix = '',
}: {
  label:      string;
  value:      string;
  icon:       React.ElementType;
  colorClass: string;
  rawValue?:  number;
  suffix?:    string;
}) {
  const labelRef = useRef<HTMLParagraphElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);
  const [labelTruncated, setLabelTruncated] = useState(false);
  const [valueTruncated, setValueTruncated] = useState(false);

  useEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    const check = () => setLabelTruncated(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [label]);

  useEffect(() => {
    const el = valueRef.current;
    if (!el) return;
    const check = () => setValueTruncated(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value]);

  const isAbbreviated      = rawValue !== undefined && rawValue >= 1_000;
  const textSize           = rawValue !== undefined && rawValue >= 10_000 ? 'text-sm' : 'text-base';
  const fullValue          = isAbbreviated
    ? `${rawValue!.toLocaleString('pt-PT')}${suffix ? ' ' + suffix : ''}`
    : undefined;

  const showValueInTooltip = isAbbreviated || valueTruncated;
  const tooltipValue       = fullValue ?? value;
  const showTooltip        = labelTruncated || showValueInTooltip;

  // Sempre renderizar o wrapper para os refs e ResizeObservers não perderem os seus elementos
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 cursor-default">
            <div className={`p-2 rounded-lg bg-background ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p
                ref={labelRef}
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight truncate"
              >
                {label}
              </p>
              <p ref={valueRef} className={`${textSize} font-black leading-tight truncate`}>
                {value}
              </p>
            </div>
          </div>
        </TooltipTrigger>
        {showTooltip && (
          <TooltipContent side="top" className="px-3 py-2.5 min-w-[120px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 leading-tight">
              {label}
            </p>
            {showValueInTooltip && (
              <p className="text-sm font-black tabular-nums leading-tight">{tooltipValue}</p>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
