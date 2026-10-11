import express from 'express';
import { login, register } from '../controllers/authController.js';
import { loginRules, registerRules } from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', registerLimiter, registerRules, validate, register);

router.post('/login', loginLimiter, loginRules, validate, login);

export default router;
