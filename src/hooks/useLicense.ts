import { useState, useEffect, useCallback } from 'react';
import type { ValidatedLicense } from '@/lib/types/licence'; 
import { checkExistingLicense } from '@/helpers/license-helpers';

export function useLicense() {
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

  // Função para recarregar a licença (usada após ativação)
  const refreshLicense = useCallback(async () => {
    await checkLicense();
  }, [checkLicense]);

  // Verifica a licença ao montar o componente
  useEffect(() => {
    checkLicense();
  }, [checkLicense]);

  return { 
    license, 
    loading, 
    error, 
    checkLicense,
    refreshLicense 
  };
}