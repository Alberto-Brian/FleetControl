import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button }  from '@/components/ui/button';
import { Input }   from '@/components/ui/input';
import { Label }   from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Layers, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth }       from '@/contexts/AuthContext';
import { updateProfile } from '@/helpers/service-auth-helpers';
import { toast }         from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAccessScopes, useEffectivePermissions } from '@/hooks/usePermission';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({ open, onOpenChange }: Props) {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation('auth');
  const fileRef = useRef<HTMLInputElement>(null);
  // 2026-09-19 — pedido do utilizador: "um utilizador tem cargos,
  // permissões e escopos, seria bom que essas informações aparecessem no
  // seu perfil". A API nunca devolve nome de Role em /me/access de
  // propósito (Fase 8) — mostra-se Scopes (cada um com as suas
  // permissões), o mesmo que a própria API expõe.
  const effectivePermissions = useEffectivePermissions();
  const accessScopes = useAccessScopes();

  const [name,   setName]   = useState('');
  const [email,  setEmail]  = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar);
    }
  }, [open, user]);

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : n.substring(0, 2).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('profile.avatarSizeError'));
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { toast.error(t('profile.nameRequired')); return; }
    setSaving(true);
    try {
      await updateProfile(user.id, {
        name:   name.trim(),
        email:  email.trim(),
        avatar,
      });
      updateUser({ ...user, name: name.trim(), email: email.trim(), avatar });
      toast.success(t('profile.saveSuccess'));
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message ?? t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t('profile.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {name ? getInitials(name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{t('profile.avatarHint')}</p>
              {avatar && (
                <button
                  type="button"
                  className="text-xs text-destructive hover:underline flex items-center gap-0.5"
                  onClick={() => setAvatar(undefined)}
                >
                  <Trash2 className="w-3 h-3" />
                  {t('profile.avatarRemove')}
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">{t('profile.name')}</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('profile.namePlaceholder')}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">{t('profile.email')}</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Acesso — cargos/permissões/scopes */}
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <p className="text-sm font-medium">{t('profile.accessTitle')}</p>
            </div>
            {effectivePermissions === null ? (
              <p className="text-xs text-muted-foreground">{t('profile.accessLoading')}</p>
            ) : (accessScopes?.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground">{t('profile.accessNone')}</p>
            ) : (
              <div className="max-h-48 space-y-2.5 overflow-y-auto pr-1">
                {accessScopes!.map((scope) => (
                  <div key={scope.id}>
                    <div className="mb-1 flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{scope.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {scope.type === 'organization' ? t('profile.accessScopeOrg') : t('profile.accessScopeResources')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {scope.permissions.map((code) => (
                        <Badge key={code} variant="outline" className="font-mono text-[9px]">{code}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              {t('profile.accessTotal', { count: effectivePermissions?.length ?? 0 })}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('profile.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('profile.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
