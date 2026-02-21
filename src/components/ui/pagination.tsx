// ========================================
// FILE: src/components/ui/pagination.tsx
// ========================================
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  // Opções de itens por página — padrão razoável para listas densas
  limitOptions?: number[];
  className?: string;
}

const DEFAULT_LIMIT_OPTIONS = [10, 20, 50, 100];

export function Pagination({
  pagination,
  onPageChange,
  onLimitChange,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  className,
}: PaginationProps) {
  const { total, page, limit, totalPages, hasNextPage, hasPrevPage } = pagination;

  // Calcula o intervalo de registos visível — ex: "21 – 40 de 150"
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Gera os números de página a mostrar — máximo 5 visíveis com reticências
  function getPageNumbers(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (page > 3) pages.push('...');

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push('...');

    pages.push(totalPages);

    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-card rounded-2xl border border-muted/50 shadow-sm",
      className
    )}>

      {/* Esquerda — info de registos + controlo de limite */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="font-medium whitespace-nowrap">
          {total === 0
            ? 'Nenhum registo'
            : `${from.toLocaleString('pt-PT')} – ${to.toLocaleString('pt-PT')} de ${total.toLocaleString('pt-PT')}`}
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap hidden sm:inline">por página</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => onLimitChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs bg-muted/30 border-none focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Direita — navegação de páginas */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Primeira página */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => onPageChange(1)}
            disabled={!hasPrevPage}
            title="Primeira página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>

          {/* Página anterior */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevPage}
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Números de página */}
          <div className="flex items-center gap-0.5">
            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground"
                >
                  ···
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'ghost'}
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-bold",
                    p === page
                      ? "shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => onPageChange(p as number)}
                >
                  {p}
                </Button>
              )
            )}
          </div>

          {/* Página seguinte */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            title="Página seguinte"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Última página */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}