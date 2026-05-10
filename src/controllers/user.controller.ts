import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, email, password, phone } = req.body;

      const result = await userService.register({
        username,
        email,
        password,
        phone,
      });

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      const result = await userService.login({ username, password });

      res.json({
        success: true,
        message: '登录成功',
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const user = await userService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { email, phone, avatar } = req.body;

      const user = await userService.updateUser(userId, {
        email,
        phone,
        avatar,
      });

      res.json({
        success: true,
        message: '更新成功',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { oldPassword, newPassword } = req.body;

      await userService.changePassword(userId, oldPassword, newPassword);

      res.json({
        success: true,
        message: '密码修改成功',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const role = req.query.role as string;
      const status = req.query.status as string;
      const keyword = req.query.keyword as string;

      const result = await userService.getUserList(page, pageSize, {
        role,
        status,
        keyword,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const user = await userService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
