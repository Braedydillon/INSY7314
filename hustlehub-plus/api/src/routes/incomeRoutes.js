import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorise } from '../middleware/authorise.js';
import { getMyIncome, getMyTransactions } from '../controllers/incomeController.js';

const router = express.Router();

router.use(authenticate);

router.get('/income/me', authorise('freelancer'), getMyIncome);
router.get('/transactions/mytransactions', authorise('client', 'freelancer'), getMyTransactions);

export default router;
