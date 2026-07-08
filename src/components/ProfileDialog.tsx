import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button }  from '@/components/ui/button';
import { Input }   from '@/components/ui/input';
import { Label }   from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { useAuth }       from '@/contexts/AuthContext';
import { updateProfile } from '@/helpers/service-auth-helpers';
import { toast }         from 'sonner';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({ open, onOpenChange }: Props) {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation('auth');
  const fileRef = useRef<HTMLInputElement>(null);

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
      <DialogContent className="sm:max-w-[420px]">
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
