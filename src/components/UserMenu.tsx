import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import ProfileDialog        from '@/components/ProfileDialog';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';

export default function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation('auth');

  const [isLoggingOut,   setIsLoggingOut]   = useState(false);
  const [isProfileOpen,  setIsProfileOpen]  = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success(t('toast.logoutSuccess'));
    } catch (error: any) {
      toast.error(t(error?.message ?? 'errors.logoutFailed'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {compact ? (
            <button
              title={user.name}
              style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                border: 'none', cursor: 'pointer', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span className="w-full h-full bg-primary/10 text-primary flex items-center justify-center"
                  style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>
                  {getInitials(user.name)}
                </span>
              )}
            </button>
          ) : (
            <Button variant="ghost" className="h-10 gap-2 px-2 hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{user.name}</span>
                <span className="text-xs text-muted-foreground leading-none mt-0.5">{user.email}</span>
              </div>
            </Button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer" onClick={() => setIsProfileOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>{t('userMenu.profile')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer" onClick={() => setIsPasswordOpen(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            <span>{t('userMenu.changePassword')}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? t('userMenu.loggingOut') : t('userMenu.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog        open={isProfileOpen}  onOpenChange={setIsProfileOpen}  />
      <ChangePasswordDialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen} />
    </>
  );
}
