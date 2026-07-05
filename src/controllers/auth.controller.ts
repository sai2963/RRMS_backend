import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response.util';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    sendCreated(res, result, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response): void => {
  sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.userId);
    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};
