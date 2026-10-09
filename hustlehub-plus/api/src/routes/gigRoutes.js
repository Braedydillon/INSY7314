import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorise } from '../middleware/authorise.js';
import { validate } from '../middleware/validate.js';
import { gigRules } from '../validators/gigValidators.js';
import { createGig, getMyGigs } from '../controllers/gigController.js';

const router = express.Router();

router.get('/mygigs', authenticate, authorise('freelancer'), getMyGigs);
router.post('/', authenticate, authorise('freelancer'), gigRules, validate, createGig);

export default router;
