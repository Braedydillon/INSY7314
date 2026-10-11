import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorise } from '../middleware/authorise.js';
import { validate } from '../middleware/validate.js';
import { bookingRules, bookingIdRule } from '../validators/bookingValidators.js';
import {
  createBooking,
  getMyBookings,
  getBooking,
  acceptBooking,
  declineBooking,
  cancelBooking,
  completeBooking,
} from '../controllers/bookingController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorise('client'), bookingRules, validate, createBooking);
router.get('/mybookings', authorise('client', 'freelancer'), getMyBookings);
router.get('/:id', bookingIdRule, validate, getBooking);

router.patch('/:id/accept', authorise('freelancer'), bookingIdRule, validate, acceptBooking);
router.patch('/:id/complete', authorise('freelancer'), bookingIdRule, validate, completeBooking);
router.patch('/:id/decline', authorise('freelancer'), bookingIdRule, validate, declineBooking);
router.patch('/:id/cancel', authorise('client'), bookingIdRule, validate, cancelBooking);

export default router;
