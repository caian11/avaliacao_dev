import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive('Price deve ser positivo'),
  stock: z.number().positive('Stock deve ser positivo'),
  groupId: z.number().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive('Price deve ser positivo').optional(),
  stock: z.number().positive('Stock deve ser positivo').optional(),
  groupId: z.number().optional(),
});

