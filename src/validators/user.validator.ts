import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': '用户名只能包含字母和数字',
      'string.min': '用户名至少3个字符',
      'string.max': '用户名最多30个字符',
      'any.required': '用户名不能为空',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱不能为空',
    }),
  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.min': '密码至少6个字符',
      'string.max': '密码最多50个字符',
      'any.required': '密码不能为空',
    }),
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': '手机号格式不正确',
    }),
});

export const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': '用户名不能为空',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': '密码不能为空',
    }),
});

export const updateProfileSchema = Joi.object({
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': '邮箱格式不正确',
    }),
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': '手机号格式不正确',
    }),
  avatar: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': '头像地址格式不正确',
    }),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .messages({
      'any.required': '原密码不能为空',
    }),
  newPassword: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.min': '新密码至少6个字符',
      'string.max': '新密码最多50个字符',
      'any.required': '新密码不能为空',
    }),
});

export const userIdSchema = Joi.object({
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': '用户ID格式不正确',
      'any.required': '用户ID不能为空',
    }),
});

export const userListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.min': '页码必须大于0',
    }),
  pageSize: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'number.min': '每页数量必须大于0',
      'number.max': '每页数量最多100',
    }),
  role: Joi.string()
    .valid('admin', 'user', 'guest')
    .optional()
    .messages({
      'any.only': '角色必须是 admin、user 或 guest',
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'banned')
    .optional()
    .messages({
      'any.only': '状态必须是 active、inactive 或 banned',
    }),
  keyword: Joi.string()
    .optional(),
});
