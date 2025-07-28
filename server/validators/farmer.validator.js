// validators/farmer.validator.js

import { body } from 'express-validator';

export const diagnoseValidator = [
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
];

export const answersValidator = [
  body('answers')
    .isArray({ min: 1 }).withMessage('Answers must be a non-empty array'),
  
  body('answers.*.question_id')
    .notEmpty().withMessage('Each answer must have a question_id'),

  body('answers.*.answer')
    .notEmpty().withMessage('Each answer must contain a response'),
];

