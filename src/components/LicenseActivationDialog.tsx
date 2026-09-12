// ========================================
// FILE: src/components/LicenseActivationDialog.tsx
// ========================================
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast }    from "@/components/ui/use-toast";
import { AlertCircle, Key, Loader2, Mail, Phone, Globe, MapPin, Info } from 'lucide-react';
import { validateLicense } from '@/helpers/license-helpers';
import { getSystemVersion } from '@/helpers/system-helpers';

interface PanelProps {
  onSuccess?: () => void;
}

// Achado real (2026-09-12): este ecrã destacava-se do resto da app —
// sidebar cinza plana (bg-muted/30, sem o cabeçalho ícone+título nem o
// padrão de hover dos outros painéis), Dialog/Radix sempre por trás (ver
// nota mais abaixo), tokens semânticos genéricos (border-border,
// text-muted-foreground) em vez do sistema --ui-* que a Ajuda e as
// Definições já usam em todo o lado. Redesenhado para seguir literalmente
// o mesmo padrão visual: cabeçalho da sidebar com caixa de ícone +
// título (igual ao "Definições"/Settings em SettingsDialog.tsx), lista de
// navegação com o mesmo hover/active via --ui-b04/--ui-b08 (não classes
// Tailwind estáticas), tipografia e bordas em --ui-t*/--ui-b* em vez de
// text-muted-foreground/border-border. bg-primary/text-primary-foreground
// mantido só onde Settings também o usa — acções e realces (botão CTA,
// caixa do código), nunca na "chrome" neutra.
function LicenseActivationPanel({ onSuccess }: PanelProps) {
  const { toast }             = useToast();
  const [tab, setTab]         = useState('activate');
  const [key, setKey]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [version, setVersion] = useState('');
  // Achado real (2026-09-12): a chave LONGA ("FULL:", colada num textarea)
  // era o caminho principal deste ecrã, com a chave CURTA (LK-XXXXX-...) só
  // detectada como um bónus depois de já a teres colado. Mas a partir de
  // agora toda organização nova recebe a chave curta — passa a ser o modo
  // por omissão, com a longa só acessível num modo "avançado" à parte,
  // nunca removida (continua a ser preciso para casos sem ligação/
  // standalone antigo).
  const [advancedMode, setAdvancedMode] = useState(false);
  const textareaRef           = useRef<HTMLTextAreaElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSystemVersion().then(setVersion);
  }, []);

  // Foca o campo certo ao montar ou quando muda de tab/modo.
  useEffect(() => {
    if (tab !== 'activate') return;
    const id = setTimeout(() => (advancedMode ? textareaRef : inputRef).current?.focus(), 80);
    return () => clearTimeout(id);
  }, [tab, advancedMode]);

  // LK- curta → válida via API (online).
  const isConnectedDisplayKey  = /^LK-[A-F0-9]{5}(-[A-F0-9]{5}){4}$/i.test(key.trim());

  const handleActivate = async () => {
    if (!key.trim()) { setError('Insere a chave de licença'); return; }

    setLoading(true);
    setError('');
    try {
      const result = await validateLicense(key);
      if (result.isValid) {
        toast({ title: 'Licença activada!', description: 'Sistema pronto para uso.' });
        setTimeout(() => onSuccess?.(), 800);
      } else {
        setError(result.error || 'Licença inválida');
      }
    } catch (e: any) {
      setError('Erro ao validar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'activate', icon: Key,   label: 'Activação' },
    { id: 'support',  icon: Phone, label: 'Suporte'   },
  ];

  // Mesmo formato de caixa "tip" da Ajuda (rgba directo, não Tailwind
  // bg-blue-50/dark:bg-blue-950), só com o tom azul-informativo em vez do
  // verde/âmbar já usados lá para dica/aviso.
  const infoBoxStyle: React.CSSProperties = {
    background: 'rgba(96,165,250,0.08)',
    border: '1px solid rgba(96,165,250,0.2)',
  };

  return (
    <div className="flex h-full">

      {/* Sidebar — mesmo padrão de SettingsDialog/HelpPage */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ borderRight: '1px solid var(--ui-b06)' }}>
        <div className="p-2.5" style={{ borderBottom: '1px solid var(--ui-b06)' }}>
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--ui-b07)' }}>
              <img src="./images/fleetlogo.png" alt="" className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--ui-t85)' }}>FleetControl</p>
              <p className="text-[11px] leading-tight" style={{ color: 'var(--ui-t45)' }}>Activação de Licença</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-1.5 space-y-0.5 px-1.5">
          {sections.map(({ id, icon: Icon, label }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-left rounded-lg transition-colors"
                style={{
                  background: isActive ? 'var(--ui-b08)' : 'transparent',
                  color:      isActive ? 'var(--ui-t90)' : 'var(--ui-t45)',
                  fontWeight: isActive ? 500 : 400,
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b04)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" /> {label}
              </button>
            );
          })}
        </nav>

        <div className="p-3.5 text-center" style={{ borderTop: '1px solid var(--ui-b06)' }}>
          <img src="./images/fleetlogo.png" alt="" className="w-9 h-9 mx-auto mb-1.5" />
          <p className="text-xs font-medium" style={{ color: 'var(--ui-t68)' }}>FleetControl</p>
          {version && <p className="text-[10px]" style={{ color: 'var(--ui-t25)' }}>v{version}</p>}
        </div>
      </aside>

      {/* Conteúdo — mesma largura/espaçamento de leitura da Ajuda */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl px-8 py-6 space-y-5">

          {tab === 'activate' && (
            <div className="space-y-5">
              <div className="pb-4" style={{ borderBottom: '1px solid var(--ui-b06)' }}>
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--ui-t90)' }}>Activação de Licença</h3>
                <p className="text-sm" style={{ color: 'var(--ui-t45)' }}>
                  {advancedMode
                    ? 'Cole a chave completa do ficheiro enviado pela AKM Systems'
                    : 'Insere o código de licença da tua organização'}
                </p>
              </div>

              {!advancedMode ? (
                <>
                  {/* Instrução de onde encontrar o código — chave curta, o caminho por omissão */}
                  <div className="flex items-start gap-2.5 rounded-lg px-3.5 py-3" style={infoBoxStyle}>
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#60a5fa' }} />
                    <div className="text-xs leading-relaxed space-y-1" style={{ color: 'var(--ui-t68)' }}>
                      <p className="font-medium" style={{ color: 'var(--ui-t85)' }}>Onde encontrar o código?</p>
                      <p>Foi-te enviado um código curto pela AKM Systems — cola-o exactamente como recebeste, no formato <span className="font-mono font-semibold">LK-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</span>.</p>
                    </div>
                  </div>

                  {/* Campo do código — chave curta */}
                  <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <Key className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--ui-t85)' }}>Código de Licença</p>
                        <p className="text-xs" style={{ color: 'var(--ui-t45)' }}>Formato: LK-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</p>
                      </div>
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={key}
                      onChange={e => setKey(e.target.value.trim())}
                      placeholder="LK-16DED-E1D7F-E24B4-633F8-20CB9"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm bg-background transition-colors cursor-text caret-foreground"
                      style={{ border: '1px solid var(--ui-b07)' }}
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => { setAdvancedMode(true); setKey(''); setError(''); }}
                    className="text-xs underline underline-offset-2 transition-colors"
                    style={{ color: 'var(--ui-t45)' }}
                  >
                    Tenho uma chave completa (avançado)
                  </button>
                </>
              ) : (
                <>
                  {/* Instrução de onde encontrar a chave — chave completa, modo avançado */}
                  <div className="flex items-start gap-2.5 rounded-lg px-3.5 py-3" style={infoBoxStyle}>
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#60a5fa' }} />
                    <div className="text-xs leading-relaxed space-y-1" style={{ color: 'var(--ui-t68)' }}>
                      <p className="font-medium" style={{ color: 'var(--ui-t85)' }}>Onde encontrar a chave?</p>
                      <p>No ficheiro de licença (.txt) recebido por email, copia o conteúdo completo da linha que começa por <span className="font-mono font-semibold">FULL:</span></p>
                      <p>Exemplo: <span className="font-mono">eyJjbi...</span></p>
                    </div>
                  </div>

                  {/* Campo da chave — chave completa */}
                  <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <Key className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--ui-t85)' }}>Chave de Licença</p>
                        <p className="text-xs" style={{ color: 'var(--ui-t45)' }}>Formato: eyJj... (linha FULL do ficheiro) ou LK-XXXXX-... (código curto)</p>
                      </div>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={key}
                      onChange={e => setKey(e.target.value.trim())}
                      placeholder="Cole aqui o conteúdo da linha FULL: do ficheiro de licença..."
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs bg-background resize-none transition-colors cursor-text caret-foreground"
                      style={{ border: '1px solid var(--ui-b07)' }}
                      rows={5}
                      disabled={loading}
                      onMouseDown={() => {
                        // setTimeout garante foco após os event listeners de captura do Radix UI
                        setTimeout(() => textareaRef.current?.focus(), 0);
                      }}
                    />

                    {/* LK- curta colada aqui por engano → confirma que também é aceite */}
                    {isConnectedDisplayKey && (
                      <div className="flex items-start gap-2 rounded-lg px-3 py-2.5" style={infoBoxStyle}>
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#60a5fa' }} />
                        <p className="text-xs" style={{ color: 'var(--ui-t68)' }}>
                          Código curto (LK-) detectado — será verificado no servidor. Requer ligação à internet.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => { setAdvancedMode(false); setKey(''); setError(''); }}
                    className="text-xs underline underline-offset-2 transition-colors"
                    style={{ color: 'var(--ui-t45)' }}
                  >
                    ← Usar código de licença
                  </button>
                </>
              )}

              {/* Erro de validação */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg px-3.5 py-3" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}>
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                onClick={handleActivate}
                disabled={loading || !key.trim()}
                className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold text-base"
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> A validar...</>
                  : <><Key className="w-5 h-5" /> Activar Sistema</>
                }
              </button>
            </div>
          )}

          {tab === 'support' && (
            <div className="space-y-5">
              <div className="pb-4" style={{ borderBottom: '1px solid var(--ui-b06)' }}>
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--ui-t90)' }}>Suporte Técnico</h3>
                <p className="text-sm" style={{ color: 'var(--ui-t45)' }}>Entre em contacto connosco</p>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Mail,  label: 'Email',    value: 'albertobrian16@gmail.com' },
                  { icon: Phone, label: 'WhatsApp', value: '+244 932 047 303'         },
                  { icon: Globe, label: 'Website',  value: 'akmsystems.ao'            },
                  { icon: MapPin,label: 'Morada',   value: 'Ingombota, Luanda'        },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-lg px-3.5 py-3" style={{ border: '1px solid var(--ui-b06)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--ui-b07)' }}>
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--ui-t45)' }}>{label}</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--ui-t85)' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-3 text-center" style={{ borderTop: '1px solid var(--ui-b06)' }}>
                <p className="text-xs" style={{ color: 'var(--ui-t25)' }}>© 2025–2026 AKM Systems</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Modal — usado a partir de Definições ("Reactivar"), com a app já a
// correr por trás; o overlay escurecido do Dialog faz sentido aqui.
export function LicenseActivationDialog({ open, onOpenChange, onSuccess }: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0">
        <LicenseActivationPanel onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}

// Ecrã inteiro — usado quando ainda não há licença nenhuma (App.tsx, antes
// de qualquer outra coisa montar). Preenche a janela toda, tal como a
// Ajuda e as Definições preenchem o seu painel de conteúdo — sem cartão
// centrado nem overlay nenhum por trás (nada para escurecer).
export function LicenseActivationScreen({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <div className="h-screen w-screen" style={{ background: 'hsl(var(--background))' }}>
      <LicenseActivationPanel onSuccess={onSuccess} />
    </div>
  );
}
