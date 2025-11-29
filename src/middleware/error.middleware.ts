import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http.erros';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  const message =
    status === 500 && isProd
      ? 'Erro interno do servidor'
      : err.message || 'Erro interno do servidor';

  res.status(status).json({
    error: message,
    ...(isProd ? {} : { stack: err.stack }),
  });
};

