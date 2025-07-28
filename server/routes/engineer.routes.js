// routes/engineer.routes.js

import express from 'express';
import {
  engineerDashboard,
  addDiseaseWithQuestions,
  getQuestionsForDisease,
  addQuestionToDisease,
  updateQuestion,
  deleteQuestion,
  submitChange,
  submitDiseaseEdit
} from '../controllers/engineer.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { diseaseWithQuestionsValidator, diseaseEditValidator } from '../validators/engineer.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const router = express.Router();

// ✅ حماية كل المسارات
router.use(authMiddleware, checkRole('engineer'));

// ✅ لوحة التحكم
router.get('/dashboard', engineerDashboard);

// ✅ إضافة مرض جديد مع أسئلة
router.post('/diseases', diseaseWithQuestionsValidator, validateRequest, addDiseaseWithQuestions);

// Diagnostic questions management
router.get('/diseases/:diseaseId/questions', getQuestionsForDisease);
router.post('/diseases/:diseaseId/questions', addQuestionToDisease);
router.put('/questions/:questionId', updateQuestion);
router.delete('/questions/:questionId', deleteQuestion);

router.post('/submit-change', submitChange);

// Submit disease edit for approval
router.post('/submit-disease-edit', diseaseEditValidator, validateRequest, submitDiseaseEdit);

export default router;
