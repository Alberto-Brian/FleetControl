import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth }        from '@/contexts/AuthContext';
import { changePassword } from '@/helpers/service-auth-helpers';
import { toast }          from 'sonner';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PasswordInput({
  id, value, onChange, label, show, onToggleShow,
}: {
  id: string; value: string; onChange: (v: string) => void;
  label: string; show: boolean; onToggleShow: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onToggleShow}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { t } = useTranslation('auth');

  const [current,  setCurrent]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showCurr, setShowCurr] = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (open) {
      setCurrent(''); setNewPass(''); setConfirm('');
      setShowCurr(false); setShowNew(false);
    }
  }, [open]);

  const confirmMismatch = confirm.length > 0 && newPass !== confirm;

  const handleSave = async () => {
    if (!user) return;
    if (newPass.length < 6)    { toast.error(t('setup.passwordTooShort'));  return; }
    if (newPass !== confirm)    { toast.error(t('setup.passwordsDontMatch')); return; }
    if (!current)               { toast.error(t('password.currentRequired')); return; }
    setSaving(true);
    try {
      await changePassword({ userId: user.id, currentPassword: current, newPassword: newPass });
      toast.success(t('password.changeSuccess'));
      onOpenChange(false);
    } catch (err: any) {
      toast.error(t(err?.message ?? 'errors.wrongCurrentPassword'));
    } finally {
      setSaving(false);
    }
  };

  const canSave = current.length > 0 && newPass.length >= 6 && newPass === confirm;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('password.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <PasswordInput
            id="pw-current"
            label={t('password.current')}
            value={current}
            onChange={setCurrent}
            show={showCurr}
            onToggleShow={() => setShowCurr(v => !v)}
          />
          <PasswordInput
            id="pw-new"
            label={t('password.new')}
            value={newPass}
            onChange={setNewPass}
            show={showNew}
            onToggleShow={() => setShowNew(v => !v)}
          />
          <div className="space-y-1.5">
            <Label htmlFor="pw-confirm">{t('password.confirm')}</Label>
            <Input
              id="pw-confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className={confirmMismatch ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {confirmMismatch && (
              <p className="text-xs text-destructive">{t('setup.passwordsDontMatch')}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('profile.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving || !canSave}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('password.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
