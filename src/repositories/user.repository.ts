import { db } from '../database/connection';
import { users, userGroups, groups } from '../database/schema';
import { eq, and, asc } from 'drizzle-orm';
import {ConflictError, NotFoundError} from "@/errors/http.erros";

export class UserRepository {
  async findAll() {
      return db
          .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              active: users.active,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt,
          })
          .from(users)
          .orderBy(asc(users.name));
  }

    async findById(id: number) {
        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                active: users.active,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, id));

        return user;
    }

    async findByEmail(email: string, userId: number) {
    const result = await db.select().from(users).where(eq(users.email, email));

        if (!result.length) {
            return;
        }

        const user = result[0];

        if (user.id === userId) {
            return;
        }

        throw new ConflictError('E-mail já cadastrado');
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const result = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as any,
      })
      .returning();
    return result[0];
  }

  async update(id: number, data: Partial<{
    name: string;
    email: string;
    password: string;
    role: string;
    active: boolean;
  }>) {
    const result = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number) {
    const userGroups = await this.getUserGroups(id);
    if (userGroups && userGroups.length) {
      await Promise.all(userGroups.map((g: any) => {
        const groupId = g.groupId ?? g.id ?? g.group_id;
        return this.removeUserFromGroup(id, groupId);
      }));
    }
    
    await db.delete(users).where(eq(users.id, id));
  }

  async getUserGroups(userId: number) {
    return await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.userId, userId));
  }

  async addUserToGroup(userId: number, groupId: number) {
    const result = await db
      .insert(userGroups)
      .values({ userId, groupId })
      .returning();
    return result[0];
  }

  async removeUserFromGroup(userId: number, groupId: number) {
    await db
      .delete(userGroups)
      .where(and(eq(userGroups.userId, userId), eq(userGroups.groupId, groupId)));
  }
}

