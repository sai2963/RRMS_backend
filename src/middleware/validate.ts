import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { HTTP_STATUS } from '../constants';

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.reduce<Record<string, string[]>>((acc, err) => {
          const field = err.path.slice(1).join('.') || 'unknown';
          if (!acc[field]) acc[field] = [];
          acc[field].push(err.message);
          return acc;
        }, {});

        res.status(HTTP_STATUS.UNPROCESSABLE).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(error);
    }
  };
