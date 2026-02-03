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
      localStorage.removeItem('fleet_user');
  }

  /**
   * Verifica se existe algum usuário cadastrado
   */
  static async hasUsers(): Promise<boolean> {
    const db = getDb();
    const allUsers = await db.query.users.findMany({
      where: isNull(users.deleted_at)
    });
    console.log("AQUI", allUsers)
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
