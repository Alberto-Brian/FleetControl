import React, { useState, useEffect } from 'react';
import { LicenseActivationDialog } from '@/components/LicenseActivationDialog';
import { useLicense } from "@/hooks/useLicense";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export function LicenseGuard({ children }: { children: React.ReactNode }) {
  const { license, loading, refreshLicense } = useLicense();
  const { toast } = useToast();
  const [showLicense, setShowLicense] = useState(false);

  // Actualiza o estado do dialog quando a licença muda
  useEffect(() => {
    if (!loading && (!license || !license.isValid)) {
      setShowLicense(true);
    } else if (license?.isValid) {
      setShowLicense(false);
    }
  }, [license, loading]);

  const handleSuccess = async () => {
    try {
      // Recarrega a licença
      await refreshLicense();
      
      // Fecha o dialog
      setShowLicense(false);
      
      // Mostra toast de sucesso
      toast({
        title: "✅ Licença activada com sucesso!",
        description: "O sistema foi activado e está pronto para uso.",
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao recarregar licença:', error);
      toast({
        title: "⚠️ Aviso",
        description: "Licença activada mas houve erro ao recarregar. Reinicie o sistema.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Verificando licença...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LicenseActivationDialog 
        open={showLicense}
        onOpenChange={setShowLicense}
        onSuccess={handleSuccess}
      />
      {children}
    </>
  );
}