import React, { useState } from 'react';
import { Plus, Search, LayoutGrid, List, Filter, Download } from 'lucide-react';
import BlockCard from '@/components/BlockCard';

// Tipagem baseada no que foi usado no BlockCard
interface Block {
  id: string;
  name: string;
  containers: number;
  booths: number;
  huts: number;
}

/**
 * BlocksPage - Versão Melhorada
 * 
 * Melhorias:
 * 1. Dashboard Header: Título claro com contagem total e ações rápidas.
 * 2. Barra de Ferramentas: Pesquisa integrada e alternador de visualização (Grid/Lista).
 * 3. Estatísticas Rápidas: Resumo visual do inventário total no topo.
 * 4. Layout Responsivo: Grid que se adapta perfeitamente a diferentes ecrãs.
 * 5. Estados Vazios: Tratamento visual para quando não há resultados.
 */
export default function BlocksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dados de exemplo (Mock)
  const [blocks] = useState<Block[]>([
    { id: '1', name: 'Bloco Norte - Setor A', containers: 12, booths: 45, huts: 8 },
    { id: '2', name: 'Bloco Sul - Setor B', containers: 8, booths: 32, huts: 15 },
    { id: '3', name: 'Zona Industrial C', containers: 24, booths: 12, huts: 4 },
    { id: '4', name: 'Terminal Logístico D', containers: 40, booths: 80, huts: 20 },
  ]);

  const filteredBlocks = blocks.filter(block => 
    block.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculos para o resumo
  const totals = blocks.reduce((acc, curr) => ({
    containers: acc.containers + curr.containers,
    booths: acc.booths + curr.booths,
    huts: acc.huts + curr.huts,
  }), { containers: 0, booths: 0, huts: 0 });

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Blocos</h1>
          <p className="text-muted-foreground">
            Administre e monitorize o inventário de todos os setores ativos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-bold shadow-sm">
            <Plus className="w-4 h-4" />
            Novo Bloco
          </button>
        </div>
      </div>

      {/* Cartões de Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Total Contentores" value={totals.containers} color="bg-blue-500" />
        <SummaryCard label="Total Bancadas" value={totals.booths} color="bg-emerald-500" />
        <SummaryCard label="Total Casotas" value={totals.huts} color="bg-orange-500" />
      </div>

      {/* Barra de Ferramentas e Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/50 p-4 rounded-xl border border-border backdrop-blur-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Pesquisar blocos por nome..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-background border border-border rounded-lg p-1">
            <button className="p-1.5 rounded-md bg-accent text-accent-foreground shadow-sm">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium ml-auto sm:ml-0">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>
      </div>

      {/* Grid de Blocos */}
      {filteredBlocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredBlocks.map(block => (
            <BlockCard 
              key={block.id} 
              block={block} 
              onClick={() => console.log('Abrir bloco:', block.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border rounded-3xl">
          <div className="p-4 rounded-full bg-muted">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Nenhum bloco encontrado</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Não encontrámos nenhum resultado para "{searchTerm}". Tente ajustar a sua pesquisa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
      <div className={`w-2 h-10 rounded-full ${color}`} />
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
