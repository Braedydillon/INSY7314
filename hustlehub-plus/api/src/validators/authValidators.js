import { body } from 'express-validator';

export const registerRules = [
  body('email')
    .isString()
    .notEmpty()
    .withMessage('Please enter an email address.')
    .bail()
    .trim()
    .isEmail()
    .withMessage('Email format is invalid.')
    .normalizeEmail(),

  body('password')
    .isString()
    .notEmpty()
    .withMessage('Please enter a password')
    .bail()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      'Password must be 12 characters minimum and include 1 symbol, number, uppercase, and lowercase character'
    ),

  body('name')
    .isString()
    .withMessage('Please enter your first name')
    .bail()
    .trim()
    .matches(/^[A-Za-z '-]{1,50}$/)
    .withMessage('Please enter a valid name'),

  body('surname')
    .isString()
    .withMessage('Please enter your surname')
    .bail()
    .trim()
    .matches(/^[A-Za-z '-]{1,50}$/)
    .withMessage('Please enter a valid surname'),

  body('displayName')
    .isString()
    .withMessage('Please enter a display name')
    .bail()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Display name must be 1 to 40 characters'),

  body('role')
    .isString()
    .bail()
    .isIn(['client', 'freelancer'])
    .withMessage('Role must be client or freelancer'),

  body('contactMethod')
    .optional()
    .isString()
    .bail()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Contact method cannot exceed 120 characters'),
];

export const loginRules = [
  body('email')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Please enter an email address')
    .bail()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .isString()
    .withMessage('Password is required')
    .bail()
    .notEmpty()
    .withMessage('Password is required'),
];
