import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { handleLike, handleUnlike } from "../controllers/likeController";

const router = Router();

router.post("/:postId", authMiddleware, handleLike);
router.delete("/:postId", authMiddleware, handleUnlike);

export default router;

