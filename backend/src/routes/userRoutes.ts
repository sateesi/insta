import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { handleGetUser } from "../controllers/userController";

const router = Router();

router.get("/:userId", authMiddleware, handleGetUser);

export default router;


