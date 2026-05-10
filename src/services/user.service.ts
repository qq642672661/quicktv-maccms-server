import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import db from '../config/database';
import config from '../config';
import { AppError } from '../middleware/error-handler';
import logger from '../utils/logger';

export interface User {
  user_id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export class UserService {
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    return await db.transaction(async (client) => {
      const existingUser = await client.query(
        "SELECT id FROM users WHERE username = $1 OR email = $2",
        [data.username, data.email],
      );

      if (existingUser.rows.length > 0) {
        throw new AppError("用户名或邮箱已存在", 400);
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      const result = await client.query(
        `INSERT INTO users (username, email, password_hash, phone, role, status)
         VALUES ($1, $2, $3, $4, 'user', 'active')
         RETURNING id as user_id, username, email, role, status, avatar_url as avatar, created_at, updated_at`,
        [data.username, data.email, hashedPassword, data.phone || null],
      );

      const user = result.rows[0];

      await client.query(
        `INSERT INTO user_statistics (user_id)
         VALUES ($1)`,
        [user.user_id],
      );

      const token = this.generateToken(user);

      logger.info(`用户注册成功: ${user.username}`);

      return { user, token };
    });
  }

  async login(data: LoginData): Promise<{ user: User; token: string }> {
    const result = await db.query(
      `SELECT id as user_id, username, email, password_hash, role, status, avatar_url as avatar, created_at, updated_at
       FROM users
       WHERE username = $1`,
      [data.username],
    );

    if (result.rows.length === 0) {
      throw new AppError("用户名或密码错误", 401);
    }

    const user = result.rows[0];

    if (user.status !== "active") {
      throw new AppError("账号已被禁用", 403);
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new AppError("用户名或密码错误", 401);
    }

    await db.query(
      `UPDATE users
       SET last_login_at = CURRENT_TIMESTAMP, last_login_ip = $1
       WHERE id = $2`,
      ["0.0.0.0", user.user_id],
    );

    delete user.password_hash;

    const token = this.generateToken(user);

    logger.info(`用户登录成功: ${user.username}`);

    return { user, token };
  }

  async getUserById(userId: string): Promise<User> {
    const result = await db.query(
      `SELECT id as user_id, username, email, role, status, avatar_url as avatar, phone, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      throw new AppError("用户不存在", 404);
    }

    return result.rows[0];
  }

  async updateUser(
    userId: string,
    data: Partial<{ email: string; phone: string; avatar: string }>,
  ): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }

    if (data.phone) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }

    if (data.avatar) {
      fields.push(`avatar_url = $${paramIndex++}`);
      values.push(data.avatar);
    }

    if (fields.length === 0) {
      throw new AppError("没有需要更新的字段", 400);
    }

    values.push(userId);

    const result = await db.query(
      `UPDATE users
       SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING id as user_id, username, email, role, status, avatar_url as avatar, phone, created_at, updated_at`,
      values,
    );

    if (result.rows.length === 0) {
      throw new AppError("用户不存在", 404);
    }

    logger.info(`用户信息更新成功: ${userId}`);

    return result.rows[0];
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const result = await db.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      throw new AppError("用户不存在", 404);
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      result.rows[0].password_hash,
    );

    if (!isPasswordValid) {
      throw new AppError("原密码错误", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hashedPassword, userId],
    );

    logger.info(`用户密码修改成功: ${userId}`);
  }

  async getUserList(
    page: number = 1,
    pageSize: number = 20,
    filters?: { role?: string; status?: string; keyword?: string },
  ): Promise<{ users: User[]; total: number; page: number; pageSize: number }> {
    const offset = (page - 1) * pageSize;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.role) {
      conditions.push(`role = $${paramIndex++}`);
      values.push(filters.role);
    }

    if (filters?.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters?.keyword) {
      conditions.push(
        `(username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`,
      );
      values.push(`%${filters.keyword}%`);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      values,
    );

    const total = parseInt(countResult.rows[0].total);

    values.push(pageSize, offset);

    const result = await db.query(
      `SELECT id as user_id, username, email, role, status, avatar_url as avatar, phone, created_at, updated_at, last_login_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values,
    );

    return {
      users: result.rows,
      total,
      page,
      pageSize,
    };
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
    };
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }
}

export const userService = new UserService();
