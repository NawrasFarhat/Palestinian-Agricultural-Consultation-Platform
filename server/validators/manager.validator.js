// validators/manager.validator.js

import { body } from 'express-validator';

export const changeRoleValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),

  body('newRole')
    .notEmpty()
    .withMessage('New role is required')
    .isIn(['farmer', 'engineer', 'manager', 'it'])
    .withMessage('Invalid role'),
];
