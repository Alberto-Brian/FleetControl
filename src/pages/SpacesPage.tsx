import React, { useState } from 'react';
import { MapPin, Package, Building2, Filter, Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

const mockSpaces = [
  { id: '1', type: 'Contentor', number: '01', block: 'A', size: '40 pés', status: 'Ocupado', seller: 'João Silva', payment: 'Semanal', price: 15000, fixed: true, lastPayment: '03/01/2026' },
  { id: '2', type: 'Contentor', number: '02', block: 'A', size: '20 pés', status: 'Ocupado', seller: 'Carlos Mendes', payment: 'Semanal', price: 12000, fixed: true, lastPayment: '02/01/2026' },
  { id: '3', type: 'Contentor', number: '03', block: 'A', size: '40 pés', status: 'Disponível', seller: '-', payment: 'Semanal', price: 15000, fixed: true, lastPayment: '-' },
  { id: '4', type: 'Bancada', number: '05', block: 'B', size: '2x3m', status: 'Ocupado', seller: 'Maria Santos', payment: 'Diário', price: 2500, fixed: false, lastPayment: '06/01/2026' },
  { id: '5', type: 'Bancada', number: '06', block: 'B', size: '2x3m', status: 'Disponível', seller: '-', payment: 'Diário', price: 2500, fixed: false, lastPayment: '-' },
  { id: '6', type: 'Casota', number: '02', block: 'A', size: '3x4m', status: 'Ocupado', seller: 'Ana Costa', payment: 'Semanal', price: 8000, fixed: true, lastPayment: '30/12/2025' },
  { id: '7', type: 'Contentor', number: '08', block: 'E', size: '40 pés', status: 'Ocupado', seller: 'Sofia Lima', payment: 'Semanal', price: 16000, fixed: true, lastPayment: '07/01/2026' },
  { id: '8', type: 'Contentor', number: '12', block: 'C', size: '40 pés', status: 'Ocupado', seller: 'Carlos Mendes', payment: 'Semanal', price: 18000, fixed: true, lastPayment: '02/01/2026' },
  { id: '9', type: 'Bancada', number: '03', block: 'D', size: '2x3m', status: 'Ocupado', seller: 'Pedro Alves', payment: 'Diário', price: 2500, fixed: false, lastPayment: '05/01/2026' },
  { id: '10', type: 'Bancada', number: '12', block: 'C', size: '2x3m', status: 'Ocupado', seller: 'Isabel Rodrigues', payment: 'Diário', price: 2500, fixed: false, lastPayment: '04/01/2026' },
  { id: '11', type: 'Casota', number: '01', block: 'B', size: '3x4m', status: 'Ocupado', seller: 'Miguel Fernandes', payment: 'Semanal', price: 9000, fixed: true, lastPayment: '28/12/2025' },
  { id: '12', type: 'Contentor', number: '04', block: 'C', size: '20 pés', status: 'Manutenção', seller: '-', payment: 'Semanal', price: 12000, fixed: true, lastPayment: '-' },
  { id: '13', type: 'Contentor', number: '05', block: 'D', size: '40 pés', status: 'Ocupado', seller: 'Francisco Costa', payment: 'Semanal', price: 14000, fixed: false, lastPayment: '06/01/2026' },
  { id: '14', type: 'Bancada', number: '08', block: 'E', size: '2x3m', status: 'Disponível', seller: '-', payment: 'Diário', price: 2500, fixed: false, lastPayment: '-' },
  { id: '15', type: 'Casota', number: '03', block: 'C', size: '3x4m', status: 'Ocupado', seller: 'Teresa Alves', payment: 'Semanal', price: 8500, fixed: true, lastPayment: '05/01/2026' },
];

export default function SpacesPage() {
  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterBlock, setFilterBlock] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredSpaces = mockSpaces.filter(space => {
    const matchType = filterType === 'Todos' || space.type === filterType;
    const matchStatus = filterStatus === 'Todos' || space.status === filterStatus;
    const matchBlock = filterBlock === 'Todos' || space.block === filterBlock;
    const matchSearch = space.number.includes(searchTerm) || 
                        space.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        space.block.includes(searchTerm);
    return matchType && matchStatus && matchBlock && matchSearch;
  });

  const totalSpaces = mockSpaces.length;
  const occupied = mockSpaces.filter(s => s.status === 'Ocupado').length;
  const available = mockSpaces.filter(s => s.status === 'Disponível').length;
  const maintenance = mockSpaces.filter(s => s.status === 'Manutenção').length;
  const totalRevenue = mockSpaces.filter(s => s.status === 'Ocupado').reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestão de Espaços</h2>
          <p className="text-muted-foreground">Contentores, Bancadas e Casotas</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Espaço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total de Espaços</p>
          <p className="text-2xl font-bold">{totalSpaces}</p>
          <p className="text-xs text-muted-foreground mt-1">Todos os tipos</p>
        </div>
        <div className="bg-green-500/10 backdrop-blur-sm rounded-xl border border-green-500/20 p-4">
          <p className="text-sm text-green-600 mb-1">Ocupados</p>
          <p className="text-2xl font-bold text-green-600">{occupied}</p>
          <p className="text-xs text-muted-foreground mt-1">{Math.round((occupied/totalSpaces)*100)}% ocupação</p>
        </div>
        <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4">
          <p className="text-sm text-blue-600 mb-1">Disponíveis</p>
          <p className="text-2xl font-bold text-blue-600">{available}</p>
          <p className="text-xs text-muted-foreground mt-1">Prontos para uso</p>
        </div>
        <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl border border-yellow-500/20 p-4">
          <p className="text-sm text-yellow-600 mb-1">Manutenção</p>
          <p className="text-2xl font-bold text-yellow-600">{maintenance}</p>
          <p className="text-xs text-muted-foreground mt-1">Em reparo</p>
        </div>
        <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-purple-600 mb-1">Receita Potencial</p>
          <p className="text-2xl font-bold text-purple-600">{Math.round(totalRevenue/1000)}K</p>
          <p className="text-xs text-muted-foreground mt-1">AOA/período</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Pesquisar por número, vendedor ou bloco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Lista
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option>Todos</option>
            <option>Contentor</option>
            <option>Bancada</option>
            <option>Casota</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option>Todos</option>
            <option>Ocupado</option>
            <option>Disponível</option>
            <option>Manutenção</option>
          </select>
          <select 
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3 py-1.5 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option>Todos</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
            <option>E</option>
          </select>
          {(filterType !== 'Todos' || filterStatus !== 'Todos' || filterBlock !== 'Todos' || searchTerm) && (
            <button
              onClick={() => {
                setFilterType('Todos');
                setFilterStatus('Todos');
                setFilterBlock('Todos');
                setSearchTerm('');
              }}
              className="text-sm text-primary hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Lista de Espaços ({filteredSpaces.length})</h3>
          <div className="text-sm text-muted-foreground">
            {filteredSpaces.filter(s => s.status === 'Ocupado').length} ocupados
          </div>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="max-h-[600px] overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpaces.map((space) => (
                <div key={space.id} className="bg-background/50 rounded-lg border border-border p-4 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {space.type === 'Contentor' && <Package className="w-5 h-5 text-blue-500" />}
                      {space.type === 'Bancada' && <MapPin className="w-5 h-5 text-green-500" />}
                      {space.type === 'Casota' && <Building2 className="w-5 h-5 text-purple-500" />}
                      <div>
                        <span className="font-semibold">{space.type} {space.number}</span>
                        {space.fixed && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">Fixo</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      space.status === 'Ocupado' ? 'bg-green-500/10 text-green-600' :
                      space.status === 'Disponível' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {space.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bloco:</span>
                      <span className="font-medium">Bloco {space.block}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tamanho:</span>
                      <span className="font-medium">{space.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vendedor:</span>
                      <span className="font-medium truncate">{space.seller}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pagamento:</span>
                      <span className="font-medium">{space.payment}</span>
                    </div>
                    {space.lastPayment !== '-' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Último Pgto:</span>
                        <span className="font-medium text-xs">{space.lastPayment}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-bold text-primary">{space.price.toLocaleString()} AOA</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" />
                      Ver
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500/20 transition-colors text-sm flex items-center justify-center gap-1">
                      <Edit className="w-3 h-3" />
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            {filteredSpaces.map((space) => (
              <div key={space.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      space.type === 'Contentor' ? 'bg-blue-500/10' :
                      space.type === 'Bancada' ? 'bg-green-500/10' : 'bg-purple-500/10'
                    }`}>
                      {space.type === 'Contentor' && <Package className="w-6 h-6 text-blue-500" />}
                      {space.type === 'Bancada' && <MapPin className="w-6 h-6 text-green-500" />}
                      {space.type === 'Casota' && <Building2 className="w-6 h-6 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{space.type} {space.number}</h4>
                        <span className="text-sm text-muted-foreground">• Bloco {space.block}</span>
                        {space.fixed && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">Fixo</span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          space.status === 'Ocupado' ? 'bg-green-500/10 text-green-600' :
                          space.status === 'Disponível' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {space.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{space.size}</span>
                        <span>•</span>
                        <span>{space.seller}</span>
                        <span>•</span>
                        <span>Pagamento {space.payment}</span>
                        {space.lastPayment !== '-' && (
                          <>
                            <span>•</span>
                            <span>Último: {space.lastPayment}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">{space.price.toLocaleString()} AOA</p>
                      <p className="text-xs text-muted-foreground">{space.payment}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}