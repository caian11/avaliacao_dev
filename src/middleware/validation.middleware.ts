import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      console.error('Validation error:', error);

      if (error instanceof ZodError) {
        const details = error.errors.map(e => ({
          path: e.path.length ? e.path.join('.') : '(root)',
          message: e.message
        }));
        return res.status(400).json({
          error: 'Validation error',
          message: 'Dados inválidos',
          details
        });
      }

      res.status(400).json({ error: 'Validation error' });
    }
  };
};

