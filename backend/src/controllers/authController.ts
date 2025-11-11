import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { registerUser, loginUser } from "../services/authService";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, username, password } = req.body;
    const auth = await registerUser({ email, username, password });
    res.status(201).json(auth);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const auth = await loginUser(email, password);
    res.json(auth);
  } catch (error) {
    next(error);
  }
};

