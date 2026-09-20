// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/lib/services/auth.service.ts
// ========================================

import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db/db_client';
import { users } from '@/lib/db/schemas';
import { eq, isNull } from 'drizzle-orm';
import { IUser } from '@/lib/types/user';
import { generateUuid } from '../utils/cripto';

export class AuthService {
  static async findUserByEmail(email: string) {
    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    if (user && user.deleted_at) return null;
    return user || null;
  }

  static async findUserById(userId: string) {
    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    if (user && user.deleted_at) return null;
    return user || null;
  }

  static async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }

  static isUserActive(user: any): boolean {
    return !!user?.is_active;
  }
  static async finishLogin(userId: string): Promise<IUser> {
    const db = getDb();
    await db
      .update(users)
      .set({
        last_access_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .where(eq(users.id, userId));
    const record = await db.query.users.findFirst({ where: eq(users.id, userId) });
    return {
      id: record!.id,
      name: record!.name,
      email: record!.email,
      avatar: record!.avatar || undefined
    };
  }

  static async logout(userId: string): Promise<void> {
    const db = getDb();
    await db
      .update(users)
      .set({ 
        last_access_at: null,
        updated_at: new Date().toISOString()
      })
      .where(eq(users.id, userId));
  }

  static async logoutAllUsers (): Promise<void>  {
    const db = getDb();
    await db
      .update(users)
      .set({
        last_access_at: null,
        updated_at: new Date().toISOString()
      })
      .where(isNull(users.deleted_at));
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fleet_user');
    }
  }

  /**
   * Verifica se existe algum usuário cadastrado
   */
  static async hasUsers(): Promise<boolean> {
    const db = getDb();
    const allUsers = await db.query.users.findMany({
      where: isNull(users.deleted_at)
    });
    // console.log("AQUI", allUsers)
    return allUsers.length > 0;
  }

  /**
   * Criar primeiro usuário (setup inicial)
   */
  static async createFirstUser(
    name: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const db = getDb();

    const userId = generateUuid();
    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      id: userId,
      name,
      email,
      password_hash: passwordHash,
      is_active: true,
      created_by: userId,
      updated_by: userId
    });

    return { id: userId, name, email };
  }

  /**
   * Trocar senha
   */
  static async changePassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    const db = getDb();
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
        updated_by: userId
      })
      .where(eq(users.id, userId));
  }

  /**
   * Fase 11B.10 — sincroniza (upsert) a representação local de um
   * utilizador que a API acabou de autenticar com sucesso. Nunca decide
   * identidade por si só (a API já decidiu, é a chamadora deste método) —
   * só cria/actualiza o registo local para continuar a servir de cadeado
   * do cache offline com a password actual. "API User ↕ local user
   * representation": o local passa a ser um espelho, nunca uma segunda
   * fonte independente.
   */
  static async syncLocalUnlockRecord(
    name: string,
    email: string,
    password: string,
  ): Promise<IUser> {
    const db = getDb();
    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await AuthService.findUserByEmail(email);

    if (existing) {
      await db
        .update(users)
        .set({
          name,
          password_hash: passwordHash,
          is_active: true,
          updated_at: new Date().toISOString(),
          updated_by: existing.id,
        })
        .where(eq(users.id, existing.id));
      return { id: existing.id, name, email };
    }

    const userId = generateUuid();
    await db.insert(users).values({
      id: userId,
      name,
      email,
      password_hash: passwordHash,
      is_active: true,
      created_by: userId,
      updated_by: userId,
    });
    return { id: userId, name, email };
  }

  /**
   * 2026-09-20 — lista os "cadeados" locais (utilizadores que já fizeram
   * login online, pelo menos uma vez, nesta máquina) para a nova secção de
   * gestão em Definições → Licença. Nunca mostra password_hash.
   */
  static async listUnlockRecords(): Promise<Array<{ id: string; name: string; email: string; last_access_at: string | null }>> {
    const db = getDb();
    const rows = await db.query.users.findMany({ where: isNull(users.deleted_at) });
    return rows.map((u) => ({ id: u.id, name: u.name, email: u.email, last_access_at: u.last_access_at }));
  }

  /**
   * Remove um único "cadeado" local (ex. um admin a limpar o registo de
   * alguém que já não trabalha cá) — hard delete, nunca soft, porque não há
   * nenhum caso de uso para "recuperar" um cadeado apagado.
   */
  static async deleteUnlockRecord(userId: string): Promise<void> {
    const db = getDb();
    await db.delete(users).where(eq(users.id, userId));
  }

  /**
   * Limpeza ao trocar de organização nesta máquina (ver
   * wipeLocalDataForIdentitySwitch em license-helpers.ts) — achado real:
   * até aqui só o PowerSync era limpo numa troca de licença para outra
   * Organization; os "cadeados" locais (nome/email/hash de password de
   * quem já fez login nesta máquina) ficavam para sempre, incluindo depois
   * da máquina passar a servir um cliente diferente — uma fuga real de PII
   * entre organizações na mesma máquina partilhada.
   */
  static async wipeAllUnlockRecords(): Promise<void> {
    const db = getDb();
    await db.delete(users);
  }

  /**
   * Actualizar perfil
   */
  static async updateProfile(
    userId: string,
    data: { name?: string; email?: string; avatar?: string }
  ): Promise<IUser> {
    const db = getDb();
    const [updated] = await db
      .update(users)
      .set({
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: userId
      })
      .where(eq(users.id, userId))
      .returning();

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar || undefined
    };
  }
}
