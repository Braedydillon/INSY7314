import { query } from 'express-validator';
import { TAX_TABLES } from '../config/taxTables.js';

export const taxRules = [
  query('taxYear')
    .optional()
    .isIn(Object.keys(TAX_TABLES))
    .withMessage('Cant find a tax table for that year.')
    .toInt(),
];
