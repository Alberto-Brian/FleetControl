import React from 'react';
import { Building2, Box, LayoutGrid, Home, ArrowRight } from 'lucide-react';

interface Block {
  id: string;
  name: string;
  containers: number;
  booths: number;
  huts: number;
}

interface BlockCardProps {
  block: Block;
  onClick: () => void;
}

/**
 * BlockCard - Versão Melhorada
 * 
 * Melhorias:
 * 1. Hierarquia Visual: Título mais proeminente e ícones específicos para cada métrica.
 * 2. Feedback Visual: Efeito de gradiente no hover e animação do ícone de seta.
 * 3. Badges e Cores: Uso de cores semânticas e badges para destacar os números.
 * 4. Layout: Grid interno para melhor organização das estatísticas.
 */
export default function BlockCard({ block, onClick }: BlockCardProps) {
  return (
    <div 
      onClick={onClick}
      className="group relative overflow-hidden bg-card hover:bg-accent/5 transition-all duration-300 rounded-2xl border border-border hover:border-primary/40 p-5 shadow-sm hover:shadow-xl cursor-pointer"
    >
      {/* Efeito de Gradiente Sutil no Canto */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />

      <div className="relative flex flex-col h-full">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
              {block.name}
            </h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              ID: {block.id.slice(0, 8)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Estatísticas em Grid */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <StatItem 
            icon={<Box className="w-4 h-4" />} 
            label="Contentores" 
            value={block.containers} 
            color="text-blue-500"
          />
          <StatItem 
            icon={<LayoutGrid className="w-4 h-4" />} 
            label="Bancadas" 
            value={block.booths} 
            color="text-emerald-500"
          />
          <StatItem 
            icon={<Home className="w-4 h-4" />} 
            label="Casotas" 
            value={block.huts} 
            color="text-orange-500"
          />
        </div>

        {/* Rodapé / Call to Action */}
        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            Ver detalhes do bloco
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatItem({ icon, label, value, color }: StatItemProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className={`${color} bg-current/10 p-1.5 rounded-md`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </div>
  );
}
