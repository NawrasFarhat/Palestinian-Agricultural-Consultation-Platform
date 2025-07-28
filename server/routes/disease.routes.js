// routes/disease.routes.js
import express from 'express';
import {
  getAllDiseases,
  getDiseaseById,
  createDisease,
  updateDisease,
  deleteDisease
} from '../controllers/disease.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// List all diseases
router.get('/', getAllDiseases);
// Get a single disease
router.get('/:id', getDiseaseById);
// Create a new disease (engineer or manager)
router.post('/', createDisease);
// Update a disease (engineer or manager)
router.put('/:id', updateDisease);
// Delete a disease (manager only)
router.delete('/:id', deleteDisease);

export default router; 