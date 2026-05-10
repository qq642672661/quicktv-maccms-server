import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { AppError } from './error-handler';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('未提供认证令牌', 401);
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        username: string;
        email: string;
        role: string;
      };

      req.user = decoded;
      next();
    } catch (error) {
      throw new AppError('无效或过期的令牌', 401);
    }
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('未认证', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('权限不足', 403));
    }

    next();
  };
};

export const requireAdmin = () => {
  return requireRole('admin', 'superadmin');
};

export default authMiddleware;
