// validators/it.validator.js

import { body } from 'express-validator';

export const updateRoleValidator = [
  body('newRole')
    .notEmpty()
    .withMessage('New role is required')
    .isIn(['farmer', 'engineer', 'manager', 'it'])
    .withMessage('Invalid role'),
];
