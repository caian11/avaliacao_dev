import { UserRepository } from '../repositories/user.repository';
import { ConflictError, NotFoundError } from '../errors/http.erros';
import bcrypt from 'bcryptjs';
import { GroupRepository } from "@/repositories/group.repository";

export class UserService {
  private userRepository: UserRepository;
  private groupRepository: GroupRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.groupRepository = new GroupRepository();
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ConflictError('User not found');
    }
    return user;
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const existing = await this.userRepository.findByEmail(data.email);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async updateUser(id: number, data: Partial<{
    name: string;
    email: string;
    password: string;
    role: string;
    active: boolean;
  }>) {

     const existing = await this.userRepository.findByEmail(data.email, id);

     const user = await this.getUserById(id);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: number) {
     const user = await this.getUserById(id);

    await this.userRepository.delete(id);
    return;
  }

  async getUserGroups(userId: number) {
    return await this.userRepository.getUserGroups(userId);
  }

  async addUserToGroup(userId: number, groupId: number) {
    const user = await this.getUserById(userId);
    const group = await this.groupRepository.findById(groupId);

    const userGroups = await this.userRepository.getUserGroups(userId);
    const alreadyInGroup = userGroups.some((g: any) => g.groupId === groupId);

    if (alreadyInGroup) {
      throw new ConflictError('Usuário já esta associado ao grupo');
    }

    return await this.userRepository.addUserToGroup(userId, groupId);
  }

  async removeUserFromGroup(userId: number, groupId: number) {
      const user = await this.getUserById(userId);
      const group = await this.groupRepository.findById(groupId);

      const userGroups = await this.userRepository.getUserGroups(userId);
      const alreadyInGroup = userGroups.some((g: any) => g.groupId === groupId);

      if (!alreadyInGroup) {
          throw new NotFoundError('Usuário não esta associado ao grupo');
      }

    await this.userRepository.removeUserFromGroup(userId, groupId);
  }
}

