import { body, param } from 'express-validator';

export const bookingRules = [
  body('gigId').isMongoId().withMessage('Invalid gig ID'),
  body('tierId').isMongoId().withMessage('Invalid tier ID'),
];

export const bookingIdRule = [param('id').isMongoId().withMessage('Invalid booking ID')];
