import express from 'express';
import { diagnose, getDiseaseSuggestions } from '../controllers/ai.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ AI diagnosis endpoint (requires authentication)
router.post('/diagnose', authMiddleware, diagnose);

// ✅ Disease suggestions endpoint (public)
router.get('/suggestions', getDiseaseSuggestions);

export default router;
