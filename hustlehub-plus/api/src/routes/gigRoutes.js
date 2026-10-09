import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorise } from '../middleware/authorise.js';
import { validate } from '../middleware/validate.js';
import { gigRules, browseRules, gigIdRule } from '../validators/gigValidators.js';
import {
  createGig,
  getMyGigs,
  browseGigs,
  getGig,
  updateGig,
  deleteGig,
} from '../controllers/gigController.js';

const router = express.Router();

router.get('/', browseRules, validate, browseGigs);
router.get('/mygigs', authenticate, authorise('freelancer'), getMyGigs);
router.get('/:id', gigIdRule, validate, getGig);

router.post('/', authenticate, authorise('freelancer'), gigRules, validate, createGig);
router.put('/:id', authenticate, authorise('freelancer'), gigIdRule, gigRules, validate, updateGig);
router.delete(
  '/:id',
  authenticate,
  authorise('freelancer', 'admin'),
  gigIdRule,
  validate,
  deleteGig
);

export default router;
