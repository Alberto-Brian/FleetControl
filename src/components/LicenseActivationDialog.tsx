import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Key, Loader2, Copy, Check, Package, Mail, Phone, Globe, MapPin, Building2 } from 'lucide-react';
import { getMachineId, validateLicense } from '@/helpers/license-helpers';
import { getSystemVersion } from '@/helpers/system-helpers';

interface LicenseActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LicenseActivationDialog({ open, onOpenChange, onSuccess }: LicenseActivationDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("activate");
  const [machineId, setMachineId] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false); 
  const [systemVersion, setSystemVersion] = useState('');
  
  useEffect(() => {
      if (open) {
          getSystemVersion().then(version => setSystemVersion(version));
      }
  }, [open]);

  useEffect(() => {
    if (open) {
      loadMachineId();
    }
  }, [open]);

  const loadMachineId = async () => {
    try {
      const id = await getMachineId();
      setMachineId(id);
    } catch (err) {
      console.error('Erro ao obter Machine ID:', err);
    }
  };

  const copyMachineId = () => {
    navigator.clipboard.writeText(machineId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "✅ Copiado!",
      description: "ID da máquina copiado para a área de transferência",
      duration: 2000,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove apenas espaços em branco, mantém a licença intacta
    const cleaned = e.target.value.trim();
    setLicenseKey(cleaned);
  };

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Por favor, insira uma chave de licença');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await validateLicense(licenseKey);

      if (result.isValid) {
        toast({
          title: "✅ Licença validada com sucesso!",
          description: "O sistema foi activado e está pronto para uso.",
          variant: "default",
        });
        
        // Aguarda um pouco para o usuário ver o toast
        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      } else {
        setError(result.error || 'Licença inválida');
        toast({
          title: "❌ Erro na validação",
          description: result.error || 'Licença inválida ou expirada',
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = 'Erro ao validar licença: ' + err.message;
      setError(errorMsg);
      toast({
        title: "❌ Erro de conexão",
        description: "Não foi possível validar a licença. Verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "activate", icon: Key, label: "Activação" },
    { id: "support", icon: Phone, label: "Suporte" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0">
        <div className="flex h-full max-h-[100vh]">
          {/* Sidebar de navegação - Estilo Windows 11 */}
          <aside className="w-64 border-r border-border bg-muted/30 flex flex-col">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5" />
                FleetControl
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Activação de Licença
              </p>
            </DialogHeader>

            <ScrollArea className="flex-1 px-3">
              <nav className="space-y-1 py-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === section.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>

            {/* Logo na sidebar */}
            <div className="p-4 border-t border-border">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-primary-foreground" />
                </div>
                <p className="text-xs font-medium">FleetControl</p>
                <p className="text-[10px] text-muted-foreground">{systemVersion ? `V${systemVersion}` : ''}</p>
              </div>
            </div>
          </aside>

          {/* Conteúdo */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {activeTab === "activate" && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center pb-4 border-b border-border">
                      <h3 className="text-xl font-bold mb-1">Activação de Licença</h3>
                      <p className="text-sm text-muted-foreground">
                        Siga os passos abaixo para activar o sistema
                      </p>
                    </div>

                    {/* PASSO 1: Machine ID */}
                    <div>
                      <h3 className="text-base font-semibold mb-1">Passo 1: ID da Máquina</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Copie este código e envie para nossa equipe
                      </p>
                      <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-foreground font-bold">1</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-2">
                              📋 Copie o ID desta máquina
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Envie este código para <strong>suporte.techsoft@gmail.com</strong> ou 
                              WhatsApp <strong>+244 923 456 789</strong> junto com seus dados 
                              (Nome, Email, NIF) para receber sua chave de licença.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={machineId}
                            readOnly
                            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono select-all"
                          />
                          <button
                            onClick={copyMachineId}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copiar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PASSO 2: Inserir Licença */}
                    <div>
                      <h3 className="text-base font-semibold mb-1">Passo 2: Chave de Licença</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Cole a chave recebida da nossa equipe (Base64URL)
                      </p>
                      <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-foreground font-bold">2</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-3">
                              🔑 Cole a chave de licença recebida
                            </p>
                            <textarea
                              value={licenseKey}
                              onChange={(e) => setLicenseKey(e.target.value.trim())}
                              placeholder="eyJjbiI6Ik5vbWUiLCJjZSI6ImVtYWlsQGV4YW1wbGUuY29tIi4uLg.dGhpcy1pcy1hLXNpZ25hdHVyZQ"
                              className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm bg-background resize-none"
                              rows={4}
                              disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              💡 Cole a licença completa sem modificações
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Erro */}
                    {error && (
                      <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    {/* Botão Activar */}
                    <button
                      onClick={handleActivate}
                      disabled={loading || !licenseKey.trim()}
                      className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold text-base shadow-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Validando licença...
                        </>
                      ) : (
                        <>
                          <Key className="w-5 h-5" />
                          Activar Sistema
                        </>
                      )}
                    </button>
                  </div>
                )}

                {activeTab === "support" && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center pb-4 border-b border-border">
                      <h3 className="text-xl font-bold mb-1">Suporte Técnico</h3>
                      <p className="text-sm text-muted-foreground">
                        Entre em contacto connosco
                      </p>
                    </div>

                    {/* Informações da Empresa */}
                    <div>
                      <h3 className="text-base font-semibold mb-4">TechSoft Solutions</h3>
                      <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-4">
                        <div>
                          <h4 className="text-base font-bold mb-1.5 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            TechSoft Solutions
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Empresa angolana especializada em desenvolvimento de software de gestão empresarial,
                            proporcionando soluções tecnológicas inovadoras para o mercado nacional.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Localização</p>
                            <p className="text-xs font-medium">Luanda, Angola</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Fundação</p>
                            <p className="text-xs font-medium">2020</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">NIF</p>
                            <p className="text-xs font-medium">5401234567</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Reg. Comercial</p>
                            <p className="text-xs font-medium">RC-123456</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contactos */}
                    <div>
                      <h3 className="text-base font-semibold mb-4">Contactos</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email Suporte</p>
                            <p className="text-sm font-medium">suporte.techsoft@gmail.com</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email Comercial</p>
                            <p className="text-sm font-medium">comercial@techsoft.ao</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Phone className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">WhatsApp / Telefone</p>
                            <p className="text-sm font-medium">+244 932 047 303</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Globe className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Website</p>
                            <p className="text-sm font-medium">www.techsoft.ao</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div>
                      <h3 className="text-base font-semibold mb-4">Endereço</h3>
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card/50">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-sm leading-relaxed">
                          <p className="font-medium">Rua Comandante Gika, Edifício Tech Plaza</p>
                          <p className="text-muted-foreground">5º Andar, Sala 502</p>
                          <p className="text-muted-foreground">Ingombota, Luanda</p>
                        </div>
                      </div>
                    </div>

                    {/* Copyright */}
                    <div className="pt-4 border-t border-border text-center space-y-1">
                      <p className="text-xs text-muted-foreground">
                        © 2025 TechSoft Solutions. Todos os direitos reservados.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Desenvolvido em Angola para Angola
                      </p>
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