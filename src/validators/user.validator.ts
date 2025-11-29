import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  role: z.enum(['admin', 'user', 'viewer']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'user', 'viewer']).optional(),
  active: z.boolean().optional(),
});

export const addUserToGroupSchema = z.object({
    groupId: z.coerce.number({
        required_error: 'groupId é obrigatório',
        invalid_type_error: 'groupId deve ser numérico',
    }).int('groupId deve ser inteiro').positive('groupId deve ser positivo'),
});

export const removeUserFromGroupSchema = addUserToGroupSchema;

