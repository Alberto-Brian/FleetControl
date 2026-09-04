// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/pages/ChangePasswordRequiredPage.tsx
// ========================================
//
// Gate obrigatório entre o login e o resto da app quando a API devolve
// must_change_password:true (password temporária de bootstrap, Fase 8B.3 —
// ex: o primeiro admin de uma Organization nova). Mesma identidade visual
// do LoginPage (RouteBackground, painel de vidro) por ser, na prática, o
// mesmo momento de fluxo — só troca o formulário.
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { KeyRound, Loader2, Lock } from 'lucide-react';
import { changePasswordOnApi } from '@/helpers/license-helpers';
import { RouteBackground } from './LoginPage';

export default function ChangePasswordRequiredPage() {
  const { user, clearMustChangePassword, logout } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t('auth:changePasswordRequired.errors.mismatch'));
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error(t('auth:changePasswordRequired.errors.tooShort'));
      return;
    }
    if (formData.newPassword === formData.currentPassword) {
      toast.error(t('auth:changePasswordRequired.errors.sameAsCurrent'));
      return;
    }

    setIsLoading(true);
    try {
      await changePasswordOnApi(formData.currentPassword, formData.newPassword);
      toast.success(t('auth:changePasswordRequired.toast.success'));
      clearMustChangePassword();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('auth:changePasswordRequired.errors.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-6"
      style={{ background: 'hsl(var(--background))' }}
    >
      <RouteBackground />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 55% at 50% 45%, hsl(var(--background) / 0.55), transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        <div
          className="rounded-[20px] px-8 py-9"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-filter)',
            WebkitBackdropFilter: 'var(--glass-filter)',
            border: '1px solid var(--ui-b07)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <div className="flex flex-col items-center gap-3.5 mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--nav-logo-bg)', boxShadow: '0 4px 16px hsl(var(--primary) / 0.35)' }}
            >
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1
                className="text-[22px] leading-tight"
                style={{ fontFamily: 'var(--app-font)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ui-t90)' }}
              >
                {t('auth:changePasswordRequired.title')}
              </h1>
              <p className="text-sm mt-1.5" style={{ color: 'var(--ui-t55)' }}>
                {t('auth:changePasswordRequired.subtitle', { email: user?.email ?? '' })}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs font-medium" style={{ color: 'var(--ui-t68)' }}>
                {t('auth:changePasswordRequired.currentPasswordLabel')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--ui-t35)' }} />
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                  autoFocus
                  autoComplete="current-password"
                  className="pl-9 h-11 rounded-xl"
                  style={{ background: 'var(--ui-b04)', borderColor: 'var(--ui-b07)', color: 'var(--ui-t90)' }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-medium" style={{ color: 'var(--ui-t68)' }}>
                {t('auth:changePasswordRequired.newPasswordLabel')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--ui-t35)' }} />
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pl-9 h-11 rounded-xl"
                  style={{ background: 'var(--ui-b04)', borderColor: 'var(--ui-b07)', color: 'var(--ui-t90)' }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium" style={{ color: 'var(--ui-t68)' }}>
                {t('auth:changePasswordRequired.confirmPasswordLabel')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--ui-t35)' }} />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="pl-9 h-11 rounded-xl"
                  style={{ background: 'var(--ui-b04)', borderColor: 'var(--ui-b07)', color: 'var(--ui-t90)' }}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl text-sm font-semibold mt-2">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('auth:changePasswordRequired.submitButtonLoading')}
                </span>
              ) : (
                t('auth:changePasswordRequired.submitButton')
              )}
            </Button>

            <button
              type="button"
              onClick={logout}
              className="w-full text-center text-xs mt-1 hover:underline"
              style={{ color: 'var(--ui-t45)' }}
            >
              {t('auth:changePasswordRequired.backToLogin')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
