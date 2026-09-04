// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/contexts/LicenseContext.tsx
// ========================================
//
// Corrige o "flash" de modo standalone ao entrar numa licença connected:
// useLicense() era um hook simples (useState+useEffect próprios), por isso
// CADA componente que o chamava (LicenseGuard, HomePage, SettingsDialog,
// etc.) disparava a sua PRÓPRIA verificação assíncrona de licença do zero.
// LicenseGuard já esperava a sua cópia resolver antes de montar HomePage,
// mas a cópia independente do HomePage arrancava outra vez de license=null
// — nesse instante isConnected era false, renderizando o layout standalone
// até a sua própria chamada resolver. Um Context partilhado, montado uma
// vez acima de LicenseGuard, elimina a segunda verificação: quando
// LicenseGuard finalmente monta os filhos, o valor já está resolvido e
// qualquer consumidor (incluindo HomePage) lê-o de imediato, sem novo ciclo
// de loading.
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ValidatedLicense } from '@/lib/types/licence';
import { checkExistingLicense } from '@/helpers/license-helpers';

interface LicenseContextValue {
  license: ValidatedLicense | null;
  loading: boolean;
  error: string | null;
  checkLicense: () => Promise<void>;
  refreshLicense: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextValue | undefined>(undefined);

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [license, setLicense] = useState<ValidatedLicense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkLicense = useCallback(async () => {
    try {
      setLoading(true);
      const result = await checkExistingLicense();

      if (result.isValid) {
        setLicense(result);
        setError(null);
      } else {
        setError(result.error || 'Licença inválida');
        setLicense(null);
      }
    } catch (err) {
      console.error('Erro ao verificar licença:', err);
      setError('Erro ao verificar licença');
      setLicense(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega a licença (usada após activação) — mesma instância partilhada,
  // por isso qualquer componente que esteja a ler o Context vê o resultado.
  const refreshLicense = useCallback(async () => {
    await checkLicense();
  }, [checkLicense]);

  useEffect(() => {
    checkLicense();
  }, [checkLicense]);

  return (
    <LicenseContext.Provider value={{ license, loading, error, checkLicense, refreshLicense }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicenseContext(): LicenseContextValue {
  const ctx = useContext(LicenseContext);
  if (!ctx) {
    throw new Error('useLicenseContext deve ser usado dentro de <LicenseProvider>');
  }
  return ctx;
}
