// ========================================
// FILE: src/components/LicenseActivationDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea }  from "@/components/ui/scroll-area";
import { useToast }    from "@/components/ui/use-toast";
import { AlertCircle, Key, Loader2, Package, Mail, Phone, Globe, MapPin, Info } from 'lucide-react';
import { validateLicense } from '@/helpers/license-helpers';
import { getSystemVersion } from '@/helpers/system-helpers';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LicenseActivationDialog({ open, onOpenChange, onSuccess }: Props) {
  const { toast }             = useToast();
  const [tab, setTab]         = useState('activate');
  const [key, setKey]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [version, setVersion] = useState('');

  useEffect(() => {
    if (open) getSystemVersion().then(setVersion);
  }, [open]);

  // Detecta se o utilizador colou a chave curta por engano
  const isDisplayKey = /^(LK|ST)-[A-F0-9]{5}(-[A-F0-9]{5}){4}$/i.test(key.trim());

  const handleActivate = async () => {
    if (!key.trim()) { setError('Insere a chave de licença'); return; }

    if (isDisplayKey) {
      setError(
        'Esta é a chave de referência (formato curto). No ficheiro de licença ' +
        'recebido, copia o conteúdo da linha que começa por "FULL:" e cola aqui.'
      );
      return;
    }

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0">
        <div className="flex h-full">

          {/* Sidebar */}
          <aside className="w-56 border-r border-border bg-muted/30 flex flex-col">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Package className="w-4 h-4" /> FleetControl
              </DialogTitle>
              <p className="text-xs text-muted-foreground">Activação de Licença</p>
            </DialogHeader>
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
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
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
                        Cole a chave de licença do ficheiro enviado pela TechSoft
                      </p>
                    </div>

                    {/* Instrução de onde encontrar a chave */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <p className="font-medium">Onde encontrar a chave?</p>
                        <p>No ficheiro de licença (.txt) recebido por email, copia o conteúdo completo da linha que começa por <span className="font-mono font-bold">FULL:</span></p>
                        <p className="text-blue-500 dark:text-blue-400">Exemplo: <span className="font-mono">eyJjbi...</span></p>
                      </div>
                    </div>

                    {/* Campo da chave */}
                    <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                          <Key className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Chave de Licença</p>
                          <p className="text-xs text-muted-foreground">Formato: eyJj... (string longa)</p>
                        </div>
                      </div>
                      <textarea
                        value={key}
                        onChange={e => setKey(e.target.value.trim())}
                        placeholder="Cole aqui o conteúdo da linha FULL: do ficheiro de licença..."
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs bg-background resize-none transition-colors ${
                          isDisplayKey
                            ? 'border-amber-400 dark:border-amber-600'
                            : 'border-border'
                        }`}
                        rows={5}
                        disabled={loading}
                      />

                      {/* Aviso em tempo real se colou a chave curta */}
                      {isDisplayKey && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Esta é a chave de referência (formato curto). No ficheiro .txt, copia o conteúdo completo da linha <span className="font-mono font-bold">FULL:</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Erro de validação */}
                    {error && !isDisplayKey && (
                      <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={handleActivate}
                      disabled={loading || !key.trim() || isDisplayKey}
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
                        { icon: Mail,  label: 'Email',    value: 'suporte.techsoft@gmail.com' },
                        { icon: Phone, label: 'WhatsApp', value: '+244 932 047 303'           },
                        { icon: Globe, label: 'Website',  value: 'www.techsoft.ao'            },
                        { icon: MapPin,label: 'Morada',   value: 'Ingombota, Luanda'          },
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
                      <p className="text-xs text-muted-foreground">© 2025 TechSoft Solutions</p>
                    </div>
                  </div>
                )}

              </div>
            </ScrollArea>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}