// ========================================
// FILE: src/lib/types/system-settings.ts
// ========================================

export interface ISystemSettings {
  id: string;

  // PDF
  pdf_watermark_enabled:   boolean;
  pdf_watermark_use_logo:  boolean;
  pdf_watermark_text:      string;
  pdf_watermark_opacity:   string;
  pdf_primary_color:       string;
  pdf_secondary_color:     string;
  pdf_show_charts:         boolean;
  pdf_show_footer:         boolean;
  pdf_show_summary:        boolean;
  pdf_paper_size:          'A4' | 'Letter';
  pdf_orientation:         'portrait' | 'landscape';

  // Alertas
  alert_mileage_threshold:     number;
  alert_license_days_before:   number;
  alert_insurance_days_before: number;
  alert_maintenance_enabled:   boolean;
  alert_fines_enabled:         boolean;

  // Viagens
  trips_require_approval:  boolean;
  trips_require_signature: boolean;
  trips_max_speed:         number;

  // Combustível
  fuel_level_control:    boolean;
  fuel_min_level_alert:  number;

  // Sistema
  session_timeout_minutes: number;
  session_multi_login:     boolean;
  notifications_enabled:   boolean;

  // Auditoria
  audit_log_enabled:        boolean;
  audit_log_retention_days: number;

  created_at: string;
  updated_at: string;
}

/** Todos os campos são opcionais no update */
export type IUpdateSystemSettings = Partial<Omit<ISystemSettings, 'id' | 'created_at' | 'updated_at'>>;

// ─────────────────────────────────────────────
// Defaults — usados quando ainda não há registo
// ─────────────────────────────────────────────
export const SYSTEM_SETTINGS_DEFAULTS: Omit<ISystemSettings, 'id' | 'created_at' | 'updated_at'> = {
  pdf_watermark_enabled:       false,
  pdf_watermark_use_logo:      false,
  pdf_watermark_text:          'CONFIDENCIAL',
  pdf_watermark_opacity:       '0.10',
  pdf_primary_color:           '#2563eb',
  pdf_secondary_color:         '#64748b',
  pdf_show_charts:             true,
  pdf_show_footer:             true,
  pdf_show_summary:            true,
  pdf_paper_size:              'A4',
  pdf_orientation:             'portrait',
  alert_mileage_threshold:     10000,
  alert_license_days_before:   30,
  alert_insurance_days_before: 30,
  alert_maintenance_enabled:   true,
  alert_fines_enabled:         true,
  trips_require_approval:      false,
  trips_require_signature:     false,
  trips_max_speed:             0,
  fuel_level_control:          true,
  fuel_min_level_alert:        20,
  session_timeout_minutes:     0,
  session_multi_login:         true,
  notifications_enabled:       true,
  audit_log_enabled:           true,
  audit_log_retention_days:    90,
};