// validators/auth.validator.js

import { body } from 'express-validator';
import Joi from 'joi';

export const registerValidator = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    phone: Joi.string().min(6).max(20).required(),
    password: Joi.string().min(6).max(255).required(),
    // Explicitly forbid role
    role: Joi.forbidden(),
    email: Joi.forbidden()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const loginValidator = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

