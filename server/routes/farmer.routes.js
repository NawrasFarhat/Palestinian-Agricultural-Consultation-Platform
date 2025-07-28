// routes/farmer.routes.js

import express from 'express';
import {
  getDiseases,
  submitSymptoms,
  getMyDiagnoses,
  submitAnswers,
  autoDiagnose,
  farmerDashboard,
  submitFeedback,
  submitSupportRequest
} from '../controllers/farmer.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { diagnoseValidator, answersValidator } from '../validators/farmer.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const router = express.Router();

// ✅ حماية كل المسارات
router.use(authMiddleware, checkRole('farmer'));

// ✅ لوحة التحكم
router.get('/dashboard', farmerDashboard);

// ✅ عرض الأمراض المتوفرة
router.get('/diseases', getDiseases);

// ✅ إرسال وصف الأعراض
router.post('/diagnose', diagnoseValidator, validateRequest, submitSymptoms);

// ✅ عرض التشخيصات الخاصة بي
router.get('/my-diagnoses', getMyDiagnoses);

// ✅ إرسال إجابات الأسئلة
router.post('/answers', answersValidator, validateRequest, submitAnswers);

// ✅ التشخيص الذكي التلقائي
router.post('/diagnose/auto', autoDiagnose);

// ✅ إرسال ملاحظات (feedback)
router.post('/feedback', submitFeedback);

// ✅ إرسال طلب دعم (support)
router.post('/support', submitSupportRequest);

export default router;
