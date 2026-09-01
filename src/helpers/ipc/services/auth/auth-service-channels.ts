//src/helpers/services/auth/auth-service-channels.ts
export const LOGIN = "service-auth:login";
export const LOGOUT = "service-auth:logout";
export const LOGOUT_ALL_USERS = "service-auth:logout-all-users";
export const HAS_USERS = "service-auth:has-users";
export const CREATE_FIRST_USER = "service-auth:create-first-user";
export const CHANGE_PASSWORD = "service-auth:change-password";
export const UPDATE_PROFILE = "service-auth:update-profile";
export const SET_API_TOKEN = 'service-auth:set-api-token';

// Fase 11B.9 — cache local (safeStorage) da sessão API do utilizador.
export const SAVE_CACHED_SESSION  = 'service-auth:save-cached-session';
export const GET_CACHED_SESSION   = 'service-auth:get-cached-session';
export const CLEAR_CACHED_SESSION = 'service-auth:clear-cached-session';

// Fase 11B.10 — sincroniza o registo local ("cadeado do cache") com a
// identidade que a API acabou de confirmar num login online bem-sucedido.
export const SYNC_LOCAL_USER = 'service-auth:sync-local-user';
