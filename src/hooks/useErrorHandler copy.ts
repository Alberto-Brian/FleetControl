// ========================================
// FILE: src/hooks/useErrorHandler.ts (CORRIGIDO)
// ========================================
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AppError, isAppError } from '@/lib/errors/AppError';
import { extractAppError } from '@/helpers/error-helpers';

/**
 * Hook para tratamento consistente de erros com Sonner
 * Suporta toasts com botões de acção e loading states
 */
export function useErrorHandler() {
  const { t } = useTranslation();

  /**
   * Trata erros vindos do IPC ou da aplicação
   * @param error - Erro capturado
   * @param fallbackKey - Chave i18n de fallback
   * @param onAction - Callback que retorna Promise para quando o usuário clicar na acção
   * @returns O AppError extraído ou null
   */
  const handleError = (
    error: unknown, 
    fallbackKey?: string,
    onAction?: (actionType: string, actionData?: any) => Promise<void>
  ): AppError | null => {
    // Tenta extrair AppError do erro IPC
    const appError = extractAppError(error);
    
    if (appError) {
      // Erro estruturado - usa o tipo para escolher o toast correto
      const i18nPlaceholders = appError.data?.i18n || {};
      const message = t(appError.i18nKey, i18nPlaceholders);
      
      // Extrai duração se existir (em ms)
      const duration = appError.data?.duration;
      
      // Monta opções do toast
      const options: any = {};
      if (duration) options.duration = duration;
      
      // ✨ CORRIGIDO: Adiciona botão de acção com loading state
      if (appError.data?.action && onAction) {
        const actionConfig = appError.data.action;
        const actionType = actionConfig.type;
        const actionData = actionConfig.data;
        
        options.action = {
          label: t(actionConfig.label),
          onClick: () => {
            // ✨ Usa toast.promise para mostrar loading durante a acção
            toast.promise(
              onAction(actionType, actionData),
              {
                loading: t(actionConfig.loadingLabel || 'common:loading'),
                success: t(actionConfig.successLabel || 'common:success'),
                error: (err) => {
                  // Extrai mensagem de erro se for AppError
                  const errorMsg = extractAppError(err);
                  return errorMsg 
                    ? t(errorMsg.i18nKey, errorMsg.data?.i18n)
                    : t(actionConfig.errorLabel || 'common:error');
                }
              }
            );
          }
        };
      }
      
      // ✨ Adiciona botão de cancelar se existir
      if (appError.data?.cancel) {
        const cancelConfig = appError.data.cancel;
        options.cancel = {
          label: t(cancelConfig.label),
          onClick: () => {} // Apenas fecha o toast
        };
      }
      
      switch (appError.type) {
        case 'success':
          toast.success(message, options);
          break;
        case 'warning':
          toast.warning(message, options);
          break;
        case 'info':
          toast.info(message, options);
          break;
        case 'error':
          toast.error(message, options);
          break;
        default:
          toast(message, options);
          break;
      }
      
      return appError;
    }

    // Erro genérico - usa fallback
    const message = error instanceof Error ? error.message : String(error);
    const displayMessage = fallbackKey ? t(fallbackKey) : message;
    toast.error(displayMessage);
    
    return null;
  };

  /**
   * Exibe toast de sucesso
   */
  const showSuccess = (i18nKey: string, placeholders?: Record<string, any>, duration?: number) => {
    toast.success(t(i18nKey, placeholders), duration ? { duration } : undefined);
  };
  
  /**
   * Exibe toast de erro
   */
  const showError = (i18nKey: string, placeholders?: Record<string, any>, duration?: number) => {
    toast.error(t(i18nKey, placeholders), duration ? { duration } : undefined);
  };

  /**
   * Exibe toast de aviso
   */
  const showWarning = (i18nKey: string, placeholders?: Record<string, any>, duration?: number) => {
    toast.warning(t(i18nKey, placeholders), duration ? { duration } : undefined);
  };

  /**
   * Exibe toast de informação
   */
  const showInfo = (i18nKey: string, placeholders?: Record<string, any>, duration?: number) => {
    toast.info(t(i18nKey, placeholders), duration ? { duration } : undefined);
  };

  /**
   * ✨ NOVO: Exibe toast com botão de acção customizado e loading
   */
  const showWithAction = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    actionLabel: string,
    onActionClick: () => Promise<void>,
    options?: {
      duration?: number;
      cancelLabel?: string;
      loadingLabel?: string;
      successLabel?: string;
      errorLabel?: string;
    }
  ) => {
    const toastOptions: any = {
      duration: options?.duration,
      action: {
        label: actionLabel,
        onClick: () => {
          toast.promise(
            onActionClick(),
            {
              loading: options?.loadingLabel || t('common:loading'),
              success: options?.successLabel || t('common:success'),
              error: options?.errorLabel || t('common:error')
            }
          );
        }
      }
    };

    if (options?.cancelLabel) {
      toastOptions.cancel = {
        label: options.cancelLabel,
        onClick: () => {}
      };
    }

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
    }
  };

  return {
    handleError,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showWithAction,
  };
}