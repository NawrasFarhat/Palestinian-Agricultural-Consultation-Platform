// validators/engineer.validator.js

import { body } from 'express-validator';

export const diseaseWithQuestionsValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Disease name is required'),

  body('symptoms')
    .trim()
    .notEmpty().withMessage('Symptoms are required'),

  body('solution')
    .trim()
    .notEmpty().withMessage('Solution is required'),

  body('questions')
    .isArray({ min: 1 }).withMessage('At least one question is required'),

  body('questions.*')
    .trim()
    .notEmpty().withMessage('Question text cannot be empty'),
];

export const diseaseEditValidator = [
  body('diseaseId')
    .isInt({ min: 1 }).withMessage('Valid disease ID is required'),

  body('name')
    .trim()
    .notEmpty().withMessage('Disease name is required'),

  body('symptoms')
    .trim()
    .notEmpty().withMessage('Symptoms are required'),

  body('solution')
    .trim()
    .notEmpty().withMessage('Solution is required'),

  // Questions are optional for editing
  body('questions')
    .optional()
    .isArray().withMessage('Questions must be an array if provided'),

  body('questions.*')
    .optional()
    .trim()
    .notEmpty().withMessage('Question text cannot be empty if provided'),
];

