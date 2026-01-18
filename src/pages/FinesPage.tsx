// src/pages/FinesPage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, Plus, Search, DollarSign, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import NewFineDialog from '@/components/fine/NewFineDialog';
import { getAllFines } from '@/helpers/fine-helpers';

export default function FinesPage() {
  const { toast } = useToast();
  const [fines, setFines] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFines();
  }, []);

  async function loadFines() {
    setIsLoading(true);
    try {
      const data = await getAllFines();
      setFines(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar multas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredFines = fines.filter(f =>
    f.fine_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.vehicle_license?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.infraction_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getStatusBadge(status: string) {
    const map = {
      pending: { label: 'Pendente', variant: 'destructive' as const },
      paid: { label: 'Paga', variant: 'default' as const },
      contested: { label: 'Contestada', variant: 'secondary' as const },
      cancelled: { label: 'Cancelada', variant: 'outline' as const },
    };
    const s = map[status as keyof typeof map] || map.pending;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  }

  const totalFines = fines.reduce((sum, f) => sum + (f.fine_amount || 0), 0);
  const pendingFines = fines.filter(f => f.status === 'pending').length;
  const paidFines = fines.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.fine_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Multas de Trânsito</h2>
          <p className="text-muted-foreground">
            {pendingFines} multa{pendingFines !== 1 ? 's' : ''} pendente{pendingFines !== 1 ? 's' : ''}
          </p>
        </div>
        <NewFineDialog onFineCreated={(fine) => {
          setFines([fine, ...fines]);
        }} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total em Multas</p>
              <p className="text-2xl font-bold">{totalFines.toLocaleString('pt-AO')} Kz</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Multas Pendentes</p>
              <p className="text-2xl font-bold">{pendingFines}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pago</p>
              <p className="text-2xl font-bold">{paidFines.toLocaleString('pt-AO')} Kz</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por nº do auto, veículo ou infração..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFines.map((fine) => (
            <Card key={fine.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    fine.status === 'pending' ? 'bg-red-100 dark:bg-red-950' : 'bg-gray-100 dark:bg-gray-950'
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      fine.status === 'pending' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{fine.infraction_type}</h3>
                    <p className="text-sm text-muted-foreground">
                      Auto nº {fine.fine_number} • {fine.vehicle_license}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fine.driver_name && `Motorista: ${fine.driver_name} • `}
                      {new Date(fine.fine_date).toLocaleDateString('pt-AO')}
                    </p>
                    {fine.location && (
                      <p className="text-xs text-muted-foreground">Local: {fine.location}</p>
                    )}
                    {fine.points && (
                      <Badge variant="outline" className="mt-2">{fine.points} pontos</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{fine.fine_amount.toLocaleString('pt-AO')} Kz</p>
                  {getStatusBadge(fine.status)}
                  {fine.due_date && fine.status === 'pending' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Vence: {new Date(fine.due_date).toLocaleDateString('pt-AO')}
                    </p>
                  )}
                </div>
              </div>

              {fine.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Marcar como Paga
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Contestar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}