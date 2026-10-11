
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorise } from '../middleware/authorise.js';

import {
  getAdminUsers,
  getAdminGigs,
  getAdminBookings,
  getAdminTransactions
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorise('admin'));

router.get('/users', getAdminUsers);
router.get('/gigs', getAdminGigs);
router.get('/bookings', getAdminBookings);
router.get('/transactions', getAdminTransactions);

export default router;
