import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db/db_client';
import { users } from '@/lib/db/schemas';
import { eq, and, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { IUser } from '@/lib/types/user';
import { generateUuid } from '../utils/cripto';

export class AuthService {
  /**
   * Login - verifica credenciais e retorna usuário
   */
  static async login(email: string, password: string): Promise<IUser> {
    const db = getDb();
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.email, email),
        isNull(users.deleted_at)
      )
    });

    if (!user) {
      throw new Error('Utilizador não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new Error('Senha incorreta');
    }

    if (!user.is_active) {
      throw new Error('Utilizador inativo');
    }

    // Actualizar último acesso
    await db
      .update(users)
      .set({ 
        last_access_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .where(eq(users.id, user.id));

    // Retornar dados sem a senha
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || undefined
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
    // Verificar se já existe usuário
    const hasUsers = await this.hasUsers();
    if (hasUsers) {
      throw new Error('Já existe um utilizador cadastrado');
    }

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
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      throw new Error('Utilizador não encontrado');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

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