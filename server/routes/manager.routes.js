// routes/manager.routes.js

import express from 'express';
import {
  changeUserRole,
  getAllDiseasesWithEngineers,
  getPendingChanges,
  approveSubmission,
  rejectSubmission,
  getRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  updateDiseaseDirectly,
  getQuestionsForDisease,
  addDiseaseAsManager,
  getAllUsers
} from '../controllers/manager.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { changeRoleValidator } from '../validators/manager.validator.js';
import { diseaseWithQuestionsValidator } from '../validators/engineer.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const router = express.Router();

router.use(authMiddleware, checkRole('manager'));

router.put('/change-role', changeRoleValidator, validateRequest, changeUserRole);

// Manager can access disease questions for editing (more specific route first)
router.get('/diseases/:diseaseId/questions', getQuestionsForDisease);
router.get('/diseases', getAllDiseasesWithEngineers);

// Pending approvals management
router.get('/pending-changes', getPendingChanges);
router.post('/approve/:id', approveSubmission);
router.post('/reject/:id', rejectSubmission);

router.get('/role-requests', getRoleRequests);
router.post('/role-requests/:id/approve', approveRoleRequest);
router.post('/role-requests/:id/reject', rejectRoleRequest);

// Manager can update diseases directly (no approval needed)
router.post('/update-disease', diseaseWithQuestionsValidator, validateRequest, updateDiseaseDirectly);

// Manager can add diseases directly (no approval needed)
router.post('/add-disease', diseaseWithQuestionsValidator, validateRequest, addDiseaseAsManager);

// Manager can get users for role management
router.get('/users', getAllUsers);

export default router;
