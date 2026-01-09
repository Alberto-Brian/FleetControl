import React, { useState } from 'react';
import { Users, Search, Plus, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';

const mockSellers = [
  { id: '1', name: 'João Silva', phone: '+244 923 456 789', email: 'joao@email.com', block: 'A', space: 'Contentor 01', status: 'Ativo', debt: 0 },
  { id: '2', name: 'Maria Santos', phone: '+244 924 567 890', email: 'maria@email.com', block: 'B', space: 'Bancada 05', status: 'Ativo', debt: 2500 },
  { id: '3', name: 'Carlos Mendes', phone: '+244 925 678 901', email: 'carlos@email.com', block: 'C', space: 'Contentor 12', status: 'Ativo', debt: 0 },
  { id: '4', name: 'Ana Costa', phone: '+244 926 789 012', email: 'ana@email.com', block: 'A', space: 'Casota 02', status: 'Pendente', debt: 8000 },
  { id: '5', name: 'Pedro Alves', phone: '+244 927 890 123', email: 'pedro@email.com', block: 'D', space: 'Bancada 03', status: 'Ativo', debt: 0 },
  { id: '6', name: 'Sofia Lima', phone: '+244 928 901 234', email: 'sofia@email.com', block: 'E', space: 'Contentor 08', status: 'Ativo', debt: 0 },
  { id: '7', name: 'Miguel Fernandes', phone: '+244 929 012 345', email: 'miguel@email.com', block: 'B', space: 'Casota 01', status: 'Atrasado', debt: 17000 },
  { id: '8', name: 'Isabel Rodrigues', phone: '+244 930 123 456', email: 'isabel@email.com', block: 'C', space: 'Bancada 12', status: 'Ativo', debt: 0 },
];

export default function SellersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredSellers = mockSellers.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.phone.includes(searchTerm) ||
    seller.block.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestão de Vendedores</h2>
          <p className="text-muted-foreground">{mockSellers.length} vendedores cadastrados</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Vendedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold">{mockSellers.length}</p>
        </div>
        <div className="bg-green-500/10 backdrop-blur-sm rounded-xl border border-green-500/20 p-4">
          <p className="text-sm text-green-600 mb-1">Ativos</p>
          <p className="text-2xl font-bold text-green-600">{mockSellers.filter(s => s.status === 'Ativo').length}</p>
        </div>
        <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl border border-yellow-500/20 p-4">
          <p className="text-sm text-yellow-600 mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">{mockSellers.filter(s => s.status === 'Pendente').length}</p>
        </div>
        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20 p-4">
          <p className="text-sm text-red-600 mb-1">Atrasados</p>
          <p className="text-2xl font-bold text-red-600">{mockSellers.filter(s => s.status === 'Atrasado').length}</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Pesquisar vendedor por nome, telefone ou bloco..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Lista de Vendedores</h3>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {filteredSellers.map((seller) => (
            <div key={seller.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{seller.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        seller.status === 'Ativo' ? 'bg-green-500/10 text-green-600' :
                        seller.status === 'Pendente' ? 'bg-yellow-500/10 text-yellow-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {seller.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{seller.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{seller.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Bloco {seller.block} - {seller.space}</span>
                      </div>
                      {seller.debt > 0 && (
                        <div className="flex items-center gap-2 text-red-600">
                          <span className="font-medium">Dívida: {seller.debt.toLocaleString()} AOA</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}