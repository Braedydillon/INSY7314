import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMe, updateMe } from '../controllers/userController.js';
import { updateProfileRules} from '../validators/userValidators.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/me', authenticate, getMe);

router.patch('/me', authenticate, updateProfileRules, validate, updateMe);

export default router;
