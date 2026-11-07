import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorise } from '../middleware/authorise.js';
import { getMyIncome, getMyTransactions, getMyTax } from '../controllers/incomeController.js';
import { validate } from '../middleware/validate.js';
import { taxRules } from '../validators/financeValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/income', authorise('freelancer'), getMyIncome);
router.get('/transactions', authorise('client', 'freelancer'), getMyTransactions);
router.get('/tax', authorise('freelancer'), taxRules, validate, getMyTax);

export default router;
