import { Router } from "express";
import { body } from "express-validator";
import { signup, login } from "../controllers/authController";

const router = Router();

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
  ],
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty()
  ],
  login
);

export default router;

