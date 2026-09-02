import express from "express";
import { register } from "../controllers/authController.js";
import { registerRules } from "../validators/authValidators.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/register", registerRules, validate, register);

export default router;