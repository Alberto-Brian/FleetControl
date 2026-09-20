// ========================================
// FILE: src/helpers/ipc/db/company/company-channels.ts
// ========================================
export const COMPANY_GET           = 'company:get';
export const COMPANY_UPDATE        = 'company:update';
export const COMPANY_IS_CONFIGURED = 'company:is-configured';
export const COMPANY_UPLOAD_LOGO   = 'company:upload-logo';
export const COMPANY_REMOVE_LOGO   = 'company:remove-logo';
export const COMPANY_GET_LOGO_B64  = 'company:get-logo-base64';
// 2026-09-20 — limpeza ao trocar de organização nesta máquina (ver
// wipeLocalDataForIdentitySwitch em license-helpers.ts).
export const COMPANY_DELETE        = 'company:delete';