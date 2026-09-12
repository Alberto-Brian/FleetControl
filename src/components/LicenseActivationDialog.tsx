// ========================================
// FILE: src/components/LicenseActivationDialog.tsx
// ========================================
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea }  from "@/components/ui/scroll-area";
import { useToast }    from "@/components/ui/use-toast";
import { AlertCircle, Key, Loader2, Mail, Phone, Globe, MapPin, Info } from 'lucide-react';
import { validateLicense } from '@/helpers/license-helpers';
import { getSystemVersion } from '@/helpers/system-helpers';

interface PanelProps {
  onSuccess?: () => void;
}

// Achado real (2026-09-12): este ecrã é usado em DOIS contextos — como
// modal a partir de Definições (Reactivar, com a app já a correr por
// trás) e como o ecrã de arranque quando ainda não há licença nenhuma
// (App.tsx, antes de qualquer coisa montar). O segundo caso nunca teve
// nada a dimming por trás — mas ao usar sempre <Dialog> (via
// LicenseActivationDialog), herdava sempre o overlay do Radix
// (`bg-black/80`, fixed inset-0), pensado para dimming sobre conteúdo
// real — resultado: um ecrã inteiro preto com o cartão a flutuar sobre
// ele, em vez de um ecrã normal da app (como a própria Ajuda). O
// conteúdo (sidebar + formulário) foi extraído para este componente
// partilhado, sem nenhuma dependência de estar dentro de um <Dialog> —
// LicenseActivationDialog (modal) e LicenseActivationScreen (página
// inteira, tema normal da app, sem overlay) reutilizam-no tal e qual.
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

  return (
    <div className="flex h-full">

      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-muted/30 flex flex-col">
        <div className="p-6 pb-4 flex flex-col space-y-1.5">
          <h2 className="flex items-center gap-2 text-base font-semibold leading-none tracking-tight">
            <img src="./images/fleetlogo.png" alt="" className="w-4 h-4" /> FleetControl
          </h2>
          <p className="text-xs text-muted-foreground">Activação de Licença</p>
        </div>
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1 py-2">
            {sections.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-border text-center">
          <img src="./images/fleetlogo.png" alt="" className="w-10 h-10 mx-auto mb-2" />
          <p className="text-xs font-medium">FleetControl</p>
          {version && <p className="text-[10px] text-muted-foreground">v{version}</p>}
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-5">

            {tab === 'activate' && (
              <div className="space-y-5">
                <div className="text-center pb-4 border-b border-border">
                  <h3 className="text-xl font-bold mb-1">Activação de Licença</h3>
                  <p className="text-sm text-muted-foreground">
                    {advancedMode
                      ? 'Cole a chave completa do ficheiro enviado pela AKM Systems'
                      : 'Insere o código de licença da tua organização'}
                  </p>
                </div>

                {!advancedMode ? (
                  <>
                    {/* Instrução de onde encontrar o código — chave curta, o caminho por omissão */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <p className="font-medium">Onde encontrar o código?</p>
                        <p>Foi-te enviado um código curto pela AKM Systems — cola-o exactamente como recebeste, no formato <span className="font-mono font-bold">LK-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</span>.</p>
                      </div>
                    </div>

                    {/* Campo do código — chave curta */}
                    <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                          <Key className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Código de Licença</p>
                          <p className="text-xs text-muted-foreground">Formato: LK-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</p>
                        </div>
                      </div>
                      <input
                        ref={inputRef}
                        type="text"
                        value={key}
                        onChange={e => setKey(e.target.value.trim())}
                        placeholder="LK-16DED-E1D7F-E24B4-633F8-20CB9"
                        className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm bg-background transition-colors cursor-text caret-foreground"
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => { setAdvancedMode(true); setKey(''); setError(''); }}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Tenho uma chave completa (avançado)
                    </button>
                  </>
                ) : (
                  <>
                    {/* Instrução de onde encontrar a chave — chave completa, modo avançado */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <p className="font-medium">Onde encontrar a chave?</p>
                        <p>No ficheiro de licença (.txt) recebido por email, copia o conteúdo completo da linha que começa por <span className="font-mono font-bold">FULL:</span></p>
                        <p className="text-blue-500 dark:text-blue-400">Exemplo: <span className="font-mono">eyJjbi...</span></p>
                      </div>
                    </div>

                    {/* Campo da chave — chave completa */}
                    <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                          <Key className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Chave de Licença</p>
                          <p className="text-xs text-muted-foreground">Formato: eyJj... (linha FULL do ficheiro) ou LK-XXXXX-... (código curto)</p>
                        </div>
                      </div>
                      <textarea
                        ref={textareaRef}
                        value={key}
                        onChange={e => setKey(e.target.value.trim())}
                        placeholder="Cole aqui o conteúdo da linha FULL: do ficheiro de licença..."
                        className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-mono text-xs bg-background resize-none transition-colors cursor-text caret-foreground"
                        rows={5}
                        disabled={loading}
                        onMouseDown={() => {
                          // setTimeout garante foco após os event listeners de captura do Radix UI
                          setTimeout(() => textareaRef.current?.focus(), 0);
                        }}
                      />

                      {/* LK- curta colada aqui por engano → confirma que também é aceite */}
                      {isConnectedDisplayKey && (
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Código curto (LK-) detectado — será verificado no servidor. Requer ligação à internet.
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => { setAdvancedMode(false); setKey(''); setError(''); }}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      ← Usar código de licença
                    </button>
                  </>
                )}

                {/* Erro de validação */}
                {error && (
                  <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
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
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-border">
                  <h3 className="text-xl font-bold mb-1">Suporte Técnico</h3>
                  <p className="text-sm text-muted-foreground">Entre em contacto connosco</p>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Mail,  label: 'Email',    value: 'albertobrian16@gmail.com' },
                    { icon: Phone, label: 'WhatsApp', value: '+244 932 047 303'         },
                    { icon: Globe, label: 'Website',  value: 'akmsystems.ao'            },
                    { icon: MapPin,label: 'Morada',   value: 'Ingombota, Luanda'        },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border text-center">
                  <p className="text-xs text-muted-foreground">© 2025–2026 AKM Systems</p>
                </div>
              </div>
            )}

          </div>
        </ScrollArea>
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
// de qualquer outra coisa montar). Mesmo tema/fundo normal da app (como a
// Ajuda ou qualquer outra página) — nunca o overlay preto do Dialog, que
// não faz sentido sem nada por trás para escurecer.
export function LicenseActivationScreen({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-4xl h-[600px] rounded-lg border border-border bg-background shadow-lg overflow-hidden">
        <LicenseActivationPanel onSuccess={onSuccess} />
      </div>
    </div>
  );
}
