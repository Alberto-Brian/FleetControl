// ========================================
// FILE: src/components/ui/searchable-select.tsx
// ========================================
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string;
  // O que aparece na lista
  label: React.ReactNode;
  // Texto usado para pesquisa (string simples, sem JSX)
  searchText: string;
  // O que aparece no trigger quando selecionado (opcional, usa label se não definido)
  selectedLabel?: React.ReactNode;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  // Permite um item "nenhum" opcional
  noneOption?: { value: string; label: string };
  // Largura mínima do popover em pixels — útil quando o trigger está em colunas estreitas
  // Sem este valor, o popover usa a largura do trigger (comportamento padrão do Radix)
  popoverMinWidth?: number;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Selecionar...',
  searchPlaceholder = 'Pesquisar...',
  emptyMessage = 'Nenhum resultado encontrado.',
  disabled = false,
  className,
  noneOption,
  popoverMinWidth,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filtra opções com base no texto de pesquisa
  const filtered = options.filter((opt) =>
    opt.searchText.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find((opt) => opt.value === value);
  const isNoneSelected = noneOption && value === noneOption.value;

  function handleSelect(val: string) {
    onValueChange(val);
    setOpen(false);
    setSearch('');
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch('');
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">
            {isNoneSelected
              ? noneOption!.label
              : selected
              ? (selected.selectedLabel ?? selected.label)
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 shadow-xl border border-border rounded-lg overflow-hidden"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        // Correcção do Radix que bloqueia eventos wheel por padrão
        onWheel={(e) => e.stopPropagation()}
        style={
          popoverMinWidth
            ? { width: `max(var(--radix-popover-trigger-width), ${popoverMinWidth}px)` }
            : { width: 'var(--radix-popover-trigger-width)' }
        }
      >
        {/* Campo de pesquisa */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {/* Badge com contagem de resultados */}
          <span className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 transition-colors",
            search
              ? filtered.length === 0
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            {filtered.length}
          </span>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Lista com scroll nativo */}
        <div className="overflow-y-auto max-h-[240px] p-1 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground">
          {/* Opção "nenhum" opcional */}
          {noneOption && !search && (
            <button
              type="button"
              onClick={() => handleSelect(noneOption.value)}
              className={cn(
                'flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm text-left transition-colors',
                'hover:bg-accent hover:text-accent-foreground text-muted-foreground italic',
                isNoneSelected && 'bg-accent/50'
              )}
            >
              <span className="flex-1">{noneOption.label}</span>
              {isNoneSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          )}

          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            filtered.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm text-left transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-accent/50 font-medium'
                  )}
                >
                  <span className="flex-1">{opt.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}