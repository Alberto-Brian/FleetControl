// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/pages/LoginPage.tsx
// ========================================
//
// Redesenho — este ecrã passou a ser visitado com frequência (Fase 11B.8,
// login por utilizador real em vez de só activar a licença). Em vez de um
// Card genérico "SaaS login" desligado do resto da app, o fundo ecoa o
// próprio modo conectado do HomePage ("mapa como fundo, painel flutuante
// em vidro por cima") — uma rota GPS estilizada com um ponto a percorrê-la
// lentamente, o mesmo tipo de coisa que a aplicação mostra de verdade
// assim que se entra. Paleta e vidro vêm inteiramente dos tokens já
// existentes em global.css (--ui-*, --glass-bg, --primary) — nada
// inventado à parte. Tipografia: Geist (já carregada, ver global.css), só
// o peso 800 na marca para dar um momento tipográfico sem importar uma
// fonte nova só para este ecrã.
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Truck, Loader2, Mail, Lock } from 'lucide-react';

// ─── Fundo: rota GPS estilizada ─────────────────────────────────────────────
// Grelha ténue + duas rotas de fundo + uma rota "activa" com um ponto a
// percorrê-la — a mesma ideia central do produto (uma frota, sempre
// rastreada), em vez de um blob genérico. `<animateMotion>` só é incluído
// quando o utilizador não pediu movimento reduzido.
// Exportado para ser reutilizado por outros ecrãs de gate pré-app (ex:
// ChangePasswordRequiredPage) — mesma identidade visual, sem duplicar.
export function RouteBackground() {
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMotionOk(!mq.matches);
    const onChange = () => setMotionOk(!mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="loginGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--ui-t15)" />
        </pattern>
        <filter id="loginDotGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="800" height="600" fill="url(#loginGrid)" />

      {/* Rotas de fundo, discretas */}
      <path
        d="M -20 480 C 160 420, 260 520, 420 440 S 700 300, 860 340"
        fill="none"
        stroke="var(--ui-t15)"
        strokeWidth="2"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
      <path
        d="M -20 120 C 140 180, 300 60, 480 140 S 720 220, 860 160"
        fill="none"
        stroke="var(--ui-t15)"
        strokeWidth="2"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />

      {/* Rota activa — a que o ponto percorre */}
      <path
        id="loginActiveRoute"
        d="M -20 260 C 180 200, 260 340, 440 300 S 640 160, 860 220"
        fill="none"
        stroke="var(--nav-active-color)"
        strokeOpacity="0.4"
        strokeWidth="2.5"
        strokeDasharray="1 9"
        strokeLinecap="round"
      />

      {/* Pins nos extremos de cada rota */}
      {[
        [420, 440], [480, 140], [440, 300],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.5" fill="var(--ui-t20)" />
      ))}

      {/* Ponto "veículo" — glow fixo, movimento condicional */}
      <circle r="4.5" fill="var(--nav-active-color)" filter="url(#loginDotGlow)">
        {motionOk ? (
          <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
            <mpath href="#loginActiveRoute" />
          </animateMotion>
        ) : (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-20,260"
            dur="1s"
            repeatCount="1"
            fill="freeze"
          />
        )}
      </circle>
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData);
      toast.success(t('auth:toast.loginSuccess'));
      // Não precisa navegar - o App.tsx vai renderizar HomePage automaticamente
      // quando isAuthenticated for true
    } catch (error: any) {
      toast.error(t(error?.message || 'auth:errors.loginFailed'));
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

      {/* Vinheta suave para o painel se destacar do fundo, sem o esconder */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 55% at 50% 45%, hsl(var(--background) / 0.55), transparent 70%)',
        }}
      />

      <div
        className="relative z-10 w-full max-w-[380px] motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        {/* Painel — mesmo tratamento de vidro do painel flutuante do HomePage */}
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
          {/* Marca */}
          <div className="flex flex-col items-center gap-3.5 mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--nav-logo-bg)', boxShadow: '0 4px 16px hsl(var(--primary) / 0.35)' }}
            >
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1
                className="text-[26px] leading-tight"
                style={{
                  fontFamily: 'var(--app-font)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--ui-t90)',
                }}
              >
                {t('navigation:app.name')}
              </h1>
              <p className="text-sm mt-1.5" style={{ color: 'var(--ui-t55)' }}>
                {t('auth:login.subtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium" style={{ color: 'var(--ui-t68)' }}>
                {t('auth:login.emailLabel')}
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--ui-t35)' }}
                />
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  placeholder={t('auth:login.emailPlaceholder')}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoFocus
                  autoComplete="username"
                  className="pl-9 h-11 rounded-xl"
                  style={{ background: 'var(--ui-b04)', borderColor: 'var(--ui-b07)', color: 'var(--ui-t90)' }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium" style={{ color: 'var(--ui-t68)' }}>
                {t('auth:login.passwordLabel')}
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--ui-t35)' }}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth:login.passwordPlaceholder')}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="pl-9 h-11 rounded-xl"
                  style={{ background: 'var(--ui-b04)', borderColor: 'var(--ui-b07)', color: 'var(--ui-t90)' }}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl text-sm font-semibold mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('auth:login.submitButtonLoading')}
                </span>
              ) : (
                t('auth:login.submitButton')
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--ui-t35)' }}>
          {t('navigation:app.tagline')}
        </p>
      </div>
    </div>
  );
}
