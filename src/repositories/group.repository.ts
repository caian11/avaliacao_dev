import { db } from '../database/connection';
import { groups, userGroups, users } from '../database/schema';
import { eq } from 'drizzle-orm';

export class GroupRepository {
  async findAll() {
    return await db.select().from(groups);
  }

  async findById(id: number) {
    const result = await db.select().from(groups).where(eq(groups.id, id));
    return result[0];
  }

    async findByName(name: string) {
    const groups = await this.findAll();
    return groups.find((g: any) => g.name === name) ?? null;
  }

  async create(data: { name: string; description?: string }) {
    const result = await db.insert(groups).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<{ name: string; description: string }>) {
    const result = await db
      .update(groups)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number) {
    await db.delete(groups).where(eq(groups.id, id));
  }

    async getGroupUsers(groupId: number) {
        const rows = await db
            .select({
                user: users,
            })
            .from(userGroups)
            .innerJoin(users, eq(userGroups.userId, users.id))
            .where(eq(userGroups.groupId, groupId));

        return rows.map(r => {
            const { password, ...safeUser } = r.user;
            return safeUser;
        });
    }

}

