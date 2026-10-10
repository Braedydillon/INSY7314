import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorise } from '../middleware/authorise.js';
import { validate } from '../middleware/validate.js';
import { bookingRules, bookingIdRule } from '../validators/bookingValidators.js';
import { createBooking, getMyBookings, getBooking } from '../controllers/bookingController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorise('client'), bookingRules, validate, createBooking);
router.get('/mybookings', authorise('client', 'freelancer'), getMyBookings);
router.get('/:id', bookingIdRule, validate, getBooking);

export default router;
