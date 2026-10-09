import { body } from 'express-validator';
import {
  GIG_CATEGORIES,
  MIN_TIERS,
  MAX_TIERS,
  MIN_TIER_PRICE_CENTS,
  MAX_TIER_PRICE_CENTS,
} from '../models/constants.js';

export const gigRules = [
  body('title')
    .isString()
    .withMessage('Please enter a title.')
    .bail()
    .trim()
    .isLength({ min: 3, max: 80 })
    .withMessage('Title must be 3 to 80 characters.'),

  body('category')
    .isString()
    .withMessage('Please choose a category.')
    .bail()
    .isIn(GIG_CATEGORIES)
    .withMessage('Please choose a valid category.'),

  body('description')
    .isString()
    .withMessage('Please enter a description.')
    .bail()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be 10 to 1000 characters.'),

  body('tiers')
    .isArray({ min: MIN_TIERS, max: MAX_TIERS })
    .withMessage(`A gig must have between ${MIN_TIERS} and ${MAX_TIERS} tiers.`),

  body('tiers.*.title')
    .isString()
    .withMessage('Each tier needs a title.')
    .bail()
    .trim()
    .isLength({ min: 2, max: 40 })
    .withMessage('Tier title must be 2 to 40 characters.'),

  body('tiers.*.description')
    .optional()
    .isString()
    .withMessage('Tier description can only be text.')
    .bail()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Tier description cannot exceed 200 characters.'),

  body('tiers.*.priceCents')
    .isInt({ min: MIN_TIER_PRICE_CENTS, max: MAX_TIER_PRICE_CENTS })
    .withMessage(
      `Tier price must be a whole number of cents from ${MIN_TIER_PRICE_CENTS} to ${MAX_TIER_PRICE_CENTS}.`
    )
    .toInt(),
];
