// ========================================
// FILE: src/components/driver/ViewDriverDialog.tsx
// ========================================
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle } from 'lucide-react';

interface ViewDriverDialogProps {
  driver: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewDriverDialog({ driver, open, onOpenChange }: ViewDriverDialogProps) {
  if (!driver) return null;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Activo', variant: 'default' as const },
      on_leave: { label: 'Afastado', variant: 'secondary' as const },
      terminated: { label: 'Demitido', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const isLicenseExpiring = (expiryDate: string): boolean => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isLicenseExpired = (expiryDate: string): boolean => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{driver.name}</DialogTitle>
            {getStatusBadge(driver.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alerta de CNH */}
          {(isLicenseExpiring(driver.license_expiry_date) || isLicenseExpired(driver.license_expiry_date)) && (
            <div className={`flex items-center gap-2 p-3 rounded-md ${
              isLicenseExpired(driver.license_expiry_date)
                ? 'bg-destructive/10 text-destructive'
                : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                {isLicenseExpired(driver.license_expiry_date)
                  ? 'CNH EXPIRADA! Renovação urgente necessária.'
                  : 'CNH expira em breve. Providencie a renovação.'}
              </span>
            </div>
          )}

          {/* Informações Pessoais */}
          <div>
            <h3 className="font-semibold mb-3">Informações Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{driver.name}</p>
              </div>
              {driver.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{driver.phone}</p>
                </div>
              )}
              {driver.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{driver.email}</p>
                </div>
              )}
              {driver.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{driver.address}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações da CNH */}
          <div>
            <h3 className="font-semibold mb-3">Carteira Nacional de Habilitação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Número da CNH</p>
                <p className="font-medium">{driver.license_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">{driver.license_category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Validade</p>
                <p className="font-medium">
                  {new Date(driver.license_expiry_date).toLocaleDateString('pt-AO')}
                </p>
              </div>
              {driver.license_issue_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Emissão</p>
                  <p className="font-medium">
                    {new Date(driver.license_issue_date).toLocaleDateString('pt-AO')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações de Emprego */}
          <div>
            <h3 className="font-semibold mb-3">Informações de Emprego</h3>
            <div className="grid grid-cols-2 gap-4">
              {driver.hire_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Admissão</p>
                  <p className="font-medium">
                    {new Date(driver.hire_date).toLocaleDateString('pt-AO')}
                  </p>
                </div>
              )}
              {driver.employee_id && (
                <div>
                  <p className="text-sm text-muted-foreground">ID do Funcionário</p>
                  <p className="font-medium">{driver.employee_id}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                <p className="font-medium">
                  {new Date(driver.created_at).toLocaleDateString('pt-AO')}
                </p>
              </div>
            </div>
          </div>

          {driver.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{driver.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}