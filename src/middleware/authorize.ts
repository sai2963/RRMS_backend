import { Request, Response, NextFunction } from 'express';
import { UserRole, HTTP_STATUS } from '../constants';

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      });
      return;
    }

    next();
  };
