// ========================================
// FILE: src/lib/types/company.ts
// ========================================

export interface ICompanySettings {
  id:           string;
  company_name: string;
  tax_id:       string | null;
  phone:        string | null;
  email:        string | null;
  address:      string | null;
  city:         string | null;
  state:        string | null;
  postal_code:  string | null;
  /** Caminho absoluto para o logo em userData/company/logo.xxx */
  logo:         string | null;
  /** Base64 data URI — preenchido pelo listener após leitura do disco */
  logo_base64?: string | null;
  currency:     string;
  timezone:     string;
  created_at:   string;
  updated_at:   string;
  deleted_at:   string | null;
}

export interface IUpdateCompanySettings {
  company_name?: string;
  tax_id?:       string | null;
  phone?:        string | null;
  email?:        string | null;
  address?:      string | null;
  city?:         string | null;
  state?:        string | null;
  postal_code?:  string | null;
  currency?:     string;
  timezone?:     string;
}

export interface IUploadLogoResult {
  path:      string;
  base64:    string;
  mimeType:  string;
  sizeBytes: number;
}

export interface IUploadLogoResponse {
  settings: ICompanySettings;
  logo:     IUploadLogoResult;
}