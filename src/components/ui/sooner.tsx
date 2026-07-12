"use client"

import React, { useState, useEffect } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react';

// Detecta o tema real da app (Electron — sem next-themes)
function useDocumentTheme(): 'dark' | 'light' {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark ? 'dark' : 'light';
}

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useDocumentTheme();

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      richColors
      expand={false}
      gap={8}
      offset={20}
      duration={4000}
      visibleToasts={5}
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info:    <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error:   <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:       'group !shadow-2xl !rounded-xl !text-[13px] !font-medium',
          title:       '!text-[13px] !font-semibold !leading-snug',
          description: '!text-[12px] !font-normal !opacity-80 !mt-0.5 !leading-snug',
          icon:        '!mt-0.5 !size-4',
          closeButton: [
            '!top-2.5 !right-2.5 !size-5 !rounded-lg',
            '!opacity-50 hover:!opacity-100',
            '!bg-transparent !border-0',
            '!transition-opacity',
          ].join(' '),
          actionButton:  '!rounded-lg !text-xs !font-semibold !h-7 !px-3',
          cancelButton:  '!rounded-lg !text-xs !h-7 !px-3',
        },
      }}
      style={
        {
          '--width':         '360px',
          '--border-radius': '12px',
          '--font-size':     '13px',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
