import { GroupRepository } from '../repositories/group.repository';
import { ProductRepository } from '../repositories/product.repository';
import { ConflictError, NotFoundError } from '../errors/http.erros';

export class GroupService {
  private groupRepository: GroupRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.groupRepository = new GroupRepository();
    this.productRepository = new ProductRepository();
  }

  async getAllGroups() {
    return await this.groupRepository.findAll();
  }

  async getGroupById(id: number) {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new ConflictError('Group not found');
    }
    return group;
  }

  async createGroup(data: { name: string; description?: string }) {
      const existing = await this.groupRepository.findByName?.(data.name) ?? null;
      if (existing) {
          throw new ConflictError('Grupo com esse nome já existe');
      }
    return await this.groupRepository.create(data);
  }

  async updateGroup(id: number, data: Partial<{ name: string; description: string }>) {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundError('Grupo não encontrado');
    }

    if (data.name) {
      const existing = await this.groupRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError('Grupo com esse nome já existe');
      }
    }

    return await this.groupRepository.update(id, data);
  }

  async deleteGroup(id: number) {
    const group = await this.getGroupById(id);

      const products = await this.productRepository.findByGroup?.(id) ?? [];
      const users = await this.groupRepository.getGroupUsers(id);

      if (products && products.length > 0) {
          throw new ConflictError('Não é possível deletar grupo com produtos associados');
      }

      if (users && users.length > 0) {
          throw new ConflictError('Não é possível deletar grupo com usuários associados');
      }

    await this.groupRepository.delete(id);
  }

  async getGroupUsers(groupId: number) {
    return await this.groupRepository.getGroupUsers(groupId);
  }
}

