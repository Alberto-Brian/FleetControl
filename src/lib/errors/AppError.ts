// ========================================
// FILE: src/lib/errors/AppError.ts
// ========================================

/**
 * Tipos de erro mapeados para os tipos do Sonner
 */
export type ErrorType = 'success' | 'error' | 'warning' | 'info';

/**
 * Tipos para o formato de data
 */
interface AppErrorData {
  i18n?: Record<string, string | number>;
  [key: string]: any;
}


/**
 * Classe de erro customizada para a aplicação
 * Otimizada para trabalhar com Electron IPC + Sonner
 */
export class AppError extends Error {
  type: ErrorType;
  i18nKey: string;
  action?: string;
  data?: any;

  constructor(params: {
    i18nKey: string;
    type?: ErrorType;
    action?: string;
    data?: AppErrorData;
  }) {
    // Usa a chave i18n como mensagem (será traduzida no componente)
    super(params.i18nKey);
    
    this.name = 'AppError';
    this.i18nKey = params.i18nKey;
    this.type = params.type || 'error';
    this.action = params.action;
    this.data = params.data;

    // Mantém o stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Serializa o erro para envio via IPC
   * Formato: "APP_ERROR||tipo||chave||acao||dados"
   * Usa || como delimitador para não conflitar com : das chaves i18n
   */
  toIpcString(): string {
    const parts = [
      'APP_ERROR',
      this.type,
      this.i18nKey,
      this.action || '',
      this.data ? JSON.stringify(this.data) : ''
    ];
    return parts.join('||');
  }

  /**
   * Deserializa um erro vindo do IPC
   */
  static fromIpcString(errorStr: string): AppError | null {
    // Verifica se é AppError serializado
    if (!errorStr.includes('APP_ERROR||')) {
      return null;
    }

    // Remove prefixo e divide
    const parts = errorStr.split('||');
    
    // Encontra o índice de APP_ERROR
    const appErrorIndex = parts.findIndex(p => p.includes('APP_ERROR'));
    if (appErrorIndex === -1) {
      return null;
    }

    // Extrai as partes após APP_ERROR
    const relevantParts = parts.slice(appErrorIndex + 1);
    
    if (relevantParts.length < 2) {
      return null;
    }

    const [type, i18nKey, action, dataStr] = relevantParts;
    
    return new AppError({
      i18nKey: i18nKey?.trim() || '',
      type: (type?.trim() as ErrorType) || 'error',
      action: action?.trim() || undefined,
      data: dataStr?.trim() ? JSON.parse(dataStr) : undefined
    });
  }
}

/**
 * Type guard para verificar se é AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Helper para criar erro de conflito
 */
export class ConflictError extends AppError {
  constructor(i18nKey: string, data?: any) {
    super({
      i18nKey,
      type: 'error',
      action: 'conflict',
      data,
    });
    this.name = 'ConflictError';
  }
}

/**
 * Helper para criar erro de validação
 */
export class ValidationError extends AppError {
  constructor(i18nKey: string, data?: any) {
    super({
      i18nKey,
      type: 'warning',
      action: 'validation',
      data,
    });
    this.name = 'ValidationError';
  }
}

/**
 * Helper para criar aviso
 */
export class WarningError extends AppError {
  constructor(i18nKey: string, data?: any) {
    super({
      i18nKey,
      type: 'warning',
      action: 'warning',
      data,
    });
    this.name = 'WarningError';
  }
}

/**
 * Helper para criar erro de não encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string, data?: any) {
    super({
      i18nKey: `common:errors.notFound.${resource}`,
      type: 'error',
      action: 'not_found',
      data,
    });
    this.name = 'NotFoundError';
  }
}