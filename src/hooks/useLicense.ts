// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/hooks/useLicense.ts
// ========================================
//
// Fica só a re-exportar o Context (ver src/contexts/LicenseContext.tsx) —
// mesma assinatura de sempre ({license, loading, error, checkLicense,
// refreshLicense}), por isso nenhum dos ~15 consumidores existentes
// (HomePage, LicenseGuard, SettingsDialog, diálogos de veículo, etc.)
// precisa de mudar. A diferença é que agora todos partilham a MESMA
// instância de estado, montada uma vez em App.tsx, em vez de cada um
// disparar a sua própria verificação assíncrona.
export { useLicenseContext as useLicense } from '@/contexts/LicenseContext';
