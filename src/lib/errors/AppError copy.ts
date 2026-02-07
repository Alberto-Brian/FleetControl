// ========================================
// FILE: src/lib/errors/AppError.ts (ATUALIZADO)
// ========================================
export interface ToastAction {
  label: string; // Chave i18n para o label do botão
  type: string; // Tipo da acção (ex: 'RESTORE_CATEGORY', 'RETRY', etc)
  data?: Record<string, any>; // Dados necessários para a acção
  loadingLabel?: string; // Chave i18n para mensagem de loading
  successLabel?: string; // Chave i18n para mensagem de sucesso
  errorLabel?: string; // Chave i18n para mensagem de erro
}

export interface ToastCancel {
  label: string; // Chave i18n para o label do botão
}

export class AppError extends Error {
  public readonly type: 'error' | 'warning' | 'info' | 'success';
  public readonly i18nKey: string;
  public readonly action?: string; // Para tracking/logging
  public readonly data?: {
    i18n?: Record<string, any>;
    duration?: number;
    action?: ToastAction; // ✨ NOVO
    cancel?: ToastCancel; // ✨ NOVO
    [key: string]: any;
  };

  constructor(
    i18nKey: string,
    data?: {
      i18n?: Record<string, any>;
      duration?: number;
      action?: ToastAction;
      cancel?: ToastCancel;
      [key: string]: any;
    },
    action?: string,
    type: 'error' | 'warning' | 'info' | 'success' = 'error',
  ) {
    super(i18nKey);
    this.name = 'AppError';
    this.type = type;
    this.i18nKey = i18nKey;
    this.action = action;
    this.data = data;
  }

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

  static fromIpcString(str: string): AppError | null {
    if (!str.startsWith('APP_ERROR||')) return null;
    
    const parts = str.split('||');
    if (parts.length < 5) return null;
    
    const [, type, i18nKey, action, dataStr] = parts;
    
    let data: any = {};
    try {
      data = JSON.parse(dataStr);
    } catch {}
    
    return new AppError(
      i18nKey,
      data,
      action || undefined,
      type as 'error' | 'warning' | 'info' | 'success',
    );
  }
}

// Classes específicas inalteradas...
export class ConflictError extends AppError {
  constructor(i18nKey: string, data?: any, action?: string,) {
    super(i18nKey, data, action || 'confict', 'error');
  }
}

export class ValidationError extends AppError {
  constructor(i18nKey: string, data?: any, action?: string,) {
    super(i18nKey, data, action || 'validation', 'error');
  }
}

export class WarningError extends AppError {
  constructor(i18nKey: string, data?: any, action?: string) {
    super(i18nKey, data, action || 'warning', 'warning');
  }
}

export class NotFoundError extends AppError {
  constructor(i18nKey: string, data?: any, action?: string) {
    super(i18nKey, data, action || 'not_found', 'error');
  }
}

export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}