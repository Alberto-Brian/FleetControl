// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginService,
  updateProfile as updateProfileService,
  syncLocalUser,
 } from '@/helpers/service-auth-helpers';
import { loginOnApi, clearApiSession, tryRestoreCachedSession, SESSION_REVOKED_EVENT } from '@/helpers/license-helpers';
import { ILogin } from '@/lib/types/auth';
import { IUser } from '@/lib/types/user';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // true quando o login online devolveu must_change_password:true (password
  // temporária de bootstrap, Fase 8B.3) — App.tsx bloqueia o resto da app
  // até clearMustChangePassword() ser chamado, depois de uma troca bem
  // sucedida. Nunca definido por uma restauração de sessão offline/cache —
  // só um login online confirma este estado com o servidor.
  mustChangePassword: boolean;
  clearMustChangePassword: () => void;
  login: (loginData: ILogin) => Promise<void>;
  logout: () => void;
  updateUser: (user: IUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = localStorage.getItem('fleet_user');
        if (savedUser) {
          const parsedUser: IUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Fase 11B.9 — reabrir a app com uma sessão local já persistida
          // não passa por login(); sem isto, o Desktop ficaria "autenticado
          // localmente, sem identidade API nenhuma" até ao próximo logout/
          // login. Reaproveita a sessão cacheada da MESMA pessoa, se ainda
          // estiver dentro da validade definida pelo backend; caso
          // contrário, fica local-only até um login explícito — nunca
          // reautentica silenciosamente com a password.
          if (parsedUser?.email) {
            await tryRestoreCachedSession(parsedUser.email);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar utilizador:', error);
        localStorage.removeItem('fleet_user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (loginData: ILogin) => {
    // Fase 11B.10 — o local SQLite deixa de ser uma segunda fonte de
    // identidade independente; passa a representar "quem está autorizado a
    // desbloquear o cache local de uma sessão previamente autenticada", não
    // "quem é este utilizador perante a API".
    const apiResult = await loginOnApi(loginData.email, loginData.password);

    if (apiResult.success && apiResult.user) {
      // Online — a API já confirmou a identidade; o local nunca vale mais
      // do que isto e nunca pode vetar um login já aceite pelo servidor.
      // Só é sincronizado (upsert, nunca uma verificação) para continuar a
      // servir de cadeado do cache na próxima vez que a app abrir sem
      // ligação, já com a password actual.
      const localUser = await syncLocalUser({
        name: apiResult.user.name,
        email: apiResult.user.email,
        password: loginData.password,
      });
      setUser(localUser);
      setMustChangePassword(!!apiResult.mustChangePassword);
      localStorage.setItem('fleet_user', JSON.stringify(localUser));
      return;
    }

    if (apiResult.code !== 'OFFLINE') {
      // API alcançável e recusou o pedido — bloqueia aqui, nem chega a
      // consultar o local (a API é a autoridade final quando alcançável).
      // Propaga o motivo real (rate limit, credenciais inválidas, conta
      // inactiva, etc.) em vez de um "falha ao fazer login" genérico —
      // loginOnApi() já traz apiResult.message da resposta real da API.
      throw new Error(apiResult.message || 'auth:errors.loginFailed');
    }

    // Offline — aqui, e só aqui, o local SQLite desempenha o papel pedido:
    // desbloquear (ou não) o cache de uma sessão API já emitida por esta
    // mesma pessoa, nunca decidir Role/Scope/permissions/Organization (o
    // Desktop nunca leu isso do local, mesmo antes desta fase).
    const userData = await loginService(loginData);
    if (!userData) {
      throw new Error('auth:errors.loginFailed');
    }
    await tryRestoreCachedSession(loginData.email);
    setUser(userData);
    localStorage.setItem('fleet_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setMustChangePassword(false);
    localStorage.removeItem('fleet_user');
    // Liberta o token do utilizador que saiu — nunca deixar o próximo login
    // (mesmo Desktop, outro utilizador) herdar a sessão API anterior.
    void clearApiSession();
  };

  const clearMustChangePassword = () => setMustChangePassword(false);

  // Fase 11B.11 (estado 6 — "sessão revogada remotamente") — quando a API
  // recusa explicitamente a sessão actual (revogada por um admin, ou
  // expirada), license-helpers.ts já limpou os tokens/cache e mostrou o
  // toast; aqui só devolvemos a app ao ecrã de login, para nunca deixar
  // alguém "preso" dentro da app com a ligação à API morta.
  useEffect(() => {
    const handleSessionRevoked = () => logout();
    window.addEventListener(SESSION_REVOKED_EVENT, handleSessionRevoked);
    return () => window.removeEventListener(SESSION_REVOKED_EVENT, handleSessionRevoked);
  }, []);

  const updateUser = (updatedUser: IUser) => {
    setUser(updatedUser);
    localStorage.setItem('fleet_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        mustChangePassword,
        clearMustChangePassword,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
