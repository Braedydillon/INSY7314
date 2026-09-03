import express from 'express';
import { login, register } from '../controllers/authController.js';
import { loginRules, registerRules } from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', registerRules, validate, register);

router.post('/login', loginRules, validate, login);

export default router;
