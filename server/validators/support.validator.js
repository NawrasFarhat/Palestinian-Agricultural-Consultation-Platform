// validators/support.validator.js

import { body } from 'express-validator';

export const supportRequestValidator = [
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required'),

  body('type')
    .optional()
    .isIn(['bug', 'feedback', 'question']).withMessage('Invalid support type'),
];

