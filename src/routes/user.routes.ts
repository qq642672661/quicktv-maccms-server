import { Router, type Router as RouterType } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validate, validateQuery, validateParams } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  userIdSchema,
  userListQuerySchema,
} from '../validators/user.validator';

const router: RouterType = Router();

router.post('/register', validate(registerSchema), userController.register);

router.post('/login', validate(loginSchema), userController.login);

router.get('/profile', authMiddleware, userController.getProfile);

router.put(
  '/profile',
  authMiddleware,
  validate(updateProfileSchema),
  userController.updateProfile
);

router.put(
  '/password',
  authMiddleware,
  validate(changePasswordSchema),
  userController.changePassword
);

router.get(
  '/list',
  authMiddleware,
  requireRole('admin', 'superadmin'),
  validateQuery(userListQuerySchema),
  userController.getUserList
);

router.get(
  '/:userId',
  authMiddleware,
  requireRole('admin', 'superadmin'),
  validateParams(userIdSchema),
  userController.getUserById
);

export default router;
