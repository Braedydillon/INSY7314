import { body } from 'express-validator';
import { stripHtml } from '../middleware/sanitizers.js';

export const updateProfileRules = [
  stripHtml('displayName'),
  body('displayName')
    .optional()
    .isString()
    .withMessage('Display name must be text.')
    .bail()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Display name must be 1 to 40 characters.'),

  stripHtml('displayName'),
  body('contactMethod')
    .optional()
    .isString()
    .withMessage('Contact method must be text.')
    .bail()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Contact method cannot exceed 120 characters.'),

  body()
    .custom(
      (value) =>
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(value).length > 0 &&
        Object.keys(value).every((key) => ['displayName', 'contactMethod'].includes(key))
    )
    .withMessage('Only displayName and contactMethod can be updated.'),
];
