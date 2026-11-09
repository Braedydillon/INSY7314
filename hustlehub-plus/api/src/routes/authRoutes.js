import express from 'express';
import { login, register, forgotPassword, resetPassword } from '../controllers/authController.js';
import {
  loginRules,
  registerRules,
  forgotPasswordRules,
  resetPasswordRules,
} from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter, registerLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', registerLimiter, registerRules, validate, register);

router.post('/login', loginLimiter, loginRules, validate, login);

router.post('/forgot-password', passwordResetLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPasswordRules, validate, resetPassword);

export default router;
