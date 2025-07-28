// routes/it.routes.js

import express from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemHealth,
  getSystemLogs,
  createBackup,
  restoreBackup,
  addQuestionWithAnswer,
  getAllQuestions,
  addUser
} from '../controllers/it.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { updateRoleValidator } from '../validators/it.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const router = express.Router();

router.use(authMiddleware, checkRole('it'));

router.get('/users', getAllUsers);

// ✅ ربطنا الـ Validator هنا
router.put('/users/:id/role', updateRoleValidator, validateRequest, updateUserRole);

router.delete('/users/:id', deleteUser);

// Questions management
router.get('/questions', getAllQuestions);
router.post('/questions', addQuestionWithAnswer);

// System monitoring routes
router.get('/system/health', getSystemHealth);
router.get('/system/logs', getSystemLogs);
router.post('/system/backup', createBackup);
router.post('/system/restore', restoreBackup);

router.post('/users', addUser);

export default router;
