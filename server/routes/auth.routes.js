// routes/auth.routes.js

import express from 'express';
import { register, login, requestRoleChange } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ تسجيل مستخدم جديد
router.post('/register', registerValidator, validateRequest, register);

// ✅ تسجيل الدخول
router.post('/login', loginValidator, validateRequest, login);

// ✅ طلب تغيير الدور
router.post('/request-role-change', authMiddleware, requestRoleChange);

export default router;
